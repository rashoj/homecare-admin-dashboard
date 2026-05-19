import { useEffect, useState } from "react"
import { getClientVisitNotes } from "../../services/clientApi"

function ClientVisitNotesTab({ clientId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadNotes() {
      try {
        const data = await getClientVisitNotes(clientId)
        setNotes(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [clientId])

  if (loading) {
    return <p className="text-gray-500">Loading visit notes...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (notes.length === 0) {
    return <p className="text-gray-500">No visit notes found for this client.</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Visit Notes</h2>

      <div className="mt-4 space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="font-semibold text-gray-900">
                  {note.caregiverName}
                </p>

                <p className="text-sm text-gray-500">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleString()
                    : "No date"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {note.incidentReported && (
                  <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Incident Reported
                  </span>
                )}

                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Submitted
                </span>
              </div>
            </div>

            {note.aiSummary && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">
                  AI Summary
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {note.aiSummary}
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label="General Notes" value={note.generalNotes} />
              <Info label="Meals" value={note.meals} />
              <Info label="Medication Notes" value={note.medicationNotes} />
              <Info label="Mobility Notes" value={note.mobilityNotes} />
              <Info label="Mood Notes" value={note.moodNotes} />
              <Info label="Hygiene Care" value={note.hygieneCare} />
              <Info label="Safety Concerns" value={note.safetyConcerns} />
              <Info label="Family Update" value={note.familyUpdate} />
            </div>

            {note.incidentReported && note.incidentDetails && (
              <div className="mt-5 rounded-xl bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Incident Details
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {note.incidentDetails}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-sm font-medium leading-6 text-gray-900">
        {value || "Not provided"}
      </p>
    </div>
  )
}

export default ClientVisitNotesTab