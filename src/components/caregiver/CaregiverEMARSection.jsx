import { useEffect, useState } from "react"
import {
  getClientMedications,
  getClientMedicationLogs,
  logMedication,
} from "../../services/clientApi"

function CaregiverEMARSection({ client, caregiver }) {
  const [medications, setMedications] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [status, setStatus] = useState("ADMINISTERED")
  const [notes, setNotes] = useState("")
  const [reason, setReason] = useState("")
  const [signature, setSignature] = useState(caregiver?.name || "")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const medicationData = await getClientMedications(client.id)
        const logData = await getClientMedicationLogs(client.id)

        setMedications(medicationData)
        setLogs(logData)
      } catch (error) {
        alert("Failed to load eMAR data")
      } finally {
        setLoading(false)
      }
    }

    if (client?.id) {
      loadData()
    }
  }, [client])

  const reloadLogs = async () => {
    const logData = await getClientMedicationLogs(client.id)
    setLogs(logData)
  }

  const getScheduledAt = (scheduledTime) => {
    if (!scheduledTime) return null

    const today = new Date().toISOString().split("T")[0]
    return `${today}T${scheduledTime}`
  }

  const isMedicationCompleted = (medication) => {
    const scheduledAt = getScheduledAt(medication.scheduledTime)

    return logs.some(
      (log) =>
        log.medicationId === medication.id &&
        log.scheduledAt === scheduledAt
    )
  }

  const getMedStatus = (scheduledTime) => {
    if (!scheduledTime) return "UNSCHEDULED"

    const scheduledAt = new Date(getScheduledAt(scheduledTime))
    const now = new Date()
    const diffMinutes = (scheduledAt - now) / 60000

    if (diffMinutes < -60) return "OVERDUE"
    if (diffMinutes <= 30 && diffMinutes >= -60) return "DUE_NOW"
    return "UPCOMING"
  }

  const getStatusBadge = (medication) => {
    if (isMedicationCompleted(medication)) {
      return "bg-green-100 text-green-700"
    }

    const medStatus = getMedStatus(medication.scheduledTime)

    if (medStatus === "OVERDUE") return "bg-red-100 text-red-700"
    if (medStatus === "DUE_NOW") return "bg-yellow-100 text-yellow-700"
    if (medStatus === "UPCOMING") return "bg-blue-100 text-blue-700"

    return "bg-gray-100 text-gray-700"
  }

  const formatMedStatus = (medication) => {
    if (isMedicationCompleted(medication)) return "Completed"

    const medStatus = getMedStatus(medication.scheduledTime)

    if (medStatus === "OVERDUE") return "Overdue"
    if (medStatus === "DUE_NOW") return "Due Now"
    if (medStatus === "UPCOMING") return "Upcoming"

    return "Unscheduled"
  }

  const handleMedicationSelect = (medication) => {
    if (isMedicationCompleted(medication)) {
      return
    }

    setSelectedMedication(medication)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedMedication) {
      alert("Please select a medication.")
      return
    }

    if (!signature.trim()) {
      alert("Signature is required.")
      return
    }

    const payload = {
      medicationId: selectedMedication.id,
      caregiverId: caregiver.id,
      scheduledAt: getScheduledAt(selectedMedication.scheduledTime),
      status,
      notes,
      prn: status === "PRN_GIVEN",
      prnReason: status === "PRN_GIVEN" ? reason : null,
      missedReason: status === "MISSED" ? reason : null,
      refusalReason: status === "REFUSED" ? reason : null,
      caregiverSignature: signature,
    }

    try {
      setSubmitting(true)

      await logMedication(payload)
      await reloadLogs()

      setSelectedMedication(null)
      setStatus("ADMINISTERED")
      setNotes("")
      setReason("")
      setSignature(caregiver?.name || "")

      alert("Medication record saved.")
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading medications...</p>
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow">
      <h2 className="text-xl font-bold text-gray-900">eMAR</h2>

      <p className="mt-1 text-sm text-gray-500">
        Due, upcoming, and overdue medications for today&apos;s visit.
      </p>

      {medications.length === 0 ? (
        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
          No active medications found for this client.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-3">
            {medications.map((medication) => {
              const completed = isMedicationCompleted(medication)

              return (
                <button
                  type="button"
                  key={medication.id}
                  disabled={completed}
                  onClick={() => handleMedicationSelect(medication)}
                  className={`w-full rounded-xl border p-4 text-left ${
                    completed
                      ? "cursor-not-allowed border-green-200 bg-green-50"
                      : selectedMedication?.id === medication.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {medication.medicationName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {medication.dosage} • {medication.frequency}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Scheduled: {medication.scheduledTime || "Not set"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {medication.instructions || "No instructions"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                        medication
                      )}`}
                    >
                      {formatMedStatus(medication)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setReason("")
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="ADMINISTERED">Administered</option>
            <option value="MISSED">Missed</option>
            <option value="REFUSED">Refused</option>
            <option value="HELD">Held</option>
            <option value="PRN_GIVEN">PRN Given</option>
          </select>

          {(status === "MISSED" ||
            status === "REFUSED" ||
            status === "PRN_GIVEN") && (
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                status === "MISSED"
                  ? "Missed reason"
                  : status === "REFUSED"
                  ? "Refusal reason"
                  : "PRN reason"
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              rows="3"
              required
            />
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Medication notes"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            rows="3"
          />

          <input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Caregiver signature"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={submitting || !selectedMedication}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:bg-gray-300"
          >
            {submitting ? "Saving..." : "Save eMAR Entry"}
          </button>
        </form>
      )}
    </div>
  )
}

export default CaregiverEMARSection