import { useEffect, useState } from "react"
import { CalendarPlus, Search, X } from "lucide-react"

import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "../services/appointmentService"

import { getClients } from "../services/clientService"
import { getClientCaregivers } from "../services/clientCaregiverApi"

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [assignedCaregivers, setAssignedCaregivers] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")
  const [loadingCaregivers, setLoadingCaregivers] = useState(false)

  const [formData, setFormData] = useState({
    clientId: "",
    caregiverId: "",
    startTime: "",
    endTime: "",
    serviceType: "PERSONAL_CARE",
    shiftType: "REGULAR",
    evvRequired: true,
    billable: true,
    status: "SCHEDULED",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const appointmentData = await getAppointments()
      const clientData = await getClients()

      setAppointments(appointmentData)
      setClients(clientData)
    } catch (error) {
      console.error(error)
      alert("Failed to load appointments")
    }
  }

  async function loadAssignedCaregivers(clientId) {
    if (!clientId) {
      setAssignedCaregivers([])
      return
    }

    try {
      setLoadingCaregivers(true)

      const data = await getClientCaregivers(clientId)
      setAssignedCaregivers(data)
    } catch (error) {
      console.error(error)
      setAssignedCaregivers([])
      alert("Failed to load assigned caregivers for this client.")
    } finally {
      setLoadingCaregivers(false)
    }
  }

  async function handleChange(e) {
    const { name, value, type, checked } = e.target

    const newValue = type === "checkbox" ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "clientId" ? { caregiverId: "" } : {}),
    }))

    if (name === "clientId") {
      await loadAssignedCaregivers(value)
    }
  }

  function resetForm() {
    setFormData({
      clientId: "",
      caregiverId: "",
      startTime: "",
      endTime: "",
      serviceType: "PERSONAL_CARE",
      shiftType: "REGULAR",
      evvRequired: true,
      billable: true,
      status: "SCHEDULED",
      notes: "",
    })

    setAssignedCaregivers([])
  }

  async function handleCreateAppointment(e) {
    e.preventDefault()

    if (!formData.clientId || !formData.caregiverId) {
      alert("Client and assigned caregiver are required.")
      return
    }

    if (!formData.startTime || !formData.endTime) {
      alert("Start and end time are required.")
      return
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      alert("End time must be after start time.")
      return
    }

    try {
      await createAppointment({
        ...formData,
        clientId: Number(formData.clientId),
        caregiverId: Number(formData.caregiverId),
      })

      setShowModal(false)
      resetForm()
      await loadData()

      alert("Appointment created successfully.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to create appointment")
    }
  }

  async function handleStatusUpdate(appointment, status) {
    try {
      await updateAppointmentStatus(appointment.id, {
        status,
        notes: appointment.notes || "",
      })

      await loadData()

      alert(`Appointment marked as ${formatLabel(status)}.`)
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.message ||
          "Failed to update appointment status."
      )
    }
  }

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.clientName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            Appointments
          </h2>

          <p className="mt-2 text-slate-500">
            Manage caregiver schedules, service types, EVV, and billable visits.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
        >
          <CalendarPlus size={18} />
          Create Appointment
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <Search size={20} className="text-slate-400" />

          <input
            className="w-full outline-none"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Caregiver</th>
              <th className="p-4">Service</th>
              <th className="p-4">Shift</th>
              <th className="p-4">Start</th>
              <th className="p-4">End</th>
              <th className="p-4">EVV</th>
              <th className="p-4">Billable</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-b hover:bg-slate-50">
                <td className="p-4">{appointment.clientName}</td>
                <td className="p-4">{appointment.caregiverName}</td>
                <td className="p-4">{formatLabel(appointment.serviceType)}</td>
                <td className="p-4">{formatLabel(appointment.shiftType)}</td>

                <td className="p-4">
                  {appointment.startTime
                    ? new Date(appointment.startTime).toLocaleString()
                    : "—"}
                </td>

                <td className="p-4">
                  {appointment.endTime
                    ? new Date(appointment.endTime).toLocaleString()
                    : "—"}
                </td>

                <td className="p-4">
                  {appointment.evvRequired ? "Yes" : "No"}
                </td>

                <td className="p-4">
                  {appointment.billable ? "Yes" : "No"}
                </td>

                <td className="p-4">
                  <StatusBadge status={appointment.status} />
                </td>

                <td className="p-4">
                  <select
                    value={appointment.status || "SCHEDULED"}
                    onChange={(e) =>
                      handleStatusUpdate(appointment, e.target.value)
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="MISSED">Missed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Create Appointment</h3>

              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Select Client</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>

              <select
                name="caregiverId"
                value={formData.caregiverId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
                disabled={!formData.clientId || loadingCaregivers}
              >
                <option value="">
                  {loadingCaregivers
                    ? "Loading assigned caregivers..."
                    : formData.clientId
                      ? "Select Assigned Caregiver"
                      : "Select client first"}
                </option>

                {assignedCaregivers.map((assignment) => (
                  <option
                    key={assignment.caregiverId}
                    value={assignment.caregiverId}
                  >
                    {assignment.caregiverName}
                  </option>
                ))}
              </select>

              {formData.clientId && assignedCaregivers.length === 0 && (
                <p className="rounded-xl bg-yellow-50 p-3 text-sm font-medium text-yellow-700">
                  No active caregivers assigned to this client. Assign a caregiver
                  before scheduling.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="PERSONAL_CARE">Personal Care</option>
                  <option value="COMPANION">Companion Care</option>
                  <option value="MEDICATION_REMINDER">
                    Medication Reminder
                  </option>
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="ADL_ASSISTANCE">ADL Assistance</option>
                  <option value="BEHAVIORAL_SUPPORT">
                    Behavioral Support
                  </option>
                </select>

                <select
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="REGULAR">Regular</option>
                  <option value="PRN">PRN</option>
                  <option value="FILL_IN">Fill-In</option>
                  <option value="OPEN_SHIFT">Open Shift</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Start Date/Time
                  </label>

                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    End Date/Time
                  </label>

                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">
                  <input
                    type="checkbox"
                    name="evvRequired"
                    checked={formData.evvRequired}
                    onChange={handleChange}
                  />

                  <span className="text-sm font-semibold text-blue-700">
                    EVV Required
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
                  <input
                    type="checkbox"
                    name="billable"
                    checked={formData.billable}
                    onChange={handleChange}
                  />

                  <span className="text-sm font-semibold text-green-700">
                    Billable Visit
                  </span>
                </label>
              </div>

              <textarea
                name="notes"
                placeholder="Appointment notes"
                value={formData.notes}
                onChange={handleChange}
                className="h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Create Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatusBadge({ status }) {
  if (status === "COMPLETED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
        Completed
      </span>
    )
  }

  if (status === "MISSED" || status === "CANCELLED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
        {formatLabel(status)}
      </span>
    )
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
        In Progress
      </span>
    )
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
      Scheduled
    </span>
  )
}

export default AppointmentsPage