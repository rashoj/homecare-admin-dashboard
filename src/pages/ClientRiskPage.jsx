import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getClientRiskRows } from "../services/riskApi"

function ClientRiskPage() {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadRisk() {
      try {
        const data = await getClientRiskRows()
        setRows(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadRisk()
  }, [])

  if (loading) {
    return <p className="text-slate-500">Loading client risk dashboard...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Client Risk Dashboard
        </h2>

        <p className="mt-2 text-slate-500">
          Monitor safety, incident, medication, EVV, and documentation risk by client.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {rows.length === 0 ? (
          <p className="text-slate-500">No client risk records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Incidents</th>
                  <th className="p-4">High</th>
                  <th className="p-4">Critical</th>
                  <th className="p-4">State Reportable</th>
                  <th className="p-4">Missed Meds</th>
                  <th className="p-4">Missing Notes</th>
                  <th className="p-4">Open EVV</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.clientId} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">
                      {row.clientName}
                    </td>

                    <td className="p-4">
                      <RiskBadge level={row.riskLevel} />
                    </td>

                    <td className="p-4 font-bold text-slate-800">
                      {row.riskScore}
                    </td>

                    <td className="p-4">{row.totalIncidents}</td>
                    <td className="p-4">{row.highSeverityIncidents}</td>
                    <td className="p-4">{row.criticalIncidents}</td>
                    <td className="p-4">{row.stateReportableIncidents}</td>
                    <td className="p-4">{row.missedMedications}</td>
                    <td className="p-4">{row.visitsMissingNotes}</td>
                    <td className="p-4">{row.openClockRecords}</td>

                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/clients/${row.clientId}`)}
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
    </div>
  )
}

function RiskBadge({ level }) {
  if (level === "CRITICAL") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Critical
      </span>
    )
  }

  if (level === "HIGH") {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
        High
      </span>
    )
  }

  if (level === "MEDIUM") {
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

export default ClientRiskPage