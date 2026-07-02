import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  UserPlus,
  X,
  Users,
  UserCheck,
  AlertTriangle,
  CalendarDays,
  Eye,
  MoreVertical,
  Filter,
  Phone,
  MapPin,
} from "lucide-react"

import { getClients, createClient } from "../services/clientService"

function ClientsPage() {
  const navigate = useNavigate()

  const [clients, setClients] = useState([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    phoneNumber: "",
    address: "",
    mobilityStatus: "",
  })

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      setLoading(true)
      const data = await getClients()
      setClients(data || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load clients")
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
      gender: "",
      phoneNumber: "",
      address: "",
      mobilityStatus: "",
    })
  }

  async function handleCreateClient(e) {
    e.preventDefault()

    try {
      setSaving(true)

      await createClient({
        fullName: formData.fullName,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        mobilityStatus: formData.mobilityStatus,
      })

      resetForm()
      setShowModal(false)
      await loadClients()

      alert("Client created successfully.")
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Failed to create client")
    } finally {
      setSaving(false)
    }
  }

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        client.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
        client.address?.toLowerCase().includes(search.toLowerCase())

      const status = getClientStatus(client)

      const matchesTab =
        activeTab === "ALL" ||
        activeTab === status ||
        (activeTab === "HIGH_RISK" && isHighRiskClient(client))

      return matchesSearch && matchesTab
    })
  }, [clients, search, activeTab])

  const totalClients = clients.length
  const activeClients = clients.filter(
    (client) => getClientStatus(client) === "ACTIVE"
  ).length
  const highRiskClients = clients.filter(isHighRiskClient).length
  const clientsWithMobilityNeeds = clients.filter(
    (client) => client.mobilityStatus && client.mobilityStatus !== "Independent"
  ).length

  const tabs = [
    { key: "ALL", label: "All Clients" },
    { key: "ACTIVE", label: "Active" },
    { key: "INACTIVE", label: "Inactive" },
    { key: "HIGH_RISK", label: "High Risk" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading clients...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Clients
          </h1>
          <p className="mt-2 text-slate-500">
            View and manage all clients receiving care.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-64"
              placeholder="Search clients..."
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
            <UserPlus size={18} />
            Add Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Clients"
          value={totalClients}
          subtitle="All enrolled clients"
          icon={<Users size={26} />}
          tone="purple"
        />
        <MetricCard
          title="Active Clients"
          value={activeClients}
          subtitle="Currently receiving care"
          icon={<UserCheck size={26} />}
          tone="green"
        />
        <MetricCard
          title="High Risk"
          value={highRiskClients}
          subtitle="Needs supervisor attention"
          icon={<AlertTriangle size={26} />}
          tone="orange"
        />
        <MetricCard
          title="Mobility Needs"
          value={clientsWithMobilityNeeds}
          subtitle="Requires care planning"
          icon={<CalendarDays size={26} />}
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
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Client
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Address
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Mobility
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                  Risk
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
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="cursor-pointer px-6 py-5"
                  >
                    <div className="flex items-center gap-4">
                      <ClientAvatar name={client.fullName} />
                      <div>
                        <p className="font-black text-slate-900">
                          {client.fullName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          ID: CLI-{String(client.id).padStart(5, "0")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={15} />
                      {client.phoneNumber || "—"}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {client.gender || "—"}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex max-w-xs items-start gap-2 text-sm text-slate-600">
                      <MapPin size={15} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2">
                        {client.address || "—"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <SmallPill>{client.mobilityStatus || "Not set"}</SmallPill>
                  </td>

                  <td className="px-6 py-5">
                    <RiskBadge client={client} />
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={getClientStatus(client)} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/clients/${client.id}`)}
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

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No clients found.
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
            Showing {filteredClients.length} of {clients.length} clients
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
        <ClientModal
          formData={formData}
          saving={saving}
          onChange={handleChange}
          onClose={() => {
            resetForm()
            setShowModal(false)
          }}
          onSubmit={handleCreateClient}
        />
      )}
    </div>
  )
}

function ClientModal({ formData, saving, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Add Client</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a client profile for care coordination.
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
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              name="gender"
              value={formData.gender}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </select>

            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            required
          />

          <select
            name="mobilityStatus"
            value={formData.mobilityStatus}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Mobility Status</option>
            <option value="Independent">Independent</option>
            <option value="Walker">Walker</option>
            <option value="Wheelchair">Wheelchair</option>
            <option value="Bedbound">Bedbound</option>
            <option value="Fall Risk">Fall Risk</option>
          </select>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            {saving ? "Creating..." : "Create Client"}
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

function ClientAvatar({ name }) {
  const initials = getInitials(name)

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
      {initials}
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

function RiskBadge({ client }) {
  if (isHighRiskClient(client)) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
        High Risk
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
      Standard
    </span>
  )
}

function getClientStatus(client) {
  if (client.active === false || client.status === "INACTIVE") {
    return "INACTIVE"
  }

  return "ACTIVE"
}

function isHighRiskClient(client) {
  const mobility = client.mobilityStatus?.toLowerCase() || ""

  return (
    mobility.includes("wheelchair") ||
    mobility.includes("bedbound") ||
    mobility.includes("fall")
  )
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

export default ClientsPage