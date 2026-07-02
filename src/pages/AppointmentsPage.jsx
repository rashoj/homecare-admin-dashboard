import { useEffect, useMemo, useState } from "react"
import {
  CalendarPlus,
  Search,
  X,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Filter,
  UserRound,
  HeartPulse,
  DollarSign,
  ShieldCheck,
  MoreVertical,
} from "lucide-react"

import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "../services/appointmentService"

import { getClients } from "../services/clientService"
import { getClientCaregivers } from "../services/clientCaregiverApi"
import { getSchedulerCaregivers } from "../services/schedulerService"

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [assignedCaregivers, setAssignedCaregivers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [loadingCaregivers, setLoadingCaregivers] = useState(false)
  const [saving, setSaving] = useState(false)

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
      setLoading(true)

      const [appointmentData, clientData] = await Promise.all([
        getAppointments(),
        getClients(),
      ])

      setAppointments(appointmentData || [])
      setClients(clientData || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  function getCurrentUser() {
    const savedUser = localStorage.getItem("homecare_user")
    return savedUser ? JSON.parse(savedUser) : null
  }

  async function loadAssignedCaregivers(clientId) {
    if (!clientId) {
      setAssignedCaregivers([])
      return
    }

    try {
      setLoadingCaregivers(true)

      const [assignedData, schedulerData] = await Promise.all([
        getClientCaregivers(clientId),
        getSchedulerCaregivers(),
      ])

      const enrichedCaregivers = (assignedData || []).map((assignment) => {
        const schedulerInfo = (schedulerData || []).find(
          (item) => Number(item.caregiverId) === Number(assignment.caregiverId)
        )

        return {
          ...assignment,
          schedulerInfo,
        }
      })

      setAssignedCaregivers(enrichedCaregivers)
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

    const currentUser = getCurrentUser()

    if (!currentUser?.id) {
      alert("Logged-in admin user was not found. Please logout and login again.")
      return
    }

    const selectedCaregiver = assignedCaregivers.find(
      (item) => Number(item.caregiverId) === Number(formData.caregiverId)
    )

    if (selectedCaregiver?.schedulerInfo?.schedulingBlocked === true) {
      const reasons = Array.isArray(selectedCaregiver.schedulerInfo.blockingReasons)
        ? selectedCaregiver.schedulerInfo.blockingReasons
        : []

      alert(
        reasons.length > 0
          ? reasons.join("\n")
          : "This caregiver cannot be scheduled."
      )
      return
    }

    try {
      setSaving(true)

      await createAppointment({
        ...formData,
        clientId: Number(formData.clientId),
        caregiverId: Number(formData.caregiverId),
        createdByUserId: currentUser.id,
        repeatType: "NONE",
      })

      setShowModal(false)
      resetForm()
      await loadData()

      alert("Appointment created successfully.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to create appointment")
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusUpdate(appointment, status) {
    const currentUser = getCurrentUser()

    if (!currentUser?.id) {
      alert("Logged-in admin user was not found. Please logout and login again.")
      return
    }

    try {
      await updateAppointmentStatus(appointment.id, {
        status,
        notes: appointment.notes || "",
        updatedByUserId: currentUser.id,
      })

      await loadData()
      alert(`Appointment marked as ${formatLabel(status)}.`)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to update appointment status.")
    }
  }

  const selectedCaregiver = assignedCaregivers.find(
    (item) => Number(item.caregiverId) === Number(formData.caregiverId)
  )

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.caregiverName?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.serviceType?.toLowerCase().includes(search.toLowerCase())

      const status = appointment.status || "SCHEDULED"

      const matchesTab =
        activeTab === "ALL" ||
        activeTab === status ||
        (activeTab === "TODAY" && isToday(appointment.startTime)) ||
        (activeTab === "UPCOMING" && isUpcoming(appointment.startTime))

      return matchesSearch && matchesTab
    })
  }, [appointments, search, activeTab])

  const todayCount = appointments.filter((a) => isToday(a.startTime)).length
  const scheduledCount = appointments.filter((a) => a.status === "SCHEDULED").length
  const inProgressCount = appointments.filter((a) => a.status === "IN_PROGRESS").length
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length
  const missedCount = appointments.filter((a) => a.status === "MISSED").length
  const evvRequiredCount = appointments.filter((a) => a.evvRequired).length

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "TODAY", label: "Today" },
    { key: "UPCOMING", label: "Upcoming" },
    { key: "SCHEDULED", label: "Scheduled" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "COMPLETED", label: "Completed" },
    { key: "MISSED", label: "Missed" },
    { key: "CANCELLED", label: "Cancelled" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading appointments...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Appointments
          </h1>
          <p className="mt-2 text-slate-500">
            Manage visits, EVV requirements, caregiver schedules, and billable care.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-64"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter size={17} />
            Filters
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <CalendarPlus size={18} />
            Schedule Visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today’s Visits" value={todayCount} subtitle="Scheduled for today" icon={<CalendarDays size={26} />} tone="blue" />
        <MetricCard title="Scheduled" value={scheduledCount} subtitle="Upcoming scheduled visits" icon={<Clock3 size={26} />} tone="purple" />
        <MetricCard title="In Progress" value={inProgressCount} subtitle="Currently active visits" icon={<Activity size={26} />} tone="orange" />
        <MetricCard title="Completed" value={completedCount} subtitle="Finished appointments" icon={<CheckCircle2 size={26} />} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MetricCard title="Missed Visits" value={missedCount} subtitle="Requires supervisor review" icon={<AlertTriangle size={26} />} tone="red" />
        <MetricCard title="EVV Required" value={evvRequiredCount} subtitle="Visits needing EVV verification" icon={<ShieldCheck size={26} />} tone="blue" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-1 py-5 text-sm font-bold ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHead>Client</TableHead>
                <TableHead>Caregiver</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>EVV</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={appointment.clientName} tone="blue" />
                      <div>
                        <p className="font-black text-slate-900">
                          {appointment.clientName || "Unknown Client"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Visit #{appointment.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={appointment.caregiverName} tone="purple" />
                      <div>
                        <p className="font-bold text-slate-800">
                          {appointment.caregiverName || "Unassigned"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Caregiver
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800">
                      {formatDate(appointment.startTime)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <SmallPill>{formatLabel(appointment.serviceType)}</SmallPill>
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      {formatLabel(appointment.shiftType)}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <BooleanBadge value={appointment.evvRequired} trueLabel="Required" falseLabel="Not Required" />
                  </td>

                  <td className="px-6 py-5">
                    <BooleanBadge value={appointment.billable} trueLabel="Billable" falseLabel="Non-billable" />
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={appointment.status} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <select
                        value={appointment.status || "SCHEDULED"}
                        onChange={(e) =>
                          handleStatusUpdate(appointment, e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="MISSED">Missed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      <button className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-100">
                        <MoreVertical size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No appointments found.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Previous
            </button>
            <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
              1
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <AppointmentModal
          clients={clients}
          formData={formData}
          assignedCaregivers={assignedCaregivers}
          selectedCaregiver={selectedCaregiver}
          loadingCaregivers={loadingCaregivers}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleCreateAppointment}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
        />
      )}
    </div>
  )
}

function AppointmentModal({
  clients,
  formData,
  assignedCaregivers,
  selectedCaregiver,
  loadingCaregivers,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Schedule Appointment
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Assign a compliant caregiver to a client visit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <select
            name="clientId"
            value={formData.clientId}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
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

            {assignedCaregivers.map((assignment) => {
              const info = assignment.schedulerInfo
              const blocked = info?.schedulingBlocked === true
              const score = info?.readinessScore ?? 0

              const label = blocked
                ? `${assignment.caregiverName} (Blocked)`
                : `${assignment.caregiverName} (Ready ${score}%)`

              return (
                <option
                  key={assignment.caregiverId}
                  value={assignment.caregiverId}
                  disabled={blocked}
                >
                  {label}
                </option>
              )
            })}
          </select>

          {formData.clientId && assignedCaregivers.length === 0 && (
            <p className="rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
              No active caregivers assigned to this client. Assign a caregiver before scheduling.
            </p>
          )}

          {formData.caregiverId && (
            <CaregiverReadinessNotice caregiver={selectedCaregiver} />
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="PERSONAL_CARE">Personal Care</option>
              <option value="COMPANION">Companion Care</option>
              <option value="MEDICATION_REMINDER">Medication Reminder</option>
              <option value="TRANSPORTATION">Transportation</option>
              <option value="ADL_ASSISTANCE">ADL Assistance</option>
              <option value="BEHAVIORAL_SUPPORT">Behavioral Support</option>
            </select>

            <select
              name="shiftType"
              value={formData.shiftType}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="REGULAR">Regular</option>
              <option value="PRN">PRN</option>
              <option value="FILL_IN">Fill-In</option>
              <option value="OPEN_SHIFT">Open Shift</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DateTimeInput label="Start Date/Time" name="startTime" value={formData.startTime} onChange={onChange} />
            <DateTimeInput label="End Date/Time" name="endTime" value={formData.endTime} onChange={onChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CheckboxCard
              name="evvRequired"
              checked={formData.evvRequired}
              onChange={onChange}
              title="EVV Required"
              tone="blue"
            />

            <CheckboxCard
              name="billable"
              checked={formData.billable}
              onChange={onChange}
              title="Billable Visit"
              tone="green"
            />
          </div>

          <textarea
            name="notes"
            placeholder="Appointment notes"
            value={formData.notes}
            onChange={onChange}
            className="h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving || selectedCaregiver?.schedulerInfo?.schedulingBlocked === true}
            className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            {saving ? "Scheduling..." : "Schedule Appointment"}
          </button>
        </form>
      </div>
    </div>
  )
}

function CaregiverReadinessNotice({ caregiver }) {
  const info = caregiver?.schedulerInfo

  if (!caregiver || !info) return null

  const blockingReasons = Array.isArray(info.blockingReasons)
    ? info.blockingReasons
    : []

  const warnings = Array.isArray(info.warnings) ? info.warnings : []

  if (info.schedulingBlocked === true) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
        <p className="font-bold">This caregiver cannot be scheduled.</p>
        {blockingReasons.length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {blockingReasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (warnings.length > 0) {
    return (
      <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-700">
        <p className="font-bold">Caregiver is ready with warnings.</p>
        <ul className="mt-2 list-disc pl-5">
          {warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700">
      <p className="font-bold">Caregiver is ready to work.</p>
      <p className="mt-1">Readiness Score: {info.readinessScore ?? 0}%</p>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tones[tone] || tones.blue}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  )
}

function Avatar({ name, tone }) {
  const style = tone === "purple"
    ? "bg-purple-100 text-purple-700"
    : "bg-blue-100 text-blue-700"

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${style}`}>
      {getInitials(name)}
    </div>
  )
}

function SmallPill({ children }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {children}
    </span>
  )
}

function BooleanBadge({ value, trueLabel, falseLabel }) {
  if (value) {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        {trueLabel}
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {falseLabel}
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "COMPLETED") return <Badge color="green">Completed</Badge>
  if (status === "IN_PROGRESS") return <Badge color="blue">In Progress</Badge>
  if (status === "MISSED") return <Badge color="red">Missed</Badge>
  if (status === "CANCELLED") return <Badge color="slate">Cancelled</Badge>
  return <Badge color="yellow">Scheduled</Badge>
}

function Badge({ color, children }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-700",
    yellow: "bg-yellow-100 text-yellow-700",
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${colors[color]}`}>
      {children}
    </span>
  )
}

function DateTimeInput({ label, name, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        required
      />
    </div>
  )
}

function CheckboxCard({ name, checked, onChange, title, tone }) {
  const style =
    tone === "green"
      ? "bg-green-50 text-green-700"
      : "bg-blue-50 text-blue-700"

  return (
    <label className={`flex items-center gap-3 rounded-2xl p-4 ${style}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span className="text-sm font-bold">{title}</span>
    </label>
  )
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function formatTime(value) {
  if (!value) return "—"
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function isToday(value) {
  if (!value) return false
  const date = new Date(value)
  const today = new Date()

  return date.toDateString() === today.toDateString()
}

function isUpcoming(value) {
  if (!value) return false
  return new Date(value) > new Date()
}

function getInitials(name) {
  if (!name) return "?"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default AppointmentsPage