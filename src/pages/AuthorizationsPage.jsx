import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react"

import {
  getAuthorizations,
  closeAuthorization,
  createAuthorization,
} from "../services/authorizationApi"
import { getClients } from "../services/clientService"

function AuthorizationsPage() {
  const navigate = useNavigate()

  const [authorizations, setAuthorizations] = useState([])
  const [clients, setClients] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

  const [formData, setFormData] = useState({
    clientId: "",
    authorizationNumber: "",
    serviceCode: "",
    startDate: "",
    endDate: "",
    approvedWeeklyHours: "",
    approvedTotalHours: "",
    notes: "",
  })

  useEffect(() => {
    loadAuthorizations()
  }, [])

  async function loadAuthorizations() {
    try {
      const data = await getAuthorizations()
      const clientsData = await getClients()

      setAuthorizations(data || [])
      setClients(clientsData || [])
    } catch (error) {
      setErrorMessage(error.message)
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
      clientId: "",
      authorizationNumber: "",
      serviceCode: "",
      startDate: "",
      endDate: "",
      approvedWeeklyHours: "",
      approvedTotalHours: "",
      notes: "",
    })
  }

  async function handleCreate(e) {
    e.preventDefault()

    try {
      const savedUser = localStorage.getItem("homecare_user")
      const currentUser = savedUser ? JSON.parse(savedUser) : null

      await createAuthorization({
        ...formData,
        clientId: Number(formData.clientId),
        approvedWeeklyHours: Number(formData.approvedWeeklyHours),
        approvedTotalHours: Number(formData.approvedTotalHours),
        actorUserId: currentUser?.id,
      })

      resetForm()
      setShowCreateModal(false)

      await loadAuthorizations()

      alert("Authorization created.")
    } catch (error) {
      alert(error.message)
    }
  }

  async function handleClose(id) {
    if (!window.confirm("Close this authorization?")) return

    try {
      await closeAuthorization(id)
      await loadAuthorizations()

      alert("Authorization closed.")
    } catch (error) {
      alert(error.message)
    }
  }

  const filteredAuthorizations = useMemo(() => {
    return authorizations.filter((auth) => {
      const text = `${auth.clientName || ""} ${auth.authorizationNumber || ""} ${
        auth.serviceCode || ""
      } ${auth.status || ""} ${auth.alertStatus || ""}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesTab =
        activeTab === "ALL" ||
        auth.status === activeTab ||
        auth.alertStatus === activeTab

      return matchesSearch && matchesTab
    })
  }, [authorizations, search, activeTab])

  const activeCount = authorizations.filter((a) => a.status === "ACTIVE").length
  const expiringSoonCount = authorizations.filter(
    (a) => a.alertStatus === "EXPIRING_SOON"
  ).length
  const expiredCount = authorizations.filter(
    (a) => a.status === "EXPIRED" || a.alertStatus === "EXPIRED"
  ).length
  const overUsedCount = authorizations.filter(
    (a) => a.alertStatus === "OVER_USED"
  ).length

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "ACTIVE", label: "Active" },
    { key: "EXPIRING_SOON", label: "Expiring Soon" },
    { key: "EXPIRED", label: "Expired" },
    { key: "OVER_USED", label: "Over Used" },
    { key: "CLOSED", label: "Closed" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading authorizations...
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 font-semibold text-red-700">
        {errorMessage}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Authorizations
          </h1>

          <p className="mt-2 text-slate-500">
            Track approved hours, remaining hours, utilization, expiration, and
            billing compliance.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex w-fit items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Authorization
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active"
          value={activeCount}
          subtitle="Currently approved"
          icon={<CheckCircle2 size={26} />}
          tone="green"
        />
        <MetricCard
          title="Expiring Soon"
          value={expiringSoonCount}
          subtitle="Needs renewal review"
          icon={<Clock3 size={26} />}
          tone="yellow"
        />
        <MetricCard
          title="Expired"
          value={expiredCount}
          subtitle="Authorization ended"
          icon={<XCircle size={26} />}
          tone="red"
        />
        <MetricCard
          title="Over Used"
          value={overUsedCount}
          subtitle="Hours exceeded"
          icon={<AlertTriangle size={26} />}
          tone="red"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none xl:w-96"
            placeholder="Search client, authorization number, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {filteredAuthorizations.length === 0 ? (
          <EmptyState onCreate={() => setShowCreateModal(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <TableHead>Client</TableHead>
                  <TableHead>Authorization</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredAuthorizations.map((auth) => (
                  <tr
                    key={auth.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar name={auth.clientName} />
                        <div>
                          <p className="font-black text-slate-900">
                            {auth.clientName || "Unknown Client"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Client #{auth.clientId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800">
                        {auth.authorizationNumber || "—"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Auth #{auth.id}
                      </p>
                    </td>

                    <td className="px-6 py-5 font-bold text-slate-700">
                      {auth.serviceCode || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800">
                        {auth.startDate || "—"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        to {auth.endDate || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <UtilizationBar auth={auth} />
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-xl font-black text-slate-900">
                        {auth.remainingHours ?? 0}
                      </p>
                      <p className="text-sm text-slate-500">hours left</p>
                    </td>

                    <td className="px-6 py-5">
                      <AlertBadge status={auth.alertStatus} />
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={auth.status} />
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/clients/${auth.clientId}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                        >
                          <Eye size={16} />
                          Review
                        </button>

                        {auth.status === "ACTIVE" && (
                          <button
                            onClick={() => handleClose(auth.id)}
                            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredAuthorizations.length} of {authorizations.length}{" "}
            authorizations
          </p>
        </div>
      </div>

      {showCreateModal && (
        <CreateAuthorizationModal
          clients={clients}
          formData={formData}
          handleChange={handleChange}
          handleCreate={handleCreate}
          resetForm={resetForm}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

function CreateAuthorizationModal({
  clients,
  formData,
  handleChange,
  handleCreate,
  resetForm,
  onClose,
}) {
  function closeModal() {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Add Authorization
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a new client service authorization.
            </p>
          </div>

          <button
            onClick={closeModal}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-6 p-6">
          <FormSection title="General">
            <FormField label="Client">
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Authorization Number">
              <input
                name="authorizationNumber"
                value={formData.authorizationNumber}
                onChange={handleChange}
                placeholder="Authorization Number"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </FormField>

            <FormField label="Service Code">
              <input
                name="serviceCode"
                value={formData.serviceCode}
                onChange={handleChange}
                placeholder="Service Code, e.g. HHA"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </FormField>
          </FormSection>

          <FormSection title="Coverage Dates">
            <FormField label="Start Date">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </FormField>
          </FormSection>

          <FormSection title="Approved Hours">
            <FormField label="Approved Weekly Hours">
              <input
                type="number"
                name="approvedWeeklyHours"
                value={formData.approvedWeeklyHours}
                onChange={handleChange}
                placeholder="Approved Weekly Hours"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </FormField>

            <FormField label="Approved Total Hours">
              <input
                type="number"
                name="approvedTotalHours"
                value={formData.approvedTotalHours}
                onChange={handleChange}
                placeholder="Approved Total Hours"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </FormField>
          </FormSection>

          <FormField label="Notes">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes"
              rows="3"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            />
          </FormField>

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700"
          >
            Save Authorization
          </button>
        </form>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            tones[tone] || tones.green
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

function UtilizationBar({ auth }) {
  const approved = Number(auth.approvedTotalHours || 0)
  const used = Number(auth.usedHours || 0)
  const percent = approved > 0 ? Math.min((used / approved) * 100, 100) : 0

  return (
    <div className="min-w-[180px]">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-slate-800">
          {used} / {approved} hrs
        </span>
        <span className="font-bold text-slate-500">
          {Math.round(percent)}%
        </span>
      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            percent >= 100
              ? "bg-red-500"
              : percent >= 85
              ? "bg-yellow-500"
              : "bg-blue-600"
          }`}
          style={{ width: `${percent}%` }}
        />
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
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
      {getInitials(name)}
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
        <FileCheck size={30} />
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-900">
        No authorizations found
      </h3>
      <p className="mt-2 text-slate-500">
        Create your first payer authorization to begin tracking approved hours.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
      >
        Add Authorization
      </button>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="mb-4 font-black text-slate-900">{title}</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  )
}

function AlertBadge({ status }) {
  if (status === "OVER_USED") {
    return <Badge color="red">Over Used</Badge>
  }

  if (status === "EXPIRED") {
    return <Badge color="red">Expired</Badge>
  }

  if (status === "EXPIRING_SOON") {
    return <Badge color="yellow">Expiring Soon</Badge>
  }

  return <Badge color="green">OK</Badge>
}

function StatusBadge({ status }) {
  if (status === "CLOSED") {
    return <Badge color="slate">Closed</Badge>
  }

  if (status === "EXPIRED") {
    return <Badge color="red">Expired</Badge>
  }

  return <Badge color="green">Active</Badge>
}

function Badge({ color, children }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        colors[color] || colors.slate
      }`}
    >
      {children}
    </span>
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

export default AuthorizationsPage