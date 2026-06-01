import { useEffect, useState } from "react"
import { Bell, CheckCircle2 } from "lucide-react"

function FamilyNotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        "http://localhost:8080/api/family-portal/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to load notifications.")
      }

      setNotifications(await response.json())
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        `http://localhost:8080/api/family-portal/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to mark notification as read.")
      }

      await loadNotifications()
    } catch (error) {
      alert(error.message || "Failed to update notification.")
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading notifications...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Notifications
          </h2>

          <p className="mt-2 text-slate-500">
            Important care updates from the agency.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
          <Bell size={22} />
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-slate-500">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-5 ${
                notification.isRead
                  ? "border-slate-100 bg-slate-50"
                  : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}

                    <h3 className="font-bold text-slate-900">
                      {notification.title}
                    </h3>
                  </div>

                  <p className="mt-2 text-slate-600">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>

                {!notification.isRead ? (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    <CheckCircle2 size={16} />
                    Mark Read
                  </button>
                ) : (
                  <span className="w-fit rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                    Read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

export default FamilyNotificationsTab