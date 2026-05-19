import { useEffect, useState } from "react"

import {
  Search,
  FileText,
  AlertTriangle,
  Sparkles
} from "lucide-react"

import { getVisitNotes } from "../services/visitNoteService"

function VisitNotesPage() {
  const [visitNotes, setVisitNotes] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadVisitNotes()
  }, [])

  const loadVisitNotes = async () => {
    try {
      const data = await getVisitNotes()
      setVisitNotes(data)
    } catch (error) {
      console.error(error)
      alert("Failed to load visit notes")
    }
  }

  const filteredNotes = visitNotes.filter((note) =>
    note.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    note.caregiverName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            Visit Notes
          </h2>

          <p className="text-slate-500 mt-2">
            Caregiver documentation, AI summaries, and patient visit records.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={20} className="text-slate-400" />

          <input
            className="w-full outline-none"
            placeholder="Search visit notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {note.clientName}
                </h3>

                <p className="text-slate-500 mt-1">
                  Caregiver: {note.caregiverName}
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  note.incidentReported
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {note.incidentReported ? "Incident Reported" : "No Incident"}
              </div>
            </div>

            <div className="space-y-4">
              {note.aiSummary && (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-blue-700" />

                    <h4 className="font-semibold text-blue-700">
                      AI Summary
                    </h4>
                  </div>

                  <p className="text-blue-800 text-sm leading-6">
                    {note.aiSummary}
                  </p>
                </div>
              )}

              <NoteSection title="General Notes" value={note.generalNotes} />
              <NoteSection title="Meals" value={note.meals} />
              <NoteSection title="Medication Notes" value={note.medicationNotes} />
              <NoteSection title="Mobility" value={note.mobilityNotes} />
              <NoteSection title="Mood" value={note.moodNotes} />
              <NoteSection title="Hygiene Care" value={note.hygieneCare} />
              <NoteSection title="Safety Concerns" value={note.safetyConcerns} />
              <NoteSection title="Family Update" value={note.familyUpdate} />

              {note.incidentReported && (
                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} className="text-red-600" />

                    <h4 className="font-semibold text-red-700">
                      Incident Details
                    </h4>
                  </div>

                  <p className="text-red-700 text-sm">
                    {note.incidentDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Visit Note
              </div>

              <p>
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-slate-500">
          No visit notes found.
        </div>
      )}
    </div>
  )
}

function NoteSection({ title, value }) {
  return (
    <div>
      <h4 className="font-semibold text-slate-700 mb-1">
        {title}
      </h4>

      <p className="text-slate-500 text-sm">
        {value || "-"}
      </p>
    </div>
  )
}

export default VisitNotesPage