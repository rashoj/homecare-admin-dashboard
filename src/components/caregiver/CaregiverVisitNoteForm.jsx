import { useState } from "react"
import { createVisitNote } from "../../services/clientApi"

function CaregiverVisitNoteForm({ appointmentId, canSubmit }) {
  const [formData, setFormData] = useState({
    generalNotes: "",
    meals: "",
    medicationNotes: "",
    mobilityNotes: "",
    moodNotes: "",
    hygieneCare: "",
    safetyConcerns: "",
    familyUpdate: "",
    incidentReported: false,
    incidentDetails: "",
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

    try {
      setSubmitting(true)

      await createVisitNote({
        appointmentId,
        ...formData,
      })

      setSubmitted(true)
      alert("Visit note submitted successfully.")
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!canSubmit) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 shadow">
        <h2 className="text-xl font-bold text-gray-900">Visit Note</h2>
        <p className="mt-2 text-sm text-gray-500">
          Clock out before submitting the visit note.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-2xl bg-green-50 p-5 shadow">
        <h2 className="text-xl font-bold text-green-700">Visit Note Submitted</h2>
        <p className="mt-2 text-sm text-green-700">
          The note was saved and AI summary will appear in the client profile.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow">
      <h2 className="text-xl font-bold text-gray-900">Visit Note</h2>
      <p className="mt-1 text-sm text-gray-500">
        Submit documentation for today&apos;s visit.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <TextArea name="generalNotes" label="General Notes" value={formData.generalNotes} onChange={handleChange} required />
        <TextArea name="meals" label="Meals" value={formData.meals} onChange={handleChange} />
        <TextArea name="medicationNotes" label="Medication Notes" value={formData.medicationNotes} onChange={handleChange} />
        <TextArea name="mobilityNotes" label="Mobility Notes" value={formData.mobilityNotes} onChange={handleChange} />
        <TextArea name="moodNotes" label="Mood Notes" value={formData.moodNotes} onChange={handleChange} />
        <TextArea name="hygieneCare" label="Hygiene Care" value={formData.hygieneCare} onChange={handleChange} />
        <TextArea name="safetyConcerns" label="Safety Concerns" value={formData.safetyConcerns} onChange={handleChange} />
        <TextArea name="familyUpdate" label="Family Update" value={formData.familyUpdate} onChange={handleChange} />

        <label className="flex items-center gap-3 rounded-xl bg-red-50 p-3">
          <input
            type="checkbox"
            name="incidentReported"
            checked={formData.incidentReported}
            onChange={handleChange}
          />
          <span className="text-sm font-semibold text-red-700">
            Incident reported during this visit
          </span>
        </label>

        {formData.incidentReported && (
          <TextArea
            name="incidentDetails"
            label="Incident Details"
            value={formData.incidentDetails}
            onChange={handleChange}
            required
          />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {submitting ? "Submitting..." : "Submit Visit Note"}
        </button>
      </form>
    </div>
  )
}

function TextArea({ name, label, value, onChange, required }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows="3"
        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </div>
  )
}

export default CaregiverVisitNoteForm