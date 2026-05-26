import { useEffect, useMemo, useState } from "react"
import {
  createBehaviorEvent,
  getBehaviorEventsByClient,
  getBehaviorOptions,
} from "../../services/behaviorEventApi"

function ClientBehaviorTrackingTab({ clientId }) {

    console.log("NEW ClientBehaviorTrackingTab LOADED")
  const [events, setEvents] = useState([])

  const [behaviorTypes, setBehaviorTypes] = useState([])
  const [triggers, setTriggers] = useState([])
  const [severities, setSeverities] = useState([])
  const [outcomes, setOutcomes] = useState([])

  const [formData, setFormData] = useState({
    caregiverId: "",
    appointmentId: "",
    serviceDocumentationId: "",
    behaviorType: "",
    trigger: "",
    severity: "",
    durationMinutes: "",
    interventionUsed: "",
    outcome: "",
    notes: "",
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [clientId])

  async function loadPageData() {
    try {
      setLoading(true)

      const [
        eventsData,
        behaviorTypeOptions,
        triggerOptions,
        severityOptions,
        outcomeOptions,
      ] = await Promise.all([
        getBehaviorEventsByClient(clientId),
        getBehaviorOptions("behavior-types"),
        getBehaviorOptions("triggers"),
        getBehaviorOptions("severities"),
        getBehaviorOptions("outcomes"),
      ])

      setEvents(eventsData)
      setBehaviorTypes(behaviorTypeOptions)
      setTriggers(triggerOptions)
      setSeverities(severityOptions)
      setOutcomes(outcomeOptions)

      setFormData((prev) => ({
        ...prev,
        behaviorType: prev.behaviorType || behaviorTypeOptions[0]?.value || "",
        trigger: prev.trigger || triggerOptions[0]?.value || "",
        severity: prev.severity || severityOptions[0]?.value || "",
        outcome: prev.outcome || outcomeOptions[0]?.value || "",
      }))
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.behaviorType || !formData.trigger || !formData.severity) {
      alert("Behavior type, trigger, and severity are required.")
      return
    }

    try {
      setSubmitting(true)

      await createBehaviorEvent({
        clientId: Number(clientId),
        caregiverId: formData.caregiverId ? Number(formData.caregiverId) : null,
        appointmentId: formData.appointmentId
          ? Number(formData.appointmentId)
          : null,
        serviceDocumentationId: formData.serviceDocumentationId
          ? Number(formData.serviceDocumentationId)
          : null,
        behaviorType: formData.behaviorType,
        trigger: formData.trigger,
        severity: formData.severity,
        durationMinutes: formData.durationMinutes
          ? Number(formData.durationMinutes)
          : null,
        interventionUsed: formData.interventionUsed,
        outcome: formData.outcome,
        notes: formData.notes,
      })

      setFormData((prev) => ({
        ...prev,
        caregiverId: "",
        appointmentId: "",
        serviceDocumentationId: "",
        durationMinutes: "",
        interventionUsed: "",
        notes: "",
      }))

      await loadPageData()
      alert("Behavior event created.")
    } catch (error) {
      alert(error.message || "Failed to create behavior event.")
    } finally {
      setSubmitting(false)
    }
  }

  const summary = useMemo(() => {
    return {
      total: events.length,
      highRisk: events.filter(
        (event) => event.severity === "HIGH" || event.severity === "CRITICAL"
      ).length,
      incidentRequired: events.filter(
        (event) => event.outcome === "INCIDENT_REPORT_REQUIRED"
      ).length,
    }
  }, [events])

  if (loading) {
    return <p className="text-slate-500">Loading behavior tracking...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Behavior Tracking Page
        </h2>

        <p className="mt-1 text-slate-500">
          Track behavior events, triggers, interventions, outcomes, and trends.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Events" value={summary.total} />
        <SummaryCard label="High Risk Events" value={summary.highRisk} danger />
        <SummaryCard
          label="Incident Reports Needed"
          value={summary.incidentRequired}
          warning
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Create Behavior Incident Card
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Document what happened, why it may have happened, what staff did,
            and the outcome.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SelectField
            label="Behavior Type"
            name="behaviorType"
            value={formData.behaviorType}
            onChange={handleChange}
            options={behaviorTypes}
          />

          <SelectField
            label="Trigger"
            name="trigger"
            value={formData.trigger}
            onChange={handleChange}
            options={triggers}
          />

          <SelectField
            label="Severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            options={severities}
          />

          <InputField
            label="Duration"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            placeholder="Minutes"
            type="number"
          />

          <SelectField
            label="Outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            options={outcomes}
          />

          <InputField
            label="Caregiver ID"
            name="caregiverId"
            value={formData.caregiverId}
            onChange={handleChange}
            placeholder="Optional"
          />

          <InputField
            label="Appointment ID"
            name="appointmentId"
            value={formData.appointmentId}
            onChange={handleChange}
            placeholder="Optional"
          />

          <InputField
            label="Service Documentation ID"
            name="serviceDocumentationId"
            value={formData.serviceDocumentationId}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <TextArea
            label="Intervention Used"
            name="interventionUsed"
            value={formData.interventionUsed}
            onChange={handleChange}
            placeholder="What did staff do to support, redirect, or de-escalate?"
          />

          <TextArea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Describe what happened before, during, and after the event."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {submitting ? "Creating..." : "Create Incident Card"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="mb-4 text-xl font-bold text-slate-800">
          Behavior Incident Cards
        </h3>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            No behavior events found.
          </div>
        ) : (
          <div className="grid gap-5">
            {events.map((event) => (
              <BehaviorIncidentCard
                key={event.id}
                event={event}
                behaviorTypes={behaviorTypes}
                triggers={triggers}
                outcomes={outcomes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BehaviorIncidentCard({ event, behaviorTypes, triggers, outcomes }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge text={labelFor(behaviorTypes, event.behaviorType)} color="red" />
            <Badge text={event.severity} color={severityColor(event.severity)} />
            <Badge text={labelFor(outcomes, event.outcome)} color="green" />
          </div>

          <h4 className="mt-4 text-lg font-bold text-slate-900">
            {labelFor(behaviorTypes, event.behaviorType)}
          </h4>

          <p className="mt-1 text-sm text-slate-500">
            Logged {formatDate(event.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          Duration: {event.durationMinutes ? `${event.durationMinutes} mins` : "—"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoCard label="Trigger" value={labelFor(triggers, event.trigger)} />
        <InfoCard label="Outcome" value={labelFor(outcomes, event.outcome)} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <LongInfo
          label="Intervention Used"
          value={event.interventionUsed || "—"}
        />

        <LongInfo label="Notes" value={event.notes || "—"} />
      </div>
    </div>
  )
}

function SummaryCard({ label, value, danger, warning }) {
  let style = "bg-blue-50 text-blue-700"

  if (danger) {
    style = "bg-red-50 text-red-700"
  }

  if (warning) {
    style = "bg-orange-50 text-orange-700"
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 w-fit rounded-xl px-4 py-2 text-3xl font-black ${style}`}>
        {value}
      </p>
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function InputField({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

function TextArea({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value || "—"}</p>
    </div>
  )
}

function LongInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  )
}

function Badge({ text, color }) {
  const styles = {
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    slate: "bg-slate-100 text-slate-700",
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[color]}`}>
      {text}
    </span>
  )
}

function severityColor(severity) {
  if (severity === "CRITICAL") return "red"
  if (severity === "HIGH") return "orange"
  if (severity === "MEDIUM") return "blue"
  return "slate"
}

function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label || value || "—"
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default ClientBehaviorTrackingTab