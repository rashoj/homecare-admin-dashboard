import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart3,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Mail,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react"
import api from "../api/axios"

function PlatformDashboardPage() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setErrorMessage("")

      const response = await api.get("/platform/dashboard")
      setDashboard(response.data)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load platform dashboard."
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Loading platform dashboard...</div>
  }

  if (errorMessage) {
    return <div className="p-8 text-red-600">{errorMessage}</div>
  }

  const demoConversionBase = dashboard.totalDemoRequests || 0
  const qualifiedRate =
    demoConversionBase > 0
      ? Math.round((dashboard.qualifiedDemoRequests / demoConversionBase) * 100)
      : 0

  const closedRate =
    demoConversionBase > 0
      ? Math.round((dashboard.closedDemoRequests / demoConversionBase) * 100)
      : 0

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Platform Command Center
          </p>

          <h2 className="mt-2 text-4xl font-black text-slate-950">
            Platform Dashboard
          </h2>

          <p className="mt-2 text-slate-500">
            Track Homecare platform leads, demo pipeline, and public contact activity.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Demo Requests"
          value={dashboard.totalDemoRequests}
          icon={<Users size={22} />}
          note="Public demo form leads"
        />

        <MetricCard
          title="Qualified Leads"
          value={dashboard.qualifiedDemoRequests}
          icon={<TrendingUp size={22} />}
          note={`${qualifiedRate}% of demo requests`}
        />

        <MetricCard
          title="Demo Scheduled"
          value={dashboard.demoScheduledRequests}
          icon={<CalendarCheck size={22} />}
          note="Leads ready for walkthrough"
        />

        <MetricCard
          title="Contact Messages"
          value={dashboard.totalContactRequests}
          icon={<Mail size={22} />}
          note="Public contact form messages"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Demo Pipeline
              </h3>
              <p className="mt-1 text-slate-500">
                Track incoming agencies from new lead to closed customer.
              </p>
            </div>

            <button
              onClick={() => navigate("/platform/demo-requests")}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              View Demo Requests
            </button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-5">
            <PipelineStep label="New" value={dashboard.newDemoRequests} />
            <PipelineStep label="Contacted" value={dashboard.contactedDemoRequests} />
            <PipelineStep label="Qualified" value={dashboard.qualifiedDemoRequests} />
            <PipelineStep label="Scheduled" value={dashboard.demoScheduledRequests} />
            <PipelineStep label="Closed" value={dashboard.closedDemoRequests} />
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-950 to-blue-700 p-7 text-white shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <BarChart3 size={26} />
          </div>

          <h3 className="mt-6 text-2xl font-black">
            Sales Snapshot
          </h3>

          <div className="mt-6 space-y-4">
            <SnapshotItem label="Qualified Rate" value={`${qualifiedRate}%`} />
            <SnapshotItem label="Closed Rate" value={`${closedRate}%`} />
            <SnapshotItem label="Open Demo Leads" value={dashboard.totalDemoRequests - dashboard.closedDemoRequests} />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Contact Requests
              </h3>
              <p className="mt-1 text-slate-500">
                Monitor messages submitted from the public contact form.
              </p>
            </div>

            <button
              onClick={() => navigate("/platform/contact-requests")}
              className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              View Contact Requests
            </button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatusCard title="New" value={dashboard.newContactRequests} />
            <StatusCard title="Responded" value={dashboard.respondedContactRequests} />
            <StatusCard title="Closed" value={dashboard.closedContactRequests} />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <h3 className="text-2xl font-black text-slate-950">
            Platform Readiness
          </h3>

          <p className="mt-1 text-slate-500">
            Current platform-level foundation completed so far.
          </p>

          <div className="mt-6 space-y-4">
            <ReadinessItem text="Public landing page live locally" />
            <ReadinessItem text="Demo request lead capture" />
            <ReadinessItem text="Contact request capture" />
            <ReadinessItem text="Platform-level lead management" />
            <ReadinessItem text="Audit logs with real logged-in actor" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-950 p-8 text-white">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
              Next Platform Milestone
            </p>

            <h3 className="mt-3 text-3xl font-black">
              Organizations & Multi-Tenant Foundation
            </h3>

            <p className="mt-4 leading-8 text-slate-300">
              The next major step is converting qualified leads into real agency organizations,
              then connecting clients, caregivers, visits, documents, billing, and users to each organization.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <NextStepCard icon={<Building2 />} title="Organizations" text="Create agency accounts." />
            <NextStepCard icon={<Users />} title="Users" text="Assign agency admins." />
            <NextStepCard icon={<MessageSquare />} title="Onboarding" text="Convert leads into customers." />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, note }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          {icon}
        </div>

        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>

      <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>

      <h3 className="mt-2 text-4xl font-black text-slate-950">
        {value ?? 0}
      </h3>

      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  )
}

function PipelineStep({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-center">
      <p className="text-3xl font-black text-blue-700">{value ?? 0}</p>
      <p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
    </div>
  )
}

function SnapshotItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-sm font-bold text-blue-100">{label}</span>
      <span className="text-xl font-black">{value}</span>
    </div>
  )
}

function StatusCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-3xl font-black text-blue-700">{value ?? 0}</p>
      <p className="mt-2 text-sm font-bold text-slate-500">{title}</p>
    </div>
  )
}

function ReadinessItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <CheckCircle2 size={18} className="text-emerald-600" />
      <span className="font-semibold text-slate-700">{text}</span>
    </div>
  )
}

function NextStepCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-blue-300">{icon}</div>
      <h4 className="mt-4 font-black">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}

export default PlatformDashboardPage