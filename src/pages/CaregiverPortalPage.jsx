import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getTodayCaregiverAssignment,
  clockIn,
  clockOut,
} from "../services/caregiverApi"
import {
  getCaregiverUser,
  clearCaregiverAuth,
} from "../services/caregiverAuthStorage"
import { evvSettings } from "../data/settingsData"
import { calculateDistanceInFeet } from "../utils/gpsUtils"
import CaregiverMARPanel from "../components/caregiver/CaregiverMARPanel"
import CaregiverVisitNoteForm from "../components/caregiver/CaregiverVisitNoteForm"
import CaregiverServiceDocumentationForm from "../components/caregiver/CaregiverServiceDocumentationForm"
import CaregiverIncidentForm from "../components/caregiver/CaregiverIncidentForm"

function CaregiverPortalPage() {
  const navigate = useNavigate()
  const caregiverUser = getCaregiverUser()

  const [assignmentData, setAssignmentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [activeClockRecord, setActiveClockRecord] = useState(null)
  const [status, setStatus] = useState("Not clocked in")
  const [location, setLocation] = useState(null)
  const [hasClockedOut, setHasClockedOut] = useState(false)

  useEffect(() => {
    async function loadAssignment() {
      if (!caregiverUser) {
        navigate("/caregiver-login")
        return
      }

      try {
        const data = await getTodayCaregiverAssignment(caregiverUser.id)

        setAssignmentData(data)

        if (data?.status === "COMPLETED") {
          setStatus("Clocked Out")
          setHasClockedOut(true)
        } else if (data?.status === "IN_PROGRESS") {
          setStatus("Clocked In")
        }
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAssignment()
  }, [caregiverUser, navigate])

  const todayAssignment = assignmentData
  const caregiver = assignmentData?.caregiver || caregiverUser
  const client = assignmentData?.client

  const handleLogout = () => {
    clearCaregiverAuth()
    navigate("/caregiver-login")
  }

  const getGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("GPS is not supported on this device.")
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
          reject("Unable to get GPS location.")
        }
      )
    })
  }

  const handleClockIn = async () => {
    if (!todayAssignment || !caregiver || !client) {
      setStatus("No scheduled visit found for today.")
      return
    }

    try {
      setStatus("Getting GPS location...")

      const gps = await getGPSLocation()

      const distanceFeet = calculateDistanceInFeet(
        gps.latitude,
        gps.longitude,
        client.latitude,
        client.longitude
      )

      if (distanceFeet > evvSettings.allowedClockInDistanceFeet) {
        setStatus(
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
      })

      setActiveClockRecord(response)
      setLocation(gps)
      setStatus("Clocked In")
      setHasClockedOut(false)
    } catch (error) {
      setStatus(error.message)
    }
  }

  const handleClockOut = async () => {
    if (!todayAssignment) {
      setStatus("No scheduled visit found.")
      return
    }

    try {
      setStatus("Getting GPS location...")

      const gps = await getGPSLocation()

      await clockOut({
        appointmentId: todayAssignment.appointmentId,
        latitude: gps.latitude,
        longitude: gps.longitude,
        notes: "",
      })

      setActiveClockRecord(null)
      setLocation(gps)
      setStatus("Clocked Out")
      setHasClockedOut(true)

      setAssignmentData((prev) =>
        prev ? { ...prev, status: "COMPLETED" } : prev
      )
    } catch (error) {
      setStatus(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            Caregiver Portal
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Loading today&apos;s visit...
          </p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Caregiver Portal
            </h1>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>

          <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        </div>
      </div>
    )
  }

  if (!todayAssignment || !caregiver || !client) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Caregiver Portal
            </h1>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>

          <p className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm font-medium text-yellow-700">
            No scheduled visit found for today.
          </p>
        </div>
      </div>
    )
  }

  const caregiverName =
    caregiver.fullName || caregiver.name || caregiver.email || "Caregiver"

  const clientName = client.fullName || client.name || "Client"

  const appointmentCompleted =
    hasClockedOut || todayAssignment.status === "COMPLETED"

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Caregiver Portal
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Clock in and out for today&apos;s visit.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-gray-500">Caregiver</p>
            <p className="font-semibold text-gray-900">{caregiverName}</p>

            <p className="mt-3 text-sm text-gray-500">Client</p>
            <p className="font-semibold text-gray-900">{clientName}</p>

            <p className="mt-3 text-sm text-gray-500">Client Address</p>
            <p className="font-semibold text-gray-900">{client.address}</p>

            <p className="mt-3 text-sm text-gray-500">
              Allowed Clock-In Radius
            </p>
            <p className="font-semibold text-gray-900">
              {evvSettings.allowedClockInDistanceFeet} feet
            </p>
          </div>

          <div className="mt-5 rounded-xl border p-4">
            <p className="text-sm text-gray-500">Current Status</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{status}</p>

            {location && (
              <div className="mt-3 rounded-lg bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>

                  <p className="text-sm font-semibold text-green-700">
                    GPS Verified Successfully
                  </p>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Location captured at {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClockIn}
              disabled={
                !!activeClockRecord || todayAssignment.status === "COMPLETED"
              }
              className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300"
            >
              Clock In
            </button>

            <button
              onClick={handleClockOut}
              disabled={!activeClockRecord}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300"
            >
              Clock Out
            </button>
          </div>
        </div>

<CaregiverMARPanel
  clientId={client.id}
  caregiverId={caregiver.id}
/>
        <CaregiverVisitNoteForm
          appointmentId={todayAssignment.appointmentId}
          canSubmit={appointmentCompleted}
        />

        <CaregiverServiceDocumentationForm
          appointmentId={todayAssignment.appointmentId}
          caregiver={caregiver}
          canSubmit={appointmentCompleted}
        />

        <CaregiverIncidentForm
          appointmentId={todayAssignment.appointmentId}
          client={client}
          caregiver={caregiver}
        />
      </div>
    </div>
  )
}

export default CaregiverPortalPage