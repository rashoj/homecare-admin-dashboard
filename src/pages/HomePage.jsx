import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  HeartPulse,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Send,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react"
import api from "../api/axios"

function HomePage() {
  const navigate = useNavigate()

  const [demoForm, setDemoForm] = useState({
    fullName: "",
    agencyName: "",
    email: "",
    phone: "",
    agencySize: "",
    message: "",
  })

  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  })

  function handleDemoChange(e) {
    setDemoForm({ ...demoForm, [e.target.name]: e.target.value })
  }

  function handleContactChange(e) {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value })
  }

async function submitDemo(e) {
  e.preventDefault()

  try {
    await api.post("/public/demo-requests", demoForm)

    alert("Thank you. Your demo request has been received.")

    setDemoForm({
      fullName: "",
      agencyName: "",
      email: "",
      phone: "",
      agencySize: "",
      message: "",
    })
  } catch (error) {
    console.error(error)
    alert("Failed to submit demo request. Please try again.")
  }
}

  async function submitContact(e) {
  e.preventDefault()

  try {
    await api.post("/public/contact-requests", contactForm)

    alert("Thank you. Your message has been sent.")

    setContactForm({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    })
  } catch (error) {
    console.error(error)
    alert("Failed to send message. Please try again.")
  }
}

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header navigate={navigate} />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-emerald-50">
          <div className="mx-auto grid max-w-screen-2xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] xl:px-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">
                <ShieldCheck size={16} />
                Built for modern home care agencies
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
                Run Your Entire Agency
                <span className="block text-blue-700">From One Platform.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Scheduling, EVV, visit documentation, caregiver management,
                billing, payroll, secure messaging, family engagement, and compliance —
                all connected in one modern platform.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() =>
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group rounded-xl bg-blue-700 px-7 py-4 font-black text-white shadow-xl shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  <span className="flex items-center justify-center gap-2">
                    Request Demo
                    <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </span>
                </button>

                <button className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-7 py-4 font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">
                  <Play size={18} />
                  Watch Tour
                </button>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-4">
                <TrustPill icon={<ShieldCheck size={17} />} text="HIPAA Focused" />
                <TrustPill icon={<Lock size={17} />} text="Secure Access" />
                <TrustPill icon={<CheckCircle2 size={17} />} text="EVV Ready" />
                <TrustPill icon={<HeartPulse size={17} />} text="Family Portal" />
              </div>
            </div>

            <HeroMockup />
          </div>

          <div className="mx-auto max-w-screen-2xl px-6 pb-12 xl:px-10">
            <div className="grid grid-cols-1 gap-4 rounded-[2rem] border border-slate-100 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur md:grid-cols-4">
              <ImpactStat value="Reduce" label="Missed Visits" />
              <ImpactStat value="24/7" label="Visit Visibility" />
              <ImpactStat value="Instant" label="Family Communication" />
              <ImpactStat value="98%" label="Documentation Focus" />
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-16 xl:px-10">
          <div className="mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                Why Agencies Switch
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                Replace scattered workflows with one connected system.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-slate-600">
                Many agencies still rely on spreadsheets, phone calls, text messages,
                paper notes, and disconnected tools. Homecare Solutions brings those
                workflows together.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SwitchCard problem="Scheduling Chaos" solution="Smart Scheduling" />
              <SwitchCard problem="Paper Documentation" solution="Digital Visit Notes" />
              <SwitchCard problem="Family Phone Calls" solution="Family Portal" />
              <SwitchCard problem="Payroll Delays" solution="Billing & Payroll" />
            </div>
          </div>
        </section>

        <section id="platform" className="bg-slate-950 px-6 py-16 text-white xl:px-10">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
                  Platform
                </p>
                <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                  Everything needed to run a modern home care agency.
                </h2>
              </div>

              <p className="max-w-xl leading-8 text-slate-300">
                Built around the real workflows agencies manage every day:
                visits, people, documentation, billing, communication, and compliance.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <DarkCard icon={<CalendarDays />} title="Scheduling" text="Plan visits, assign caregivers, and manage daily operations." />
              <DarkCard icon={<CheckCircle2 />} title="EVV Tracking" text="Support accurate clock in/out records and visit accountability." />
              <DarkCard icon={<ClipboardCheck />} title="Documentation" text="Capture visit notes, care updates, incidents, and reviews." />
              <DarkCard icon={<MessageCircle />} title="Messaging" text="Connect agency staff and families through secure conversations." />
              <DarkCard icon={<DollarSign />} title="Billing & Payroll" text="Organize authorizations, claims, billing records, and payroll workflows." />
              <DarkCard icon={<HeartPulse />} title="Family Portal" text="Give families secure visibility into approved care updates." />
            </div>
          </div>
        </section>

        <section id="features" className="bg-white px-6 py-16 xl:px-10">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                  Product Modules
                </p>
                <h2 className="mt-3 text-4xl font-black md:text-5xl">
                  Built for better agency control.
                </h2>
              </div>
              <p className="max-w-xl leading-7 text-slate-600">
                Replace disconnected spreadsheets and paper-heavy workflows with
                a connected care management platform.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Feature icon={<CalendarDays />} title="Smart Scheduling" text="Create visits, assign caregivers, and reduce missed appointments." />
              <Feature icon={<CheckCircle2 />} title="EVV & Time Tracking" text="Support accurate clock in/out records and completed visit visibility." />
              <Feature icon={<ClipboardCheck />} title="Visit Documentation" text="Capture care notes, family updates, incident details, and summaries." />
              <Feature icon={<DollarSign />} title="Billing & Payroll" text="Organize billing records, payroll workflows, and claim visibility." />
              <Feature icon={<FileText />} title="Document Management" text="Upload, review, approve, reject, and share documents securely." />
              <Feature icon={<MessageCircle />} title="Secure Messaging" text="Enable family-agency communication with participant-based conversations." />
              <Feature icon={<Bell />} title="Notifications" text="Send important alerts for messages, documents, visits, and updates." />
              <Feature icon={<Activity />} title="Care Visibility" text="Give agency teams better visibility into daily care activity." />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-16 xl:px-10">
          <div className="mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                Compliance & Security
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                Compliance built into every workflow.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-slate-600">
                Homecare Solutions is designed with role-based access,
                secure workflows, documentation review, and agency accountability in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ComplianceItem text="EVV Ready" />
              <ComplianceItem text="Role-Based Access" />
              <ComplianceItem text="Secure Messaging" />
              <ComplianceItem text="Visit Documentation" />
              <ComplianceItem text="Incident Tracking" />
              <ComplianceItem text="Authorization Management" />
            </div>
          </div>
        </section>

        <section id="portals" className="bg-white px-6 py-16 xl:px-10">
          <div className="mx-auto max-w-screen-2xl">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                  Portals
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                  One platform. Three secure experiences.
                </h2>
                <p className="mt-5 leading-8 text-slate-600">
                  Admin, caregiver, and family users get the right tools with the right access.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Portal icon={<Users />} title="Admin Portal" text="Manage clients, caregivers, scheduling, documents, compliance, billing, and messaging." />
                <Portal icon={<Smartphone />} title="Caregiver Portal" text="View visits, clock in/out, complete documentation, and manage care tasks." />
                <Portal icon={<HeartPulse />} title="Family Portal" text="Access approved care updates, documents, appointments, notifications, and messages." />
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="bg-white px-6 py-16 xl:px-10">
          <div className="mx-auto grid max-w-screen-2xl overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-10 text-white md:p-14">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-200">
                Product Demo
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                See Homecare Solutions in action.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-blue-100">
                Request a personalized walkthrough and discover how agencies streamline
                scheduling, EVV, documentation, billing, and family engagement.
              </p>

              <div className="mt-8 rounded-[2rem] bg-white/10 p-5 backdrop-blur">
                <div className="flex h-64 items-center justify-center rounded-[1.5rem] bg-white/15">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-blue-700 shadow-2xl">
                    <Play size={38} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <CheckLine text="Personalized demo" />
                  <CheckLine text="No obligation" />
                  <CheckLine text="Built for agencies" />
                  <CheckLine text="HIPAA focused" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-emerald-50 p-10 md:p-14">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">
                Get Started
              </p>
              <h2 className="mt-4 text-4xl font-black">Request a Demo</h2>
              <p className="mt-3 leading-7 text-slate-600">
                Tell us about your agency. We’ll follow up with a personalized walkthrough.
              </p>

              <form onSubmit={submitDemo} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input name="fullName" placeholder="Full Name" value={demoForm.fullName} onChange={handleDemoChange} required />
                <Input name="agencyName" placeholder="Agency Name" value={demoForm.agencyName} onChange={handleDemoChange} required />
                <Input name="email" type="email" placeholder="Email Address" value={demoForm.email} onChange={handleDemoChange} required />
                <Input name="phone" placeholder="Phone Number" value={demoForm.phone} onChange={handleDemoChange} />

                <select
                  name="agencySize"
                  value={demoForm.agencySize}
                  onChange={handleDemoChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 md:col-span-2"
                >
                  <option value="">Agency Size</option>
                  <option value="1-10 caregivers">1-10 caregivers</option>
                  <option value="11-50 caregivers">11-50 caregivers</option>
                  <option value="51-100 caregivers">51-100 caregivers</option>
                  <option value="100+ caregivers">100+ caregivers</option>
                </select>

                <textarea
                  name="message"
                  placeholder="Message"
                  value={demoForm.message}
                  onChange={handleDemoChange}
                  className="min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 md:col-span-2"
                />

                <button className="rounded-xl bg-blue-700 px-5 py-4 font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 md:col-span-2">
                  Request Demo
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-slate-50 px-6 py-16 xl:px-10">
          <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
                Contact
              </p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Have questions?
              </h2>
              <p className="mt-4 max-w-xl leading-8 text-slate-600">
                Send us a message about your agency, product demo, or pilot opportunity.
              </p>
            </div>

            <form onSubmit={submitContact} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/50">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input name="fullName" placeholder="Full Name" value={contactForm.fullName} onChange={handleContactChange} required />
                <Input name="email" type="email" placeholder="Email Address" value={contactForm.email} onChange={handleContactChange} required />
                <Input name="subject" placeholder="Subject" value={contactForm.subject} onChange={handleContactChange} />
                <textarea
                  name="message"
                  placeholder="Message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  className="min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 md:col-span-2"
                  required
                />
              </div>

              <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700">
                Send Message
                <Send size={16} />
              </button>
            </form>
          </div>
        </section>

        <section className="bg-blue-700 px-6 py-10 text-white xl:px-10">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-black">Ready to modernize your agency?</h2>
              <p className="mt-2 text-blue-100">
                See how Homecare Solutions can simplify operations, improve visibility, and support growth.
              </p>
            </div>
            <button
              onClick={() =>
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-xl bg-white px-6 py-4 font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              Book a Demo Today
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Header({ navigate }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 xl:px-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white">
            <HeartPulse size={24} />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black leading-none">Homecare</h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Solutions
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-9 text-sm font-bold text-slate-700 lg:flex">
          <a href="#platform" className="hover:text-blue-700">Platform</a>
          <a href="#features" className="hover:text-blue-700">Modules</a>
          <a href="#portals" className="hover:text-blue-700">Portals</a>
          <a href="#demo" className="hover:text-blue-700">Demo</a>
          <a href="#contact" className="hover:text-blue-700">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
            }
            className="hidden rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 md:block"
          >
            Request Demo
          </button>

          <button
            onClick={() => navigate("/admin-login")}
            className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  )
}

function HeroMockup() {
  return (
    <div className="relative min-h-[420px]">
      <div className="absolute right-8 top-6 w-[720px] rounded-[2rem] border-[9px] border-slate-950 bg-white shadow-2xl shadow-slate-900/20">
        <div className="rounded-[1.35rem] bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">Agency Dashboard</h3>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
              Live
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            <MiniMetric label="Clients" value="128" />
            <MiniMetric label="Caregivers" value="86" />
            <MiniMetric label="Visits" value="236" />
            <MiniMetric label="Open Tasks" value="18" />
          </div>

          <div className="mt-4 grid grid-cols-[1.2fr_0.8fr] gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h4 className="font-black">Today’s Schedule</h4>
              {["John Smith", "Mary Johnson", "Robert Brown"].map((name) => (
                <div key={name} className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-semibold">{name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h4 className="font-black">Visit Status</h4>
              <div className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-full border-[17px] border-blue-600 border-b-purple-500 border-r-emerald-500">
                <span className="text-2xl font-black">236</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhoneMockup
        className="absolute left-0 top-28"
        label="Caregiver App"
        color="bg-blue-700"
        title="Hello, Mary"
        items={[
          ["Next Visit", "10:00 AM"],
          ["Tasks", "3 pending"],
          ["Clock In", "Ready"],
        ]}
      />

      <PhoneMockup
        className="absolute right-0 top-20"
        label="Family Portal"
        color="bg-purple-700"
        title="Good morning, Sarah"
        items={[
          ["Upcoming Visit", "Today, 10:00 AM"],
          ["Visit Notes", "Visit completed"],
          ["Medications", "Up to date"],
        ]}
      />
    </div>
  )
}

function PhoneMockup({ className, label, color, title, items }) {
  return (
    <div className={`${className} w-56 rounded-[2rem] border-[8px] border-slate-950 bg-white shadow-2xl shadow-slate-900/20`}>
      <div className="rounded-[1.45rem] bg-white p-4">
        <p className={`rounded-xl px-3 py-2 text-center text-xs font-black text-white ${color}`}>
          {label}
        </p>
        <h4 className="mt-4 font-black">{title}</h4>
        <div className="mt-4 space-y-3">
          {items.map(([title, text]) => (
            <div key={title} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-500">{title}</p>
              <p className="mt-1 text-sm font-black">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function TrustPill({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black shadow-sm">
      <span className="text-blue-700">{icon}</span>
      {text}
    </div>
  )
}

function ImpactStat({ value, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-3xl font-black text-blue-700">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  )
}

function SwitchCard({ problem, solution }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-red-500">
        {problem}
      </p>
      <div className="my-4 h-px bg-slate-100" />
      <p className="flex items-center gap-2 text-xl font-black text-blue-700">
        <ArrowRight size={18} />
        {solution}
      </p>
    </div>
  )
}

function DarkCard({ icon, title, text }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-500/20 p-4 text-blue-200">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  )
}

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-100 p-4 text-blue-700">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  )
}

function ComplianceItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={20} />
      </div>
      <p className="font-black text-slate-800">{text}</p>
    </div>
  )
}

function Portal({ icon, title, text }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-100 p-4 text-blue-700">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
      <button className="mt-5 font-black text-blue-700">Learn More →</button>
    </div>
  )
}

function CheckLine({ text }) {
  return (
    <p className="flex items-center gap-2 text-sm font-black text-blue-100">
      <CheckCircle2 size={17} className="text-emerald-300" />
      {text}
    </p>
  )
}

function Input({ name, value, onChange, placeholder, type = "text", required }) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-12 text-white xl:px-10">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700">
              <HeartPulse size={23} />
            </div>
            <div>
              <h3 className="text-2xl font-black leading-none">Homecare</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                Solutions
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Modern home care operations software for agencies that want better workflows,
            better visibility, and better care coordination.
          </p>
        </div>

        <FooterColumn title="Product" items={["Scheduling", "EVV", "Documentation", "Messaging", "Billing"]} />
        <FooterColumn title="Solutions" items={["Home Care Agencies", "Private Duty", "Medicaid Providers", "Family Engagement"]} />

        <div>
          <h4 className="font-black">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p className="flex items-center gap-2"><Phone size={15} /> (555) 123-4567</p>
            <p className="flex items-center gap-2"><Mail size={15} /> info@homecaresolutions.com</p>
            <p>© 2026 Homecare Solutions.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="font-black">{title}</h4>
      <div className="mt-4 space-y-2 text-sm text-slate-400">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  )
}

export default HomePage