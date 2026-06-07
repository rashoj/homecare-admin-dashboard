import { useEffect, useState } from "react"
import {
  Building2,
  Mail,
  Phone,
  Search,
  CalendarDays,
  RefreshCw,
} from "lucide-react"
import api from "../api/axios"

function PlatformDemoRequestsPage() {
  const [demoRequests, setDemoRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    loadDemoRequests()
  }, [])

  async function loadDemoRequests() {
    try {
      setLoading(true)
      setErrorMessage("")

      const response = await api.get("/platform/demo-requests")

      setDemoRequests(response.data || [])
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load demo requests."
      )
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/platform/demo-requests/${id}/status?status=${status}`)

      setDemoRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status } : request
        )
      )
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update status."
      )
    }
  }

  const filteredRequests = demoRequests.filter((request) => {
    const keyword = search.toLowerCase()

    const matchesSearch =
      request.fullName?.toLowerCase().includes(keyword) ||
      request.agencyName?.toLowerCase().includes(keyword) ||
      request.email?.toLowerCase().includes(keyword) ||
      request.phone?.toLowerCase().includes(keyword)

    const matchesStatus =
      statusFilter === "ALL" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalCount = demoRequests.length
  const newCount = demoRequests.filter((r) => r.status === "NEW").length
  const contactedCount = demoRequests.filter((r) => r.status === "CONTACTED").length
  const qualifiedCount =
  demoRequests.filter(
    (r) => r.status === "QUALIFIED"
  ).length
  const scheduledCount = demoRequests.filter((r) => r.status === "DEMO_SCHEDULED").length
  const closedCount = demoRequests.filter((r) => r.status === "CLOSED").length

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading demo requests...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Platform Sales
          </p>

          <h2 className="mt-2 text-4xl font-black text-slate-950">
            Demo Requests
          </h2>

          <p className="mt-2 text-slate-500">
            Manage demo requests submitted from the public Homecare landing page.
          </p>
        </div>

        <button
          onClick={loadDemoRequests}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total Leads" value={totalCount} />
        <StatsCard title="New" value={newCount} />
        <StatsCard title="Contacted" value={contactedCount} />
        <StatsCard
  title="Qualified"
  value={qualifiedCount}
/>
        <StatsCard title="Demo Scheduled" value={scheduledCount} />
        <StatsCard title="Closed" value={closedCount} />
      </div>

      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search size={20} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, agency, email, or phone..."
              className="w-full outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="DEMO_SCHEDULED">Demo Scheduled</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-xl font-black text-slate-950">
            Incoming Leads
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            These are platform-level sales leads, not agency client records.
          </p>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            No demo requests found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((request) => (
              <DemoRequestCard
                key={request.id}
                request={request}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DemoRequestCard({ request, onStatusChange }) {
  return (
    <div className="p-6 transition hover:bg-slate-50">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-xl font-black text-slate-950">
              {request.fullName || "Unnamed Contact"}
            </h4>

            <StatusBadge status={request.status} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
            <Info icon={<Building2 size={16} />} value={request.agencyName || "No agency"} />
            <Info icon={<Mail size={16} />} value={request.email || "No email"} />
            <Info icon={<Phone size={16} />} value={request.phone || "No phone"} />
            <Info icon={<CalendarDays size={16} />} value={formatDate(request.createdAt)} />
          </div>

          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Agency Size
            </p>
            <p className="mt-1 font-semibold text-slate-700">
              {request.agencySize || "Not provided"}
            </p>
          </div>

          {request.message && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Message
              </p>
              <p className="mt-2 leading-7 text-slate-700">
                {request.message}
              </p>
            </div>
          )}
        </div>

        <div className="w-full xl:w-64">
          <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Lead Status
          </label>

          <select
            value={request.status || "NEW"}
            onChange={(e) => onStatusChange(request.id, e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-blue-500"
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>

            <option value="DEMO_SCHEDULED">Demo Scheduled</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-3 text-4xl font-black text-blue-700">
        {value ?? 0}
      </h3>
    </div>
  )
}

function Info({ icon, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-blue-700">{icon}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const value = status || "NEW"

const classes =
  value === "CONTACTED"
    ? "bg-blue-100 text-blue-700"
    : value === "QUALIFIED"
    ? "bg-indigo-100 text-indigo-700"
    : value === "DEMO_SCHEDULED"
    ? "bg-purple-100 text-purple-700"
    : value === "CLOSED"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>
      {value.replace("_", " ")}
    </span>
  )
}

function formatDate(value) {
  if (!value) return "—"

  return new Date(value).toLocaleString()
}

export default PlatformDemoRequestsPage