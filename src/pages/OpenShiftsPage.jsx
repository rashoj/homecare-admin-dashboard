import { useEffect, useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  Plus,
  X,
  Search,
  Filter,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Timer,
  UserCheck,
  MoreVertical,
  ShieldCheck,
  DollarSign,
} from "lucide-react"

import { getClients } from "../services/clientService"
import {
  getOpenShifts,
  createOpenShift,
  cancelOpenShift,
} from "../services/openShiftService"

function OpenShiftsPage() {
  const [openShifts, setOpenShifts] = useState([])
  const [clients, setClients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

  const [formData, setFormData] = useState({
    clientId: "",
    startTime: "",
    endTime: "",
    serviceType: "PERSONAL_CARE",
    priority: "NORMAL",
    evvRequired: true,
    billable: true,
    assignedCaregiverOnly: false,
    expiresAt: "",
    requiredSkills: "",
    notes: "",
  })

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {
    try {
      setLoading(true)

      const [shiftData, clientData] = await Promise.all([
        getOpenShifts(),
        getClients(),
      ])

      setOpenShifts(shiftData || [])
      setClients(clientData || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load open shifts.")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function resetForm() {
    setFormData({
      clientId: "",
      startTime: "",
      endTime: "",
      serviceType: "PERSONAL_CARE",
      priority: "NORMAL",
      evvRequired: true,
      billable: true,
      assignedCaregiverOnly: false,
      expiresAt: "",
      requiredSkills: "",
      notes: "",
    })
  }

  async function handleCreateOpenShift(e) {
    e.preventDefault()

    if (!formData.clientId || !formData.startTime || !formData.endTime) {
      alert("Client, start time, and end time are required.")
      return
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      alert("End time must be after start time.")
      return
    }

    if (
      formData.expiresAt &&
      new Date(formData.expiresAt) >= new Date(formData.startTime)
    ) {
      alert("Expiration time must be before the shift start time.")
      return
    }

    try {
      setSaving(true)

      await createOpenShift({
        clientId: Number(formData.clientId),
        startTime: formData.startTime,
        endTime: formData.endTime,
        serviceType: formData.serviceType,
        priority: formData.priority,
        evvRequired: formData.evvRequired,
        billable: formData.billable,
        assignedCaregiverOnly: formData.assignedCaregiverOnly,
        expiresAt: formData.expiresAt || null,
        requiredSkills: formData.requiredSkills,
        notes: formData.notes,
      })

      resetForm()
      setShowModal(false)
      await loadPage()

      alert("Open shift created successfully.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to create open shift.")
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelOpenShift(openShiftId) {
    if (!confirm("Cancel this open shift?")) return

    try {
      await cancelOpenShift(openShiftId)
      await loadPage()
      alert("Open shift cancelled.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to cancel open shift.")
    }
  }

  const filteredShifts = useMemo(() => {
    return openShifts.filter((shift) => {
      const matchesSearch =
        shift.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        shift.claimedByCaregiverName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        shift.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
        shift.priority?.toLowerCase().includes(search.toLowerCase()) ||
        shift.requiredSkills?.toLowerCase().includes(search.toLowerCase())

      const status = shift.status || "OPEN"

      const matchesTab =
        activeTab === "ALL" ||
        activeTab === status ||
        (activeTab === "URGENT" && shift.priority === "URGENT") ||
        (activeTab === "ASSIGNED_ONLY" && shift.assignedCaregiverOnly === true)

      return matchesSearch && matchesTab
    })
  }, [openShifts, search, activeTab])

  const totalOpen = openShifts.filter((shift) => shift.status === "OPEN").length
  const totalAssigned = openShifts.filter(
    (shift) => shift.status === "ASSIGNED"
  ).length
  const totalExpired = openShifts.filter(
    (shift) => shift.status === "EXPIRED"
  ).length
  const totalUrgent = openShifts.filter(
    (shift) => shift.priority === "URGENT"
  ).length
  const totalAssignedOnly = openShifts.filter(
    (shift) => shift.assignedCaregiverOnly === true
  ).length
  const totalBillable = openShifts.filter((shift) => shift.billable).length

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "OPEN", label: "Open" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "EXPIRED", label: "Expired" },
    { key: "CANCELLED", label: "Cancelled" },
    { key: "URGENT", label: "Urgent" },
    { key: "ASSIGNED_ONLY", label: "Assigned Only" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading open shifts...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Open Shift Marketplace
          </h1>
          <p className="mt-2 text-slate-500">
            Publish unassigned visits and allow eligible caregivers to claim open
            work.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-64"
              placeholder="Search shifts..."
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
            className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-purple-700"
          >
            <Plus size={18} />
            Create Shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Open Shifts"
          value={totalOpen}
          subtitle="Available to claim"
          icon={<BriefcaseBusiness size={26} />}
          tone="purple"
        />
        <MetricCard
          title="Assigned"
          value={totalAssigned}
          subtitle="Successfully claimed"
          icon={<CheckCircle2 size={26} />}
          tone="green"
        />
        <MetricCard
          title="Expired"
          value={totalExpired}
          subtitle="No longer claimable"
          icon={<Timer size={26} />}
          tone="slate"
        />
        <MetricCard
          title="Urgent"
          value={totalUrgent}
          subtitle="High priority staffing"
          icon={<AlertTriangle size={26} />}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MetricCard
          title="Assigned-Only"
          value={totalAssignedOnly}
          subtitle="Restricted to assigned caregivers"
          icon={<UserCheck size={26} />}
          tone="orange"
        />
        <MetricCard
          title="Billable Shifts"
          value={totalBillable}
          subtitle="Revenue-generating open visits"
          icon={<DollarSign size={26} />}
          tone="blue"
        />
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
                    ? "border-purple-600 text-purple-600"
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
                <TableHead>Time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Claimed By</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </tr>
            </thead>

            <tbody>
              {filteredShifts.map((shift) => (
                <tr
                  key={shift.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={shift.clientName} />
                      <div>
                        <p className="font-black text-slate-900">
                          {shift.clientName || "Unknown Client"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Shift #{shift.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800">
                      {formatDate(shift.startTime)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <SmallPill>{formatLabel(shift.serviceType)}</SmallPill>
                    {shift.requiredSkills && (
                      <div className="mt-2 flex max-w-xs flex-wrap gap-2">
                        {splitSkills(shift.requiredSkills).map((skill) => (
                          <SkillTag key={skill}>{skill}</SkillTag>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <PriorityBadge priority={shift.priority} />
                  </td>

                  <td className="px-6 py-5">
                    <ExpirationBadge shift={shift} />
                  </td>

                  <td className="px-6 py-5">
                    {shift.claimedByCaregiverName ? (
                      <div>
                        <p className="font-bold text-slate-800">
                          {shift.claimedByCaregiverName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {shift.claimedAt
                            ? formatDateTime(shift.claimedAt)
                            : "Claimed"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">
                        Not claimed
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <BooleanBadge
                        value={shift.evvRequired}
                        trueLabel="EVV Required"
                        falseLabel="No EVV"
                      />
                      <BooleanBadge
                        value={shift.billable}
                        trueLabel="Billable"
                        falseLabel="Non-billable"
                      />
                      {shift.assignedCaregiverOnly && (
                        <span className="inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          Assigned Only
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={shift.status} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {shift.status === "OPEN" && (
                        <button
                          onClick={() => handleCancelOpenShift(shift.id)}
                          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}

                      <button className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-100">
                        <MoreVertical size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredShifts.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No open shifts found.
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
            Showing {filteredShifts.length} of {openShifts.length} shifts
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Previous
            </button>
            <button className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white">
              1
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <OpenShiftModal
          clients={clients}
          formData={formData}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleCreateOpenShift}
          onClose={() => {
            resetForm()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function OpenShiftModal({
  clients,
  formData,
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
              Create Open Shift
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Publish a client visit for eligible caregivers to claim.
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
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500"
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DateTimeInput
              label="Start Date/Time"
              name="startTime"
              value={formData.startTime}
              onChange={onChange}
            />

            <DateTimeInput
              label="End Date/Time"
              name="endTime"
              value={formData.endTime}
              onChange={onChange}
            />
          </div>

          <DateTimeInput
            label="Claim Expiration"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={onChange}
            required={false}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500"
            >
              <option value="PERSONAL_CARE">Personal Care</option>
              <option value="COMPANION">Companion Care</option>
              <option value="MEDICATION_REMINDER">Medication Reminder</option>
              <option value="TRANSPORTATION">Transportation</option>
              <option value="ADL_ASSISTANCE">ADL Assistance</option>
              <option value="BEHAVIORAL_SUPPORT">Behavioral Support</option>
            </select>

            <select
              name="priority"
              value={formData.priority}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <CheckboxCard
            name="assignedCaregiverOnly"
            checked={formData.assignedCaregiverOnly}
            onChange={onChange}
            title="Only caregivers already assigned to this client can claim"
            tone="orange"
          />

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
              title="Billable"
              tone="green"
            />
          </div>

          <input
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={onChange}
            placeholder="Required skills, separated by commas"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500"
          />

          <textarea
            name="notes"
            value={formData.notes}
            onChange={onChange}
            placeholder="Notes"
            className="h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 disabled:bg-slate-300"
          >
            {saving ? "Creating..." : "Create Open Shift"}
          </button>
        </form>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            tones[tone] || tones.purple
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

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  )
}

function Avatar({ name }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-sm font-black text-purple-700">
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

function SkillTag({ children }) {
  return (
    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
      {children}
    </span>
  )
}

function BooleanBadge({ value, trueLabel, falseLabel }) {
  if (value) {
    return (
      <span className="inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        {trueLabel}
      </span>
    )
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {falseLabel}
    </span>
  )
}

function PriorityBadge({ priority }) {
  if (priority === "URGENT") return <Badge color="red">Urgent</Badge>
  if (priority === "HIGH") return <Badge color="orange">High</Badge>
  if (priority === "LOW") return <Badge color="slate">Low</Badge>
  return <Badge color="blue">Normal</Badge>
}

function StatusBadge({ status }) {
  if (status === "OPEN") return <Badge color="purple">Open</Badge>
  if (status === "ASSIGNED") return <Badge color="green">Assigned</Badge>
  if (status === "EXPIRED") return <Badge color="slate">Expired</Badge>
  if (status === "CANCELLED") return <Badge color="red">Cancelled</Badge>
  return <Badge color="slate">{formatLabel(status)}</Badge>
}

function Badge({ color, children }) {
  const colors = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        colors[color] || colors.slate
      }`}
    >
      {children}
    </span>
  )
}

function ExpirationBadge({ shift }) {
  if (shift.status === "EXPIRED") {
    return <Badge color="slate">Expired</Badge>
  }

  if (!shift.expiresAt) {
    return <Badge color="blue">No expiration</Badge>
  }

  const now = new Date()
  const expiresAt = new Date(shift.expiresAt)
  const diffMs = expiresAt.getTime() - now.getTime()

  if (diffMs <= 0) {
    return <Badge color="slate">Expired</Badge>
  }

  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours < 2) {
    return <Badge color="red">{formatTimeLeft(diffMs)} left</Badge>
  }

  if (diffHours < 8) {
    return <Badge color="orange">{formatTimeLeft(diffMs)} left</Badge>
  }

  return (
    <div>
      <Badge color="green">{formatTimeLeft(diffMs)} left</Badge>
      <p className="mt-1 text-xs text-slate-400">
        {formatDateTime(shift.expiresAt)}
      </p>
    </div>
  )
}

function DateTimeInput({ label, name, value, onChange, required = true }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-500"
        required={required}
      />
    </div>
  )
}

function CheckboxCard({ name, checked, onChange, title, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  }

  return (
    <label
      className={`flex items-center gap-3 rounded-2xl p-4 ${
        tones[tone] || tones.blue
      }`}
    >
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

function formatDateTime(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function formatTimeLeft(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

function splitSkills(value) {
  if (!value) return []

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
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

export default OpenShiftsPage