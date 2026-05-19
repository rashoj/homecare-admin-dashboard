import { useEffect, useState } from "react"
import {
  getClientCaregivers,
  assignCaregiverToClient,
} from "../../services/clientCaregiverApi"
import { getCaregivers } from "../../services/caregiverApi"

function ClientCaregiversTab({ clientId }) {
  const [assignedCaregivers, setAssignedCaregivers] = useState([])
  const [caregivers, setCaregivers] = useState([])
  const [selectedCaregiverId, setSelectedCaregiverId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadData()
  }, [clientId])

  async function loadData() {
    try {
      const assignedData = await getClientCaregivers(clientId)
      const caregiverData = await getCaregivers()

      setAssignedCaregivers(assignedData)
      setCaregivers(caregiverData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign(e) {
    e.preventDefault()

    if (!selectedCaregiverId) {
      alert("Please select a caregiver.")
      return
    }

    try {
      setSaving(true)

      await assignCaregiverToClient({
        clientId: Number(clientId),
        caregiverId: Number(selectedCaregiverId),
      })

      setSelectedCaregiverId("")
      await loadData()

      alert("Caregiver assigned successfully.")
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading caregivers...</p>
  if (errorMessage) return <p className="text-red-600">{errorMessage}</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">
        Assigned Caregivers
      </h2>

      <form
        onSubmit={handleAssign}
        className="mb-6 mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row"
      >
        <select
          value={selectedCaregiverId}
          onChange={(e) => setSelectedCaregiverId(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3"
        >
          <option value="">Select caregiver</option>

          {caregivers.map((caregiver) => (
            <option key={caregiver.id} value={caregiver.id}>
              {caregiver.fullName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {saving ? "Assigning..." : "Assign Caregiver"}
        </button>
      </form>

      {assignedCaregivers.length === 0 ? (
        <p className="text-gray-500">
          No caregivers assigned to this client.
        </p>
      ) : (
        <div className="space-y-3">
          {assignedCaregivers.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <p className="font-semibold text-gray-900">
                {assignment.caregiverName}
              </p>

              <p className="text-sm text-gray-500">
                Status: {assignment.active ? "Active" : "Inactive"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientCaregiversTab