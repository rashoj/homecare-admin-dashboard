import { useEffect, useState } from "react"
import {
  Bell,
  FileText,
  Pill,
  Users,
  ClipboardCheck,
} from "lucide-react"
import api from "../../api/axios"

function FamilyTimelineTab() {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadTimeline()
  }, [])

  async function loadTimeline() {
    try {
      setLoading(true)
      setErrorMessage("")

      const response = await api.get("/family-portal/timeline")

      setTimeline(response.data || [])
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load timeline."
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading timeline...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Activity Timeline
        </h2>

        <p className="mt-2 text-slate-500">
          Recent care activity for your loved one.
        </p>
      </div>

      {timeline.length === 0 ? (
        <p className="text-slate-500">
          No activity found.
        </p>
      ) : (
        <div className="space-y-6">
          {timeline.map((item) => (
            <div
              key={`${item.relatedEntityType}-${item.relatedEntityId}`}
              className="flex gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <span className="text-xs font-semibold text-slate-400">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                <p className="mt-2 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                    {item.type?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getIcon(type) {
  switch (type) {
    case "DOCUMENT":
      return <FileText className="text-blue-600" size={20} />

    case "MEDICATION":
      return <Pill className="text-green-600" size={20} />

    case "CARE_TEAM":
      return <Users className="text-purple-600" size={20} />

    case "VISIT_NOTE":
      return <ClipboardCheck className="text-orange-600" size={20} />

    default:
      return <Bell className="text-blue-600" size={20} />
  }
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

export default FamilyTimelineTab