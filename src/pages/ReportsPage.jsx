import { useState } from "react"

import {
  DollarSign,
  Users,
  UserRound,
  ClipboardCheck,
  Clock3,
  FileWarning,
  TrendingUp
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

import { getSummaryReport } from "../services/reportService"

function ReportsPage() {
  const [clientRate, setClientRate] = useState("")
  const [caregiverRate, setCaregiverRate] = useState("")
  const [report, setReport] = useState(null)

  const financialData = report
    ? [
        { name: "Revenue", value: report.estimatedRevenue },
        { name: "Payroll", value: report.estimatedPayroll },
        { name: "Margin", value: report.estimatedGrossMargin }
      ]
    : []

  const operationsData = report
    ? [
        { name: "Clients", value: report.totalClients },
        { name: "Caregivers", value: report.totalCaregivers },
        { name: "Visits", value: report.completedVisits },
        { name: "Pending Docs", value: report.pendingDocuments }
      ]
    : []

  const COLORS = ["#16a34a", "#2563eb", "#9333ea", "#dc2626"]

  const handleGenerateReport = async () => {
    try {
      const data = await getSummaryReport(clientRate, caregiverRate)
      setReport(data)
    } catch (error) {
      console.error(error)
      alert("Failed to generate report")
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Reports & Analytics
        </h2>

        <p className="text-slate-500 mt-2">
          View operational, workforce, and financial analytics.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Client Billing Rate"
            className="border border-slate-200 rounded-xl px-4 py-3"
            value={clientRate}
            onChange={(e) => setClientRate(e.target.value)}
          />

          <input
            type="number"
            placeholder="Caregiver Payroll Rate"
            className="border border-slate-200 rounded-xl px-4 py-3"
            value={caregiverRate}
            onChange={(e) => setCaregiverRate(e.target.value)}
          />

          <button
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition"
          >
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <AnalyticsCard
              title="Revenue"
              value={`$${report.estimatedRevenue?.toFixed(2)}`}
              icon={<DollarSign size={24} className="text-white" />}
              color="bg-green-600"
            />

            <AnalyticsCard
              title="Payroll"
              value={`$${report.estimatedPayroll?.toFixed(2)}`}
              icon={<DollarSign size={24} className="text-white" />}
              color="bg-blue-600"
            />

            <AnalyticsCard
              title="Gross Margin"
              value={`$${report.estimatedGrossMargin?.toFixed(2)}`}
              icon={<TrendingUp size={24} className="text-white" />}
              color="bg-purple-600"
            />

            <AnalyticsCard
              title="Total Hours"
              value={report.totalHours?.toFixed(2)}
              icon={<Clock3 size={24} className="text-white" />}
              color="bg-cyan-600"
            />

            <AnalyticsCard
              title="Clients"
              value={report.totalClients}
              icon={<Users size={24} className="text-white" />}
              color="bg-orange-600"
            />

            <AnalyticsCard
              title="Caregivers"
              value={report.totalCaregivers}
              icon={<UserRound size={24} className="text-white" />}
              color="bg-pink-600"
            />

            <AnalyticsCard
              title="Completed Visits"
              value={report.completedVisits}
              icon={<ClipboardCheck size={24} className="text-white" />}
              color="bg-emerald-600"
            />

            <AnalyticsCard
              title="Pending Documents"
              value={report.pendingDocuments}
              icon={<FileWarning size={24} className="text-white" />}
              color="bg-red-600"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">
                Financial Overview
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">
                Operations Breakdown
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={operationsData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label
                    >
                      {operationsData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AnalyticsCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div
        className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-5`}
      >
        {icon}
      </div>

      <h3 className="text-slate-500 text-sm">
        {title}
      </h3>

      <p className="text-4xl font-bold text-slate-800 mt-2">
        {value}
      </p>
    </div>
  )
}

export default ReportsPage