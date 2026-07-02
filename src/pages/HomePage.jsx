import { useEffect, useState } from "react"
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
  Sparkles,
  Users,
  Menu,
  X,
} from "lucide-react"
import api from "../api/axios"

const HERO_IMAGE = "/carebridge-homepage-hero.png"

const featureCards = [
  {
    title: "Smart Scheduling",
    text: "Intelligent scheduling and caregiver matching reduce no-shows and optimize productivity.",
    icon: <CalendarDays size={30} />,
    tone: "blue",
  },
  {
    title: "EVV & Compliance",
    text: "GPS-verified clock in/out, real-time monitoring, and automated compliance reporting.",
    icon: <ShieldCheck size={30} />,
    tone: "green",
  },
  {
    title: "Care Documentation",
    text: "Capture visit notes, MAR, service docs, and incidents easily from any device.",
    icon: <ClipboardCheck size={30} />,
    tone: "purple",
  },
  {
    title: "AI Insights & Alerts",
    text: "AI-powered risk detection and smart alerts help you act before issues grow.",
    icon: <Sparkles size={30} />,
    tone: "orange",
  },
  {
    title: "Billing & Payroll",
    text: "Seamless billing, claims, payroll, and timesheets all integrated in one place.",
    icon: <DollarSign size={30} />,
    tone: "blue",
  },
  {
    title: "Communication",
    text: "Keep caregivers, clients, and families connected with real-time updates and messaging.",
    icon: <MessageCircle size={30} />,
    tone: "pink",
  },
]

function HomePage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <Header
        navigate={navigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main>
        <HeroSection />
        <FeatureCarousel />
        <AgencyConfidenceSection />
        <PlatformSection />
        <MobileAndAISection />
        <SecuritySection />
        <PortalsSection />
        <DemoSection
          demoForm={demoForm}
          handleDemoChange={handleDemoChange}
          submitDemo={submitDemo}
        />
        <ContactSection
          contactForm={contactForm}
          handleContactChange={handleContactChange}
          submitContact={submitContact}
        />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}

function Header({ navigate, mobileMenuOpen, setMobileMenuOpen }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    ["Platform", "#platform"],
    ["Operations", "#operations"],
    ["AI", "#ai"],
    ["Portals", "#portals"],
    ["Demo", "#demo"],
    ["Contact", "#contact"],
  ]

  const textColor = scrolled ? "text-slate-800" : "text-white"
  const mutedColor = scrolled ? "text-slate-500" : "text-white/75"

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 xl:px-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-700/20">
            <HeartPulse size={24} />
          </div>

          <div className="text-left">
            <h1 className={`text-2xl font-black leading-none ${textColor}`}>
              CareBridge
            </h1>
            <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.28em] ${mutedColor}`}>
              Home Care OS
            </p>
          </div>
        </button>

        <nav className={`hidden items-center gap-8 text-sm font-black lg:flex ${textColor}`}>
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="transition hover:text-blue-600">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => navigate("/admin-login")}
            className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
              scrolled
                ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                : "border border-white/45 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            }`}
          >
            Login
          </button>

          <button
            onClick={() =>
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Request Demo
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`rounded-2xl p-3 lg:hidden ${
            scrolled ? "bg-slate-100 text-slate-700" : "bg-white/10 text-white backdrop-blur"
          }`}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="bg-white px-6 py-4 shadow-xl lg:hidden">
          <div className="space-y-3">
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-black text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}

            <button
              onClick={() => navigate("/admin-login")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-black text-slate-700"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[720px] overflow-hidden bg-slate-950">
      <img
        src={HERO_IMAGE}
        alt="Caregiver supporting an older adult at home"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/48 to-slate-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/25" />

      <div className="relative mx-auto flex min-h-[720px] max-w-screen-2xl items-center px-6 pb-24 pt-32 xl:px-10">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-700 shadow-lg">
            <Sparkles size={15} />
            All-in-one homecare platform
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-tight md:text-5xl xl:text-6xl">
            Smarter Tools.
            <span className="block">Stronger Care.</span>
            <span className="block text-blue-500">Better Lives.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/90 md:text-lg">
            Everything your homecare agency needs to operate efficiently, stay compliant,
            and deliver exceptional care—every single day.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() =>
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
              }
              className="group rounded-2xl bg-blue-700 px-7 py-4 font-black text-white shadow-xl shadow-blue-900/30 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              <span className="flex items-center justify-center gap-2">
                Request Demo
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </button>

            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-7 py-4 font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
              <Play size={18} />
              Watch Overview
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-5 text-sm font-black text-white">
            <TrustPillDark icon={<ShieldCheck size={17} />} text="HIPAA Compliant" />
            <TrustPillDark icon={<Lock size={17} />} text="Secure & Encrypted" />
            <TrustPillDark icon={<Users size={17} />} text="Trusted by Agencies" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCarousel() {
  const [startIndex, setStartIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % featureCards.length)
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [])

  const visibleCards = [0, 1, 2].map(
    (offset) => featureCards[(startIndex + offset) % featureCards.length]
  )

  function previous() {
    setStartIndex((current) =>
      current === 0 ? featureCards.length - 1 : current - 1
    )
  }

  function next() {
    setStartIndex((current) => (current + 1) % featureCards.length)
  }

  return (
    <section className="relative bg-white px-6 pb-16 xl:px-10">
      <div className="relative mx-auto -mt-16 max-w-screen-2xl">
        <button
          onClick={previous}
          className="absolute left-0 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-900 shadow-2xl shadow-slate-900/20 transition hover:bg-blue-50 lg:flex"
        >
          ‹
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-900 shadow-2xl shadow-slate-900/20 transition hover:bg-blue-50 lg:flex"
        >
          ›
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visibleCards.map((card) => (
            <FeatureCard key={card.title} card={card} />
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {featureCards.map((card, index) => (
            <button
              key={card.title}
              onClick={() => setStartIndex(index)}
              className={`h-3 rounded-full transition-all ${
                index === startIndex ? "w-8 bg-blue-700" : "w-3 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ card }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    purple: "bg-violet-100 text-violet-700",
    orange: "bg-orange-100 text-orange-700",
    pink: "bg-pink-100 text-pink-700",
  }

  return (
    <div className="min-h-[305px] rounded-[2rem] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_rgba(15,23,42,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(37,99,235,0.20)]">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          tones[card.tone] || tones.blue
        }`}
      >
        {card.icon}
      </div>

      <h3 className="mt-6 text-xl font-black text-slate-950">{card.title}</h3>
      <p className="mt-4 min-h-[92px] leading-7 text-slate-600">{card.text}</p>

      <button className="mt-5 flex items-center gap-2 font-black text-blue-700">
        Learn more <ArrowRight size={16} />
      </button>
    </div>
  )
}

function AgencyConfidenceSection() {
  return (
    <section id="operations" className="relative overflow-hidden bg-slate-50 px-6 py-20 xl:px-10">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-black uppercase tracking-wide text-blue-700">
            Real-time operations
          </p>
          <h2 className="mt-6 max-w-2xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
            Keep every visit, caregiver, and compliance task under control.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-slate-600">
            CareBridge gives supervisors instant visibility into today’s schedule,
            open tasks, EVV exceptions, documentation risks, and billing readiness.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <OperationMetric icon={<CalendarDays />} value="128" label="Scheduled visits" tone="blue" />
            <OperationMetric icon={<CheckCircle2 />} value="96" label="Completed today" tone="green" />
            <OperationMetric icon={<Bell />} value="8" label="Alerts to review" tone="orange" />
            <OperationMetric icon={<DollarSign />} value="42" label="Billing-ready visits" tone="purple" />
          </div>
        </div>

        <AgencyDashboardCard />
      </div>
    </section>
  )
}

function OperationMetric({ icon, value, label, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-violet-100 text-violet-700",
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="flex items-center gap-4">
        <div className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ${tones[tone]}`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-black text-slate-950">{value}</p>
          <p className="text-sm font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function AgencyDashboardCard() {
  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-blue-700">CareBridge</p>
          <h3 className="text-2xl font-black text-slate-950">Today’s Agency Command Center</h3>
        </div>
        <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-black text-blue-700">
          Live Operations
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MiniMetric label="Clients" value="248" />
        <MiniMetric label="Caregivers" value="156" />
        <MiniMetric label="Visits" value="642" />
        <MiniMetric label="Compliance" value="98%" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-950">Visit Flow</h4>
            <span className="text-xs font-black text-emerald-600">+12% this week</span>
          </div>

          <div className="mt-7 flex h-48 items-end gap-3">
            {[38, 50, 62, 76, 88, 66, 84].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-400 shadow-lg shadow-blue-700/20"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs font-bold text-slate-400">D{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] bg-slate-50 p-5">
            <h4 className="font-black text-slate-950">Compliance Status</h4>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[16px] border-blue-600 border-b-orange-400 border-r-emerald-500 bg-white">
                <span className="text-2xl font-black">98%</span>
              </div>
              <div className="space-y-2 text-sm font-bold text-slate-600">
                <p>EVV verified</p>
                <p>Docs reviewed</p>
                <p>Billing ready</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-950">Priority Alerts</h4>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">8 Open</span>
            </div>
            <div className="mt-4 space-y-3">
              <AlertLine color="red" title="Missed clock-out" text="Caregiver follow-up needed" />
              <AlertLine color="orange" title="Late visit" text="Scheduler review pending" />
              <AlertLine color="blue" title="MAR verification" text="Supervisor action required" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertLine({ color, title, text }) {
  const colors = {
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <div className={`h-3 w-3 rounded-full ${colors[color]?.split(" ")[0]}`} />
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs font-semibold text-slate-500">{text}</p>
      </div>
    </div>
  )
}

function PlatformSection() {
  return (
    <section id="platform" className="bg-slate-950 px-6 py-20 text-white xl:px-10">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
              All-in-One Platform
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
              Everything you need to run a successful agency.
            </h2>
          </div>

          <p className="max-w-xl leading-8 text-slate-300">
            Built around the real workflows agencies manage every day: visits,
            caregivers, documentation, billing, family engagement, and compliance.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <DarkCard icon={<CalendarDays />} title="Smart Scheduling" text="Plan visits, assign caregivers, manage open shifts, and reduce missed coverage." />
          <DarkCard icon={<CheckCircle2 />} title="EVV & Compliance" text="Support accurate clock-in/out records, exceptions, audit trails, and review workflows." />
          <DarkCard icon={<ClipboardCheck />} title="Care Documentation" text="Capture visit notes, service documentation, incidents, MAR review, and approvals." />
          <DarkCard icon={<Sparkles />} title="AI Insights" text="Identify risks, surface exceptions, summarize documentation, and support faster decisions." />
          <DarkCard icon={<DollarSign />} title="Billing & Payroll" text="Connect approved visits, authorizations, billing records, and payroll workflows." />
          <DarkCard icon={<MessageCircle />} title="Communication" text="Keep agency staff, caregivers, clients, and families connected securely." />
        </div>
      </div>
    </section>
  )
}

function MobileAndAISection() {
  return (
    <section id="ai" className="bg-white px-6 py-20 xl:px-10">
      <div className="mx-auto grid max-w-screen-2xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="rounded-[2.25rem] bg-gradient-to-br from-blue-700 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-900/20">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
            Caregiver Mobile Experience
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight">
            Give caregivers the tools they need at the point of care.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <MobileFeature title="Clock In / Out" text="EVV-ready time tracking" />
            <MobileFeature title="Visit Notes" text="Document care quickly" />
            <MobileFeature title="Medication Tasks" text="MAR workflow visibility" />
            <MobileFeature title="Secure Messages" text="Stay connected" />
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            AI Operations Center
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            AI insights that help agencies act sooner.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            CareBridge helps supervisors identify patterns, detect risks, and
            respond faster across scheduling, documentation, EVV, and compliance.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <AIItem text="Predict missed visits" />
            <AIItem text="Detect fraud and anomalies" />
            <AIItem text="Review documentation faster" />
            <AIItem text="Optimize scheduling coverage" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  return (
    <section className="bg-slate-50 px-6 py-20 xl:px-10">
      <div className="mx-auto max-w-screen-2xl rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/60">
        <SectionHeading
          eyebrow="Security & Compliance"
          title="Built for sensitive homecare operations."
          text="Secure workflows, role-based access, audit logs, documentation review, EVV visibility, and compliance-focused controls are built into the platform."
          centered
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-6">
          <ComplianceItem text="HIPAA Focused" />
          <ComplianceItem text="Role-Based Access" />
          <ComplianceItem text="Audit Logs" />
          <ComplianceItem text="EVV Ready" />
          <ComplianceItem text="Secure Messaging" />
          <ComplianceItem text="Compliance Reports" />
        </div>
      </div>
    </section>
  )
}

function PortalsSection() {
  return (
    <section id="portals" className="bg-white px-6 py-20 xl:px-10">
      <div className="mx-auto max-w-screen-2xl">
        <SectionHeading
          eyebrow="Portals"
          title="One platform. Three secure experiences."
          text="Admin, caregiver, and family users get the right tools with the right level of access."
          centered
        />
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Portal icon={<Users />} title="Admin Portal" text="Manage clients, caregivers, scheduling, compliance, documents, billing, payroll, and messages." />
          <Portal icon={<Smartphone />} title="Caregiver Portal" text="View visits, clock in/out, complete service documentation, medication tasks, and care updates." />
          <Portal icon={<HeartPulse />} title="Family Portal" text="Access approved care updates, appointments, documents, notifications, and secure messages." />
        </div>
      </div>
    </section>
  )
}

function DemoSection({ demoForm, handleDemoChange, submitDemo }) {
  return (
    <section id="demo" className="bg-white px-6 py-20 xl:px-10">
      <div className="mx-auto grid max-w-screen-2xl overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-10 text-white md:p-14">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-200">
            Product Demo
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            See CareBridge in action.
          </h2>
          <p className="mt-5 max-w-xl leading-8 text-blue-100">
            Request a personalized walkthrough and see how agencies streamline scheduling,
            EVV, documentation, billing, compliance, and family engagement.
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

        <div className="bg-gradient-to-br from-white to-blue-50 p-10 md:p-14">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
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
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 md:col-span-2"
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
              className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 md:col-span-2"
            />
            <button className="rounded-2xl bg-blue-700 px-5 py-4 font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 md:col-span-2">
              Request Demo
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function ContactSection({ contactForm, handleContactChange, submitContact }) {
  return (
    <section id="contact" className="bg-slate-50 px-6 py-20 xl:px-10">
      <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Contact
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Have questions?
          </h2>
          <p className="mt-4 max-w-xl leading-8 text-slate-600">
            Send us a message about your agency, product demo, pilot opportunity,
            or partnership interest.
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
              className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 md:col-span-2"
              required
            />
          </div>

          <button className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700">
            Send Message
            <Send size={16} />
          </button>
        </form>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-white px-6 py-10 xl:px-10">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-6 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-800 to-indigo-700 p-10 text-white shadow-2xl shadow-blue-900/20 md:flex-row md:items-center">
        <div>
          <h2 className="text-4xl font-black">Ready to elevate your homecare agency?</h2>
          <p className="mt-3 max-w-2xl text-blue-100">
            Join modern agencies using CareBridge to simplify operations, improve compliance,
            and deliver better care.
          </p>
        </div>
        <button
          onClick={() =>
            document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
          }
          className="rounded-2xl bg-white px-7 py-4 font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
        >
          Schedule a Demo
        </button>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, text, centered }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 leading-8 text-slate-600">{text}</p>
    </div>
  )
}

function TrustPillDark({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-white drop-shadow-sm">
      <span>{icon}</span>
      {text}
    </div>
  )
}

function DarkCard({ icon, title, text }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.09]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 p-4 text-blue-200">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{text}</p>
      <button className="mt-5 flex items-center gap-2 font-black text-blue-200">
        Learn more <ArrowRight size={16} />
      </button>
    </div>
  )
}

function MobileFeature({ title, text }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-blue-100">{text}</p>
    </div>
  )
}

function AIItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
        <Sparkles size={18} />
      </div>
      <p className="font-black text-slate-800">{text}</p>
    </div>
  )
}

function ComplianceItem({ text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50 p-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={22} />
      </div>
      <p className="mt-3 font-black text-slate-800">{text}</p>
    </div>
  )
}

function Portal({ icon, title, text }) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 p-4 text-blue-700">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
      <button className="mt-5 flex items-center gap-2 font-black text-blue-700">
        Learn More <ArrowRight size={16} />
      </button>
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

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
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
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-14 text-white xl:px-10">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700">
              <HeartPulse size={23} />
            </div>
            <div>
              <h3 className="text-2xl font-black leading-none">CareBridge</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                Home Care OS
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Modern homecare operations software for agencies that want better workflows,
            better visibility, and better care coordination.
          </p>
        </div>

        <FooterColumn title="Product" items={["Scheduling", "EVV", "Documentation", "Messaging", "Billing"]} />
        <FooterColumn title="Solutions" items={["Home Care Agencies", "Private Duty", "Medicaid Providers", "Family Engagement"]} />

        <div>
          <h4 className="font-black">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p className="flex items-center gap-2"><Phone size={15} /> (555) 123-4567</p>
            <p className="flex items-center gap-2"><Mail size={15} /> info@carebridge.com</p>
            <p>© 2026 CareBridge. All rights reserved.</p>
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
