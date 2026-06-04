import { useEffect, useState } from "react"
import api from "../../api/axios"

function FamilyMedicationsTab() {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadMedications()
  }, [])

  async function loadMedications() {
    try {
      setLoading(true)
      setErrorMessage("")

      const response = await api.get("/family-portal/medications")

      setMedications(response.data || [])
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load medications."
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading medications...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-slate-900">Medications</h2>

      {medications.length === 0 ? (
        <p className="mt-4 text-slate-500">No active medications found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {medications.map((med) => (
            <div
              key={med.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {med.medicationName}
                  </h3>

                  <p className="mt-1 font-semibold text-slate-700">
                    {med.dosage}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Active
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info label="Frequency" value={med.frequency} />
                <Info
                  label="Scheduled Time"
                  value={formatTime(med.scheduledTime)}
                />
              </div>

              <div className="mt-4 rounded-xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Instructions
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {med.instructions || "No instructions provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function formatTime(value) {
  if (!value) return "—"

  const [hour, minute] = value.split(":")
  const date = new Date()

  date.setHours(Number(hour))
  date.setMinutes(Number(minute))

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default FamilyMedicationsTab