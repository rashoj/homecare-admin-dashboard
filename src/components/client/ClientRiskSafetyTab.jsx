import { useEffect, useState } from "react"
import {
  getClientMedicationLogs,
  getClientAppointments,
  getClientClockRecords,
} from "../../services/clientApi"
import { getIncidentsByClient } from "../../services/incidentApi"

function ClientRiskSafetyTab({ clientId }) {
  const [incidents, setIncidents] = useState([])
  const [medicationLogs, setMedicationLogs] = useState([])
  const [appointments, setAppointments] = useState([])
  const [clockRecords, setClockRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadRiskData() {
      try {
        const incidentData = await getIncidentsByClient(clientId)
        const medLogData = await getClientMedicationLogs(clientId)
        const appointmentData = await getClientAppointments(clientId)
        const clockData = await getClientClockRecords(clientId)

        setIncidents(incidentData)
        setMedicationLogs(medLogData)
        setAppointments(appointmentData)
        setClockRecords(clockData)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadRiskData()
  }, [clientId])

  if (loading) {
    return <p className="text-gray-500">Loading risk and safety data...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  const missedMeds = medicationLogs.filter((log) => log.status === "MISSED")
  const refusedMeds = medicationLogs.filter((log) => log.status === "REFUSED")
  const highIncidents = incidents.filter((i) => i.severity === "HIGH")
  const criticalIncidents = incidents.filter((i) => i.severity === "CRITICAL")
  const stateReportable = incidents.filter((i) => i.stateReportable)
  const openClockRecords = clockRecords.filter(
    (record) => record.status === "CLOCKED_IN"
  )

  const completedAppointments = appointments.filter(
    (appointment) => appointment.completed
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Risk & Safety</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <RiskCard label="Total Incidents" value={incidents.length} />
        <RiskCard label="High/Critical" value={highIncidents.length + criticalIncidents.length} />
        <RiskCard label="Missed Meds" value={missedMeds.length} />
        <RiskCard label="Open EVV" value={openClockRecords.length} />
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900">Safety Summary</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <SummaryItem label="State Reportable Incidents" value={stateReportable.length} />
          <SummaryItem label="Refused Medications" value={refusedMeds.length} />
          <SummaryItem label="Completed Visits" value={completedAppointments.length} />
          <SummaryItem label="Open Clock Records" value={openClockRecords.length} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900">Recent Incidents</h3>

        {incidents.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No incidents reported for this client.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id}
                className="rounded-xl bg-gray-50 p-4"
              >
                <div className="flex flex-col justify-between gap-2 md:flex-row">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {incident.incidentType}
                    </p>

                    <p className="text-sm text-gray-500">
                      {incident.incidentDateTime
                        ? new Date(incident.incidentDateTime).toLocaleString()
                        : "No date"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge value={incident.severity} />
                    <Badge value={incident.status} />
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-700">
                  {incident.description || "No description"}
                </p>

                {incident.correctiveAction && (
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">Corrective Action:</span>{" "}
                    {incident.correctiveAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900">Medication Risk</h3>

        {missedMeds.length === 0 && refusedMeds.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No missed or refused medication records found.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {[...missedMeds, ...refusedMeds].slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">
                  {log.medicationName}
                </p>

                <p className="text-sm text-gray-500">
                  Status: {log.status}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  {log.missedReason ||
                    log.refusalReason ||
                    log.notes ||
                    "No reason provided"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RiskCard({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Badge({ value }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      {value}
    </span>
  )
}

export default ClientRiskSafetyTab