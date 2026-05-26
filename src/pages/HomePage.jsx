import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Heart,
  ShieldCheck,
  Users,
  Lock,
  Mail,
  EyeOff,
  Activity,
  ClipboardCheck,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

function HomePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    navigate("/admin-login")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f8ff] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg transition hover:scale-105">
            <Heart size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-blue-900">HomeCare</h1>
            <p className="-mt-1 text-xs font-semibold text-slate-500">
              Management System
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
          <a className="hover:text-blue-700" href="#features">Features</a>
          <a className="hover:text-blue-700" href="#trust">Why Us</a>
          <a className="hover:text-blue-700" href="#login">Login</a>
        </nav>

        <button
          onClick={() => navigate("/admin-login")}
          className="rounded-xl bg-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-900"
        >
          Admin Login
        </button>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            <ShieldCheck size={17} />
            Built for care, compliance, and operations
          </div>

          <h2 className="mt-7 max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 xl:text-[64px]">
            Home care software that keeps every shift accountable.
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Manage clients, caregivers, EVV, eMAR, ISP goals, behavior tracking,
            billing, and compliance from one modern platform.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/admin-login")}
              className="group rounded-xl bg-blue-700 px-6 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              <span className="inline-flex items-center gap-2">
                Login to Admin Portal
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </button>

            <button
              onClick={() => navigate("/caregiver-login")}
              className="rounded-xl border border-blue-200 bg-white px-6 py-3.5 font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Caregiver Login
            </button>
          </div>

          <div id="features" className="mt-10 grid gap-4 sm:grid-cols-2">
            <Feature icon={<ClipboardCheck />} title="Audit-ready documentation" />
            <Feature icon={<Activity />} title="EVV and shift accountability" />
            <Feature icon={<Bell />} title="Medication and compliance alerts" />
            <Feature icon={<Users />} title="Client-centered care workflows" />
          </div>
        </section>

        <section id="login" className="relative">
          <div className="relative rounded-[2.2rem] border border-white bg-white/70 p-5 shadow-2xl backdrop-blur transition hover:-translate-y-1">
            <div className="rounded-[1.7rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl">
              <div className="mb-4 flex justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-300">
                    Agency Operations
                  </p>
                  <h3 className="mt-1 text-xl font-black">
                    Today’s Care Overview
                  </h3>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Live
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <DashboardMetric label="Visits" value="42" />
                <DashboardMetric label="EVV" value="96%" />
                <DashboardMetric label="MAR" value="98%" />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 text-slate-900">
                  <p className="text-sm font-bold text-slate-500">
                    Compliance Alerts
                  </p>

                  <div className="mt-4 space-y-3">
                    <AlertRow label="Overdue Medication" value="2" danger />
                    <AlertRow label="Missing Visit Notes" value="4" warning />
                    <AlertRow label="EVV Exceptions" value="3" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 text-slate-900">
                  <p className="text-sm font-bold text-slate-500">
                    Supervisor Queue
                  </p>

                  <div className="mt-4 space-y-3">
                    <QueueRow title="MAR Review" status="Pending" />
                    <QueueRow title="ISP Progress" status="Submitted" />
                    <QueueRow title="Behavior Incident" status="Review" />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-blue-600 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-100">
                      Compliance Score
                    </p>
                    <p className="mt-1 text-3xl font-black">94%</p>
                  </div>

                  <div className="h-16 w-16 rounded-full border-8 border-blue-300 border-t-white" />
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h3 className="text-2xl font-black text-slate-900">
                  Admin Login
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Secure access for authorized agency users.
                </p>
              </div>

              <Input
                icon={<Mail size={18} />}
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                icon={<Lock size={18} />}
                rightIcon={<EyeOff size={18} />}
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-blue-700 py-3.5 font-bold text-white transition hover:bg-blue-800"
              >
                Continue to Login
              </button>
            </form>
          </div>
        </section>
      </main>

      <section
        id="trust"
        className="relative z-10 mx-auto max-w-7xl px-6 pb-8"
      >
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Built for modern agencies
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <TrustItem text="Reduce missed documentation and billing errors." />
            <TrustItem text="Keep supervisors aware of urgent compliance issues." />
            <TrustItem text="Give caregivers simple tools for accurate shift records." />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-4 px-6 pb-10 md:grid-cols-4">
        <Stat value="500+" label="Families Supported" />
        <Stat value="200+" label="Caregivers Managed" />
        <Stat value="98%" label="Compliance Focus" />
        <Stat value="24/7" label="Operational Visibility" />
      </section>

      <footer className="relative z-10 border-t border-blue-100 bg-white/70 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HomeCare Management System. All rights reserved.</p>
          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Security</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Feature({ icon, title }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <p className="font-bold text-slate-800">{title}</p>
    </div>
  )
}

function DashboardMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 transition hover:-translate-y-0.5 hover:bg-white/15">
      <p className="text-sm text-blue-100">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function AlertRow({ label, value, danger, warning }) {
  let badge = "bg-blue-100 text-blue-700"
  if (danger) badge = "bg-red-100 text-red-700"
  if (warning) badge = "bg-yellow-100 text-yellow-700"

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge}`}>
        {value}
      </span>
    </div>
  )
}

function QueueRow({ title, status }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        {status}
      </span>
    </div>
  )
}

function TrustItem({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
      <CheckCircle2 className="mt-0.5 text-blue-700" size={20} />
      <p className="font-semibold text-slate-700">{text}</p>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <p className="text-3xl font-black text-blue-700">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  )
}

function Input({
  icon,
  rightIcon,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
      <span className="text-slate-400">{icon}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-sm outline-none"
      />
      {rightIcon && <span className="text-slate-400">{rightIcon}</span>}
    </div>
  )
}

export default HomePage