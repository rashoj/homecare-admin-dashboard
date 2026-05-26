import { useEffect, useState } from "react"
import {
  getClientMedications,
  getClientMedicationLogs,
  logMedication,
} from "../../services/clientApi"
import { getUser } from "../../services/authStorage"

function ClientMedicationsTab({ clientId }) {
  const [medications, setMedications] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [status, setStatus] = useState("ADMINISTERED")
  const [notes, setNotes] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    try {
      setLoading(true)

      const medicationData = await getClientMedications(clientId)
      const logData = await getClientMedicationLogs(clientId)

      setMedications(medicationData)
      setLogs(logData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      loadData()
    }
  }, [clientId])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!selectedMedication) {
      alert("Please select a medication.")
      return
    }

    const user = getUser()

    const payload = {
      medicationId: selectedMedication.id,
      caregiverId: user?.id,
      status,
      notes,
      prn: status === "PRN_GIVEN",
      prnReason: status === "PRN_GIVEN" ? reason : null,
      missedReason: status === "MISSED" ? reason : null,
      refusalReason: status === "REFUSED" ? reason : null,
      caregiverSignature: user?.name || user?.email || "",
    }

    try {
      setSubmitting(true)

      await logMedication(payload)

      setSelectedMedication(null)
      setStatus("ADMINISTERED")
      setNotes("")
      setReason("")

      await loadData()
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading MAR...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">
        Medication Administration Record
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">
            Scheduled Medications
          </h3>

          {medications.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              No active medications found for this client.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {medications.map((med) => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMedication(med)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedMedication?.id === med.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-bold text-gray-900">
                    {med.medicationName}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {med.dosage} • {med.frequency}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Scheduled: {med.scheduledTime || "Not set"}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {med.instructions || "No instructions"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">
            Log Medication Pass
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-gray-500">
                Selected Medication
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {selectedMedication
                  ? selectedMedication.medicationName
                  : "None selected"}
              </p>
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
              <option value="GIVEN">Given</option>
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
              />
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Medication notes"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              rows="3"
            />

            <button
              type="submit"
              disabled={submitting || !selectedMedication}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:bg-gray-300"
            >
              {submitting ? "Saving..." : "Save MAR Entry"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900">MAR History</h3>

        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No medication logs found for this client.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
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

                  <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    {formatStatus(log.status)}
                  </span>
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
      </div>
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

  return status || "—"
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default ClientMedicationsTab