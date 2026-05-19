import { useEffect, useState } from "react"
import { Search, UserRound, Mail, Phone, Plus } from "lucide-react"
import { getUsers, registerUser } from "../services/userService"
import { useNavigate } from "react-router-dom"

function CaregiversPage() {
  const [caregivers, setCaregivers] = useState([])
  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadCaregivers()
  }, [])

  const loadCaregivers = async () => {
    try {
      const data = await getUsers()
      setCaregivers(data.filter((user) => user.role === "CAREGIVER"))
    } catch (error) {
      console.error(error)
      alert("Failed to load caregivers")
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
      alert(error.message || "Failed to create caregiver.")
    } finally {
      setSaving(false)
    }
  }

  const filteredCaregivers = caregivers.filter(
    (caregiver) =>
      caregiver.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      caregiver.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            Caregivers
          </h2>

          <p className="mt-2 text-slate-500">
            Manage caregiver profiles, contact details, and compliance status.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Caregiver
        </button>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <Search size={20} className="text-slate-400" />

          <input
            className="w-full outline-none"
            placeholder="Search caregivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {filteredCaregivers.map((caregiver) => (
          <div
            key={caregiver.id}
            onClick={() => navigate(`/caregivers/${caregiver.id}`)}
            className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <UserRound size={32} className="text-blue-700" />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              {caregiver.fullName}
            </h3>

            <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              {caregiver.active === false ? "Inactive" : "Active"}
            </span>

            <div className="mt-5 space-y-3 text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{caregiver.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{caregiver.phoneNumber || "-"}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat title="Role" value={caregiver.role} />
              <MiniStat
                title="Status"
                value={caregiver.active === false ? "Inactive" : "Active"}
              />
            </div>
          </div>
        ))}
      </div>

      {filteredCaregivers.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
          No caregivers found.
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Add Caregiver
                </h3>

                <p className="mt-1 text-slate-500">
                  Create a caregiver account that can be assigned to clients.
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm()
                  setShowCreateModal(false)
                }}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateCaregiver} className="space-y-4">
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Temporary Password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {saving ? "Creating..." : "Create Caregiver"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  )
}

export default CaregiversPage