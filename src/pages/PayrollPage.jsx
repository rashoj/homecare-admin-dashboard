import { useState } from "react"

import {
  DollarSign,
  Users,
  UserRound,
  Calculator
} from "lucide-react"

import {
  calculateCaregiverPayroll,
  calculateClientPayroll,
  downloadClientInvoicePdf
} from "../services/payrollService"

function PayrollPage() {
  const [caregiverId, setCaregiverId] = useState("")
  const [caregiverRate, setCaregiverRate] = useState("")

  const [clientId, setClientId] = useState("")
  const [clientRate, setClientRate] = useState("")

  const [caregiverPayroll, setCaregiverPayroll] = useState(null)
  const [clientPayroll, setClientPayroll] = useState(null)

  const handleCaregiverPayroll = async () => {
    try {
      const data = await calculateCaregiverPayroll(caregiverId, caregiverRate)
      setCaregiverPayroll(data)
    } catch (error) {
      console.error(error)
      alert("Failed to calculate caregiver payroll")
    }
  }

  const handleClientPayroll = async () => {
    try {
      const data = await calculateClientPayroll(clientId, clientRate)
      setClientPayroll(data)
    } catch (error) {
      console.error(error)
      alert("Failed to calculate client invoice")
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const blob = await downloadClientInvoicePdf(clientId, clientRate)

      const url = window.URL.createObjectURL(new Blob([blob]))

      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `client-invoice-${clientId}.pdf`)

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert("Failed to download invoice PDF")
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Payroll & Invoicing
        </h2>

        <p className="text-slate-500 mt-2">
          Calculate caregiver payroll and client invoice totals.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Caregiver Payroll */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
              <UserRound size={24} className="text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold">
                Caregiver Payroll
              </h3>

              <p className="text-slate-500 text-sm">
                Calculate caregiver payment totals
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              placeholder="Caregiver ID"
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              value={caregiverId}
              onChange={(e) => setCaregiverId(e.target.value)}
            />

            <input
              type="number"
              placeholder="Hourly Rate"
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              value={caregiverRate}
              onChange={(e) => setCaregiverRate(e.target.value)}
            />

            <button
              onClick={handleCaregiverPayroll}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition"
            >
              Calculate Payroll
            </button>
          </div>

          {caregiverPayroll && (
            <div className="mt-6 border border-blue-200 bg-blue-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calculator size={20} className="text-blue-700" />

                <h4 className="font-bold text-blue-700">
                  Payroll Summary
                </h4>
              </div>

              <div className="space-y-3 text-sm">
                <PayrollRow
                  label="Caregiver"
                  value={caregiverPayroll.caregiverName}
                />

                <PayrollRow
                  label="Hourly Rate"
                  value={`$${caregiverPayroll.hourlyRate}`}
                />

                <PayrollRow
                  label="Total Hours"
                  value={caregiverPayroll.totalHours?.toFixed(2)}
                />

                <PayrollRow
                  label="Total Pay"
                  value={`$${caregiverPayroll.totalPay?.toFixed(2)}`}
                  highlight
                />
              </div>
            </div>
          )}
        </div>

        {/* Client Invoice */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold">
                Client Invoice
              </h3>

              <p className="text-slate-500 text-sm">
                Calculate client billing totals
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              placeholder="Client ID"
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />

            <input
              type="number"
              placeholder="Client Hourly Rate"
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              value={clientRate}
              onChange={(e) => setClientRate(e.target.value)}
            />

            <button
              onClick={handleClientPayroll}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition"
            >
              Calculate Invoice
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="w-full border border-green-600 text-green-700 hover:bg-green-50 rounded-xl py-3 font-semibold transition"
            >
              Download Invoice PDF
            </button>
          </div>

          {clientPayroll && (
            <div className="mt-6 border border-green-200 bg-green-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-green-700" />

                <h4 className="font-bold text-green-700">
                  Invoice Summary
                </h4>
              </div>

              <div className="space-y-3 text-sm">
                <PayrollRow
                  label="Client"
                  value={clientPayroll.clientName}
                />

                <PayrollRow
                  label="Hourly Rate"
                  value={`$${clientPayroll.hourlyRate}`}
                />

                <PayrollRow
                  label="Total Hours"
                  value={clientPayroll.totalHours?.toFixed(2)}
                />

                <PayrollRow
                  label="Amount Due"
                  value={`$${clientPayroll.amountDue?.toFixed(2)}`}
                  highlight
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PayrollRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        {label}
      </span>

      <span
        className={`font-semibold ${
          highlight ? "text-lg text-slate-800" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default PayrollPage