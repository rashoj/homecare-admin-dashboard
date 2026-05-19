import { useEffect, useState } from "react"
import { getClientClockRecords } from "../../services/clientApi"

function ClientClockRecordsTab({ clientId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadClockRecords() {
      try {
        const data = await getClientClockRecords(clientId)
        setRecords(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadClockRecords()
  }, [clientId])

  if (loading) {
    return <p className="text-gray-500">Loading clock records...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (records.length === 0) {
    return <p className="text-gray-500">No clock records found for this client.</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Clock Records</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-3">Caregiver</th>
              <th className="py-3">Clock In</th>
              <th className="py-3">Clock Out</th>
              <th className="py-3">Hours</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b last:border-0">
                <td className="py-4 font-medium text-gray-900">
                  {record.caregiverName}
                </td>

                <td className="py-4 text-gray-700">
                  {record.clockInTime
                    ? new Date(record.clockInTime).toLocaleString()
                    : "—"}
                </td>

                <td className="py-4 text-gray-700">
                  {record.clockOutTime
                    ? new Date(record.clockOutTime).toLocaleString()
                    : "—"}
                </td>

                <td className="py-4 text-gray-700">
                  {record.totalHours ? Number(record.totalHours).toFixed(2) : "—"}
                </td>

                <td className="py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {record.status === "CLOCKED_OUT" ? "Completed" : record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClientClockRecordsTab