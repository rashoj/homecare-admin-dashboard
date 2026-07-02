import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import {
  UserRound,
  Calendar,
  Clock3,
  FileText,
  ClipboardCheck,
  Mail,
  Phone,
  ShieldCheck,
  Plus,
} from "lucide-react"

import {
  getCaregiverById,
  getCaregiverAppointments,
  getCaregiverVisitNotes,
  getCaregiverDocuments,
  getCaregiverClockRecords,
} from "../services/caregiverDetailsService"

import {
  getCaregiverComplianceRecords,
  createCaregiverComplianceRecord,
} from "../services/caregiverComplianceService"

function CaregiverDetailsPage() {
  const { id } = useParams()

  const [activeTab, setActiveTab] = useState("overview")
  const [caregiver, setCaregiver] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [visitNotes, setVisitNotes] = useState([])
  const [documents, setDocuments] = useState([])
  const [clockRecords, setClockRecords] = useState([])
  const [complianceRecords, setComplianceRecords] = useState([])

  const [showComplianceModal, setShowComplianceModal] = useState(false)
  const [savingCompliance, setSavingCompliance] = useState(false)

  const [complianceForm, setComplianceForm] = useState({
    recordType: "BACKGROUND_CHECK",
    status: "COMPLETED",
    completedDate: "",
    expirationDate: "",
    notes: "",
  })

  useEffect(() => {
    loadCaregiverData()
  }, [id])

  async function loadCaregiverData() {
    try {
      const caregiverData = await getCaregiverById(id)
      const appointmentData = await getCaregiverAppointments(id)
      const visitNoteData = await getCaregiverVisitNotes(id)
      const documentData = await getCaregiverDocuments(id)
      const allClockRecords = await getCaregiverClockRecords()
      const complianceData = await getCaregiverComplianceRecords(id)

      setCaregiver(caregiverData)
      setAppointments(appointmentData)
      setVisitNotes(visitNoteData)
      setDocuments(documentData)
      setComplianceRecords(complianceData)

      setClockRecords(
        allClockRecords.filter(
          (record) =>
            String(record.caregiverName) === String(caregiverData.fullName)
        )
      )
    } catch (error) {
      console.error(error)
      alert("Failed to load caregiver details")
    }
  }

  function handleComplianceChange(e) {
    setComplianceForm({
      ...complianceForm,
      [e.target.name]: e.target.value,
    })
  }

  function resetComplianceForm() {
    setComplianceForm({
      recordType: "BACKGROUND_CHECK",
      status: "COMPLETED",
      completedDate: "",
      expirationDate: "",
      notes: "",
    })
  }

  async function handleCreateComplianceRecord(e) {
    e.preventDefault()

    try {
      setSavingCompliance(true)

      await createCaregiverComplianceRecord({
        caregiverId: Number(id),
        recordType: complianceForm.recordType,
        status: complianceForm.status,
        completedDate: complianceForm.completedDate || null,
        expirationDate: complianceForm.expirationDate || null,
        notes: complianceForm.notes,
      })

      resetComplianceForm()
      setShowComplianceModal(false)
      await loadCaregiverData()
      alert("Compliance record added successfully.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to add compliance record.")
    } finally {
      setSavingCompliance(false)
    }
  }

  if (!caregiver) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading Caregiver Details...
      </div>
    )
  }

  const expiredCount = complianceRecords.filter((record) =>
    isExpired(record.expirationDate)
  ).length

  const expiringSoonCount = complianceRecords.filter((record) =>
    isExpiringSoon(record.expirationDate)
  ).length

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "compliance", label: "Compliance" },
    { key: "documents", label: "Documents" },
    { key: "appointments", label: "Appointments" },
    { key: "evv", label: "EVV" },
    { key: "training", label: "Training" },
    { key: "performance", label: "Performance" },
    { key: "payroll", label: "Payroll" },
    { key: "audit", label: "Audit Timeline" },
  ]

  return (
    <div>
      <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100">
              <UserRound size={42} className="text-blue-700" />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                {caregiver.fullName}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700">
                  {caregiver.role}
                </span>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">
                  {caregiver.active === false ? "Inactive" : "Active"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-slate-500">
                <p className="flex items-center gap-2">
                  <Mail size={16} />
                  {caregiver.email}
                </p>

                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  {caregiver.phoneNumber || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Workforce Compliance
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {calculateComplianceScore(complianceRecords)}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 overflow-x-auto rounded-2xl bg-white p-3 shadow-sm">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-3 text-sm font-bold ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          appointments={appointments}
          visitNotes={visitNotes}
          clockRecords={clockRecords}
          documents={documents}
          complianceRecords={complianceRecords}
          expiredCount={expiredCount}
          expiringSoonCount={expiringSoonCount}
        />
      )}

      {activeTab === "compliance" && (
        <ComplianceTab
          complianceRecords={complianceRecords}
          expiredCount={expiredCount}
          expiringSoonCount={expiringSoonCount}
          onAdd={() => setShowComplianceModal(true)}
        />
      )}

      {activeTab === "documents" && <DocumentsTab documents={documents} />}

      {activeTab === "appointments" && (
        <AppointmentsTab appointments={appointments} />
      )}

      {activeTab === "evv" && <EVVTab clockRecords={clockRecords} />}

      {activeTab === "training" && <ComingSoon title="Training" />}

      {activeTab === "performance" && <ComingSoon title="Performance" />}

      {activeTab === "payroll" && <ComingSoon title="Payroll" />}

      {activeTab === "audit" && <ComingSoon title="Audit Timeline" />}

      {showComplianceModal && (
        <ComplianceModal
          form={complianceForm}
          saving={savingCompliance}
          onChange={handleComplianceChange}
          onClose={() => {
            resetComplianceForm()
            setShowComplianceModal(false)
          }}
          onSubmit={handleCreateComplianceRecord}
        />
      )}
    </div>
  )
}

function OverviewTab({
  appointments,
  visitNotes,
  clockRecords,
  documents,
  complianceRecords,
  expiredCount,
  expiringSoonCount,
}) {
  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Calendar size={22} className="text-white" />} title="Appointments" value={appointments.length} color="bg-blue-600" />
        <StatCard icon={<ClipboardCheck size={22} className="text-white" />} title="Visit Notes" value={visitNotes.length} color="bg-green-600" />
        <StatCard icon={<Clock3 size={22} className="text-white" />} title="Clock Records" value={clockRecords.length} color="bg-cyan-600" />
        <StatCard icon={<ShieldCheck size={22} className="text-white" />} title="Compliance Items" value={complianceRecords.length} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MiniStat title="Compliance Score" value={`${calculateComplianceScore(complianceRecords)}%`} />
        <MiniStat title="Expiring Soon" value={expiringSoonCount} />
        <MiniStat title="Expired" value={expiredCount} />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-bold text-slate-800">
          Profile Summary
        </h3>
        <p className="text-slate-500">
          This overview summarizes caregiver workforce readiness, EVV activity,
          documentation, and compliance status.
        </p>
      </div>
    </>
  )
}

function ComplianceTab({
  complianceRecords,
  expiredCount,
  expiringSoonCount,
  onAdd,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">
            Caregiver Compliance
          </h3>
          <p className="mt-1 text-slate-500">
            Background checks, clearances, health screens, and certifications.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <MiniStat title="Total Records" value={complianceRecords.length} />
        <MiniStat title="Compliance Score" value={`${calculateComplianceScore(complianceRecords)}%`} />
        <MiniStat title="Expiring Soon" value={expiringSoonCount} />
        <MiniStat title="Expired" value={expiredCount} />
      </div>

      <div className="space-y-4">
        {complianceRecords.length > 0 ? (
          complianceRecords.map((record) => (
            <div key={record.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">
                    {formatRecordType(record.recordType)}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Completed: {record.completedDate || "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Expires: {record.expirationDate || "-"}
                  </p>
                  {record.notes && (
                    <p className="mt-2 text-sm text-slate-500">{record.notes}</p>
                  )}
                </div>

                <div className="text-left md:text-right">
                  <span className={getComplianceBadge(record)}>
                    {getComplianceStatus(record)}
                  </span>

                  {record.expirationDate && (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {getExpirationText(record.expirationDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500">No compliance records found.</p>
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ documents }) {
  return (
    <Panel title="Documents & Certifications">
      {documents.length > 0 ? (
        documents.map((document) => (
          <SimpleCard key={document.id}>
            <h4 className="font-bold text-slate-800">
              {document.documentName}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {document.documentType}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Expiration: {document.expirationDate || "-"}
            </p>
          </SimpleCard>
        ))
      ) : (
        <p className="text-slate-500">No documents found.</p>
      )}
    </Panel>
  )
}

function AppointmentsTab({ appointments }) {
  return (
    <Panel title="Assigned Appointments">
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <SimpleCard key={appointment.id}>
            <h4 className="font-bold text-slate-800">
              {appointment.clientName}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {appointment.notes || "No notes"}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              {appointment.startTime
                ? new Date(appointment.startTime).toLocaleString()
                : "-"}{" "}
              -{" "}
              {appointment.endTime
                ? new Date(appointment.endTime).toLocaleString()
                : "-"}
            </p>
          </SimpleCard>
        ))
      ) : (
        <p className="text-slate-500">No appointments found.</p>
      )}
    </Panel>
  )
}

function EVVTab({ clockRecords }) {
  return (
    <Panel title="Clock Records / EVV History">
      {clockRecords.length > 0 ? (
        clockRecords.map((record) => (
          <SimpleCard key={record.id}>
            <h4 className="font-bold text-slate-800">{record.clientName}</h4>
            <p className="mt-1 text-sm text-slate-500">
              Clock In:{" "}
              {record.clockInTime
                ? new Date(record.clockInTime).toLocaleString()
                : "-"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Clock Out:{" "}
              {record.clockOutTime
                ? new Date(record.clockOutTime).toLocaleString()
                : "-"}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : "-"}
            </p>
          </SimpleCard>
        ))
      ) : (
        <p className="text-slate-500">No clock records found.</p>
      )}
    </Panel>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
      <p className="mt-3">This section is ready for the next production module.</p>
    </div>
  )
}

function ComplianceModal({ form, saving, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              Add Compliance Record
            </h3>
            <p className="mt-1 text-slate-500">
              Add background checks, clearances, or certifications.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <select
            name="recordType"
            value={form.recordType}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="BACKGROUND_CHECK">Background Check</option>
            <option value="FBI_FINGERPRINT">FBI Fingerprint</option>
            <option value="CHILD_ABUSE_CLEARANCE">Child Abuse Clearance</option>
            <option value="TB_SCREEN">TB Screen</option>
            <option value="CPR_FIRST_AID">CPR / First Aid</option>
            <option value="MANDATED_REPORTER">Mandated Reporter</option>
            <option value="DRIVER_LICENSE">Driver License</option>
            <option value="AUTO_INSURANCE">Auto Insurance</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="EXPIRED">Expired</option>
            <option value="FAILED">Failed</option>
            <option value="WAIVED">Waived</option>
          </select>

          <input
            type="date"
            name="completedDate"
            value={form.completedDate}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="date"
            name="expirationDate"
            value={form.expirationDate}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <textarea
            name="notes"
            value={form.notes}
            onChange={onChange}
            placeholder="Notes"
            className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? "Saving..." : "Save Compliance Record"}
          </button>
        </form>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
        {icon}
      </div>
      <h3 className="text-sm text-slate-500">{title}</h3>
      <p className="mt-2 text-4xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-2xl font-bold">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SimpleCard({ children }) {
  return <div className="rounded-xl border border-slate-200 p-4">{children}</div>
}

function formatRecordType(type) {
  if (!type) return "-"
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function isExpired(expirationDate) {
  if (!expirationDate) return false
  return new Date(expirationDate) < new Date()
}

function isExpiringSoon(expirationDate) {
  if (!expirationDate) return false
  const today = new Date()
  const expiration = new Date(expirationDate)
  const diffDays = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 30
}

function calculateComplianceScore(records) {
  if (!records || records.length === 0) return 0

  const validRecords = records.filter(
    (record) =>
      record.status === "COMPLETED" &&
      !isExpired(record.expirationDate)
  )

  return Math.round((validRecords.length / records.length) * 100)
}

function getComplianceStatus(record) {
  if (isExpired(record.expirationDate)) return "EXPIRED"
  if (isExpiringSoon(record.expirationDate)) return "EXPIRING SOON"
  return record.status
}

function getComplianceBadge(record) {
  const status = getComplianceStatus(record)

  if (status === "EXPIRED" || status === "FAILED") {
    return "inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
  }

  if (status === "EXPIRING SOON" || status === "PENDING") {
    return "inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
  }

  return "inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
}

function getExpirationText(expirationDate) {
  const today = new Date()
  const expiration = new Date(expirationDate)
  const diffDays = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`
  if (diffDays === 0) return "Expires today"
  return `Expires in ${diffDays} days`
}

export default CaregiverDetailsPage