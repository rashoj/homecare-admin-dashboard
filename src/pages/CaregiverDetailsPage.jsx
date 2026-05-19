import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import {
  UserRound,
  Calendar,
  Clock3,
  FileText,
  ClipboardCheck,
  Mail,
  Phone
} from "lucide-react"

import {
  getCaregiverById,
  getCaregiverAppointments,
  getCaregiverVisitNotes,
  getCaregiverDocuments,
  getCaregiverClockRecords
} from "../services/caregiverDetailsService"

function CaregiverDetailsPage() {
  const { id } = useParams()

  const [caregiver, setCaregiver] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [visitNotes, setVisitNotes] = useState([])
  const [documents, setDocuments] = useState([])
  const [clockRecords, setClockRecords] = useState([])

  useEffect(() => {
    loadCaregiverData()
  }, [])

  const loadCaregiverData = async () => {
    try {
      const caregiverData = await getCaregiverById(id)
      const appointmentData = await getCaregiverAppointments(id)
      const visitNoteData = await getCaregiverVisitNotes(id)
      const documentData = await getCaregiverDocuments(id)
      const allClockRecords = await getCaregiverClockRecords()

      setCaregiver(caregiverData)
      setAppointments(appointmentData)
      setVisitNotes(visitNoteData)
      setDocuments(documentData)

      setClockRecords(
        allClockRecords.filter(
          (record) => String(record.caregiverName) === String(caregiverData.fullName)
        )
      )
    } catch (error) {
      console.error(error)
      alert("Failed to load caregiver details")
    }
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Caregiver Details...
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center">
            <UserRound size={42} className="text-blue-700" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              {caregiver.fullName}
            </h1>

            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
                {caregiver.role}
              </span>

              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                Active
              </span>
            </div>

            <div className="mt-4 text-slate-500 space-y-2">
              <p className="flex items-center gap-2">
                <Mail size={16} />
                {caregiver.email}
              </p>

              <p className="flex items-center gap-2">
                <Phone size={16} />
                {caregiver.phoneNumber || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Calendar size={22} className="text-white" />}
          title="Appointments"
          value={appointments.length}
          color="bg-blue-600"
        />

        <StatCard
          icon={<ClipboardCheck size={22} className="text-white" />}
          title="Visit Notes"
          value={visitNotes.length}
          color="bg-green-600"
        />

        <StatCard
          icon={<Clock3 size={22} className="text-white" />}
          title="Clock Records"
          value={clockRecords.length}
          color="bg-cyan-600"
        />

        <StatCard
          icon={<FileText size={22} className="text-white" />}
          title="Documents"
          value={documents.length}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">Assigned Appointments</h3>

          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {appointment.clientName}
                      </h4>

                      <p className="text-slate-500 text-sm mt-1">
                        {appointment.notes || "No notes"}
                      </p>
                    </div>

                    <span
                      className={`h-fit px-3 py-1 rounded-full text-sm ${
                        appointment.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.completed ? "Completed" : "Scheduled"}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm mt-3">
                    {appointment.startTime
                      ? new Date(appointment.startTime).toLocaleString()
                      : "-"}
                    {" - "}
                    {appointment.endTime
                      ? new Date(appointment.endTime).toLocaleString()
                      : "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No appointments found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">Documents & Certifications</h3>

          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map((document) => (
                <div
                  key={document.id}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {document.documentName}
                      </h4>

                      <p className="text-slate-500 text-sm mt-1">
                        {document.documentType}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        document.approvalStatus === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : document.approvalStatus === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {document.approvalStatus}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm mt-3">
                    Expiration: {document.expirationDate || "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No documents found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
        <h3 className="text-2xl font-bold mb-6">Clock Records / EVV History</h3>

        <div className="space-y-4">
          {clockRecords.length > 0 ? (
            clockRecords.map((record) => (
              <div
                key={record.id}
                className="border border-slate-200 rounded-xl p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {record.clientName}
                    </h4>

                    <p className="text-slate-500 text-sm mt-1">
                      Clock In:{" "}
                      {record.clockInTime
                        ? new Date(record.clockInTime).toLocaleString()
                        : "-"}
                    </p>

                    <p className="text-slate-500 text-sm mt-1">
                      Clock Out:{" "}
                      {record.clockOutTime
                        ? new Date(record.clockOutTime).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        record.status === "CLOCKED_OUT"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {record.status}
                    </span>

                    <p className="text-slate-500 text-sm mt-3">
                      {record.totalHours
                        ? `${record.totalHours.toFixed(2)} hrs`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No clock records found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div
        className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-5`}
      >
        {icon}
      </div>

      <h3 className="text-slate-500 text-sm">{title}</h3>

      <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
  )
}

export default CaregiverDetailsPage