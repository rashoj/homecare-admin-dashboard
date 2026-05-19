import { useState } from "react"
import {
  createIncident,
  uploadIncidentAttachment,
} from "../../services/incidentApi"

function CaregiverIncidentForm({ appointmentId, client, caregiver }) {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState([])

  const [formData, setFormData] = useState({
    incidentType: "",
    severity: "LOW",
    description: "",
    immediateActionTaken: "",
    witnessName: "",
    witnessPhone: "",
    witnessStatement: "",
    stateReportable: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const resetForm = () => {
    setFormData({
      incidentType: "",
      severity: "LOW",
      description: "",
      immediateActionTaken: "",
      witnessName: "",
      witnessPhone: "",
      witnessStatement: "",
      stateReportable: false,
    })

    setFiles([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.incidentType || !formData.description) {
      alert("Incident type and description are required.")
      return
    }

    try {
      setSubmitting(true)

      const incident = await createIncident({
        appointmentId,
        clientId: client.id,
        caregiverId: caregiver.id,
        ...formData,
      })

      for (const file of files) {
        await uploadIncidentAttachment(incident.id, file)
      }

      resetForm()
      setShowForm(false)

      alert("Incident submitted for supervisor review.")
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Incident Reporting
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Report falls, injuries, medication issues, behavior concerns, or
            safety events.
          </p>
        </div>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
        >
          Report Incident
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            name="incidentType"
            value={formData.incidentType}
            onChange={handleChange}
            placeholder="Incident Type, e.g. Fall, Injury, Behavior"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            required
          />

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <TextArea
            name="description"
            label="Incident Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <TextArea
            name="immediateActionTaken"
            label="Immediate Action Taken"
            value={formData.immediateActionTaken}
            onChange={handleChange}
          />

          <input
            name="witnessName"
            value={formData.witnessName}
            onChange={handleChange}
            placeholder="Witness Name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />

          <input
            name="witnessPhone"
            value={formData.witnessPhone}
            onChange={handleChange}
            placeholder="Witness Phone"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />

          <TextArea
            name="witnessStatement"
            label="Witness Statement"
            value={formData.witnessStatement}
            onChange={handleChange}
          />

          <label className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <input
              type="checkbox"
              name="stateReportable"
              checked={formData.stateReportable}
              onChange={handleChange}
            />

            <span className="text-sm font-semibold text-red-700">
              This may be state-reportable
            </span>
          </label>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Attach Photos / Files
            </label>

            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
            />

            {files.length > 0 && (
              <div className="mt-2 rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700">
                  {files.length} file(s) selected
                </p>

                <ul className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-xs text-gray-500">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="flex-1 rounded-xl bg-gray-200 py-3 font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white disabled:bg-gray-300"
            >
              {submitting ? "Submitting..." : "Submit Incident"}
            </button>
          </div>
        </form>
      )}
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

export default CaregiverIncidentForm