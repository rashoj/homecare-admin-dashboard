import { useEffect, useState } from "react"
import { getClients } from "../services/clientService"
import MedicationMARPanel from "../components/medications/MedicationMARPanel"

function MedicationsPage() {
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClients()
        setClients(data)
      } catch (error) {
        alert("Failed to load clients")
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  if (loading) {
    return <p className="text-slate-500">Loading clients...</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Medication Management
        </h2>

        <p className="mt-2 text-slate-500">
          Select a client to manage medication schedules, MAR history, and
          compliance.
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select Client
        </label>

        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Choose a client</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
            </option>
          ))}
        </select>
      </div>

      <MedicationMARPanel clientId={selectedClientId} />
    </div>
  )
}

export default MedicationsPage