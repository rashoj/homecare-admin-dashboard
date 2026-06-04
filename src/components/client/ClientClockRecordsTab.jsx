import { useEffect, useState } from "react"
import {
  getClientClockRecords,
  adminAdjustClockRecord,
} from "../../services/clientApi"

function ClientClockRecordsTab({ clientId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [editingRecord, setEditingRecord] = useState(null)

  const [adjustmentData, setAdjustmentData] = useState({
    clockInTime: "",
    clockOutTime: "",
    adjustmentReason: "",
  })

  useEffect(() => {
    loadClockRecords()
  }, [clientId])

  async function loadClockRecords() {
    try {
      setLoading(true)
      setErrorMessage("")

      const data = await getClientClockRecords(clientId)
      setRecords(data)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openEdit(record) {
    setEditingRecord(record)

    setAdjustmentData({
      clockInTime: toDateTimeLocal(record.clockInTime),
      clockOutTime: toDateTimeLocal(record.clockOutTime),
      adjustmentReason: "",
    })
  }

  function closeEdit() {
    setEditingRecord(null)

    setAdjustmentData({
      clockInTime: "",
      clockOutTime: "",
      adjustmentReason: "",
    })
  }

  function handleAdjustmentChange(e) {
    setAdjustmentData({
      ...adjustmentData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSaveAdjustment(e) {
    e.preventDefault()

    try {
      const savedUser = localStorage.getItem("homecare_user")
      const currentUser = savedUser ? JSON.parse(savedUser) : null

      await adminAdjustClockRecord(editingRecord.id, {
        clockInTime: adjustmentData.clockInTime,
        clockOutTime: adjustmentData.clockOutTime,
        adjustmentReason: adjustmentData.adjustmentReason,
        actorUserId: currentUser?.id,
      })

      closeEdit()
      await loadClockRecords()

      alert("Clock record adjusted successfully.")
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading clock records...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Clock Records</h2>

      {records.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No clock records found for this client.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Caregiver</th>
                <th className="py-3">Clock In</th>
                <th className="py-3">Clock Out</th>
                <th className="py-3">Hours</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b last:border-0">
                  <td className="py-4 font-medium text-gray-900">
                    {record.caregiverName}
                  </td>

                  <td className="py-4 text-gray-700">
                    {record.clockInTime
                      ? new Date(record.clockInTime).toLocaleString()
                      : "—"}
                  </td>

                  <td className="py-4 text-gray-700">
                    {record.clockOutTime
                      ? new Date(record.clockOutTime).toLocaleString()
                      : "—"}
                  </td>

                  <td className="py-4 text-gray-700">
                    {record.totalHours
                      ? Number(record.totalHours).toFixed(2)
                      : "—"}
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {record.status === "CLOCKED_OUT"
                        ? "Completed"
                        : record.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <button
                      onClick={() => openEdit(record)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Edit Time
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Adjust Clock Record
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Updating this will also update billing/payroll hours.
                </p>
              </div>

              <button
                onClick={closeEdit}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Clock In Time
                </label>

                <input
                  type="datetime-local"
                  name="clockInTime"
                  value={adjustmentData.clockInTime}
                  onChange={handleAdjustmentChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Clock Out Time
                </label>

                <input
                  type="datetime-local"
                  name="clockOutTime"
                  value={adjustmentData.clockOutTime}
                  onChange={handleAdjustmentChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <textarea
                name="adjustmentReason"
                value={adjustmentData.adjustmentReason}
                onChange={handleAdjustmentChange}
                placeholder="Required reason for adjustment"
                rows="3"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Clock Adjustment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function toDateTimeLocal(value) {
  if (!value) return ""

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)

  return localDate.toISOString().slice(0, 16)
}

export default ClientClockRecordsTab