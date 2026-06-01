import { useState } from "react"
import { getCaregiverToken } from "../../services/caregiverAuthStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function CaregiverRescheduleRequestForm({ appointmentId, caregiver }) {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    requestedStartTime: "",
    requestedEndTime: "",
    reason: "",
  })

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!appointmentId) {
      setMessage("Appointment was not found.")
      return false
    }

    if (!caregiver?.id) {
      setMessage("Caregiver user was not found. Please log in again.")
      return false
    }

    if (!formData.requestedStartTime || !formData.requestedEndTime) {
      setMessage("Requested start and end time are required.")
      return false
    }

    if (
      new Date(formData.requestedEndTime) <=
      new Date(formData.requestedStartTime)
    ) {
      setMessage("End time must be after start time.")
      return false
    }

    if (!formData.reason.trim()) {
      setMessage("Please enter a reason for reschedule request.")
      return false
    }

    return true
  }

  async function submitRequest(e) {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      setMessage("")

      const token = getCaregiverToken()

      const response = await fetch(
        `${API_BASE_URL}/appointment-reschedule-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointmentId,
            requestedByUserId: caregiver.id,
            requestedStartTime: formData.requestedStartTime,
            requestedEndTime: formData.requestedEndTime,
            reason: formData.reason.trim(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Failed to submit reschedule request."
        )
      }

      setMessage("Reschedule request submitted for admin review.")

      setFormData({
        requestedStartTime: "",
        requestedEndTime: "",
        reason: "",
      })
    } catch (error) {
      setMessage(error.message || "Unable to submit reschedule request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitRequest} className="space-y-4">
      <div className="rounded-2xl bg-purple-50 p-4">
        <p className="text-sm font-bold text-purple-700">
          Current Appointment
        </p>
        <p className="mt-1 text-lg font-black text-slate-900">
          Appointment #{appointmentId}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Submit a proposed new time. Admin approval is required.
        </p>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">
          Requested Start
        </label>
        <input
          type="datetime-local"
          name="requestedStartTime"
          value={formData.requestedStartTime}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">
          Requested End
        </label>
        <input
          type="datetime-local"
          name="requestedEndTime"
          value={formData.requestedEndTime}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <textarea
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        placeholder="Reason for reschedule request..."
        className="h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      {message && (
        <div className="rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-purple-600 py-3 font-bold text-white disabled:bg-purple-300"
      >
        {submitting ? "Submitting..." : "Submit Reschedule Request"}
      </button>
    </form>
  )
}

export default CaregiverRescheduleRequestForm