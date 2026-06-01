import { useState } from "react"
import { getCaregiverToken } from "../../services/caregiverAuthStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function CaregiverAppointmentReferralForm({ caregiver, client }) {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    referralSource: "HOSPITAL",
    hospitalName: "",
    dischargePlannerName: "",
    dischargePlannerPhone: "",
    requestedStartTime: "",
    requestedEndTime: "",
    serviceType: "PERSONAL_CARE",
    notes: "",
  })

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!caregiver?.id) {
      setMessage("Caregiver user was not found. Please log in again.")
      return false
    }

    if (!client?.id) {
      setMessage("Client was not found for this referral.")
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

    return true
  }

  async function submitReferral(e) {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      setMessage("")

const token = getCaregiverToken()

      const response = await fetch(`${API_BASE_URL}/appointment-referrals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: client.id,
          caregiverId: caregiver.id,
          clientFullName: client.fullName || client.name,
          clientPhone: client.phoneNumber || client.phone,
          clientEmail: client.email,
          clientAddress: client.address,
          referralSource: formData.referralSource,
          hospitalName: formData.hospitalName,
          dischargePlannerName: formData.dischargePlannerName,
          dischargePlannerPhone: formData.dischargePlannerPhone,
          requestedStartTime: formData.requestedStartTime,
          requestedEndTime: formData.requestedEndTime,
          serviceType: formData.serviceType,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit referral.")
      }

      setMessage("Appointment referral submitted successfully for admin review.")

      setFormData({
        referralSource: "HOSPITAL",
        hospitalName: "",
        dischargePlannerName: "",
        dischargePlannerPhone: "",
        requestedStartTime: "",
        requestedEndTime: "",
        serviceType: "PERSONAL_CARE",
        notes: "",
      })
    } catch (error) {
      setMessage(error.message || "Unable to submit appointment referral.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitReferral} className="space-y-4">
      <div className="rounded-2xl bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-700">Client</p>
        <p className="mt-1 text-lg font-black text-slate-900">
          {client?.fullName || client?.name || "Assigned Client"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {client?.address || "No address available"}
        </p>
      </div>

      <select
        name="referralSource"
        value={formData.referralSource}
        onChange={handleChange}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="HOSPITAL">Hospital</option>
        <option value="FAMILY">Family</option>
        <option value="SELF_REFERRAL">Self Referral</option>
        <option value="SOCIAL_WORKER">Social Worker</option>
        <option value="REHAB_CENTER">Rehab Center</option>
      </select>

      <input
        name="hospitalName"
        value={formData.hospitalName}
        onChange={handleChange}
        placeholder="Hospital / facility name"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        name="dischargePlannerName"
        value={formData.dischargePlannerName}
        onChange={handleChange}
        placeholder="Discharge planner / contact name"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        name="dischargePlannerPhone"
        value={formData.dischargePlannerPhone}
        onChange={handleChange}
        placeholder="Discharge planner phone"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <select
        name="serviceType"
        value={formData.serviceType}
        onChange={handleChange}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="PERSONAL_CARE">Personal Care</option>
        <option value="COMPANION">Companion Care</option>
        <option value="MEDICATION_REMINDER">Medication Reminder</option>
        <option value="TRANSPORTATION">Transportation</option>
        <option value="ADL_ASSISTANCE">ADL Assistance</option>
        <option value="BEHAVIORAL_SUPPORT">Behavioral Support</option>
      </select>

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
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Referral notes, discharge details, service need..."
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
        className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:bg-blue-300"
      >
        {submitting ? "Submitting..." : "Submit Appointment Referral"}
      </button>
    </form>
  )
}

export default CaregiverAppointmentReferralForm