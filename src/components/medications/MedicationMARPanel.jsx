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
      setFormData((prev) => ({
        ...prev,
        clientId,
      }))

      loadData()
    }
  }, [clientId])

  const loadData = async () => {
    try {
      setLoading(true)

      const medicationData = await getClientMedications(clientId)
      const logData = await getClientMedicationLogs(clientId)

      setMedications(medicationData)
      setLogs(logData)
    } catch (error) {
      alert("Failed to load MAR data")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCreateMedication = async (e) => {
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
    } catch (error) {
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

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-slate-800">
          Scheduled Medications
        </h3>

        {medications.length === 0 ? (
          <p className="text-slate-500">No medications found for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Medication</th>
                  <th className="p-4">Dosage</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Scheduled Time</th>
                  <th className="p-4">Instructions</th>
                </tr>
              </thead>

              <tbody>
                {medications.map((med) => (
                  <tr key={med.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">
                      {med.medicationName}
                    </td>
                    <td className="p-4">{med.dosage}</td>
                    <td className="p-4">{med.frequency}</td>
                    <td className="p-4">{med.scheduledTime || "—"}</td>
                    <td className="p-4">{med.instructions || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-slate-800">MAR History</h3>

        {logs.length === 0 ? (
          <p className="text-slate-500">No MAR records found for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Medication</th>
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Given At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Signature</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">
                      {log.medicationName}
                    </td>

                    <td className="p-4">{log.caregiverName || "—"}</td>

                    <td className="p-4">
                      {log.givenAt
                        ? new Date(log.givenAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {formatStatus(log.status)}
                      </span>
                    </td>

                    <td className="p-4">
                      {log.prnReason ||
                        log.missedReason ||
                        log.refusalReason ||
                        log.notes ||
                        "—"}
                    </td>

                    <td className="p-4">{log.caregiverSignature || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function formatStatus(status) {
  if (status === "ADMINISTERED") return "Administered"
  if (status === "GIVEN") return "Given"
  if (status === "MISSED") return "Missed"
  if (status === "REFUSED") return "Refused"
  if (status === "HELD") return "Held"
  if (status === "PRN_GIVEN") return "PRN Given"

  return status
}

export default MedicationMARPanel