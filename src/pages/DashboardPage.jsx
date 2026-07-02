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
  Clock3,
  TrendingUp,
  Radio,
  BarChart3,
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
import {
  getFraudSummary,
  getFraudAlerts,
  resolveFraudAlert,
} from "../services/fraudService"

function DashboardPage({ user }) {
  const [dashboard, setDashboard] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [operations, setOperations] = useState(null)

  const [visitTrendData, setVisitTrendData] = useState([])
  const [marTrendData, setMarTrendData] = useState([])
  const [incidentSeverityData, setIncidentSeverityData] = useState([])
  const [evvTrendData, setEvvTrendData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  const [fraudSummary, setFraudSummary] = useState(null)
  const [fraudAlerts, setFraudAlerts] = useState([])

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
        fraudSummaryData,
        fraudAlertsData,
      ] = await Promise.all([
        getAdminDashboard(),
        getUserNotifications(user.id),
        getAdminOperationsSummary(),
        getAdminVisitTrends(),
        getAdminMarTrends(),
        getAdminIncidentSeverity(),
        getAdminEVVTrends(),
        getAdminRecentActivity(),
        getFraudSummary(),
        getFraudAlerts(),
      ])

      setDashboard(dashboardData)
      setNotifications(notificationData || [])
      setOperations(operationsData)
      setVisitTrendData(visitTrends || [])
      setMarTrendData(marTrends || [])
      setIncidentSeverityData(incidentSeverity || [])
      setEvvTrendData(evvTrends || [])
      setRecentActivity(activityData || [])
      setFraudSummary(fraudSummaryData)
      setFraudAlerts(fraudAlertsData || [])
    } catch (error) {
      console.error(error)
      alert("Failed to load dashboard")
    }
  }

  async function handleResolveFraudAlert(id) {
    try {
      await resolveFraudAlert(id)
      await loadDashboard()
    } catch {
      alert("Failed to resolve fraud alert")
    }
  }

  if (!dashboard || !operations) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 text-lg font-semibold text-slate-600 shadow-sm">
          Loading operations center...
        </div>
      </div>
    )
  }

  const primaryStats = [
    {
      title: "Total Clients",
      value: dashboard.totalClients,
      subtitle: "Enrolled clients",
      icon: <Users size={26} />,
      tone: "blue",
    },
    {
      title: "Caregivers",
      value: dashboard.totalCaregivers,
      subtitle: "Active workforce",
      icon: <UserCheck size={26} />,
      tone: "green",
    },
    {
      title: "Appointments",
      value: dashboard.totalAppointments,
      subtitle: "Scheduled visits",
      icon: <Calendar size={26} />,
      tone: "purple",
    },
    {
      title: "Completed Visits",
      value: dashboard.completedAppointments,
      subtitle: "Completed care visits",
      icon: <ClipboardCheck size={26} />,
      tone: "green",
    },
  ]

  const liveOpsStats = [
    {
      title: "Clocked In",
      value: operations.caregiversClockedIn,
      subtitle: "Caregivers active now",
      icon: <Radio size={26} />,
      tone: "blue",
    },
    {
      title: "EVV Alerts",
      value: operations.unreadEVVAlerts,
      subtitle: "Unread alerts",
      icon: <Bell size={26} />,
      tone: "red",
    },
    {
      title: "EVV Exceptions",
      value: operations.openEVVExceptions,
      subtitle: "Needs review",
      icon: <AlertTriangle size={26} />,
      tone: "orange",
    },
    {
      title: "Payroll Blocked",
      value: operations.payrollBlockedItems,
      subtitle: "Requires approval",
      icon: <DollarSign size={26} />,
      tone: "slate",
    },
  ]

  const complianceStats = [
    {
      title: "Pending Service Docs",
      value: operations.pendingServiceDocumentation,
      subtitle: "Awaiting review",
      icon: <FileText size={26} />,
      tone: "orange",
    },
    {
      title: "Pending Documents",
      value: dashboard.pendingDocuments,
      subtitle: "Awaiting approval",
      icon: <FileText size={26} />,
      tone: "blue",
    },
    {
      title: "Open Incidents",
      value: dashboard.openIncidents,
      subtitle: "Supervisor review",
      icon: <ShieldAlert size={26} />,
      tone: "red",
    },
    {
      title: "MAR Compliance",
      value: `${dashboard.marComplianceRate ?? 0}%`,
      subtitle: "Medication compliance",
      icon: <Pill size={26} />,
      tone: "green",
    },
  ]

  const fraudStats = [
    {
      title: "Open Fraud Alerts",
      value: fraudSummary?.openAlerts ?? 0,
      subtitle: "Needs investigation",
      icon: <ShieldAlert size={26} />,
      tone: "red",
    },
    {
      title: "High Risk Alerts",
      value: fraudSummary?.highAlerts ?? 0,
      subtitle: "Compliance exposure",
      icon: <AlertTriangle size={26} />,
      tone: "orange",
    },
    {
      title: "Critical Alerts",
      value: fraudSummary?.criticalAlerts ?? 0,
      subtitle: "Immediate review",
      icon: <Siren size={26} />,
      tone: "red",
    },
    {
      title: "Fraud Risk Score",
      value: fraudSummary?.totalRiskScore ?? 0,
      subtitle: "Organization exposure",
      icon: <Activity size={26} />,
      tone: "purple",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-blue-300">
              CareBridge Operations Center
            </p>

            <h1 className="text-5xl font-black tracking-tight">
              Good morning, {user?.fullName || "Admin"} 👋
            </h1>

            <p className="mt-3 max-w-3xl text-lg text-slate-300">
              Real-time agency operations, staffing, EVV, compliance, fraud,
              documentation, and billing risk in one command center.
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

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <HeroMiniStat
            label="Agency Health"
            value={getAgencyHealth(dashboard, operations, fraudSummary)}
          />
          <HeroMiniStat
            label="Missed Visits"
            value={dashboard.missedAppointments ?? 0}
          />
          <HeroMiniStat
            label="High Severity EVV"
            value={operations.highSeverityEVVExceptions ?? 0}
          />
          <HeroMiniStat
            label="Notifications"
            value={notifications.filter((item) => !item.isRead).length}
          />
        </div>
      </div>

      <SectionHeader
        title="Agency Snapshot"
        subtitle="Core volume, staffing, and care delivery numbers."
        icon={<BarChart3 size={22} />}
      />

      <CardGrid>
        {primaryStats.map((item) => (
          <MetricCard key={item.title} item={item} />
        ))}
      </CardGrid>

      <SectionHeader
        title="Live Operations"
        subtitle="Real-time operational issues that need agency attention."
        icon={<Activity size={22} />}
      />

      <CardGrid>
        {liveOpsStats.map((item) => (
          <MetricCard key={item.title} item={item} />
        ))}
      </CardGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Today’s Operational Pulse" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PulseRow
              label="Caregivers Clocked In"
              value={operations.caregiversClockedIn}
              status="Live"
              good
            />
            <PulseRow
              label="Open EVV Exceptions"
              value={operations.openEVVExceptions}
              status="Review"
              good={(operations.openEVVExceptions ?? 0) === 0}
            />
            <PulseRow
              label="Pending Service Docs"
              value={operations.pendingServiceDocumentation}
              status="Queue"
              good={(operations.pendingServiceDocumentation ?? 0) === 0}
            />
            <PulseRow
              label="Payroll Blockers"
              value={operations.payrollBlockedItems}
              status="Finance"
              good={(operations.payrollBlockedItems ?? 0) === 0}
            />
          </div>
        </Panel>

        <Panel title="Compliance Status">
          <div className="space-y-4">
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
              label="Payroll Blocking Issues"
              value={operations.payrollBlockedItems ?? 0}
              good={(operations.payrollBlockedItems ?? 0) === 0}
            />
          </div>
        </Panel>
      </div>

      <SectionHeader
        title="Fraud Intelligence"
        subtitle="Suspicious activity, visit anomalies, and fraud risk exposure."
        icon={<ShieldAlert size={22} />}
      />

      <CardGrid>
        {fraudStats.map((item) => (
          <MetricCard key={item.title} item={item} />
        ))}
      </CardGrid>

      <Panel title="Fraud Alert Feed">
        <div className="space-y-4">
          {fraudAlerts.length > 0 ? (
            fraudAlerts.slice(0, 5).map((alert) => (
              <FraudAlertCard
                key={alert.id}
                alert={alert}
                onResolve={handleResolveFraudAlert}
              />
            ))
          ) : (
            <EmptyState text="No open fraud alerts." />
          )}
        </div>
      </Panel>

      <SectionHeader
        title="Compliance & Documentation"
        subtitle="Clinical documentation, incidents, medication, and approval queues."
        icon={<ClipboardCheck size={22} />}
      />

      <CardGrid>
        {complianceStats.map((item) => (
          <MetricCard key={item.title} item={item} />
        ))}
      </CardGrid>

      <SectionHeader
        title="Operational Analytics"
        subtitle="Live charts powered by backend data."
        icon={<TrendingUp size={22} />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartPanel title="Visit Completion Trend">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={visitTrendData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="missed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="MAR Compliance Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={marTrendData}>
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" strokeWidth={4} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Incidents by Severity">
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
        </ChartPanel>

        <ChartPanel title="EVV Exceptions Trend">
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
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Recent Audit Activity" className="xl:col-span-2">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 8).map((activity) => (
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
              <EmptyState text="No recent activity found." />
            )}
          </div>
        </Panel>

        <Panel title="Notifications">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.slice(0, 6).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  title={notification.title}
                  message={notification.message}
                  isRead={notification.isRead}
                />
              ))
            ) : (
              <EmptyState text="No notifications found." />
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function CardGrid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  )
}

function HeroMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <p className="text-sm font-semibold text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function MetricCard({ item }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
          tones[item.tone] || tones.blue
        }`}
      >
        {item.icon}
      </div>

      <p className="text-sm font-semibold text-slate-500">{item.title}</p>
      <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
        {item.value ?? 0}
      </h3>
      <p className="mt-3 text-sm text-slate-500">{item.subtitle}</p>
    </div>
  )
}

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-blue-600">{icon}</div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <p className="text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function Panel({ title, children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="mb-5 text-2xl font-black text-slate-900">{title}</h2>
      {children}
    </div>
  )
}

function ChartPanel({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-black text-slate-900">{title}</h3>
      {children}
    </div>
  )
}

function PulseRow({ label, value, status, good }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-800">{label}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            good ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-4 text-4xl font-black text-slate-900">{value ?? 0}</p>
    </div>
  )
}

function FraudAlertCard({ alert, onResolve }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h4 className="font-black text-slate-900">{alert.title}</h4>

          <p className="mt-1 text-sm text-slate-600">
            {alert.caregiverName || "Unknown caregiver"} →{" "}
            {alert.clientName || "Unknown client"}
          </p>

          <p className="mt-2 text-sm text-slate-500">{alert.description}</p>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Visit #{alert.visitId} •{" "}
            {alert.detectedAt
              ? new Date(alert.detectedAt).toLocaleString()
              : "Unknown time"}
          </p>
        </div>

        <div className="text-left xl:text-right">
          <div className="font-black text-red-600">{alert.severity}</div>
          <div className="text-sm font-semibold text-slate-700">
            Risk {alert.riskScore}
          </div>

          <div className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-red-600">
            {alert.alertType}
          </div>

          <button
            onClick={() => onResolve(alert.id)}
            className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ title, description, color }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className={`mt-1 h-4 w-4 rounded-full ${color}`} />
      <div>
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function NotificationItem({ title, message, isRead }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-500">{message}</p>

      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
          isRead ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"
        }`}
      >
        {isRead ? "Read" : "New"}
      </span>
    </div>
  )
}

function StatusRow({ label, value, good }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">
      <div className="flex items-center gap-3">
        {good ? (
          <CheckCircle2 size={18} className="text-green-500" />
        ) : (
          <AlertTriangle size={18} className="text-orange-500" />
        )}

        <span className="font-semibold text-slate-700">{label}</span>
      </div>

      <span className="font-black text-slate-900">{value}</span>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-sm font-semibold text-slate-500">
      {text}
    </div>
  )
}

function getAgencyHealth(dashboard, operations, fraudSummary) {
  let score = 100

  if ((operations.openEVVExceptions ?? 0) > 0) score -= 10
  if ((operations.payrollBlockedItems ?? 0) > 0) score -= 10
  if ((dashboard.openIncidents ?? 0) > 0) score -= 10
  if ((fraudSummary?.openAlerts ?? 0) > 0) score -= 10
  if ((dashboard.marComplianceRate ?? 100) < 80) score -= 10

  return `${Math.max(score, 0)}%`
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
  if (action.includes("PAID") || action.includes("APPROVE")) return "bg-green-500"
  if (action.includes("DENY") || action.includes("VOID") || action.includes("INCIDENT")) return "bg-red-500"
  if (action.includes("BILLING") || action.includes("CLAIM")) return "bg-blue-500"
  if (action.includes("TIMESHEET") || action.includes("CLOCK")) return "bg-orange-500"
  return "bg-indigo-500"
}

export default DashboardPage