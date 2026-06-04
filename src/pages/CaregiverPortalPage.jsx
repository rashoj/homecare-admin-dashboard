import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  Clock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  User,
  CalendarDays,
} from "lucide-react"

import {
  getTodayCaregiverAssignment,
  clockIn,
  clockOut,
  getClockRecordByAppointment,
} from "../services/caregiverApi"

import {
  getUser,
  logout,
} from "../services/authStorage"

import { evvSettings } from "../data/settingsData"
import { calculateDistanceInFeet } from "../utils/gpsUtils"

import CaregiverMARPanel from "../components/caregiver/CaregiverMARPanel"
import CaregiverVisitNoteForm from "../components/caregiver/CaregiverVisitNoteForm"
import CaregiverServiceDocumentationForm from "../components/caregiver/CaregiverServiceDocumentationForm"
import CaregiverIncidentForm from "../components/caregiver/CaregiverIncidentForm"
import CaregiverAppointmentReferralForm from "../components/caregiver/CaregiverAppointmentReferralForm"
import CaregiverRescheduleRequestForm from "../components/caregiver/CaregiverRescheduleRequestForm"
import CaregiverMyRequestsDashboard from "../components/caregiver/CaregiverMyRequestsDashboard"

function CaregiverPortalPage() {
  const navigate = useNavigate()
const caregiverUser = getUser()
  const [assignmentData, setAssignmentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeClockRecord, setActiveClockRecord] = useState(null)
  const [status, setStatus] = useState("Not clocked in")
  const [location, setLocation] = useState(null)
  const [hasClockedOut, setHasClockedOut] = useState(false)
  const [actionMessage, setActionMessage] = useState("")

  useEffect(() => {
    async function loadAssignment() {
      if (!caregiverUser) {
        navigate("/caregiver-login")
        return
      }

      try {
        const data = await getTodayCaregiverAssignment(caregiverUser.id)

        setAssignmentData(data)

        const existingClockRecord = await getClockRecordByAppointment(data.appointmentId)

if (existingClockRecord) {
  setActiveClockRecord(existingClockRecord)

  if (existingClockRecord.clockOutTime) {
    setStatus("Clocked Out")
    setHasClockedOut(true)
  } else {
    setStatus("Clocked In")
    setHasClockedOut(false)
  }
}

        if (data?.status === "COMPLETED") {
          setStatus("Clocked Out")
          setHasClockedOut(true)
        } else if (data?.status === "IN_PROGRESS") {
          setStatus("Clocked In")
        }
      } catch {
        setAssignmentData(null)
      } finally {
        setLoading(false)
      }
    }

    loadAssignment()
  }, [caregiverUser, navigate])

  const todayAssignment = assignmentData
  const caregiver = assignmentData?.caregiver || caregiverUser
  const client = assignmentData?.client

  const caregiverName =
    caregiver?.fullName || caregiver?.name || caregiver?.email || "Caregiver"

  const clientName = client?.fullName || client?.name || "Client"

  const appointmentCompleted =
    hasClockedOut || todayAssignment?.status === "COMPLETED"

 function handleLogout() {
  logout()
  navigate("/caregiver-login")
}

  function getGPSLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS is not supported on this device."))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {
          reject(new Error("Unable to get GPS location."))
        }
      )
    })
  }

  async function handleClockIn() {
    if (!todayAssignment || !caregiver || !client) {
      setActionMessage("No scheduled visit found for today.")
      return
    }

    try {
      setActionMessage("Getting GPS location...")

      const gps = await getGPSLocation()

      const distanceFeet = calculateDistanceInFeet(
        gps.latitude,
        gps.longitude,
        client.latitude,
        client.longitude
      )

      if (distanceFeet > evvSettings.allowedClockInDistanceFeet) {
        setActionMessage(
          `Clock-in denied. You are ${Math.round(
            distanceFeet
          )} feet away from the client location.`
        )
        return
      }

      const response = await clockIn({
  appointmentId: todayAssignment.appointmentId,
  latitude: gps.latitude,
  longitude: gps.longitude,
  notes: "",
  actorUserId: caregiver.id,
})

      setActiveClockRecord(response)
      setLocation(gps)
      setStatus("Clocked In")
      setHasClockedOut(false)
      setActionMessage("Clock-in successful. GPS verified.")
    } catch (error) {
      setActionMessage(error.message || "Clock-in failed.")
    }
  }

  async function handleClockOut() {
    if (!todayAssignment) {
      setActionMessage("No scheduled visit found.")
      return
    }

    try {
      setActionMessage("Getting GPS location...")

      const gps = await getGPSLocation()

      await clockOut({
  appointmentId: todayAssignment.appointmentId,
  latitude: gps.latitude,
  longitude: gps.longitude,
  notes: "",
  actorUserId: caregiver.id,
})

      setActiveClockRecord(null)
      setLocation(gps)
      setStatus("Clocked Out")
      setHasClockedOut(true)
      setActionMessage("Clock-out successful. Visit completed.")

      setAssignmentData((prev) =>
        prev ? { ...prev, status: "COMPLETED" } : prev
      )
    } catch (error) {
      setActionMessage(error.message || "Clock-out failed.")
    }
  }


  if (loading) {
    return (
      <PageShell>
       
        <MobileCard>
          <h1 className="text-2xl font-black text-slate-900">
            Caregiver Portal
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Loading today&apos;s shift...
          </p>
        </MobileCard>
      </PageShell>
    )
  }

  if (!todayAssignment || !client) {
    return (
      <PageShell>
        <MobileCard>
          <Header
            caregiverName={caregiverName}
            handleLogout={handleLogout}
          />

          <div className="mt-6 rounded-2xl bg-blue-50 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <CalendarDays size={26} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No visit scheduled today
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              You are logged in successfully. There is no assigned client visit
              for today. Please check back later or contact your scheduler.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">Caregiver</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {caregiverName}
            </p>
          </div>
        </MobileCard>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <MobileCard>
          <Header caregiverName={caregiverName} handleLogout={handleLogout} />

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-100">
                  Today&apos;s Visit
                </p>
                <h2 className="mt-1 text-2xl font-black">{clientName}</h2>
              </div>

              <StatusBadge status={status} />
            </div>

            <div className="mt-5 space-y-3">
              <InfoLine icon={<User size={18} />} text={caregiverName} />
              <InfoLine icon={<MapPin size={18} />} text={client.address} />
              <InfoLine
                icon={<Clock size={18} />}
                text={`Allowed radius: ${evvSettings.allowedClockInDistanceFeet} feet`}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Current Status
            </p>

            <p className="mt-2 text-xl font-black text-slate-900">{status}</p>

            {location && (
              <div className="mt-4 rounded-xl bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <p className="text-sm font-bold text-green-700">
                    GPS verified successfully
                  </p>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Location captured at {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}

            {actionMessage && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">
                  {actionMessage}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleClockIn}
              disabled={
                !!activeClockRecord || todayAssignment.status === "COMPLETED"
              }
              className="rounded-2xl bg-green-600 px-4 py-4 font-bold text-white shadow disabled:bg-slate-300"
            >
              Clock In
            </button>

            <button
              onClick={handleClockOut}
              disabled={!activeClockRecord}
              className="rounded-2xl bg-red-600 px-4 py-4 font-bold text-white shadow disabled:bg-slate-300"
            >
              Clock Out
            </button>
          </div>
        </MobileCard>
        <WorkflowBlock title="My Requests">
  <CaregiverMyRequestsDashboard caregiver={caregiver} />
</WorkflowBlock>

        <WorkflowBlock title="Appointment Referral">
          <CaregiverAppointmentReferralForm
            caregiver={caregiver}
            client={client}
          />
        </WorkflowBlock>

        <WorkflowBlock title="Request Reschedule">
  <CaregiverRescheduleRequestForm
    appointmentId={todayAssignment.appointmentId}
    caregiver={caregiver}
  />
</WorkflowBlock>

        <WorkflowBlock title="Medication Pass">
          <CaregiverMARPanel clientId={client.id} caregiverId={caregiver.id} />
        </WorkflowBlock>

        <WorkflowBlock title="Visit Note">
          <CaregiverVisitNoteForm
            appointmentId={todayAssignment.appointmentId}
            canSubmit={appointmentCompleted}
          />
        </WorkflowBlock>

        <WorkflowBlock title="Service Documentation">
          <CaregiverServiceDocumentationForm
            appointmentId={todayAssignment.appointmentId}
            caregiver={caregiver}
            canSubmit={appointmentCompleted}
          />
        </WorkflowBlock>

        <WorkflowBlock title="Incident Report">
          <CaregiverIncidentForm
            appointmentId={todayAssignment.appointmentId}
            client={client}
            caregiver={caregiver}
          />
        </WorkflowBlock>
      </div>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4">
      {children}
    </div>
  )
}

function MobileCard({ children }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white bg-white p-5 shadow-xl">
      {children}
    </div>
  )
}

function Header({ caregiverName, handleLogout }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Caregiver Portal
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome, {caregiverName}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  )
}

function InfoLine({ icon, text }) {
  return (
    <div className="flex items-start gap-3 text-sm text-blue-50">
      <span className="mt-0.5">{icon}</span>
      <span>{text || "—"}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const isClockedIn = status === "Clocked In"
  const isClockedOut = status === "Clocked Out"

  let style = "bg-slate-100 text-slate-700"
  let icon = <AlertTriangle size={14} />

  if (isClockedIn) {
    style = "bg-green-100 text-green-700"
    icon = <CheckCircle2 size={14} />
  }

  if (isClockedOut) {
    style = "bg-blue-100 text-blue-700"
    icon = <CheckCircle2 size={14} />
  }

  return (
    <span
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${style}`}
    >
      {icon}
      {status}
    </span>
  )
}

function WorkflowBlock({ title, children }) {
  return (
    <div className="mt-5 rounded-3xl border border-white bg-white p-4 shadow-xl">
      <h2 className="mb-4 text-xl font-black text-slate-900">{title}</h2>
      {children}
    </div>
  )
}

export default CaregiverPortalPage