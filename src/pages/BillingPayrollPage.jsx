import { useEffect, useState } from "react"
import { getTimesheets, reviewTimesheet } from "../services/timesheetApi"

function BillingPayrollPage() {
  const [timesheets, setTimesheets] = useState([])
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [reviewData, setReviewData] = useState({
    caregiverPayRate: "",
    billingRate: "",
    payrollStatus: "PENDING",
    billingStatus: "PENDING",
    billable: false,
    authorizationOverrideReason: "",
    notes: "",
  })

  useEffect(() => {
    loadTimesheets()
  }, [])

  async function loadTimesheets() {
    try {
      const data = await getTimesheets()
      setTimesheets(data)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openReview(timesheet) {
    setSelectedTimesheet(timesheet)

    setReviewData({
      caregiverPayRate: timesheet.caregiverPayRate || "",
      billingRate: timesheet.billingRate || "",
      payrollStatus: timesheet.payrollStatus || "PENDING",
      billingStatus: timesheet.billingStatus || "PENDING",
      billable: Boolean(timesheet.billable),
       authorizationOverrideReason:
    timesheet.authorizationOverrideReason || "",
      notes: timesheet.notes || "",
    })
  }

  function closeReview() {
    setSelectedTimesheet(null)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setReviewData({
      ...reviewData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await reviewTimesheet(selectedTimesheet.id, {
        caregiverPayRate: Number(reviewData.caregiverPayRate),
        billingRate: Number(reviewData.billingRate),
        payrollStatus: reviewData.payrollStatus,
        billingStatus: reviewData.billingStatus,
       billable: reviewData.billable,
authorizationOverride:
  selectedTimesheet.authorizationValid === false &&
  reviewData.billable,
authorizationOverrideReason:
  reviewData.authorizationOverrideReason,
notes: reviewData.notes,
      })

      await loadTimesheets()
      closeReview()

      alert("Timesheet reviewed successfully.")
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading billing and payroll...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Billing & Payroll
        </h2>

        <p className="mt-2 text-slate-500">
          Review EVV-based timesheets, payroll approval, billing status, and authorization compliance.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {timesheets.length === 0 ? (
          <p className="text-slate-500">No timesheets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Hours</th>
                  <th className="p-4">Payroll</th>
                  <th className="p-4">Billing</th>
                  <th className="p-4">Doc</th>
                  <th className="p-4">Auth</th>
                  <th className="p-4">Billable</th>
                  <th className="p-4">Pay</th>
                  <th className="p-4">Bill</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {timesheets.map((ts) => (
                  <tr key={ts.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">
                      {ts.clientName}
                    </td>

                    <td className="p-4">{ts.caregiverName}</td>
                    <td className="p-4">{ts.totalHours}</td>

                    <td className="p-4">
                      <StatusBadge status={ts.payrollStatus} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={ts.billingStatus} />
                    </td>

                    <td className="p-4">
                      <FlagBadge ok={ts.documentationApproved} />
                    </td>

                    <td className="p-4">
                      <FlagBadge ok={ts.authorizationValid} />
                    </td>

                    <td className="p-4">
                      <FlagBadge ok={ts.billable} />
                    </td>

                    <td className="p-4">${ts.caregiverPayAmount ?? 0}</td>
                    <td className="p-4">${ts.billableAmount ?? 0}</td>

                    <td className="p-4">
                      <button
                        onClick={() => openReview(ts)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Review Timesheet
                </h3>

                <p className="mt-1 text-slate-500">
                  Verify payroll, billing, documentation, and authorization before approval.
                </p>
              </div>

              <button
                onClick={closeReview}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCard label="Client" value={selectedTimesheet.clientName} />
              <InfoCard label="Caregiver" value={selectedTimesheet.caregiverName} />
              <InfoCard label="Clock In" value={formatDate(selectedTimesheet.clockInTime)} />
              <InfoCard label="Clock Out" value={formatDate(selectedTimesheet.clockOutTime)} />
              <InfoCard label="Total Hours" value={selectedTimesheet.totalHours} />
              <InfoCard label="Authorization" value={selectedTimesheet.authorizationNumber || "None"} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <ComplianceCard
                label="Documentation Approved"
                ok={selectedTimesheet.documentationApproved}
              />
              <ComplianceCard
                label="Authorization Valid"
                ok={selectedTimesheet.authorizationValid}
              />
              <ComplianceCard
                label="Billable"
                ok={selectedTimesheet.billable}
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="number"
                  step="0.01"
                  name="caregiverPayRate"
                  value={reviewData.caregiverPayRate}
                  onChange={handleChange}
                  placeholder="Caregiver Pay Rate"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />

                <input
                  type="number"
                  step="0.01"
                  name="billingRate"
                  value={reviewData.billingRate}
                  onChange={handleChange}
                  placeholder="Billing Rate"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  name="payrollStatus"
                  value={reviewData.payrollStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="PENDING">Payroll Pending</option>
                  <option value="APPROVED">Payroll Approved</option>
                  <option value="PAID">Paid</option>
                </select>

                <select
                  name="billingStatus"
                  value={reviewData.billingStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="NEEDS_REVIEW">Needs Review</option>
                   <option value="PENDING">Billing Pending</option>
                  <option value="APPROVED">Billing Approved</option>
                  <option value="BILLED">Billed</option>
                  <option value="DENIED">Denied</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">
                <input
                  type="checkbox"
                  name="billable"
                  checked={reviewData.billable}
                  onChange={handleChange}
                />

                <span className="text-sm font-semibold text-blue-700">
                  Mark this timesheet as billable
                </span>
                {selectedTimesheet.authorizationValid === false &&
  reviewData.billable && (
    <textarea
      name="authorizationOverrideReason"
      value={reviewData.authorizationOverrideReason}
      onChange={handleChange}
      placeholder="Required authorization override reason"
      rows="3"
      className="w-full rounded-xl border border-red-300 px-4 py-3"
      required
    />
)}
              </label>


              <textarea
                name="notes"
                value={reviewData.notes}
                onChange={handleChange}
                placeholder="Reviewer notes"
                rows="3"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Timesheet Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function ComplianceCard({ label, ok }) {
  return (
    <div className={`rounded-xl p-4 ${ok ? "bg-green-50" : "bg-red-50"}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-bold ${ok ? "text-green-700" : "text-red-700"}`}>
        {ok ? "Yes" : "No"}
      </p>
    </div>
  )
}

function FlagBadge({ ok }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {ok ? "Yes" : "No"}
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "NEEDS_REVIEW") {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
        Needs Review
      </span>
    )
  }

  if (status === "APPROVED" || status === "PAID" || status === "BILLED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        {status}
      </span>
    )
  }

  if (status === "DENIED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Denied
      </span>
    )
  }

  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Pending
    </span>
  )
}

export default BillingPayrollPage