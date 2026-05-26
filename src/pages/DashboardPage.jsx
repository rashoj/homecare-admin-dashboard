import { useEffect, useState } from "react"

import {
  Users,
  Calendar,
  FileText,
  Pill,
  Clock3,
  ClipboardCheck,
  Bell,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Search,
  Activity,
} from "lucide-react"

import { getAdminDashboard } from "../services/dashboardService"
import { getUserNotifications } from "../services/notificationService"
import { getAdminOperationsSummary } from "../services/adminOperationsDashboardApi"

function DashboardPage({ user }) {
  const [dashboard, setDashboard] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [operations, setOperations] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const dashboardData = await getAdminDashboard()
      setDashboard(dashboardData)

      const notificationData = await getUserNotifications(user.id)
      setNotifications(notificationData)

      const operationsData = await getAdminOperationsSummary()
      setOperations(operationsData)
    } catch (error) {
      console.error(error)
      alert("Failed to load dashboard")
    }
  }

  if (!dashboard || !operations) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg font-semibold text-slate-600">
          Loading Dashboard...
        </div>
      </div>
    )
  }

  const operationsStats = [
    {
      title: "Unread EVV Alerts",
      value: operations.unreadEVVAlerts,
      subtext: "No new alerts",
      color: "from-red-500 to-pink-500",
      icon: <Bell size={24} className="text-white" />,
    },
    {
      title: "Open EVV Issues",
      value: operations.openEVVExceptions,
      subtext: "Needs supervisor review",
      color: "from-yellow-400 to-orange-500",
      icon: <AlertTriangle size={24} className="text-white" />,
    },
    {
      title: "High Severity EVV",
      value: operations.highSeverityEVVExceptions,
      subtext: "Critical compliance risk",
      color: "from-rose-500 to-red-600",
      icon: <ShieldAlert size={24} className="text-white" />,
    },
    {
      title: "Caregivers Clocked In",
      value: operations.caregiversClockedIn,
      subtext: "Active right now",
      color: "from-cyan-500 to-blue-500",
      icon: <UserCheck size={24} className="text-white" />,
    },
    {
      title: "Pending Service Docs",
      value: operations.pendingServiceDocumentation,
      subtext: "Awaiting review",
      color: "from-orange-500 to-amber-500",
      icon: <FileText size={24} className="text-white" />,
    },
    {
      title: "Payroll Blocked",
      value: operations.payrollBlockedItems,
      subtext: "Requires approval",
      color: "from-slate-700 to-slate-900",
      icon: <DollarSign size={24} className="text-white" />,
    },
  ]

  const stats = [
    {
      title: "Total Clients",
      value: dashboard.totalClients,
      subtext: "Active enrolled clients",
      color: "from-blue-500 to-indigo-500",
      icon: <Users size={24} className="text-white" />,
    },
    {
      title: "Caregivers",
      value: dashboard.totalCaregivers,
      subtext: "Active caregivers",
      color: "from-green-500 to-emerald-500",
      icon: <Users size={24} className="text-white" />,
    },
    {
      title: "Appointments",
      value: dashboard.totalAppointments,
      subtext: "Scheduled visits",
      color: "from-purple-500 to-violet-500",
      icon: <Calendar size={24} className="text-white" />,
    },
    {
      title: "Completed Visits",
      value: dashboard.completedAppointments,
      subtext: "Completed this month",
      color: "from-emerald-500 to-teal-500",
      icon: <ClipboardCheck size={24} className="text-white" />,
    },
    {
      title: "Pending Documents",
      value: dashboard.pendingDocuments,
      subtext: "Requires attention",
      color: "from-orange-500 to-amber-500",
      icon: <FileText size={24} className="text-white" />,
    },
    {
      title: "Medications",
      value: dashboard.totalMedications,
      subtext: "Medication records",
      color: "from-pink-500 to-rose-500",
      icon: <Pill size={24} className="text-white" />,
    },
    {
      title: "Visit Notes",
      value: dashboard.totalVisitNotes,
      subtext: "Care notes submitted",
      color: "from-orange-500 to-red-500",
      icon: <ClipboardCheck size={24} className="text-white" />,
    },
    {
      title: "Clock Records",
      value: dashboard.totalClockRecords,
      subtext: "EVV clock activity",
      color: "from-cyan-500 to-blue-500",
      icon: <Clock3 size={24} className="text-white" />,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            Good morning, {user.fullName || "Admin"} 👋
          </h1>

          <p className="mt-3 text-lg text-slate-500">
            Here&apos;s what&apos;s happening in your agency today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              placeholder="Search anything..."
              className="w-44 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="relative rounded-2xl bg-white p-4 shadow-sm">
            <Bell size={20} className="text-slate-700" />
            {operations.unreadEVVAlerts > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {operations.unreadEVVAlerts}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
              {user.fullName?.charAt(0) || "A"}
            </div>

            <div>
              <p className="font-bold text-slate-800">
                {user.fullName || "Admin"}
              </p>
              <p className="text-sm text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader
        title="Live Operations"
        subtitle="Real-time EVV, documentation, and payroll overview."
        icon={<Activity size={22} />}
      />

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {operationsStats.map((item, index) => (
          <ModernCard key={index} item={item} />
        ))}
      </div>

      <SectionHeader
        title="Key Metrics"
        subtitle="High-level agency performance overview."
        icon={<ClipboardCheck size={22} />}
      />

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <ModernCard key={index} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Activity
            </h2>

            <button className="font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>

          <div className="space-y-5">
            <ActivityItem
              color="bg-green-500"
              title="Visit Completed"
              description="Caregiver visit activity will be connected to backend next."
            />

            <ActivityItem
              color="bg-orange-500"
              title="Medication Logged"
              description="Medication log activity will be connected to backend next."
            />

            <ActivityItem
              color="bg-blue-500"
              title="Document Uploaded"
              description="Document upload activity will be connected to backend next."
            />

            <ActivityItem
              color="bg-purple-500"
              title="EVV Issue Created"
              description="Late clock-in or missed clock-out events appear here."
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Notifications
            </h2>

            <button className="font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>

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
              <p className="text-slate-500">No notifications found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-black">
              Your agency is running smoothly 🎉
            </h2>

            <p className="mt-2 text-lg text-blue-100">
              Keep up the great work providing excellent care.
            </p>
          </div>

          <button className="rounded-2xl bg-white/20 px-6 py-4 font-bold backdrop-blur-sm transition hover:bg-white/30">
            View Full Reports
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="text-blue-600">{icon}</div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function ModernCard({ item }) {
  return (
    <div className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color}`}
      >
        {item.icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{item.title}</p>

      <h3 className="mt-3 text-5xl font-black tracking-tight text-slate-900">
        {item.value ?? 0}
      </h3>

      <p className="mt-3 text-sm text-slate-500">{item.subtext}</p>
    </div>
  )
}

function ActivityItem({ title, description, color }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className={`mt-1 h-4 w-4 rounded-full ${color}`} />

      <div>
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function NotificationItem({ title, message, isRead }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isRead
              ? "bg-slate-200 text-slate-600"
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