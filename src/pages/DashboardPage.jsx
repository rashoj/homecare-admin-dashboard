import { useEffect, useState } from "react"
import {
  Users,
  Calendar,
  FileText,
  Pill,
  ClipboardCheck,
  Bell,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Search,
  Activity,
  Siren,
  CheckCircle2,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import {
  getAdminDashboard,
  getAdminVisitTrends,
  getAdminMarTrends,
  getAdminIncidentSeverity,
  getAdminEVVTrends,
  getAdminRecentActivity,
} from "../services/dashboardService"
import { getUserNotifications } from "../services/notificationService"
import { getAdminOperationsSummary } from "../services/adminOperationsDashboardApi"

function DashboardPage({ user }) {
  const [dashboard, setDashboard] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [operations, setOperations] = useState(null)

  const [visitTrendData, setVisitTrendData] = useState([])
  const [marTrendData, setMarTrendData] = useState([])
  const [incidentSeverityData, setIncidentSeverityData] = useState([])
  const [evvTrendData, setEvvTrendData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const [
        dashboardData,
        notificationData,
        operationsData,
        visitTrends,
        marTrends,
        incidentSeverity,
        evvTrends,
        activityData,
      ] = await Promise.all([
        getAdminDashboard(),
        getUserNotifications(user.id),
        getAdminOperationsSummary(),
        getAdminVisitTrends(),
        getAdminMarTrends(),
        getAdminIncidentSeverity(),
        getAdminEVVTrends(),
        getAdminRecentActivity(),
      ])

      setDashboard(dashboardData)
      setNotifications(notificationData)
      setOperations(operationsData)
      setVisitTrendData(visitTrends)
      setMarTrendData(marTrends)
      setIncidentSeverityData(incidentSeverity)
      setEvvTrendData(evvTrends)
      setRecentActivity(activityData)
    } catch {
      alert("Failed to load dashboard")
    }
  }

  if (!dashboard || !operations) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl bg-white px-8 py-6 text-lg font-semibold text-slate-600 shadow">
          Loading command center...
        </div>
      </div>
    )
  }

  const operationsStats = [
    {
      title: "Unread EVV Alerts",
      value: operations.unreadEVVAlerts,
      subtext: "Requires attention",
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
      subtext: "Enrolled clients",
      color: "from-blue-500 to-indigo-500",
      icon: <Users size={24} className="text-white" />,
    },
    {
      title: "Caregivers",
      value: dashboard.totalCaregivers,
      subtext: "Active workforce",
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
      subtext: "Completed care visits",
      color: "from-emerald-500 to-teal-500",
      icon: <ClipboardCheck size={24} className="text-white" />,
    },
    {
      title: "Open Incidents",
      value: dashboard.openIncidents,
      subtext: "Supervisor review",
      color: "from-red-500 to-rose-600",
      icon: <ShieldAlert size={24} className="text-white" />,
    },
    {
      title: "Missed Visits",
      value: dashboard.missedAppointments,
      subtext: "Operational review",
      color: "from-yellow-500 to-orange-500",
      icon: <AlertTriangle size={24} className="text-white" />,
    },
    {
      title: "Pending Documents",
      value: dashboard.pendingDocuments,
      subtext: "Awaiting approval",
      color: "from-indigo-500 to-blue-600",
      icon: <FileText size={24} className="text-white" />,
    },
    {
      title: "MAR Compliance",
      value: `${dashboard.marComplianceRate ?? 0}%`,
      subtext: "Medication compliance",
      color: "from-emerald-500 to-green-600",
      icon: <Pill size={24} className="text-white" />,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              Agency Command Center
            </p>
            <h1 className="text-5xl font-black tracking-tight">
              Good morning, {user.fullName || "Admin"} 👋
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-300">
              Real-time care operations, compliance, billing, EVV, documentation,
              and agency risk in one place.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
              <Search size={18} className="text-slate-300" />
              <input
                placeholder="Search agency..."
                className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="relative rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Bell size={20} className="text-white" />
              {operations.unreadEVVAlerts > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {operations.unreadEVVAlerts}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionHeader
        title="Live Operations"
        subtitle="Real-time EVV, documentation, and payroll blockers."
        icon={<Activity size={22} />}
      />

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {operationsStats.map((item) => (
          <ModernCard key={item.title} item={item} />
        ))}
      </div>

      <SectionHeader
        title="Agency Metrics"
        subtitle="Core care delivery, staffing, compliance, and documentation numbers."
        icon={<ClipboardCheck size={22} />}
      />

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <ModernCard key={item.title} item={item} />
        ))}
      </div>

      <SectionHeader
        title="Operational Analytics"
        subtitle="Live charts powered by backend data."
        icon={<Activity size={22} />}
      />

      <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Visit Completion Trend">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={visitTrendData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="missed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="MAR Compliance Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={marTrendData}>
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rate"
                strokeWidth={4}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Incidents by Severity">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={incidentSeverityData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {incidentSeverityData.map((entry) => (
                  <Cell key={entry.name} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="EVV Exceptions Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={evvTrendData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="exceptions"
                strokeWidth={4}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-8 shadow-sm xl:col-span-2">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Recent Audit Activity
          </h2>

          <div className="space-y-5">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  color={getActivityColor(activity.action)}
                  title={formatAction(activity.action)}
                  description={`${activity.actorName || "System"} - ${
                    activity.description || "Activity recorded."
                  }`}
                />
              ))
            ) : (
              <p className="text-slate-500">No recent activity found.</p>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Notifications
            </h2>

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

          <div className="mt-6 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <Siren size={24} className="text-red-400" />
              <h2 className="text-2xl font-bold">
                Compliance Status
              </h2>
            </div>

            <div className="space-y-5">
              <StatusRow label="EVV Monitoring" value="Active" good />
              <StatusRow
                label="Medication Compliance"
                value={`${dashboard.marComplianceRate ?? 0}%`}
                good={(dashboard.marComplianceRate ?? 0) >= 80}
              />
              <StatusRow
                label="Open Incidents"
                value={dashboard.openIncidents ?? 0}
                good={(dashboard.openIncidents ?? 0) === 0}
              />
              <StatusRow
                label="Pending Documentation"
                value={dashboard.pendingServiceDocumentation ?? 0}
                good={(dashboard.pendingServiceDocumentation ?? 0) === 0}
              />
              <StatusRow
                label="Payroll Blocking Issues"
                value={operations.payrollBlockedItems ?? 0}
                good={(operations.payrollBlockedItems ?? 0) === 0}
              />
            </div>
          </div>
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
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color} shadow-lg transition group-hover:scale-105`}
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

function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-bold text-slate-900">{title}</h3>
      {children}
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
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
        {isRead ? "Read" : "New"}
      </span>
    </div>
  )
}

function StatusRow({ label, value, good }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4">
      <div className="flex items-center gap-3">
        {good ? (
          <CheckCircle2 size={18} className="text-green-400" />
        ) : (
          <AlertTriangle size={18} className="text-orange-400" />
        )}
        <span className="font-medium text-slate-200">{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  )
}

function formatAction(action) {
  if (!action) return "Activity"

  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getActivityColor(action) {
  if (!action) return "bg-slate-500"

  if (action.includes("PAID") || action.includes("APPROVE")) {
    return "bg-green-500"
  }

  if (action.includes("DENY") || action.includes("VOID") || action.includes("INCIDENT")) {
    return "bg-red-500"
  }

  if (action.includes("BILLING") || action.includes("CLAIM")) {
    return "bg-blue-500"
  }

  if (action.includes("TIMESHEET") || action.includes("CLOCK")) {
    return "bg-orange-500"
  }

  return "bg-indigo-500"
}

export default DashboardPage