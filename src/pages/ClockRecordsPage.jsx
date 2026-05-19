import { useEffect, useState } from "react"
import { getClockRecords } from "../services/caregiverApi"

function ClockRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadClockRecords() {
      try {
        const data = await getClockRecords()
        setRecords(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadClockRecords()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading clock records...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clock Records</h1>
        <p className="text-gray-500">
          Review caregiver EVV clock-in and clock-out activity.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        {records.length === 0 ? (
          <p className="text-gray-500">No clock records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Caregiver</th>
                  <th className="py-3">Client</th>
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
                    <td className="py-4 text-gray-700">{record.clientName}</td>
                    <td className="py-4 text-gray-700">
                      {record.clockInTime}
                    </td>
                    <td className="py-4 text-gray-700">
                      {record.clockOutTime || "—"}
                    </td>
                    <td className="py-4 text-gray-700">
                      {record.totalHours ?? "—"}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {record.status}
                      </span>
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

export default ClockRecordsPage