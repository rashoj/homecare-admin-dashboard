import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  User,
  Phone,
  MapPin,
  CalendarDays,
  HeartPulse,
  ShieldCheck,
  FileText,
  Pill,
  Users,
  CreditCard,
  ClipboardCheck,
  Clock3,
  AlertTriangle,
  Target,
  Activity,
  Home,
  UserRound,
} from "lucide-react"

import { getClientById } from "../services/clientApi"

import ClientClockRecordsTab from "../components/client/ClientClockRecordsTab"
import ClientCaregiversTab from "../components/client/ClientCaregiversTab"
import ClientAppointmentsTab from "../components/client/ClientAppointmentsTab"
import ClientVisitNotesTab from "../components/client/ClientVisitNotesTab"
import MedicationMARPanel from "../components/medications/MedicationMARPanel"
import ClientRiskSafetyTab from "../components/client/ClientRiskSafetyTab"
import ClientISPGoalsTab from "../components/client/ClientISPGoalsTab"
import ClientBehaviorIncidentCardsTab from "../components/client/ClientBehaviorIncidentCardsTab"
import ClientBillingTab from "../components/client/ClientBillingTab"
import ClientDocumentsTab from "../components/client/ClientDocumentsTab"
import ClientFamilyAccessTab from "../components/client/ClientFamilyAccessTab"

function ClientDetailsPage() {
  const { clientId } = useParams()

  const [client, setClient] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const tabs = [
    { id: "overview", label: "Overview", icon: <Home size={16} /> },
    { id: "appointments", label: "Appointments", icon: <CalendarDays size={16} /> },
    { id: "clockRecords", label: "EVV / Clock", icon: <Clock3 size={16} /> },
    { id: "visitNotes", label: "Visit Notes", icon: <ClipboardCheck size={16} /> },
    { id: "medications", label: "MAR", icon: <Pill size={16} /> },
    { id: "risk", label: "Risk & Safety", icon: <AlertTriangle size={16} /> },
    { id: "ispGoals", label: "ISP / Goals", icon: <Target size={16} /> },
    { id: "behavior", label: "Behavior", icon: <Activity size={16} /> },
    { id: "documents", label: "Documents", icon: <FileText size={16} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={16} /> },
    { id: "caregivers", label: "Caregivers", icon: <Users size={16} /> },
    { id: "familyAccess", label: "Family Access", icon: <UserRound size={16} /> },
  ]

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        setErrorMessage("")
        const data = await getClientById(clientId)
        setClient(data)
      } catch (error) {
        setErrorMessage(error.message || "Failed to load client.")
      } finally {
        setLoading(false)
      }
    }

    if (clientId) loadClient()
  }, [clientId])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading client workspace...
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 font-semibold text-red-700">
        {errorMessage}
      </div>
    )
  }

  if (!client) {
    return (
      <div className="rounded-3xl bg-white p-6 text-slate-500 shadow-sm">
        Client not found.
      </div>
    )
  }

  const age = calculateAge(client.dateOfBirth)
  const active = client.active !== false

  return (
    <div className="space-y-8">
      <div className="text-sm font-semibold text-slate-500">
        Clients <span className="mx-2">/</span>
        <span className="text-slate-900">{client.fullName}</span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-6">
            <ClientAvatar name={client.fullName} />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  {client.fullName}
                </h1>
                <StatusBadge active={active} />
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Client ID: CLI-{String(client.id || clientId).padStart(5, "0")}
              </p>
            </div>
          </div>

          <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Edit Client
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ProfileFact
            icon={<CalendarDays size={20} />}
            label="Date of Birth"
            value={client.dateOfBirth || "Not provided"}
            subvalue={age ? `${age} yrs` : ""}
          />
          <ProfileFact
            icon={<User size={20} />}
            label="Gender"
            value={formatLabel(client.gender) || "Not provided"}
          />
          <ProfileFact
            icon={<HeartPulse size={20} />}
            label="Mobility"
            value={client.mobilityStatus || "Not provided"}
          />
          <ProfileFact
            icon={<Phone size={20} />}
            label="Phone"
            value={client.phoneNumber || "Not provided"}
          />
          <ProfileFact
            icon={<ShieldCheck size={20} />}
            label="Emergency Contact"
            value={client.emergencyContactName || "Not provided"}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-6 overflow-x-auto px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-5 text-sm font-bold ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <OverviewWorkspace client={client} age={age} />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {activeTab === "appointments" && <ClientAppointmentsTab clientId={clientId} />}
          {activeTab === "clockRecords" && <ClientClockRecordsTab clientId={clientId} />}
          {activeTab === "visitNotes" && <ClientVisitNotesTab clientId={clientId} />}
          {activeTab === "medications" && <MedicationMARPanel clientId={clientId} />}
          {activeTab === "risk" && <ClientRiskSafetyTab clientId={clientId} />}
          {activeTab === "ispGoals" && <ClientISPGoalsTab clientId={clientId} />}
          {activeTab === "behavior" && <ClientBehaviorIncidentCardsTab clientId={clientId} />}
          {activeTab === "documents" && <ClientDocumentsTab clientId={clientId} />}
          {activeTab === "billing" && <ClientBillingTab clientId={clientId} />}
          {activeTab === "caregivers" && <ClientCaregiversTab clientId={clientId} />}
          {activeTab === "familyAccess" && <ClientFamilyAccessTab clientId={clientId} />}
        </div>
      )}
    </div>
  )
}

function OverviewWorkspace({ client, age }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">
              Client Overview
            </h2>
            <SmallPill>Care Profile</SmallPill>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 md:grid-cols-3">
            <OverviewField label="Date of Birth" value={client.dateOfBirth || "Not provided"} subvalue={age ? `${age} years` : ""} />
            <OverviewField label="Address" value={client.address || "Not provided"} />
            <OverviewField label="Emergency Contact" value={client.emergencyContactName || "Not provided"} />

            <OverviewField label="Phone" value={client.phoneNumber || "Not provided"} />
            <OverviewField label="Emergency Phone" value={client.emergencyContactPhone || "Not provided"} />
            <OverviewField label="Gender" value={formatLabel(client.gender) || "Not provided"} />

            <OverviewField label="Mobility" value={client.mobilityStatus || "Not provided"} />
            <OverviewField label="Medical Conditions" value={client.medicalConditions || "No conditions listed"} />
            <OverviewField label="Allergies" value={client.allergies || "No allergies listed"} />

            <OverviewField label="Care Plan" value={client.carePlan || "No care plan available"} wide />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">
              Care Snapshot
            </h2>
            <SmallPill>Live</SmallPill>
          </div>

          <div className="space-y-4">
            <SnapshotRow label="Status" value={client.active === false ? "Inactive" : "Active"} good={client.active !== false} />
            <SnapshotRow label="EVV Required" value="Yes" good />
            <SnapshotRow label="Risk Level" value={isHighRiskClient(client) ? "High Risk" : "Standard"} good={!isHighRiskClient(client)} />
            <SnapshotRow label="Primary Language" value={client.primaryLanguage || "English"} good />
            <SnapshotRow label="Preferred Contact" value={client.preferredContact || "Phone"} good />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Appointments" value="—" subtitle="Total" icon={<CalendarDays size={24} />} tone="blue" />
        <MetricCard title="Completed" value="—" subtitle="Visits" icon={<CheckIcon />} tone="green" />
        <MetricCard title="Missed" value="—" subtitle="Visits" icon={<AlertTriangle size={24} />} tone="red" />
        <MetricCard title="Medications" value="—" subtitle="Active" icon={<Pill size={24} />} tone="orange" />
        <MetricCard title="Caregivers" value="—" subtitle="Assigned" icon={<Users size={24} />} tone="green" />
        <MetricCard title="Documents" value="—" subtitle="Total" icon={<FileText size={24} />} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <InfoPanel title="Upcoming Appointments">
          <EmptyPanel text="Appointment summary will appear here from backend data." />
        </InfoPanel>

        <InfoPanel title="Recent Visit Notes">
          <EmptyPanel text="Recent visit notes will appear here." />
        </InfoPanel>

        <InfoPanel title="Care Team">
          <EmptyPanel text="Assigned caregivers and supervisors will appear here." />
        </InfoPanel>

        <InfoPanel title="Recent Documents">
          <EmptyPanel text="Recent uploaded documents will appear here." />
        </InfoPanel>

        <InfoPanel title="Risk & Safety Alerts">
          <RiskLine
            title={isHighRiskClient(client) ? "Mobility / Fall Risk" : "No critical risk"}
            subtitle={isHighRiskClient(client) ? "Review safety plan" : "All clear"}
            warning={isHighRiskClient(client)}
          />
        </InfoPanel>

        <InfoPanel title="Family Access">
          <EmptyPanel text="Family portal users will appear here." />
        </InfoPanel>
      </div>
    </div>
  )
}

function ProfileFact({ icon, label, value, subvalue }) {
  return (
    <div className="flex items-center gap-3 border-slate-200 xl:border-l xl:pl-5 first:border-l-0 first:pl-0">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 font-black text-slate-900">{value}</p>
        {subvalue && <p className="text-sm text-slate-500">{subvalue}</p>}
      </div>
    </div>
  )
}

function OverviewField({ label, value, subvalue, wide }) {
  return (
    <div className={`border-b border-r border-slate-200 p-5 ${wide ? "md:col-span-3" : ""}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-bold text-slate-900">{value}</p>
      {subvalue && <p className="mt-1 text-sm text-slate-500">{subvalue}</p>}
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone] || tones.blue}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <h3 className="font-black text-slate-900">{title}</h3>
        <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-blue-600">
          View All
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function EmptyPanel({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
      {text}
    </div>
  )
}

function SnapshotRow({ label, value, good }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className={`text-sm font-black ${good ? "text-green-700" : "text-red-700"}`}>
        {value}
      </span>
    </div>
  )
}

function RiskLine({ title, subtitle, warning }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <AlertTriangle
        size={18}
        className={warning ? "text-orange-500" : "text-green-500"}
      />
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function ClientAvatar({ name }) {
  return (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-3xl font-black text-blue-700">
      {getInitials(name)}
    </div>
  )
}

function StatusBadge({ active }) {
  return active ? (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
      Inactive
    </span>
  )
}

function SmallPill({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      {children}
    </span>
  )
}

function CheckIcon() {
  return <ShieldCheck size={24} />
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null

  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age
}

function isHighRiskClient(client) {
  const mobility = client.mobilityStatus?.toLowerCase() || ""

  return (
    mobility.includes("wheelchair") ||
    mobility.includes("bedbound") ||
    mobility.includes("fall")
  )
}

function formatLabel(value) {
  if (!value) return ""

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getInitials(name) {
  if (!name) return "?"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default ClientDetailsPage