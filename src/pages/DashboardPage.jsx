import { useEffect, useState } from "react"

import {
  Users,
  Calendar,
  FileText,
  Pill,
  Clock3,
  ClipboardCheck
} from "lucide-react"

import { getAdminDashboard } from "../services/dashboardService"
import { getUserNotifications } from "../services/notificationService"

function DashboardPage({ user }) {
  const [dashboard, setDashboard] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const dashboardData = await getAdminDashboard()
      setDashboard(dashboardData)

      const notificationData = await getUserNotifications(user.id)
      setNotifications(notificationData)
    } catch (error) {
      console.error(error)
      alert("Failed to load dashboard")
    }
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    )
  }

  const stats = [
    {
      title: "Total Clients",
      value: dashboard.totalClients,
      color: "bg-blue-500",
      icon: <Users size={22} className="text-white" />
    },
    {
      title: "Caregivers",
      value: dashboard.totalCaregivers,
      color: "bg-green-500",
      icon: <Users size={22} className="text-white" />
    },
    {
      title: "Appointments",
      value: dashboard.totalAppointments,
      color: "bg-purple-500",
      icon: <Calendar size={22} className="text-white" />
    },
    {
      title: "Completed Visits",
      value: dashboard.completedAppointments,
      color: "bg-emerald-500",
      icon: <ClipboardCheck size={22} className="text-white" />
    },
    {
      title: "Pending Documents",
      value: dashboard.pendingDocuments,
      color: "bg-red-500",
      icon: <FileText size={22} className="text-white" />
    },
    {
      title: "Medications",
      value: dashboard.totalMedications,
      color: "bg-pink-500",
      icon: <Pill size={22} className="text-white" />
    },
    {
      title: "Visit Notes",
      value: dashboard.totalVisitNotes,
      color: "bg-orange-500",
      icon: <ClipboardCheck size={22} className="text-white" />
    },
    {
      title: "Clock Records",
      value: dashboard.totalClockRecords,
      color: "bg-cyan-500",
      icon: <Clock3 size={22} className="text-white" />
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            Dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            Welcome back, {user.fullName}
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm">
          <p className="font-semibold">
            {user.role}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5`}
            >
              {item.icon}
            </div>

            <h3 className="text-slate-500 text-sm">
              {item.title}
            </h3>

            <p className="text-4xl font-bold text-slate-800 mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Lower Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">
            Recent Activity
          </h3>

          <div className="space-y-5">
            <ActivityItem
              title="Visit Completed"
              description="Caregiver visit activity will be connected to backend next."
            />

            <ActivityItem
              title="Medication Logged"
              description="Medication log activity will be connected to backend next."
            />

            <ActivityItem
              title="Document Uploaded"
              description="Document upload activity will be connected to backend next."
            />
          </div>
        </div>

        {/* Real Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">
            Notifications
          </h3>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  title={notification.title}
                  message={notification.message}
                  isRead={notification.isRead}
                />
              ))
            ) : (
              <p className="text-slate-500">
                No notifications found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ title, description }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <h4 className="font-bold text-slate-800">
        {title}
      </h4>

      <p className="text-slate-500 mt-1">
        {description}
      </p>
    </div>
  )
}

function NotificationItem({ title, message, isRead }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-semibold text-slate-800">
            {title}
          </h4>

          <p className="text-sm text-slate-500 mt-1">
            {message}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isRead
              ? "bg-slate-100 text-slate-500"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isRead ? "Read" : "New"}
        </span>
      </div>
    </div>
  )
}

export default DashboardPage