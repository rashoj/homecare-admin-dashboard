import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

import { getAppointments } from "../services/appointmentService"

function CalendarPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const data = await getAppointments()

      const calendarEvents = data.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.clientName} - ${appointment.caregiverName}`,
        start: appointment.startTime,
        end: appointment.endTime,
        backgroundColor: appointment.completed ? "#16a34a" : "#2563eb",
        borderColor: appointment.completed ? "#16a34a" : "#2563eb",
        extendedProps: {
          status: appointment.status,
          completed: appointment.completed,
          notes: appointment.notes,
          clientName: appointment.clientName,
          caregiverName: appointment.caregiverName
        }
      }))

      setEvents(calendarEvents)
    } catch (error) {
      console.error(error)
      alert("Failed to load calendar")
    }
  }

  const handleEventClick = (info) => {
    const event = info.event

    alert(
      `Client: ${event.extendedProps.clientName}\n` +
      `Caregiver: ${event.extendedProps.caregiverName}\n` +
      `Status: ${event.extendedProps.status}\n` +
      `Notes: ${event.extendedProps.notes || "-"}`
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800">
          Scheduling Calendar
        </h2>

        <p className="text-slate-500 mt-2">
          View caregiver appointments and client visits by day, week, or month.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          events={events}
          eventClick={handleEventClick}
          height="75vh"
          nowIndicator={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
        />
      </div>
    </div>
  )
}

export default CalendarPage