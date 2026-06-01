import { useEffect, useState } from "react"

function FamilyVisitNotesTab() {
  const [visitNotes, setVisitNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadVisitNotes() {
      try {
        const token = localStorage.getItem("homecare_auth_token")

        const response = await fetch(
          "http://localhost:8080/api/family-portal/visit-notes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load visit notes.")
        }

        setVisitNotes(await response.json())
      } catch (error) {
        setErrorMessage(error.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    loadVisitNotes()
  }, [])

  if (loading) {
    return <p className="text-slate-500">Loading visit notes...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (visitNotes.length === 0) {
    return <p className="text-slate-500">No visit notes found.</p>
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-slate-900">Visit Notes</h2>

      <div className="mt-6 space-y-5">
        {visitNotes.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <p className="font-bold text-slate-900">
                  {note.caregiverName || "Caregiver"}
                </p>

                <p className="text-sm text-slate-500">
                  {formatDate(note.createdAt)}
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                Family Update
              </span>
            </div>

            {note.familyUpdate && (
              <p className="mt-4 rounded-xl bg-white p-4 text-slate-700">
                {note.familyUpdate}
              </p>
            )}

            {note.aiSummary && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-700">
                  Care Summary
                </p>
                <p className="mt-2 text-slate-700">{note.aiSummary}</p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Info label="Meals" value={note.meals} />
              <Info label="Medication" value={note.medicationNotes} />
              <Info label="Mobility" value={note.mobilityNotes} />
              <Info label="Mood" value={note.moodNotes} />
              <Info label="Hygiene" value={note.hygieneCare} />
              <Info label="Safety" value={note.safetyConcerns} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700">{value || "No update"}</p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return "Date unavailable"
  return new Date(value).toLocaleString()
}

export default FamilyVisitNotesTab