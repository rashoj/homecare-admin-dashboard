import { useEffect, useState } from "react"
import { getToken } from "../../services/authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function CaregiverMyRequestsDashboard({ caregiver }) {
  const [referrals, setReferrals] = useState([])
  const [reschedules, setReschedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadRequests()
  }, [caregiver?.id])

  async function loadRequests() {
   if (!caregiver?.id) {
  setLoading(false)
  return
}

    try {
      setLoading(true)
      setMessage("")

const token = getToken()

      const [referralResponse, rescheduleResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/appointment-referrals/caregiver/${caregiver.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_BASE_URL}/appointment-reschedule-requests/caregiver/${caregiver.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ])

 if (referralResponse.ok) {
  setReferrals(await referralResponse.json())
} else {
  console.warn("Referral requests unavailable")
  setReferrals([])
}

if (rescheduleResponse.ok) {
  setReschedules(await rescheduleResponse.json())
} else {
  console.warn("Reschedule requests unavailable")
  setReschedules([])
}} catch (error) {
  console.error(error)
  setReferrals([])
  setReschedules([])
} finally {
  setLoading(false)
}
  }

  if (loading) {
    return <p className="text-sm font-semibold text-slate-500">Loading requests...</p>
  }

  return (
    <div className="space-y-5">
      <button
        onClick={loadRequests}
        className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700"
      >
        Refresh My Requests
      </button>

      {message && (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {message}
        </div>
      )}

      <RequestSection title="Appointment Referrals" items={referrals} type="referral" />

      <RequestSection title="Reschedule Requests" items={reschedules} type="reschedule" />
    </div>
  )
}

function RequestSection({ title, items, type }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-black text-slate-900">{title}</h3>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-semibold text-slate-500">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${type}-${item.id}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">
                    {type === "referral"
                      ? item.hospitalName || item.referralSource || "Referral Request"
                      : `Appointment #${item.appointmentId}`}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {type === "referral"
                      ? `${formatDate(item.requestedStartTime)} - ${formatDate(
                          item.requestedEndTime
                        )}`
                      : `${formatDate(item.requestedStartTime)} - ${formatDate(
                          item.requestedEndTime
                        )}`}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>

              <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
                <p className="font-bold text-slate-900">
                  {type === "referral" ? "Notes" : "Reason"}
                </p>
                <p className="mt-1">
                  {type === "referral"
                    ? item.notes || "No notes provided."
                    : item.reason || "No reason provided."}
                </p>
              </div>

              {item.adminNotes && (
                <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                  <p className="font-bold">Admin Notes</p>
                  <p className="mt-1">{item.adminNotes}</p>
                </div>
              )}

              {item.reviewedAt && (
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Reviewed at {formatDate(item.reviewedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const base = "rounded-full px-3 py-1 text-xs font-black"

  if (status === "APPROVED" || status === "CONVERTED") {
    return <span className={`${base} bg-green-100 text-green-700`}>{formatLabel(status)}</span>
  }

  if (status === "REJECTED") {
    return <span className={`${base} bg-red-100 text-red-700`}>{formatLabel(status)}</span>
  }

  if (status === "UNDER_REVIEW") {
    return <span className={`${base} bg-purple-100 text-purple-700`}>{formatLabel(status)}</span>
  }

  return <span className={`${base} bg-yellow-100 text-yellow-700`}>{formatLabel(status)}</span>
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default CaregiverMyRequestsDashboard