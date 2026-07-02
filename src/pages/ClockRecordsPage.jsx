import { useEffect, useMemo, useState } from "react"
import {
  Clock3,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Timer,
} from "lucide-react"

import { getClockRecords } from "../services/caregiverApi"

function ClockRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("ALL")

  useEffect(() => {
    loadClockRecords()
  }, [])

  async function loadClockRecords() {
    try {
      setLoading(true)
      setErrorMessage("")
      const data = await getClockRecords()
      setRecords(data || [])
    } catch (error) {
      setErrorMessage(error.message || "Failed to load clock records.")
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const text = `${record.caregiverName || ""} ${record.clientName || ""} ${
        record.status || ""
      }`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesTab =
        activeTab === "ALL" ||
        record.status === activeTab ||
        (activeTab === "OPEN" && !record.clockOutTime) ||
        (activeTab === "COMPLETED" && record.clockOutTime)

      return matchesSearch && matchesTab
    })
  }, [records, search, activeTab])

  const openRecords = records.filter((record) => !record.clockOutTime).length
  const completedRecords = records.filter((record) => record.clockOutTime).length
  const totalHours = records.reduce(
    (sum, record) => sum + Number(record.totalHours || 0),
    0
  )

  const tabs = [
    { key: "ALL", label: "All Records" },
    { key: "OPEN", label: "Clocked In" },
    { key: "COMPLETED", label: "Completed" },
    { key: "MISSED_CLOCK_OUT", label: "Missed Clock-Out" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 font-semibold text-slate-600 shadow-sm">
          Loading clock records...
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Clock Records
          </h1>
          <p className="mt-2 text-slate-500">
            Review caregiver EVV clock-in, clock-out activity, visit hours, and
            missed clock-out risks.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none sm:w-72"
              placeholder="Search caregiver or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Records"
          value={records.length}
          subtitle="All clock events"
          icon={<Clock3 size={26} />}
          tone="blue"
        />
        <MetricCard
          title="Clocked In"
          value={openRecords}
          subtitle="Currently active"
          icon={<UserCheck size={26} />}
          tone="orange"
        />
        <MetricCard
          title="Completed"
          value={completedRecords}
          subtitle="Clocked out visits"
          icon={<CheckCircle2 size={26} />}
          tone="green"
        />
        <MetricCard
          title="Total Hours"
          value={totalHours.toFixed(2)}
          subtitle="Recorded visit hours"
          icon={<Timer size={26} />}
          tone="purple"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-1 py-5 text-sm font-bold ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <TableHead>Caregiver</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>EVV Risk</TableHead>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={record.caregiverName} tone="blue" />
                      <div>
                        <p className="font-black text-slate-900">
                          {record.caregiverName || "Unknown Caregiver"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Record #{record.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 font-bold text-slate-700">
                    {record.clientName || "—"}
                  </td>

                  <td className="px-6 py-5">
                    <DateTimeBlock value={record.clockInTime} />
                  </td>

                  <td className="px-6 py-5">
                    <DateTimeBlock value={record.clockOutTime} empty="Still clocked in" />
                  </td>

                  <td className="px-6 py-5">
                    <span className="font-black text-slate-900">
                      {record.totalHours ?? "—"}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge record={record} />
                  </td>

                  <td className="px-6 py-5">
                    <RiskBadge record={record} />
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="font-semibold text-slate-600">
                      No clock records found.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or selected tab.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredRecords.length} of {records.length} clock records
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Previous
            </button>
            <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
              1
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            tones[tone] || tones.blue
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  )
}

function Avatar({ name }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700">
      {getInitials(name)}
    </div>
  )
}

function DateTimeBlock({ value, empty = "—" }) {
  if (!value) {
    return <span className="text-sm font-semibold text-slate-400">{empty}</span>
  }

  const date = new Date(value)

  return (
    <div>
      <p className="font-bold text-slate-800">{date.toLocaleDateString()}</p>
      <p className="mt-1 text-sm text-slate-500">
        {date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  )
}

function StatusBadge({ record }) {
  if (!record.clockOutTime) {
    return (
      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
        Clocked In
      </span>
    )
  }

  if (record.status === "MISSED_CLOCK_OUT") {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        Missed Clock-Out
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      {formatLabel(record.status || "Completed")}
    </span>
  )
}

function RiskBadge({ record }) {
  if (record.status === "MISSED_CLOCK_OUT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
        <AlertTriangle size={13} />
        Review
      </span>
    )
  }

  if (!record.clockOutTime) {
    return (
      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        Monitor
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
      Normal
    </span>
  )
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
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

export default ClockRecordsPage