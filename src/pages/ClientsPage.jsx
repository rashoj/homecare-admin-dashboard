import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  Search,
  UserPlus,
  X
} from "lucide-react"

import {
  getClients,
  createClient
} from "../services/clientService"

function ClientsPage() {

  const [clients, setClients] = useState([])

  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    phoneNumber: "",
    address: "",
    mobilityStatus: ""
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {

    try {

      const data = await getClients()

      setClients(data)

    } catch (error) {

      console.error(error)

      alert("Failed to load clients")
    }
  }

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCreateClient = async (e) => {

    e.preventDefault()

    try {

      await createClient(formData)

      setShowModal(false)

      setFormData({
        fullName: "",
        gender: "",
        phoneNumber: "",
        address: "",
        mobilityStatus: ""
      })

      loadClients()

    } catch (error) {

      console.error(error)

      alert("Failed to create client")
    }
  }

  const filteredClients = clients.filter((client) =>
    client.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-4xl font-bold text-slate-800">
            Clients
          </h2>

          <p className="text-slate-500 mt-2">
            Manage patient profiles and care information.
          </p>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
        >

          <UserPlus size={18} />

          Add Client

        </button>

      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">

        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">

          <Search size={20} className="text-slate-400" />

          <input
            className="w-full outline-none"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-50 border-b">

            <tr>

              <th className="p-4">Client</th>

              <th className="p-4">Gender</th>

              <th className="p-4">Phone</th>

              <th className="p-4">Mobility</th>

              <th className="p-4">Status</th>

            </tr>

          </thead>

          <tbody>

            {filteredClients.map((client) => (

              <tr
  key={client.id}
  onClick={() => navigate(`/clients/${client.id}`)}
  className="border-b hover:bg-slate-50 cursor-pointer"
>

                <td className="p-4">

                  <div>

                    <p className="font-semibold text-slate-800">
                      {client.fullName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {client.address}
                    </p>

                  </div>

                </td>

                <td className="p-4">
                  {client.gender}
                </td>

                <td className="p-4">
                  {client.phoneNumber}
                </td>

                <td className="p-4">
                  {client.mobilityStatus}
                </td>

                <td className="p-4">

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Modal */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg rounded-2xl p-8">

            <div className="flex justify-between items-center mb-6">

              <h3 className="text-2xl font-bold">
                Add Client
              </h3>

              <button onClick={() => setShowModal(false)}>

                <X size={24} />

              </button>

            </div>

            <form
              onSubmit={handleCreateClient}
              className="space-y-4"
            >

              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <input
                type="text"
                name="gender"
                placeholder="Gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                required
              />

              <input
                type="text"
                name="mobilityStatus"
                placeholder="Mobility Status"
                value={formData.mobilityStatus}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >

                Create Client

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default ClientsPage