import { useEffect, useState } from "react"
import {
  getIncidents,
  reviewIncident,
  getIncidentAttachments,
  downloadIncidentAttachment,
  downloadIncidentPdf,
} from "../services/incidentApi"

function IncidentsPage() {
  const [incidents, setIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [reviewData, setReviewData] = useState({
    reviewedByUserId: 1,
    reviewStatus: "UNDER_REVIEW",
    supervisorNotes: "",
    correctiveAction: "",
    followUpRequired: "",
  })

  useEffect(() => {
    loadIncidents()
  }, [])

  async function loadIncidents() {
    try {
      const data = await getIncidents()
      setIncidents(data)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function openReviewModal(incident) {
    setSelectedIncident(incident)

    setReviewData({
      reviewedByUserId: 1,
      reviewStatus: incident.reviewStatus || "UNDER_REVIEW",
      supervisorNotes: incident.supervisorNotes || "",
      correctiveAction: incident.correctiveAction || "",
      followUpRequired: incident.followUpRequired || "",
    })

    try {
      const attachmentData = await getIncidentAttachments(incident.id)
      setAttachments(attachmentData)
    } catch (error) {
      setAttachments([])
    }
  }

  function closeReviewModal() {
    setSelectedIncident(null)
    setAttachments([])
  }

  function handleChange(e) {
    setReviewData({
      ...reviewData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmitReview(e) {
    e.preventDefault()

    try {
      await reviewIncident(selectedIncident.id, reviewData)
      await loadIncidents()

      closeReviewModal()

      alert("Incident review saved.")
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading incidents...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Incident Management
        </h2>

        <p className="mt-2 text-slate-500">
          Review caregiver-submitted incidents, corrective actions, and
          follow-up requirements.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {incidents.length === 0 ? (
          <p className="text-slate-500">No incidents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">State Reportable</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">
                      {incident.clientName}
                    </td>

                    <td className="p-4">{incident.caregiverName}</td>

                    <td className="p-4">{incident.incidentType}</td>

                    <td className="p-4">
                      <SeverityBadge severity={incident.severity} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={incident.status} />
                    </td>

                    <td className="p-4">
                      {incident.stateReportable ? "Yes" : "No"}
                    </td>

                    <td className="p-4">
                      {incident.incidentDateTime
                        ? new Date(incident.incidentDateTime).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => openReviewModal(incident)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Incident Review
                </h3>

                <p className="mt-1 text-slate-500">
                  Review incident details, attachments, and supervisor action.
                </p>
              </div>

              <button
                onClick={closeReviewModal}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard label="Client" value={selectedIncident.clientName} />
              <InfoCard
                label="Caregiver"
                value={selectedIncident.caregiverName}
              />
              <InfoCard
                label="Incident Type"
                value={selectedIncident.incidentType}
              />
              <InfoCard label="Severity" value={selectedIncident.severity} />
              <InfoCard label="Status" value={selectedIncident.status} />
              <InfoCard
                label="State Reportable"
                value={selectedIncident.stateReportable ? "Yes" : "No"}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <LargeInfoCard
                label="Description"
                value={selectedIncident.description}
              />

              <LargeInfoCard
                label="Immediate Action Taken"
                value={selectedIncident.immediateActionTaken}
              />

              <LargeInfoCard
                label="Witness Name"
                value={selectedIncident.witnessName}
              />

              <LargeInfoCard
                label="Witness Phone"
                value={selectedIncident.witnessPhone}
              />

              <LargeInfoCard
                label="Witness Statement"
                value={selectedIncident.witnessStatement}
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h4 className="font-bold text-slate-800">Attachments</h4>

              {attachments.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No attachments uploaded for this incident.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {attachment.fileName}
                        </p>

                        <p className="text-sm text-slate-500">
                          {attachment.fileType || "File"} •{" "}
                          {attachment.fileSize
                            ? `${Math.round(attachment.fileSize / 1024)} KB`
                            : "Unknown size"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          downloadIncidentAttachment(
                            attachment.id,
                            attachment.fileName
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => downloadIncidentPdf(selectedIncident.id)}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Download Incident PDF
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
              <select
                name="reviewStatus"
                value={reviewData.reviewStatus}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              <TextArea
                name="supervisorNotes"
                label="Supervisor Notes"
                value={reviewData.supervisorNotes}
                onChange={handleChange}
              />

              <TextArea
                name="correctiveAction"
                label="Corrective Action"
                value={reviewData.correctiveAction}
                onChange={handleChange}
              />

              <TextArea
                name="followUpRequired"
                label="Follow-Up Required"
                value={reviewData.followUpRequired}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Incident Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SeverityBadge({ severity }) {
  if (severity === "CRITICAL") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Critical
      </span>
    )
  }

  if (severity === "HIGH") {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
        High
      </span>
    )
  }

  if (severity === "MEDIUM") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Medium
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Low
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "CLOSED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Closed
      </span>
    )
  }

  if (status === "RESOLVED") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        Resolved
      </span>
    )
  }

  if (status === "UNDER_REVIEW") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Under Review
      </span>
    )
  }

  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
      Submitted
    </span>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function LargeInfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  )
}

function TextArea({ name, label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="3"
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

export default IncidentsPage