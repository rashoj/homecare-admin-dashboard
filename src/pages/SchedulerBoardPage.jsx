import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Search,
  AlertTriangle,
  Clock3,
  ClipboardCheck,
  Plus,
  X,
  UserCheck,
} from "lucide-react"

import {
  getAppointments,
  assignCaregiverToAppointment,
} from "../services/appointmentService"

import { getSchedulerCaregivers } from "../services/schedulerService"

function SchedulerBoardPage() {
  const [appointments, setAppointments] = useState([])
  const [caregivers, setCaregivers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAssignDrawer, setShowAssignDrawer] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [assignMessage, setAssignMessage] = useState("")

  const [draggedAppointment, setDraggedAppointment] = useState(null)
  const [dropMessage, setDropMessage] = useState("")

  useEffect(() => {
    loadBoard()
  }, [])

  async function loadBoard() {
    try {
      setLoading(true)

      const [appointmentData, caregiverData] = await Promise.all([
        getAppointments(),
        getSchedulerCaregivers(),
      ])

      setAppointments(appointmentData || [])
      setCaregivers(caregiverData || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load scheduler board.")
    } finally {
      setLoading(false)
    }
  }

  function openAssignDrawer(appointment) {
    setSelectedAppointment(appointment)
    setAssignMessage("")
    setShowAssignDrawer(true)
  }

  function closeAssignDrawer() {
    setSelectedAppointment(null)
    setAssignMessage("")
    setShowAssignDrawer(false)
  }

  async function handleAssignCaregiver(caregiver) {
    if (!selectedAppointment) return

    if (caregiver.schedulingBlocked) {
      setAssignMessage("This caregiver is blocked and cannot be scheduled.")
      return
    }

    try {
      setAssigning(true)
      setAssignMessage("Assigning caregiver...")

      await assignCaregiverToAppointment(selectedAppointment.id, {
        caregiverId: caregiver.caregiverId,
        notes: "Assigned from Scheduler Board.",
      })

      await loadBoard()
      closeAssignDrawer()
      alert("Caregiver assigned successfully.")
    } catch (error) {
      console.error(error)
      setAssignMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign caregiver."
      )
    } finally {
      setAssigning(false)
    }
  }

  async function handleDropOnCaregiver(caregiver) {
    if (!draggedAppointment) return

    if (caregiver.schedulingBlocked) {
      setDropMessage("This caregiver is blocked and cannot be scheduled.")
      setDraggedAppointment(null)
      return
    }

    try {
      setDropMessage("Assigning visit...")

      await assignCaregiverToAppointment(draggedAppointment.id, {
        caregiverId: caregiver.caregiverId,
        notes: "Assigned by drag-and-drop from Scheduler Board.",
      })

      await loadBoard()
      setDropMessage("Visit assigned successfully.")
    } catch (error) {
      console.error(error)
      setDropMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign caregiver."
      )
    } finally {
      setDraggedAppointment(null)
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const text = `${appointment.clientName || ""} ${
        appointment.caregiverName || ""
      } ${appointment.serviceType || ""}`.toLowerCase()

      return text.includes(search.toLowerCase())
    })
  }, [appointments, search])

  const assignedAppointments = filteredAppointments.filter(
    (appointment) => appointment.caregiverId
  )

  const unassignedAppointments = filteredAppointments.filter((appointment) => {
    const schedulableStatuses = ["SCHEDULED", "OPEN"]

    return (
      !appointment.caregiverId &&
      schedulableStatuses.includes(appointment.status)
    )
  })

  const todayAppointments = filteredAppointments.filter((appointment) =>
    isToday(appointment.startTime)
  )

  const completedToday = todayAppointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  )

  const inProgressToday = todayAppointments.filter(
    (appointment) => appointment.status === "IN_PROGRESS"
  )

  const missedToday = todayAppointments.filter(
    (appointment) => appointment.status === "MISSED"
  )

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading scheduler board...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Scheduler Board
          </h1>
          <p className="mt-2 text-slate-500">
            Manage today’s visits, caregiver assignments, open work, and EVV flow.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-72"
              placeholder="Search client, caregiver, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
            <Plus size={18} />
            Create Visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Today’s Visits"
          value={todayAppointments.length}
          subtitle="Scheduled today"
          icon={<CalendarDays size={26} />}
          tone="blue"
        />

        <MetricCard
          title="In Progress"
          value={inProgressToday.length}
          subtitle="Live visits"
          icon={<Clock3 size={26} />}
          tone="orange"
        />

        <MetricCard
          title="Completed"
          value={completedToday.length}
          subtitle="Finished visits"
          icon={<ClipboardCheck size={26} />}
          tone="green"
        />

        <MetricCard
          title="Missed"
          value={missedToday.length}
          subtitle="Needs review"
          icon={<AlertTriangle size={26} />}
          tone="red"
        />
      </div>

      {dropMessage && (
        <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">
          {dropMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <SchedulerColumn
          title="Unassigned / Open Work"
          subtitle={`${unassignedAppointments.length} visits need coverage`}
          warning
        >
          {unassignedAppointments.length > 0 ? (
            unassignedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showAssignButton
                draggable
                onDragStart={() => {
                  setDraggedAppointment(appointment)
                  setDropMessage("")
                }}
                onAssign={() => openAssignDrawer(appointment)}
              />
            ))
          ) : (
            <EmptyColumn text="No unassigned visits." />
          )}
        </SchedulerColumn>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex min-w-max gap-5">
            {caregivers.map((caregiver) => {
              const caregiverAppointments = assignedAppointments.filter(
                (appointment) =>
                  Number(appointment.caregiverId) ===
                  Number(caregiver.caregiverId)
              )

              return (
                <CaregiverColumn
                  key={caregiver.caregiverId}
                  caregiver={caregiver}
                  appointments={caregiverAppointments}
                  draggedAppointment={draggedAppointment}
                  onDropAppointment={() => handleDropOnCaregiver(caregiver)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {showAssignDrawer && selectedAppointment && (
        <AssignCaregiverDrawer
          appointment={selectedAppointment}
          caregivers={caregivers}
          assigning={assigning}
          assignMessage={assignMessage}
          onClose={closeAssignDrawer}
          onAssign={handleAssignCaregiver}
        />
      )}
    </div>
  )
}

function AssignCaregiverDrawer({
  appointment,
  caregivers,
  assigning,
  assignMessage,
  onClose,
  onAssign,
}) {
  const [search, setSearch] = useState("")

  const filteredCaregivers = caregivers.filter((caregiver) => {
    const text = `${caregiver.caregiverName || ""} ${
      caregiver.caregiverEmail || ""
    }`.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Assign Caregiver
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assign a compliant caregiver to this appointment.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Appointment</p>
          <h3 className="mt-1 text-xl font-black text-slate-900">
            {appointment.clientName}
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat
              label="Time"
              value={`${formatTime(appointment.startTime)} - ${formatTime(
                appointment.endTime
              )}`}
            />
            <MiniStat
              label="Service"
              value={formatLabel(appointment.serviceType)}
            />
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search caregivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {assignMessage && (
          <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            {assignMessage}
          </div>
        )}

        <div className="space-y-4">
          {filteredCaregivers.map((caregiver) => (
            <CaregiverAssignCard
              key={caregiver.caregiverId}
              caregiver={caregiver}
              assigning={assigning}
              onAssign={() => onAssign(caregiver)}
            />
          ))}

          {filteredCaregivers.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
              No caregivers found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CaregiverAssignCard({ caregiver, assigning, onAssign }) {
  const blocked = caregiver.schedulingBlocked === true
  const warning = !blocked && (caregiver.warnings || []).length > 0

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-900">
            {caregiver.caregiverName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {caregiver.caregiverEmail}
          </p>
        </div>

        <ReadinessBadge caregiver={caregiver} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat
          label="Readiness"
          value={`${caregiver.readinessScore ?? 0}%`}
        />
        <MiniStat
          label="Today Visits"
          value={caregiver.todayAppointments ?? 0}
        />
      </div>

      {blocked && caregiver.blockingReasons?.length > 0 && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4">
          <p className="text-sm font-black text-red-700">Cannot schedule</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
            {caregiver.blockingReasons.slice(0, 3).map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {warning && (
        <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
          Ready with warnings.
        </div>
      )}

      <button
        onClick={onAssign}
        disabled={blocked || assigning}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-300"
      >
        <UserCheck size={18} />
        {assigning ? "Assigning..." : "Assign Caregiver"}
      </button>
    </div>
  )
}

function CaregiverColumn({
  caregiver,
  appointments,
  draggedAppointment,
  onDropAppointment,
}) {
  const blocked = caregiver.schedulingBlocked === true

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropAppointment}
      className={`w-80 shrink-0 rounded-3xl border p-4 transition ${
        draggedAppointment
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900">
              {caregiver.caregiverName}
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {caregiver.caregiverEmail}
            </p>
          </div>

          <ReadinessBadge caregiver={caregiver} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniStat label="Score" value={`${caregiver.readinessScore ?? 0}%`} />
          <MiniStat label="Visits" value={appointments.length} />
        </div>

        {blocked && caregiver.blockingReasons?.length > 0 && (
          <div className="mt-4 rounded-xl bg-red-50 p-3">
            <p className="text-xs font-black text-red-700">
              Scheduling Blocked
            </p>
            <ul className="mt-2 list-disc pl-4 text-xs text-red-600">
              {caregiver.blockingReasons.slice(0, 2).map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {draggedAppointment && (
          <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-black text-blue-700">
            Drop visit here to assign
          </div>
        )}
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <EmptyColumn text="No visits assigned." />
        )}
      </div>
    </div>
  )
}

function SchedulerColumn({ title, subtitle, children, warning }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        {warning && (
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
            <AlertTriangle size={20} />
          </div>
        )}
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

function AppointmentCard({
  appointment,
  showAssignButton,
  onAssign,
  draggable = false,
  onDragStart,
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-black text-slate-900">
            {appointment.clientName || "Unknown Client"}
          </h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Visit #{appointment.id}
          </p>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-bold text-slate-800">Time:</span>{" "}
          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </p>

        <p>
          <span className="font-bold text-slate-800">Service:</span>{" "}
          {formatLabel(appointment.serviceType)}
        </p>

        <p>
          <span className="font-bold text-slate-800">Shift:</span>{" "}
          {formatLabel(appointment.shiftType)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {appointment.evvRequired && <SmallPill>EVV</SmallPill>}
        {appointment.billable && <SmallPill>Billable</SmallPill>}
      </div>

      {draggable && (
        <p className="mt-3 text-xs font-bold text-blue-600">
          Drag to caregiver column
        </p>
      )}

      {showAssignButton && (
        <button
          onClick={onAssign}
          className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700"
        >
          Assign Caregiver
        </button>
      )}
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            tones[tone] || tones.blue
          }`}
        >
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

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
    </div>
  )
}

function ReadinessBadge({ caregiver }) {
  if (caregiver.schedulingBlocked) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Blocked
      </span>
    )
  }

  if ((caregiver.warnings || []).length > 0) {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        Warning
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      Ready
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
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        colors[color] || colors.slate
      }`}
    >
      {children}
    </span>
  )
}

function SmallPill({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      {children}
    </span>
  )
}

function EmptyColumn({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
      {text}
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

export default SchedulerBoardPage