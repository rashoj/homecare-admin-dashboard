import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

import { getAIOperationsCenter } from "../services/aiCopilotService"

function AIOperationsCenterPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadOperationsCenter()
  }, [])

  async function loadOperationsCenter() {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await getAIOperationsCenter()
      setData(response)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || "Failed to load AI Operations Center.")
    } finally {
      setLoading(false)
    }
  }

  const executiveBrief = useMemo(() => {
    if (!data) return ""

    if (data.health?.tone === "red") {
      return "CareBridge detected elevated operational risk today. Focus first on high-severity EVV exceptions, unread alerts, and state-reportable incidents."
    }

    if (data.health?.tone === "orange") {
      return "Operations need supervisor attention. Review staffing, EVV exceptions, and incident activity before closing the day."
    }

    if (data.openShifts?.openShifts > 0) {
      return "Operations are mostly stable, but staffing coverage should be reviewed because open shifts remain."
    }

    if (data.evv?.openExceptions > 0) {
      return "Operations are stable, but EVV exceptions should be cleared before payroll and billing workflows continue."
    }

    return "Operations appear stable based on current live agency data."
  }, [data])

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50">
        <div className="rounded-[2rem] border border-slate-200 bg-white px-8 py-6 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Bot size={28} />
          </div>
          <p className="font-black text-slate-800">Loading AI Operations Center...</p>
          <p className="mt-1 text-sm text-slate-500">Reading live agency intelligence.</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 font-semibold text-red-700">
        {errorMessage}
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-48 -z-10 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        <section className="overflow-hidden rounded-[2.5rem] bg-slate-950 shadow-2xl shadow-slate-900/20">
          <div className="relative p-8 text-white xl:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_34%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_34%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-slate-900" />

            <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100 backdrop-blur">
                  <Sparkles size={15} />
                  Enterprise Operations Intelligence
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                  CareBridge AI Operations Center
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Live operational health, risk signals, and recommended next actions
                  powered by your agency data.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <HeroMiniStat
                    label="Visits Today"
                    value={data.appointments.totalToday}
                    helper={`${data.appointments.completedToday} completed`}
                  />
                  <HeroMiniStat
                    label="Open Shifts"
                    value={data.openShifts.openShifts}
                    helper={`${data.openShifts.assignedShifts} assigned`}
                  />
                  <HeroMiniStat
                    label="EVV Issues"
                    value={data.evv.openExceptions}
                    helper={`${data.evv.unreadAlerts} unread alerts`}
                  />
                  <HeroMiniStat
                    label="High Risk"
                    value={data.incidents.highRiskIncidents}
                    helper={`${data.incidents.stateReportableIncidents} reportable`}
                  />
                </div>
              </div>

              <AgencyHealthOrb health={data.health} onRefresh={loadOperationsCenter} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <ExecutiveBriefCard text={executiveBrief} data={data} />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <MetricCard
              title="Scheduling"
              value={data.appointments.totalToday}
              subtitle={`${data.appointments.unassignedToday} unassigned visits today`}
              icon={<CalendarDays size={24} />}
              tone={data.appointments.unassignedToday > 0 ? "orange" : "blue"}
              actionLabel="Open Scheduler"
              onAction={() => navigate("/scheduler")}
            />

            <MetricCard
              title="Staffing Coverage"
              value={data.openShifts.openShifts}
              subtitle={`${data.openShifts.claimedShifts} claimed shifts`}
              icon={<Users size={24} />}
              tone={data.openShifts.openShifts > 0 ? "orange" : "green"}
              actionLabel="Open Shifts"
              onAction={() => navigate("/open-shifts")}
            />

            <MetricCard
              title="EVV Review"
              value={data.evv.openExceptions}
              subtitle={`${data.evv.highSeverityExceptions} high severity`}
              icon={<ShieldCheck size={24} />}
              tone={data.evv.openExceptions > 0 ? "red" : "green"}
              actionLabel="Review EVV"
              onAction={() => navigate("/evv-exceptions")}
            />

            <MetricCard
              title="Incident Risk"
              value={data.incidents.highRiskIncidents}
              subtitle={`${data.incidents.stateReportableIncidents} state reportable`}
              icon={<AlertTriangle size={24} />}
              tone={data.incidents.highRiskIncidents > 0 ? "red" : "green"}
              actionLabel="Open Incidents"
              onAction={() => navigate("/incidents")}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                  <Zap size={14} />
                  Priority Actions
                </div>
                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  AI Recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Suggested actions based on live operational data.
                </p>
              </div>

              <button
                onClick={loadOperationsCenter}
                className="flex w-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.recommendations?.map((recommendation, index) => (
                <RecommendationCard
                  key={`${recommendation.title}-${index}`}
                  recommendation={recommendation}
                  onOpen={() => navigate(recommendation.route)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
                <Activity size={14} />
                Live Briefing
              </div>
              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Today’s Operational Brief
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                CareBridge is monitoring the agency in real time.
              </p>
            </div>

            <div className="space-y-4">
              <BriefingItem
                icon={<CalendarDays size={20} />}
                title="Scheduling"
                text={`${data.appointments.totalToday} visits today, ${data.appointments.completedToday} completed, and ${data.appointments.unassignedToday} unassigned.`}
                tone="blue"
              />

              <BriefingItem
                icon={<ShieldCheck size={20} />}
                title="EVV Review"
                text={`${data.evv.openExceptions} open EVV exceptions, ${data.evv.highSeverityExceptions} high severity, and ${data.evv.unreadAlerts} unread alerts.`}
                tone={data.evv.openExceptions > 0 ? "red" : "green"}
              />

              <BriefingItem
                icon={<AlertTriangle size={20} />}
                title="Incidents"
                text={`${data.incidents.highRiskIncidents} high-risk incidents and ${data.incidents.stateReportableIncidents} state-reportable incidents.`}
                tone={data.incidents.highRiskIncidents > 0 ? "red" : "green"}
              />

              <BriefingItem
                icon={<CheckCircle2 size={20} />}
                title="Recommended Focus"
                text={buildFocusText(data)}
                tone={data.health.tone}
              />
            </div>
          </div>
        </section>
    </div>
  )
}

function AgencyHealthOrb({ health, onRefresh }) {
  const toneClasses = {
    green: "from-emerald-400 via-green-500 to-emerald-700 shadow-emerald-900/30",
    blue: "from-blue-400 via-blue-600 to-indigo-700 shadow-blue-900/30",
    orange: "from-amber-300 via-orange-500 to-orange-700 shadow-orange-900/30",
    red: "from-red-400 via-rose-600 to-red-800 shadow-red-900/30",
  }

  const ringTone = {
    green: "text-emerald-300",
    blue: "text-blue-300",
    orange: "text-orange-300",
    red: "text-red-300",
  }

  return (
    <div className="relative flex justify-center xl:justify-end">
      <div className="relative w-full max-w-md rounded-[2.25rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">
              Agency Health
            </p>
            <p className="mt-2 text-xl font-black text-white">{health.label}</p>
          </div>

          <button
            onClick={onRefresh}
            className="rounded-2xl bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <RefreshCcw size={18} />
          </button>
        </div>

        <div className="mt-7 flex items-center justify-center">
          <div
            className={`relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br ${
              toneClasses[health.tone] || toneClasses.blue
            } shadow-2xl`}
          >
            <div className="absolute inset-3 rounded-full border border-white/20" />
            <div className="absolute inset-8 rounded-full bg-slate-950/35 backdrop-blur" />
            <div className="relative text-center">
              <p className={`text-sm font-black uppercase tracking-widest ${ringTone[health.tone] || ringTone.blue}`}>
                Score
              </p>
              <p className="mt-1 text-6xl font-black text-white">{health.score}</p>
              <p className="mt-1 text-sm font-black text-white/70">/ 100</p>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex justify-between text-xs font-black uppercase tracking-wide text-white/60">
            <span>Risk</span>
            <span>Stable</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${health.score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroMiniStat({ label, value, helper }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15">
      <p className="text-xs font-bold text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{helper}</p>
    </div>
  )
}

function ExecutiveBriefCard({ text, data }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-xl shadow-slate-200/70 backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Bot size={28} />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
            <Sparkles size={14} />
            AI Executive Brief
          </div>

          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950">
            {data.health.label === "Critical"
              ? "Immediate attention recommended"
              : "Today’s agency outlook"}
          </h2>

          <p className="mt-4 text-base leading-8 text-slate-600">{text}</p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniBriefStat label="Health" value={`${data.health.score}%`} />
        <MiniBriefStat label="Recommendations" value={data.recommendations?.length || 0} />
        <MiniBriefStat label="Risk Items" value={data.evv.highSeverityExceptions + data.incidents.highRiskIncidents} />
      </div>
    </div>
  )
}

function MiniBriefStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone, actionLabel, onAction }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  }

  const accent = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    orange: "bg-orange-500",
    red: "bg-red-600",
  }

  return (
    <div className="group rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/70">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone] || tones.blue}`}>
          {icon}
        </div>
        <div className={`h-3 w-3 rounded-full ${accent[tone] || accent.blue}`} />
      </div>

      <p className="mt-6 text-sm font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>

      <button
        onClick={onAction}
        className="mt-5 flex items-center gap-2 text-sm font-black text-blue-700 transition group-hover:gap-3"
      >
        {actionLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

function RecommendationCard({ recommendation, onOpen }) {
  const tones = {
    URGENT: {
      badge: "bg-red-100 text-red-700",
      icon: "bg-red-100 text-red-700",
      border: "border-red-100",
    },
    HIGH: {
      badge: "bg-orange-100 text-orange-700",
      icon: "bg-orange-100 text-orange-700",
      border: "border-orange-100",
    },
    MEDIUM: {
      badge: "bg-yellow-100 text-yellow-700",
      icon: "bg-yellow-100 text-yellow-700",
      border: "border-yellow-100",
    },
    LOW: {
      badge: "bg-green-100 text-green-700",
      icon: "bg-green-100 text-green-700",
      border: "border-green-100",
    },
  }

  const style = tones[recommendation.priority] || tones.MEDIUM

  return (
    <div
      className={`group rounded-[1.75rem] border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${style.border}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
            <AlertTriangle size={21} />
          </div>

          <div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${style.badge}`}>
              {recommendation.priority}
            </span>

            <h3 className="mt-3 text-lg font-black text-slate-950">
              {recommendation.title}
            </h3>

            <p className="mt-1 leading-7 text-slate-600">
              {recommendation.description}
            </p>
          </div>
        </div>

        <button
          onClick={onOpen}
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
        >
          Open
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function BriefingItem({ icon, title, text, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  }

  return (
    <div className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone] || tones.blue}`}>
        {icon}
      </div>

      <div>
        <h3 className="font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  )
}

function buildFocusText(data) {
  if (data.health.tone === "red") {
    return "Immediate supervisor review is recommended based on current risk indicators."
  }

  if (data.openShifts.openShifts > 0) {
    return "Staffing coverage should be reviewed first."
  }

  if (data.evv.openExceptions > 0) {
    return "EVV exceptions should be reviewed before payroll."
  }

  return "Operations appear stable based on current live data."
}

export default AIOperationsCenterPage
