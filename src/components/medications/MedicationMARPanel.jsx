import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import {
  getClientMedications,
  getClientMedicationLogs,
} from "../../services/clientApi"
import { createMedication } from "../../services/medicationService"

function MedicationMARPanel({ clientId }) {
  const [medications, setMedications] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    clientId: clientId || "",
    medicationName: "",
    dosage: "",
    frequency: "",
    scheduledTime: "",
    instructions: "",
  })

  useEffect(() => {
    if (clientId) {
      setFormData((prev) => ({ ...prev, clientId }))
      loadData()
    }
  }, [clientId])

  async function loadData() {
    try {
      setLoading(true)
      const medicationData = await getClientMedications(clientId)
      const logData = await getClientMedicationLogs(clientId)

      setMedications(medicationData)
      setLogs(logData)
    } catch {
      alert("Failed to load MAR data")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleCreateMedication(e) {
    e.preventDefault()

    try {
      await createMedication({
        ...formData,
        clientId,
      })

      setShowModal(false)
      setFormData({
        clientId,
        medicationName: "",
        dosage: "",
        frequency: "",
        scheduledTime: "",
        instructions: "",
      })

      await loadData()
    } catch {
      alert("Failed to create medication")
    }
  }

  const administeredCount = logs.filter(
    (log) => log.status === "ADMINISTERED" || log.status === "GIVEN"
  ).length

  const missedCount = logs.filter((log) => log.status === "MISSED").length
  const refusedCount = logs.filter((log) => log.status === "REFUSED").length
  const prnCount = logs.filter((log) => log.status === "PRN_GIVEN").length

  if (!clientId) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-slate-500">
          Select a client to view medications and MAR records.
        </p>
      </div>
    )
  }

  if (loading) {
    return <p className="text-slate-500">Loading MAR data...</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">
            Medication Administration Record
          </h3>
          <p className="mt-1 text-slate-500">
            Manage medication schedules, PRN tracking, and MAR history.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Medication
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Administered" value={administeredCount} />
        <StatCard label="Missed" value={missedCount} />
        <StatCard label="Refused" value={refusedCount} />
        <StatCard label="PRN Given" value={prnCount} />
      </div>

      <Section title="Scheduled Medications">
        {medications.length === 0 ? (
          <EmptyText text="No medications found for this client." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {medications.map((med) => (
              <div
                key={med.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {med.medicationName}
                    </h4>

                    <p className="mt-1 font-semibold text-slate-700">
                      {med.dosage}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    {med.frequency}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoBox label="Scheduled Time" value={med.scheduledTime || "—"} />
                  <InfoBox label="Status" value={med.active ? "Active" : "Inactive"} />
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Instructions
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {med.instructions || "No instructions provided."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="MAR History">
        {logs.length === 0 ? (
          <EmptyText text="No MAR records found for this client." />
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {log.medicationName}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Caregiver: {log.caregiverName || "—"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Scheduled: {formatDate(log.scheduledAt)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Given At: {formatDate(log.givenAt)}
                    </p>
                  </div>

                  <StatusBadge status={log.status} />
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason / Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {log.prnReason ||
                      log.missedReason ||
                      log.refusalReason ||
                      log.notes ||
                      "—"}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Signature
                  </p>

                  {log.caregiverSignature?.startsWith("data:image") ? (
                    <img
                      src={log.caregiverSignature}
                      alt="Caregiver signature"
                      className="mt-3 h-20 max-w-56 rounded-xl border border-slate-200 bg-white p-2 object-contain"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      {log.caregiverSignature || "—"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Add Medication</h3>

              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-4">
              <input
                type="text"
                name="medicationName"
                placeholder="Medication Name"
                value={formData.medicationName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="text"
                name="dosage"
                placeholder="Dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="text"
                name="frequency"
                placeholder="Frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                name="instructions"
                placeholder="Instructions"
                value={formData.instructions}
                onChange={handleChange}
                className="h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Medication
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    ADMINISTERED: "bg-green-100 text-green-700",
    GIVEN: "bg-green-100 text-green-700",
    MISSED: "bg-red-100 text-red-700",
    REFUSED: "bg-orange-100 text-orange-700",
    HELD: "bg-slate-100 text-slate-700",
    PRN_GIVEN: "bg-purple-100 text-purple-700",
  }

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-blue-100 text-blue-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  )
}

function EmptyText({ text }) {
  return <p className="text-slate-500">{text}</p>
}

function formatStatus(status) {
  if (status === "ADMINISTERED") return "Administered"
  if (status === "GIVEN") return "Given"
  if (status === "MISSED") return "Missed"
  if (status === "REFUSED") return "Refused"
  if (status === "HELD") return "Held"
  if (status === "PRN_GIVEN") return "PRN Given"

  return status || "—"
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default MedicationMARPanel