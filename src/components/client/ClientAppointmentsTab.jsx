import { useEffect, useState } from "react"
import { getClientAppointments } from "../../services/clientApi"
import { getToken, getUser } from "../../services/authStorage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function ClientAppointmentsTab({ clientId }) {
  const [appointments, setAppointments] = useState([])
  const [referrals, setReferrals] = useState([])
  const [rescheduleRequests, setRescheduleRequests] = useState([])

  const [notesByReferral, setNotesByReferral] = useState({})
  const [notesByReschedule, setNotesByReschedule] = useState({})

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [actionId, setActionId] = useState(null)

  useEffect(() => {
    loadClientAppointmentData()
  }, [clientId])

  async function loadClientAppointmentData() {
    try {
      setLoading(true)
      setErrorMessage("")

      const [appointmentData, referralData, rescheduleData] =
        await Promise.all([
          getClientAppointments(clientId),
          getClientReferrals(clientId),
          getClientRescheduleRequests(clientId),
        ])

      setAppointments(appointmentData || [])
      setReferrals(referralData || [])
      setRescheduleRequests(rescheduleData || [])

      const referralNotes = {}
      ;(referralData || []).forEach((referral) => {
        referralNotes[referral.id] = referral.adminNotes || ""
      })
      setNotesByReferral(referralNotes)

      const rescheduleNotes = {}
      ;(rescheduleData || []).forEach((request) => {
        rescheduleNotes[request.id] = request.adminNotes || ""
      })
      setNotesByReschedule(rescheduleNotes)
    } catch (error) {
      setErrorMessage(error.message || "Failed to load client appointments.")
    } finally {
      setLoading(false)
    }
  }

  async function getClientReferrals(id) {
    const token = getToken()

    const response = await fetch(
      `${API_BASE_URL}/appointment-referrals/client/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to load client appointment referrals.")
    }

    return response.json()
  }

  async function getClientRescheduleRequests(id) {
    const token = getToken()

    const response = await fetch(
      `${API_BASE_URL}/appointment-reschedule-requests/client/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to load appointment reschedule requests.")
    }

    return response.json()
  }

  function requireAdminUser() {
    const user = getUser()

    if (!user?.id) {
      alert("Logged-in admin user was not found. Please log in again.")
      return null
    }

    return user
  }

  async function reviewReferral(referral, status) {
    const user = requireAdminUser()
    if (!user) return

    try {
      setActionId(`REFERRAL-${referral.id}-${status}`)

      const token = getToken()

      const response = await fetch(
        `${API_BASE_URL}/appointment-referrals/${referral.id}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            adminNotes:
              notesByReferral[referral.id] ||
              referral.adminNotes ||
              `Referral marked as ${formatLabel(status)}.`,
            reviewedByUserId: user.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to review referral.")
      }

      await loadClientAppointmentData()
    } catch (error) {
      alert(error.message || "Unable to review referral.")
    } finally {
      setActionId(null)
    }
  }

  async function convertReferral(referral) {
    const user = requireAdminUser()
    if (!user) return

    if (!referral.clientId) {
      alert("Referral must be linked to an existing client before conversion.")
      return
    }

    if (!referral.caregiverId) {
      alert("Referral must have a caregiver before conversion.")
      return
    }

    if (!referral.requestedStartTime || !referral.requestedEndTime) {
      alert("Referral must have requested start and end time.")
      return
    }

    if (!referral.serviceType) {
      alert("Referral must have a service type before conversion.")
      return
    }

    try {
      setActionId(`REFERRAL-${referral.id}-CONVERT`)

      const token = getToken()

      const response = await fetch(
        `${API_BASE_URL}/appointment-referrals/${referral.id}/convert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clientId: referral.clientId,
            caregiverId: referral.caregiverId,
            convertedByUserId: user.id,
            serviceType: referral.serviceType,
            notes:
              notesByReferral[referral.id] ||
              referral.adminNotes ||
              referral.notes ||
              "Approved and converted from appointment referral.",
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to convert referral.")
      }

      await loadClientAppointmentData()
    } catch (error) {
      alert(error.message || "Unable to convert referral.")
    } finally {
      setActionId(null)
    }
  }

  async function reviewReschedule(request, status) {
    const user = requireAdminUser()
    if (!user) return

    try {
      setActionId(`RESCHEDULE-${request.id}-${status}`)

      const token = getToken()

      const response = await fetch(
        `${API_BASE_URL}/appointment-reschedule-requests/${request.id}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            adminNotes:
              notesByReschedule[request.id] ||
              request.adminNotes ||
              `Reschedule request marked as ${formatLabel(status)}.`,
            reviewedByUserId: user.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Failed to review reschedule request."
        )
      }

      await loadClientAppointmentData()
    } catch (error) {
      alert(error.message || "Unable to review reschedule request.")
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading client appointment data...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Scheduled Appointments
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Official appointments linked to this client.
            </p>
          </div>

          <button
            onClick={loadClientAppointmentData}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        {appointments.length === 0 ? (
          <EmptyState message="No appointments found for this client." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b text-gray-500">
                  <th className="p-4">Caregiver</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Shift</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4">EVV</th>
                  <th className="p-4">Billable</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Completed</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {appointment.caregiverName || "Not assigned"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {formatLabel(appointment.serviceType)}
                    </td>

                    <td className="p-4 text-gray-700">
                      {formatLabel(appointment.shiftType)}
                    </td>

                    <td className="p-4 text-gray-700">
                      {formatDate(appointment.startTime)}
                    </td>

                    <td className="p-4 text-gray-700">
                      {formatDate(appointment.endTime)}
                    </td>

                    <td className="p-4 text-gray-700">
                      {appointment.evvRequired ? "Yes" : "No"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {appointment.billable ? "Yes" : "No"}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={appointment.status} />
                    </td>

                    <td className="p-4 text-gray-700">
                      {appointment.completed ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Reschedule Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review proposed appointment time changes for this client.
          </p>
        </div>

        {rescheduleRequests.length === 0 ? (
          <EmptyState message="No reschedule requests found for this client." />
        ) : (
          <div className="grid gap-4">
            {rescheduleRequests.map((request) => {
              const approved = request.status === "APPROVED"
              const rejected = request.status === "REJECTED"

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Appointment #{request.appointmentId}
                        </h3>

                        <RequestStatusBadge status={request.status} />
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Requested by {request.requestedByName || "Unknown user"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Info
                      label="Original Start"
                      value={formatDate(request.originalStartTime)}
                    />
                    <Info
                      label="Original End"
                      value={formatDate(request.originalEndTime)}
                    />
                    <Info
                      label="Requested Start"
                      value={formatDate(request.requestedStartTime)}
                    />
                    <Info
                      label="Requested End"
                      value={formatDate(request.requestedEndTime)}
                    />
                    <Info label="Caregiver" value={request.caregiverName} />
                    <Info label="Client" value={request.clientName} />
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-4 text-sm text-gray-700">
                    <p className="font-bold text-gray-900">Reason</p>
                    <p className="mt-1">{request.reason || "No reason provided."}</p>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-bold text-gray-700">
                      Admin Notes
                    </label>
                    <textarea
                      value={notesByReschedule[request.id] || ""}
                      onChange={(e) =>
                        setNotesByReschedule((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      disabled={approved || rejected}
                      placeholder="Add review notes before approving or rejecting..."
                      className="mt-2 h-24 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {request.reviewedByName || request.reviewedAt ? (
                    <div className="mt-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                      <p className="font-bold">Review Info</p>
                      <p className="mt-1">
                        Reviewed by: {request.reviewedByName || "—"}
                      </p>
                      <p className="mt-1">
                        Reviewed at: {formatDate(request.reviewedAt)}
                      </p>
                    </div>
                  ) : null}

                  {!approved && !rejected ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <button
                        onClick={() =>
                          reviewReschedule(request, "UNDER_REVIEW")
                        }
                        disabled={!!actionId}
                        className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:bg-purple-300"
                      >
                        {actionId ===
                        `RESCHEDULE-${request.id}-UNDER_REVIEW`
                          ? "Saving..."
                          : "Mark Under Review"}
                      </button>

                      <button
                        onClick={() => reviewReschedule(request, "REJECTED")}
                        disabled={!!actionId}
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-red-300"
                      >
                        {actionId === `RESCHEDULE-${request.id}-REJECTED`
                          ? "Rejecting..."
                          : "Reject"}
                      </button>

                      <button
                        onClick={() => reviewReschedule(request, "APPROVED")}
                        disabled={!!actionId}
                        className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:bg-green-300"
                      >
                        {actionId === `RESCHEDULE-${request.id}-APPROVED`
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Appointment Referrals / Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review caregiver or hospital referral requests connected to this
            client.
          </p>
        </div>

        {referrals.length === 0 ? (
          <EmptyState message="No appointment referrals found for this client." />
        ) : (
          <div className="grid gap-4">
            {referrals.map((referral) => {
              const converted = referral.status === "CONVERTED"
              const rejected = referral.status === "REJECTED"

              return (
                <div
                  key={referral.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {referral.hospitalName ||
                            referral.referralSource ||
                            "Referral"}
                        </h3>

                        <ReferralStatusBadge status={referral.status} />
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Submitted by{" "}
                        {referral.caregiverName || "Unknown caregiver"}
                      </p>
                    </div>

                    {referral.convertedAppointmentId ? (
                      <div className="rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                        Appointment #{referral.convertedAppointmentId}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Info
                      label="Start"
                      value={formatDate(referral.requestedStartTime)}
                    />
                    <Info
                      label="End"
                      value={formatDate(referral.requestedEndTime)}
                    />
                    <Info
                      label="Service"
                      value={formatLabel(referral.serviceType)}
                    />
                    <Info
                      label="Planner"
                      value={referral.dischargePlannerName || "—"}
                    />
                    <Info
                      label="Planner Phone"
                      value={referral.dischargePlannerPhone || "—"}
                    />
                    <Info
                      label="Referral Source"
                      value={formatLabel(referral.referralSource)}
                    />
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-4 text-sm text-gray-700">
                    <p className="font-bold text-gray-900">Referral Notes</p>
                    <p className="mt-1">
                      {referral.notes || "No notes provided."}
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-bold text-gray-700">
                      Admin Notes
                    </label>
                    <textarea
                      value={notesByReferral[referral.id] || ""}
                      onChange={(e) =>
                        setNotesByReferral((prev) => ({
                          ...prev,
                          [referral.id]: e.target.value,
                        }))
                      }
                      disabled={converted}
                      placeholder="Add review notes before marking under review, rejecting, or converting..."
                      className="mt-2 h-24 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {referral.reviewedByName || referral.reviewedAt ? (
                    <div className="mt-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                      <p className="font-bold">Review Info</p>
                      <p className="mt-1">
                        Reviewed by: {referral.reviewedByName || "—"}
                      </p>
                      <p className="mt-1">
                        Reviewed at: {formatDate(referral.reviewedAt)}
                      </p>
                    </div>
                  ) : null}

                  {!converted && !rejected ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <button
                        onClick={() => reviewReferral(referral, "UNDER_REVIEW")}
                        disabled={!!actionId}
                        className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:bg-purple-300"
                      >
                        {actionId ===
                        `REFERRAL-${referral.id}-UNDER_REVIEW`
                          ? "Saving..."
                          : "Mark Under Review"}
                      </button>

                      <button
                        onClick={() => reviewReferral(referral, "REJECTED")}
                        disabled={!!actionId}
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-red-300"
                      >
                        {actionId === `REFERRAL-${referral.id}-REJECTED`
                          ? "Rejecting..."
                          : "Reject"}
                      </button>

                      <button
                        onClick={() => convertReferral(referral)}
                        disabled={!!actionId}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
                      >
                        {actionId === `REFERRAL-${referral.id}-CONVERT`
                          ? "Converting..."
                          : "Convert"}
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-medium text-gray-500">
      {message}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value || "—"}</p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function formatLabel(value) {
  if (!value) return "—"

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatusBadge({ status }) {
  const baseClass = "rounded-full px-3 py-1 text-xs font-semibold"

  if (status === "COMPLETED") {
    return (
      <span className={`${baseClass} bg-green-100 text-green-700`}>
        Completed
      </span>
    )
  }

  if (status === "MISSED" || status === "CANCELLED") {
    return (
      <span className={`${baseClass} bg-red-100 text-red-700`}>
        {formatLabel(status)}
      </span>
    )
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className={`${baseClass} bg-blue-100 text-blue-700`}>
        In Progress
      </span>
    )
  }

  return (
    <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
      Scheduled
    </span>
  )
}

function RequestStatusBadge({ status }) {
  const baseClass = "rounded-full px-3 py-1 text-xs font-bold"

  if (status === "APPROVED") {
    return (
      <span className={`${baseClass} bg-green-100 text-green-700`}>
        Approved
      </span>
    )
  }

  if (status === "REJECTED") {
    return (
      <span className={`${baseClass} bg-red-100 text-red-700`}>
        Rejected
      </span>
    )
  }

  if (status === "UNDER_REVIEW") {
    return (
      <span className={`${baseClass} bg-purple-100 text-purple-700`}>
        Under Review
      </span>
    )
  }

  return (
    <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
      Submitted
    </span>
  )
}

function ReferralStatusBadge({ status }) {
  return <RequestStatusBadge status={status} />
}

export default ClientAppointmentsTab