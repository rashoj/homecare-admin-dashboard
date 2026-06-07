import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  UserPlus,
  Users,
} from "lucide-react"
import api from "../api/axios"

const emptyAgencyAdminForm = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
}

function PlatformOrganizationDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [organization, setOrganization] = useState(null)
  const [form, setForm] = useState(null)
  const [organizationUsers, setOrganizationUsers] = useState([])
  const [agencyAdminForm, setAgencyAdminForm] = useState(emptyAgencyAdminForm)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadPageData()
  }, [id])

  async function loadPageData() {
    try {
      setLoading(true)
      setErrorMessage("")

      const [organizationResponse, usersResponse] = await Promise.all([
        api.get(`/platform/organizations/${id}`),
        api.get(`/platform/organizations/${id}/users`),
      ])

      setOrganization(organizationResponse.data)
      setForm(organizationResponse.data)
      setOrganizationUsers(usersResponse.data || [])
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load organization."
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadOrganization() {
    try {
      setErrorMessage("")

      const response = await api.get(`/platform/organizations/${id}`)
      setOrganization(response.data)
      setForm(response.data)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load organization."
      )
    }
  }

  async function loadOrganizationUsers() {
    try {
      const response = await api.get(`/platform/organizations/${id}/users`)
      setOrganizationUsers(response.data || [])
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load organization users."
      )
    }
  }

  async function updateOrganization(e) {
    e.preventDefault()

    try {
      setSaving(true)

      const response = await api.put(`/platform/organizations/${id}`, form)

      setOrganization(response.data)
      setForm(response.data)

      alert("Organization updated successfully.")
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update organization."
      )
    } finally {
      setSaving(false)
    }
  }

  async function createAgencyAdmin(e) {
    e.preventDefault()

    try {
      setCreatingAdmin(true)

      await api.post(
        `/platform/organizations/${id}/agency-admin`,
        agencyAdminForm
      )

      setAgencyAdminForm(emptyAgencyAdminForm)
      await loadOrganizationUsers()

      alert("Agency admin created successfully.")
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to create agency admin."
      )
    } finally {
      setCreatingAdmin(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function updateAgencyAdminField(field, value) {
    setAgencyAdminForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Loading organization...</div>
  }

  if (errorMessage) {
    return <div className="p-8 text-red-600">{errorMessage}</div>
  }

  if (!organization || !form) {
    return <div className="p-8 text-slate-500">Organization not found.</div>
  }

  return (
    <div>
      <button
        onClick={() => navigate("/platform/organizations")}
        className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Back to Organizations
      </button>

      <div className="mb-8 rounded-3xl bg-gradient-to-br from-blue-950 to-blue-700 p-8 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div className="flex gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Building2 size={30} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-200">
                Organization Profile
              </p>

              <h1 className="mt-2 text-4xl font-black">
                {organization.name}
              </h1>

              <p className="mt-2 text-blue-100">
                {organization.legalName || "Legal name not provided"}
              </p>
            </div>
          </div>

          <StatusBadge status={organization.status} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <HeaderInfo
            icon={<Mail size={18} />}
            label="Email"
            value={organization.email || "—"}
          />

          <HeaderInfo
            icon={<Phone size={18} />}
            label="Phone"
            value={organization.phone || "—"}
          />

          <HeaderInfo
            icon={<MapPin size={18} />}
            label="Location"
            value={`${organization.city || "—"}, ${organization.state || "—"}`}
          />
        </div>
      </div>

      <form
        onSubmit={updateOrganization}
        className="rounded-3xl bg-white p-7 shadow-sm"
      >
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Edit Organization
            </h2>

            <p className="mt-1 text-slate-500">
              Update organization profile, identifiers, and platform status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrganization}
            className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
          >
            <RefreshCw size={17} />
            Reload
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Organization Name"
            value={form.name || ""}
            onChange={(v) => updateField("name", v)}
            required
          />

          <Input
            label="Legal Name"
            value={form.legalName || ""}
            onChange={(v) => updateField("legalName", v)}
          />

          <Input
            label="Email"
            type="email"
            value={form.email || ""}
            onChange={(v) => updateField("email", v)}
          />

          <Input
            label="Phone"
            value={form.phone || ""}
            onChange={(v) => updateField("phone", v)}
          />

          <Input
            label="Address Line 1"
            value={form.addressLine1 || ""}
            onChange={(v) => updateField("addressLine1", v)}
          />

          <Input
            label="Address Line 2"
            value={form.addressLine2 || ""}
            onChange={(v) => updateField("addressLine2", v)}
          />

          <Input
            label="City"
            value={form.city || ""}
            onChange={(v) => updateField("city", v)}
          />

          <Input
            label="State"
            value={form.state || ""}
            onChange={(v) => updateField("state", v)}
          />

          <Input
            label="Zip Code"
            value={form.zipCode || ""}
            onChange={(v) => updateField("zipCode", v)}
          />

          <Input
            label="Medicaid Provider Number"
            value={form.medicaidProviderNumber || ""}
            onChange={(v) => updateField("medicaidProviderNumber", v)}
          />

          <Input
            label="NPI Number"
            value={form.npiNumber || ""}
            onChange={(v) => updateField("npiNumber", v)}
          />

          <label>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Status
            </span>

            <select
              value={form.status || "LEAD"}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </div>

        <div className="mt-7 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:bg-blue-300"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Create Agency Admin
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create the first agency admin for this organization.
              </p>
            </div>
          </div>

          <form onSubmit={createAgencyAdmin} className="space-y-4">
            <Input
              label="Full Name"
              value={agencyAdminForm.fullName}
              onChange={(v) => updateAgencyAdminField("fullName", v)}
              required
            />

            <Input
              label="Email"
              type="email"
              value={agencyAdminForm.email}
              onChange={(v) => updateAgencyAdminField("email", v)}
              required
            />

            <Input
              label="Temporary Password"
              type="password"
              value={agencyAdminForm.password}
              onChange={(v) => updateAgencyAdminField("password", v)}
              required
            />

            <Input
              label="Phone Number"
              value={agencyAdminForm.phoneNumber}
              onChange={(v) => updateAgencyAdminField("phoneNumber", v)}
            />

            <button
              type="submit"
              disabled={creatingAdmin}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:bg-blue-300"
            >
              <UserPlus size={17} />
              {creatingAdmin ? "Creating..." : "Create Agency Admin"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Users size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Organization Users
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Users assigned to this organization.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadOrganizationUsers}
              className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {organizationUsers.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No organization users found.
            </div>
          ) : (
            <div className="space-y-4">
              {organizationUsers.map((user) => (
                <OrganizationUserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HeaderInfo({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-2 text-blue-100">
        {icon}
        <span className="text-xs font-black uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      <p className="mt-2 font-bold">{value}</p>
    </div>
  )
}

function OrganizationUserCard({ user }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h3 className="font-black text-slate-950">
            {user.fullName}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {user.email}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {user.phoneNumber || "No phone number"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
            {user.role}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              user.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user.active ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
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
    <span className={`w-fit rounded-full px-4 py-2 text-xs font-black ${classes}`}>
      {value}
    </span>
  )
}

export default PlatformOrganizationDetailsPage