import { useEffect, useState } from "react"
import { getClientAppointments } from "../../services/clientApi"

function ClientAppointmentsTab({ clientId }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadAppointments() {
      try {
        const data = await getClientAppointments(clientId)
        setAppointments(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [clientId])

  if (loading) {
    return <p className="text-gray-500">Loading appointments...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (appointments.length === 0) {
    return <p className="text-gray-500">No appointments found for this client.</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Appointments</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-3">Caregiver</th>
              <th className="py-3">Start Time</th>
              <th className="py-3">End Time</th>
              <th className="py-3">Status</th>
              <th className="py-3">Completed</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b last:border-0">
                <td className="py-4 font-medium text-gray-900">
                  {appointment.caregiverName || "Not assigned"}
                </td>

                <td className="py-4 text-gray-700">
                  {appointment.startTime
                    ? new Date(appointment.startTime).toLocaleString()
                    : "—"}
                </td>

                <td className="py-4 text-gray-700">
                  {appointment.endTime
                    ? new Date(appointment.endTime).toLocaleString()
                    : "—"}
                </td>

                <td className="py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {appointment.status}
                  </span>
                </td>

                <td className="py-4 text-gray-700">
                  {appointment.completed ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClientAppointmentsTab