import { useState } from "react"
import { submitServiceDocumentation } from "../../services/serviceDocumentationApi"
import SignaturePadField from "../common/SignaturePadField"

function CaregiverServiceDocumentationForm({
  appointmentId,
  caregiver,
  canSubmit,
}) {
  const [formData, setFormData] = useState({
    shiftTasksCompleted: "",
    adlsCompleted: "",
    goalProgressNotes: "",
    dailyServiceNotes: "",
    shiftCompleted: false,
    caregiverSignature: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.shiftCompleted) {
      alert("Please confirm the shift was completed.")
      return
    }

    if (!formData.caregiverSignature) {
      alert("Caregiver signature is required.")
      return
    }

    try {
      setSubmitting(true)

      await submitServiceDocumentation({
        appointmentId,
        ...formData,
      })

      setSubmitted(true)

      alert("Service documentation submitted.")
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!canSubmit) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 shadow">
        <h2 className="text-xl font-bold text-gray-900">
          Service Documentation
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Clock out before submitting documentation.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-2xl bg-green-50 p-5 shadow">
        <h2 className="text-xl font-bold text-green-700">
          Documentation Submitted
        </h2>

        <p className="mt-2 text-sm text-green-700">
          Submitted for supervisor review.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow">
      <h2 className="text-xl font-bold text-gray-900">
        Service Documentation
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Complete required shift documentation.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <TextArea
          name="shiftTasksCompleted"
          label="Shift Tasks Completed"
          value={formData.shiftTasksCompleted}
          onChange={handleChange}
        />

        <TextArea
          name="adlsCompleted"
          label="ADLs Completed"
          value={formData.adlsCompleted}
          onChange={handleChange}
        />

        <TextArea
          name="goalProgressNotes"
          label="Goal Progress Notes"
          value={formData.goalProgressNotes}
          onChange={handleChange}
        />

        <TextArea
          name="dailyServiceNotes"
          label="Daily Service Notes"
          value={formData.dailyServiceNotes}
          onChange={handleChange}
        />

        <label className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">
          <input
            type="checkbox"
            name="shiftCompleted"
            checked={formData.shiftCompleted}
            onChange={handleChange}
          />

          <span className="text-sm font-semibold text-blue-700">
            I confirm this shift was completed.
          </span>
        </label>

        <SignaturePadField
          label="Caregiver Signature"
          value={formData.caregiverSignature}
          onChange={(signatureDataUrl) =>
            setFormData({
              ...formData,
              caregiverSignature: signatureDataUrl,
            })
          }
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {submitting ? "Submitting..." : "Submit Documentation"}
        </button>
      </form>
    </div>
  )
}

function TextArea({
  name,
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="3"
        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </div>
  )
}

export default CaregiverServiceDocumentationForm