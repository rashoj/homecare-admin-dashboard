import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  X,
  Users,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Eye,
  MoreVertical,
  Filter,
  Mail,
  Phone,
} from "lucide-react"

import { getUsers, registerUser } from "../services/userService"

function CaregiversPage() {
  const navigate = useNavigate()

  const [caregivers, setCaregivers] = useState([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  })

  useEffect(() => {
    loadCaregivers()
  }, [])

  async function loadCaregivers() {
    try {
      setLoading(true)
      const data = await getUsers()
      setCaregivers((data || []).filter((user) => user.role === "CAREGIVER"))
    } catch (error) {
      console.error(error)
      alert("Failed to load caregivers")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  function resetForm() {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
    })
  }

  async function handleCreateCaregiver(e) {
    e.preventDefault()

    try {
      setSaving(true)

      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: "CAREGIVER",
      })

      resetForm()
      setShowCreateModal(false)
      await loadCaregivers()

      alert("Caregiver created successfully.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || error.message || "Failed to create caregiver.")
    } finally {
      setSaving(false)
    }
  }

  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((caregiver) => {
      const matchesSearch =
        caregiver.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        caregiver.email?.toLowerCase().includes(search.toLowerCase()) ||
        caregiver.phoneNumber?.toLowerCase().includes(search.toLowerCase())

      const status = getCaregiverStatus(caregiver)

      const matchesTab =
        activeTab === "ALL" ||
        activeTab === status ||
        (activeTab === "READY" && isReadyCaregiver(caregiver)) ||
        (activeTab === "NEEDS_REVIEW" && !isReadyCaregiver(caregiver))

      return matchesSearch && matchesTab
    })
  }, [caregivers, search, activeTab])

  const totalCaregivers = caregivers.length
  const activeCaregivers = caregivers.filter(
    (caregiver) => getCaregiverStatus(caregiver) === "ACTIVE"
  ).length
  const inactiveCaregivers = caregivers.filter(
    (caregiver) => getCaregiverStatus(caregiver) === "INACTIVE"
  ).length
  const readyCaregivers = caregivers.filter(isReadyCaregiver).length

  const tabs = [
    { key: "ALL", label: "All Caregivers" },
    { key: "ACTIVE", label: "Active" },
    { key: "INACTIVE", label: "Inactive" },
    { key: "READY", label: "Ready" },
    { key: "NEEDS_REVIEW", label: "Needs Review" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading caregivers...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Caregivers
          </h1>
          <p className="mt-2 text-slate-500">
            Manage caregiver profiles, workforce readiness, and compliance status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-64"
              placeholder="Search caregivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter size={17} />
            Filters
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Caregiver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Caregivers"
          value={totalCaregivers}
          subtitle="All workforce users"
          icon={<Users size={26} />}
          tone="purple"
        />
        <MetricCard
          title="Active"
          value={activeCaregivers}
          subtitle="Available in workforce"
          icon={<UserCheck size={26} />}
          tone="green"
        />
        <MetricCard
          title="Needs Review"
          value={inactiveCaregivers}
          subtitle="Inactive or incomplete profile"
          icon={<AlertTriangle size={26} />}
          tone="orange"
        />
        <MetricCard
          title="Ready"
          value={readyCaregivers}
          subtitle="Ready for scheduling"
          icon={<ShieldCheck size={26} />}
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
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Caregiver
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Readiness
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCaregivers.map((caregiver) => (
                <tr
                  key={caregiver.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td
                    onClick={() => navigate(`/caregivers/${caregiver.id}`)}
                    className="cursor-pointer px-6 py-5"
                  >
                    <div className="flex items-center gap-4">
                      <CaregiverAvatar name={caregiver.fullName} />
                      <div>
                        <p className="font-black text-slate-900">
                          {caregiver.fullName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          ID: CG-{String(caregiver.id).padStart(5, "0")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={15} />
                      {caregiver.email || "—"}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                      <Phone size={15} />
                      {caregiver.phoneNumber || "—"}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <SmallPill>{formatLabel(caregiver.role)}</SmallPill>
                  </td>

                  <td className="px-6 py-5">
                    <ReadinessBadge caregiver={caregiver} />
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={getCaregiverStatus(caregiver)} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/caregivers/${caregiver.id}`)}
                        className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye size={17} />
                      </button>

                      <button className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-100">
                        <MoreVertical size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCaregivers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No caregivers found.
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
            Showing {filteredCaregivers.length} of {caregivers.length} caregivers
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

      {showCreateModal && (
        <CaregiverModal
          formData={formData}
          saving={saving}
          onChange={handleChange}
          onClose={() => {
            resetForm()
            setShowCreateModal(false)
          }}
          onSubmit={handleCreateCaregiver}
        />
      )}
    </div>
  )
}

function CaregiverModal({ formData, saving, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Add Caregiver
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a caregiver account that can be assigned to clients.
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
          <input
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            placeholder="Full Name"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onChange}
            placeholder="Phone Number"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Temporary Password"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            {saving ? "Creating..." : "Create Caregiver"}
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
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
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

function CaregiverAvatar({ name }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
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

function StatusBadge({ status }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        Active
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      Inactive
    </span>
  )
}

function ReadinessBadge({ caregiver }) {
  if (isReadyCaregiver(caregiver)) {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
        Ready
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
      Needs Review
    </span>
  )
}

function getCaregiverStatus(caregiver) {
  if (caregiver.active === false || caregiver.status === "INACTIVE") {
    return "INACTIVE"
  }

  return "ACTIVE"
}

function isReadyCaregiver(caregiver) {
  return getCaregiverStatus(caregiver) === "ACTIVE"
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
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

export default CaregiversPage