import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Paperclip,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react"

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
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

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
      setLoading(true)
      setErrorMessage("")
      const data = await getIncidents()
      setIncidents(data || [])
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
      setAttachments(attachmentData || [])
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

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const text = `${incident.clientName || ""} ${incident.caregiverName || ""} ${
        incident.incidentType || ""
      } ${incident.severity || ""} ${incident.status || ""} ${
        incident.reviewStatus || ""
      }`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesTab =
        activeTab === "ALL" ||
        incident.status === activeTab ||
        incident.reviewStatus === activeTab ||
        incident.severity === activeTab ||
        (activeTab === "STATE_REPORTABLE" && incident.stateReportable)

      return matchesSearch && matchesTab
    })
  }, [incidents, search, activeTab])

  const submittedCount = incidents.filter(
    (incident) => incident.status === "SUBMITTED"
  ).length
  const underReviewCount = incidents.filter(
    (incident) =>
      incident.reviewStatus === "UNDER_REVIEW" ||
      incident.status === "UNDER_REVIEW"
  ).length
  const highRiskCount = incidents.filter(
    (incident) =>
      incident.severity === "HIGH" || incident.severity === "CRITICAL"
  ).length
  const stateReportableCount = incidents.filter(
    (incident) => incident.stateReportable
  ).length

  const tabs = [
    { key: "ALL", label: "All Incidents" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "RESOLVED", label: "Resolved" },
    { key: "CLOSED", label: "Closed" },
    { key: "STATE_REPORTABLE", label: "State Reportable" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading incidents...
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 font-semibold text-red-700">
        {errorMessage}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Incident Management
          </h1>

          <p className="mt-2 text-slate-500">
            Review caregiver-submitted incidents, state reportable events,
            corrective actions, attachments, and supervisor follow-up.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-72"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Submitted"
          value={submittedCount}
          subtitle="Awaiting review"
          icon={<FileText size={26} />}
          tone="yellow"
        />
        <MetricCard
          title="Under Review"
          value={underReviewCount}
          subtitle="Supervisor queue"
          icon={<Clock3 size={26} />}
          tone="blue"
        />
        <MetricCard
          title="High Risk"
          value={highRiskCount}
          subtitle="High or critical severity"
          icon={<ShieldAlert size={26} />}
          tone="red"
        />
        <MetricCard
          title="State Reportable"
          value={stateReportableCount}
          subtitle="Regulatory attention"
          icon={<AlertTriangle size={26} />}
          tone="orange"
        />
      </div>

      {stateReportableCount > 0 && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-100 p-3 text-red-700">
              <ShieldAlert size={24} />
            </div>

            <div>
              <h2 className="text-lg font-black text-red-800">
                State reportable incidents require careful review
              </h2>
              <p className="mt-1 text-sm font-semibold text-red-600">
                {stateReportableCount} incident
                {stateReportableCount === 1 ? "" : "s"} may require external
                reporting or compliance follow-up.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-1 py-5 text-sm font-bold ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHead>Client</TableHead>
                <TableHead>Caregiver</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>State Reportable</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </tr>
            </thead>

            <tbody>
              {filteredIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={incident.clientName} />
                      <div>
                        <p className="font-black text-slate-900">
                          {incident.clientName || "Unknown Client"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Incident #{incident.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <UserRound size={17} className="text-slate-400" />
                      <span className="font-bold text-slate-700">
                        {incident.caregiverName || "—"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <TypeBadge type={incident.incidentType} />
                  </td>

                  <td className="px-6 py-5">
                    <SeverityBadge severity={incident.severity} />
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge
                      status={incident.reviewStatus || incident.status}
                    />
                  </td>

                  <td className="px-6 py-5">
                    <ReportableBadge value={incident.stateReportable} />
                  </td>

                  <td className="px-6 py-5">
                    <DateTimeBlock value={incident.incidentDateTime} />
                  </td>

                  <td className="px-6 py-5">
                    <button
                      onClick={() => openReviewModal(incident)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                    >
                      <Eye size={16} />
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No incidents found.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or selected tab.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Previous
            </button>
            <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
              1
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedIncident && (
        <ReviewModal
          selectedIncident={selectedIncident}
          attachments={attachments}
          reviewData={reviewData}
          handleChange={handleChange}
          handleSubmitReview={handleSubmitReview}
          closeReviewModal={closeReviewModal}
        />
      )}
    </div>
  )
}

function ReviewModal({
  selectedIncident,
  attachments,
  reviewData,
  handleChange,
  handleSubmitReview,
  closeReviewModal,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Incident Review
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review incident details, attachments, corrective actions, and
                supervisor follow-up.
              </p>
            </div>

            <button
              onClick={closeReviewModal}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {selectedIncident.stateReportable && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                  <ShieldAlert size={22} />
                </div>

                <div>
                  <p className="font-black text-red-800">
                    State reportable incident
                  </p>
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    This incident may require regulatory reporting and formal
                    supervisor follow-up.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="Client" value={selectedIncident.clientName} />
            <InfoCard label="Caregiver" value={selectedIncident.caregiverName} />
            <InfoCard
              label="Incident Type"
              value={formatLabel(selectedIncident.incidentType)}
            />
            <InfoCard label="Severity" value={formatLabel(selectedIncident.severity)} />
            <InfoCard
              label="Status"
              value={formatLabel(
                selectedIncident.reviewStatus || selectedIncident.status
              )}
            />
            <InfoCard
              label="State Reportable"
              value={selectedIncident.stateReportable ? "Yes" : "No"}
            />
            <InfoCard
              label="Incident Date"
              value={formatDate(selectedIncident.incidentDateTime)}
            />
            <InfoCard
              label="Incident ID"
              value={`INC-${String(selectedIncident.id).padStart(5, "0")}`}
            />
          </div>

          <SectionCard title="Incident Details">
            <LargeInfoCard
              label="Description"
              value={selectedIncident.description}
            />

            <LargeInfoCard
              label="Immediate Action Taken"
              value={selectedIncident.immediateActionTaken}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Witness Name"
                value={selectedIncident.witnessName}
              />

              <InfoCard
                label="Witness Phone"
                value={selectedIncident.witnessPhone}
              />
            </div>

            <LargeInfoCard
              label="Witness Statement"
              value={selectedIncident.witnessStatement}
            />
          </SectionCard>

          <SectionCard title="Attachments">
            {attachments.length === 0 ? (
              <EmptyPanel text="No attachments uploaded for this incident." />
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                        <Paperclip size={20} />
                      </div>

                      <div>
                        <p className="font-black text-slate-900">
                          {attachment.fileName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {attachment.fileType || "File"} •{" "}
                          {attachment.fileSize
                            ? `${Math.round(attachment.fileSize / 1024)} KB`
                            : "Unknown size"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        downloadIncidentAttachment(
                          attachment.id,
                          attachment.fileName
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => downloadIncidentPdf(selectedIncident.id)}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              <Download size={18} />
              Download Incident PDF
            </button>
          </SectionCard>

          <SectionCard title="Supervisor Review">
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <FormField label="Review Status">
                <select
                  name="reviewStatus"
                  value={reviewData.reviewStatus}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </FormField>

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
                className="w-full rounded-2xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700"
              >
                Save Incident Review
              </button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            tones[tone] || tones.blue
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  )
}

function Avatar({ name }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
      {getInitials(name)}
    </div>
  )
}

function DateTimeBlock({ value }) {
  if (!value) return <span className="text-sm text-slate-400">—</span>

  const date = new Date(value)

  return (
    <div>
      <p className="font-bold text-slate-800">{date.toLocaleDateString()}</p>
      <p className="mt-1 text-sm text-slate-500">
        {date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  )
}

function SeverityBadge({ severity }) {
  if (severity === "CRITICAL") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Critical
      </span>
    )
  }

  if (severity === "HIGH") {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
        High
      </span>
    )
  }

  if (severity === "MEDIUM") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        Medium
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      Low
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "CLOSED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
        Closed
      </span>
    )
  }

  if (status === "RESOLVED") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
        Resolved
      </span>
    )
  }

  if (status === "UNDER_REVIEW") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        Under Review
      </span>
    )
  }

  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
      Submitted
    </span>
  )
}

function ReportableBadge({ value }) {
  if (value) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Yes
      </span>
    )
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      No
    </span>
  )
}

function TypeBadge({ type }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      {formatLabel(type)}
    </span>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h4 className="mb-5 text-xl font-black text-slate-900">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function LargeInfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  )
}

function TextArea({ name, label, value, onChange }) {
  return (
    <FormField label={label}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
      />
    </FormField>
  )
}

function EmptyPanel({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
      {text}
    </div>
  )
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

function getInitials(name) {
  if (!name) return "?"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default IncidentsPage
