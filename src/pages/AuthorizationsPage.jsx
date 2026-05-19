import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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

      setAuthorizations(data)
      setClients(clientsData)
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
      await createAuthorization({
        ...formData,
        clientId: Number(formData.clientId),
        approvedWeeklyHours: Number(formData.approvedWeeklyHours),
        approvedTotalHours: Number(formData.approvedTotalHours),
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

  if (loading) {
    return <p className="text-slate-500">Loading authorizations...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            Authorizations
          </h2>

          <p className="mt-2 text-slate-500">
            Track approved hours, remaining hours, expiration, and billing
            compliance.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-fit rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Add Authorization
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {authorizations.length === 0 ? (
          <p className="text-slate-500">No authorizations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Auth #</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Approved</th>
                  <th className="p-4">Used</th>
                  <th className="p-4">Remaining</th>
                  <th className="p-4">Alert</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {authorizations.map((auth) => (
                  <tr key={auth.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">
                      {auth.clientName}
                    </td>

                    <td className="p-4">{auth.authorizationNumber}</td>
                    <td className="p-4">{auth.serviceCode}</td>

                    <td className="p-4">
                      {auth.startDate} → {auth.endDate}
                    </td>

                    <td className="p-4">{auth.approvedTotalHours ?? 0}</td>
                    <td className="p-4">{auth.usedHours ?? 0}</td>

                    <td className="p-4 font-bold">
                      {auth.remainingHours ?? 0}
                    </td>

                    <td className="p-4">
                      <AlertBadge status={auth.alertStatus} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={auth.status} />
                    </td>

                    <td className="flex gap-2 p-4">
                      <button
                        onClick={() => navigate(`/clients/${auth.clientId}`)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Review
                      </button>

                      {auth.status === "ACTIVE" && (
                        <button
                          onClick={() => handleClose(auth.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Add Authorization
                </h3>

                <p className="mt-1 text-slate-500">
                  Create a new client service authorization.
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

            <form onSubmit={handleCreate} className="space-y-4">
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Select Client</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>

              <input
                name="authorizationNumber"
                value={formData.authorizationNumber}
                onChange={handleChange}
                placeholder="Authorization Number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                name="serviceCode"
                value={formData.serviceCode}
                onChange={handleChange}
                placeholder="Service Code, e.g. HHA"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="number"
                  name="approvedWeeklyHours"
                  value={formData.approvedWeeklyHours}
                  onChange={handleChange}
                  placeholder="Approved Weekly Hours"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />

                <input
                  type="number"
                  name="approvedTotalHours"
                  value={formData.approvedTotalHours}
                  onChange={handleChange}
                  placeholder="Approved Total Hours"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes"
                rows="3"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Authorization
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertBadge({ status }) {
  if (status === "OVER_USED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Over Used
      </span>
    )
  }

  if (status === "EXPIRED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Expired
      </span>
    )
  }

  if (status === "EXPIRING_SOON") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Expiring Soon
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      OK
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "CLOSED") {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        Closed
      </span>
    )
  }

  if (status === "EXPIRED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Expired
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Active
    </span>
  )
}

export default AuthorizationsPage