import { useEffect, useState } from "react"
import api from "../../api/axios"

function FamilyAppointmentsTab() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true)
        setErrorMessage("")

        const response = await api.get("/family-portal/appointments")

        setAppointments(response.data || [])
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to load appointments."
        )
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  if (loading) return <p className="text-slate-500">Loading appointments...</p>
  if (errorMessage) return <p className="text-red-600">{errorMessage}</p>
  if (appointments.length === 0) return <p className="text-slate-500">No appointments found.</p>

  return (
    <div className="rounded-3xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>

      <div className="mt-6 space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="font-bold text-slate-900">
                  {appointment.caregiverName || "Caregiver not assigned"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDateTime(appointment.startTime)} - {formatDateTime(appointment.endTime)}
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700">
                {appointment.status || (appointment.completed ? "COMPLETED" : "SCHEDULED")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) return "Not scheduled"
  return new Date(value).toLocaleString()
}

export default FamilyAppointmentsTab