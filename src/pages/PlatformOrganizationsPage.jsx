import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"
import api from "../api/axios"

const emptyForm = {
  name: "",
  legalName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  medicaidProviderNumber: "",
  npiNumber: "",
}

function PlatformOrganizationsPage() {
  const navigate = useNavigate()

  const [organizations, setOrganizations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadOrganizations()
  }, [])

  async function loadOrganizations() {
    try {
      setLoading(true)
      setErrorMessage("")

      const response = await api.get("/platform/organizations")
      setOrganizations(response.data || [])
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load organizations."
      )
    } finally {
      setLoading(false)
    }
  }

  async function createOrganization(e) {
    e.preventDefault()

    try {
      setSaving(true)

      await api.post("/platform/organizations", form)

      setForm(emptyForm)
      setShowForm(false)
      await loadOrganizations()

      alert("Organization created successfully.")
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to create organization."
      )
    } finally {
      setSaving(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const filteredOrganizations = organizations.filter((org) => {
    const keyword = search.toLowerCase()

    return (
      org.name?.toLowerCase().includes(keyword) ||
      org.legalName?.toLowerCase().includes(keyword) ||
      org.email?.toLowerCase().includes(keyword) ||
      org.phone?.toLowerCase().includes(keyword) ||
      org.city?.toLowerCase().includes(keyword) ||
      org.state?.toLowerCase().includes(keyword)
    )
  })

  if (loading) {
    return <div className="p-8 text-slate-500">Loading organizations...</div>
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Platform Management
          </p>

          <h2 className="mt-2 text-4xl font-black text-slate-950">
            Organizations
          </h2>

          <p className="mt-2 text-slate-500">
            Manage homecare agencies using the Homecare platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadOrganizations}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            <Plus size={17} />
            New Organization
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      {showForm && (
        <div className="mb-8 rounded-3xl bg-white p-7 shadow-sm">
          <h3 className="text-2xl font-black text-slate-950">
            Create Organization
          </h3>

          <form
            onSubmit={createOrganization}
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Input
              label="Organization Name"
              value={form.name}
              onChange={(v) => updateField("name", v)}
              required
            />

            <Input
              label="Legal Name"
              value={form.legalName}
              onChange={(v) => updateField("legalName", v)}
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => updateField("email", v)}
            />

            <Input
              label="Phone"
              value={form.phone}
              onChange={(v) => updateField("phone", v)}
            />

            <Input
              label="Address Line 1"
              value={form.addressLine1}
              onChange={(v) => updateField("addressLine1", v)}
            />

            <Input
              label="Address Line 2"
              value={form.addressLine2}
              onChange={(v) => updateField("addressLine2", v)}
            />

            <Input
              label="City"
              value={form.city}
              onChange={(v) => updateField("city", v)}
            />

            <Input
              label="State"
              value={form.state}
              onChange={(v) => updateField("state", v)}
            />

            <Input
              label="Zip Code"
              value={form.zipCode}
              onChange={(v) => updateField("zipCode", v)}
            />

            <Input
              label="Medicaid Provider Number"
              value={form.medicaidProviderNumber}
              onChange={(v) => updateField("medicaidProviderNumber", v)}
            />

            <Input
              label="NPI Number"
              value={form.npiNumber}
              onChange={(v) => updateField("npiNumber", v)}
            />

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:bg-blue-300"
              >
                {saving ? "Creating..." : "Create Organization"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm)
                  setShowForm(false)
                }}
                className="rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <Search size={20} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name, email, phone, city, or state..."
            className="w-full outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredOrganizations.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm xl:col-span-2">
            No organizations found.
          </div>
        ) : (
          filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onClick={() => navigate(`/platform/organizations/${org.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function OrganizationCard({ organization, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Building2 size={26} />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-950">
              {organization.name}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {organization.legalName || "Legal name not provided"}
            </p>
          </div>
        </div>

        <StatusBadge status={organization.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Info icon={<Mail size={16} />} value={organization.email || "No email"} />
        <Info icon={<Phone size={16} />} value={organization.phone || "No phone"} />

        <Info
          icon={<MapPin size={16} />}
          value={`${organization.city || "—"}, ${organization.state || "—"}`}
        />

        <Info value={`NPI: ${organization.npiNumber || "—"}`} />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Medicaid Provider
        </p>

        <p className="mt-2 font-semibold text-slate-700">
          {organization.medicaidProviderNumber || "Not provided"}
        </p>
      </div>

      <div className="mt-5 text-sm font-bold text-blue-700">
        View organization details →
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  )
}

function Info({ icon, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
      {icon && <span className="text-blue-700">{icon}</span>}
      {value}
    </div>
  )
}

function StatusBadge({ status }) {
  const value = status || "LEAD"

  const classes =
    value === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : value === "SUSPENDED"
      ? "bg-red-100 text-red-700"
      : value === "INACTIVE"
      ? "bg-slate-200 text-slate-700"
      : "bg-yellow-100 text-yellow-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>
      {value}
    </span>
  )
}

export default PlatformOrganizationsPage