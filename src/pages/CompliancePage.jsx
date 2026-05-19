import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getComplianceSummary,
  getClientComplianceRows,
  getMissedMedicationAlerts,
  getMissingVisitNoteAlerts,
} from "../services/complianceApi"

function CompliancePage() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [clients, setClients] = useState([])
  const [missedMedicationAlerts, setMissedMedicationAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [missingVisitNoteAlerts, setMissingVisitNoteAlerts] = useState([])

  useEffect(() => {
    async function loadCompliance() {
      try {
        const summaryData = await getComplianceSummary()
        const clientData = await getClientComplianceRows()
        const missedMedicationData = await getMissedMedicationAlerts()
        const missingVisitNoteData = await getMissingVisitNoteAlerts()


        setSummary(summaryData)
        setClients(clientData)
        setMissedMedicationAlerts(missedMedicationData)
        setMissingVisitNoteAlerts(missingVisitNoteData)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadCompliance()
  }, [])

  if (loading) {
    return <p className="text-slate-500">Loading compliance dashboard...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Compliance Dashboard
        </h2>

        <p className="mt-2 text-slate-500">
          Review client documentation, MAR, EVV, and incident compliance.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Missed Medications"
          value={summary?.missedMedications || 0}
        />

        <SummaryCard
          label="Missing Visit Notes"
          value={summary?.visitsMissingNotes || 0}
        />

        <SummaryCard
          label="Open Clock Records"
          value={summary?.openClockRecords || 0}
        />

        <SummaryCard
          label="Incidents Reported"
          value={summary?.incidentsReported || 0}
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-slate-800">
          Client Compliance Review
        </h3>

        {clients.length === 0 ? (
          <p className="text-slate-500">No client compliance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Missed Meds</th>
                  <th className="p-4">Refused Meds</th>
                  <th className="p-4">Missing Notes</th>
                  <th className="p-4">Open Clock</th>
                  <th className="p-4">Incidents</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.clientId}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-800">
                      {client.clientName}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={client.complianceStatus} />
                    </td>

                    <td className="p-4">{client.missedMedications}</td>
                    <td className="p-4">{client.refusedMedications}</td>
                    <td className="p-4">{client.visitsMissingNotes}</td>
                    <td className="p-4">{client.openClockRecords}</td>
                    <td className="p-4">{client.incidentsReported}</td>

                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/clients/${client.clientId}`)}
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

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-slate-800">
          Missed Medication Alerts
        </h3>

        {missedMedicationAlerts.length === 0 ? (
          <p className="text-slate-500">No missed medication alerts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Medication</th>
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Scheduled</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {missedMedicationAlerts.map((alert) => (
                  <tr
                    key={alert.logId}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-800">
                      {alert.clientName}
                    </td>

                    <td className="p-4">{alert.medicationName}</td>

                    <td className="p-4">{alert.caregiverName || "—"}</td>

                    <td className="p-4">
                      {alert.scheduledAt
                        ? new Date(alert.scheduledAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-4">
                      {alert.missedReason || alert.notes || "No reason provided"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/clients/${alert.clientId}`)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
  <h3 className="mb-4 text-xl font-bold text-slate-800">
    Visits Missing Notes
  </h3>

  {missingVisitNoteAlerts.length === 0 ? (
    <p className="text-slate-500">No visits missing notes.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="p-4">Client</th>
            <th className="p-4">Caregiver</th>
            <th className="p-4">Start Time</th>
            <th className="p-4">End Time</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {missingVisitNoteAlerts.map((alert) => (
            <tr
              key={alert.appointmentId}
              className="border-b hover:bg-slate-50"
            >
              <td className="p-4 font-semibold text-slate-800">
                {alert.clientName}
              </td>

              <td className="p-4">
                {alert.caregiverName || "—"}
              </td>

              <td className="p-4">
                {alert.startTime
                  ? new Date(alert.startTime).toLocaleString()
                  : "—"}
              </td>

              <td className="p-4">
                {alert.endTime
                  ? new Date(alert.endTime).toLocaleString()
                  : "—"}
              </td>

              <td className="p-4">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  Missing Note
                </span>
              </td>

              <td className="p-4">
                <button
                  onClick={() => navigate(`/clients/${alert.clientId}`)}
                  className="rounded-lg bg-yellow-600 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-700"
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
    </div>
    
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === "CRITICAL") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Critical
      </span>
    )
  }

  if (status === "NEEDS_REVIEW") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Needs Review
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Compliant
    </span>
  )
}

export default CompliancePage