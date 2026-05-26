import { useEffect, useState } from "react"
import { submitServiceDocumentation } from "../../services/serviceDocumentationApi"
import { getActiveISPGoalsByClient } from "../../services/ispApi"
import { getAppointmentById } from "../../services/appointmentService"
import { getBehaviorOptions } from "../../services/behaviorEventApi"
import SignaturePadField from "../common/SignaturePadField"

function CaregiverServiceDocumentationForm({ appointmentId, caregiver, canSubmit }) {
  const [formData, setFormData] = useState({
    shiftTasksCompleted: "",
    adlsCompleted: "",
    goalProgressNotes: "",
    dailyServiceNotes: "",
    shiftCompleted: false,
    caregiverSignature: "",
  })

  const [ispGoals, setIspGoals] = useState([])
  const [goalProgressList, setGoalProgressList] = useState([])

  const [behaviorTypes, setBehaviorTypes] = useState([])
  const [triggers, setTriggers] = useState([])
  const [severities, setSeverities] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [behaviorEvents, setBehaviorEvents] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadSupportData()
  }, [appointmentId])

  async function loadSupportData() {
    try {
      const appointmentData = await getAppointmentById(appointmentId)
      const clientId = appointmentData.clientId || appointmentData.client?.id

      if (clientId) {
        const goals = await getActiveISPGoalsByClient(clientId)
        setIspGoals(goals)
      }

      const [behaviorTypeOptions, triggerOptions, severityOptions, outcomeOptions] =
        await Promise.all([
          getBehaviorOptions("behavior-types"),
          getBehaviorOptions("triggers"),
          getBehaviorOptions("severities"),
          getBehaviorOptions("outcomes"),
        ])

      setBehaviorTypes(behaviorTypeOptions)
      setTriggers(triggerOptions)
      setSeverities(severityOptions)
      setOutcomes(outcomeOptions)
    } catch (error) {
      console.error("Failed to load service documentation support data", error)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  function addGoalProgress() {
    setGoalProgressList([
      ...goalProgressList,
      {
        goalId: "",
        progressStatus: "IMPROVED",
        promptLevel: "VERBAL_PROMPT",
        progressNote: "",
      },
    ])
  }

  function updateGoalProgress(index, field, value) {
    const updated = [...goalProgressList]
    updated[index] = { ...updated[index], [field]: value }
    setGoalProgressList(updated)
  }

  function removeGoalProgress(index) {
    setGoalProgressList(goalProgressList.filter((_, i) => i !== index))
  }

  function addBehaviorEvent() {
    setBehaviorEvents([
      ...behaviorEvents,
      {
        behaviorType: behaviorTypes[0]?.value || "",
        trigger: triggers[0]?.value || "",
        severity: severities[0]?.value || "",
        durationMinutes: "",
        interventionUsed: "",
        outcome: outcomes[0]?.value || "",
        notes: "",
      },
    ])
  }

  function updateBehaviorEvent(index, field, value) {
    const updated = [...behaviorEvents]
    updated[index] = { ...updated[index], [field]: value }
    setBehaviorEvents(updated)
  }

  function removeBehaviorEvent(index) {
    setBehaviorEvents(behaviorEvents.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.shiftCompleted) {
      alert("Please confirm the shift was completed.")
      return
    }

    if (!formData.caregiverSignature) {
      alert("Caregiver signature is required.")
      return
    }

    const validGoalProgress = goalProgressList
      .filter((item) => item.goalId && item.progressNote.trim() !== "")
      .map((item) => ({
        goalId: Number(item.goalId),
        progressStatus: item.progressStatus,
        promptLevel: item.promptLevel,
        progressNote: item.progressNote,
      }))

    const validBehaviorEvents = behaviorEvents
      .filter((item) => item.behaviorType && item.trigger && item.severity)
      .map((item) => ({
        behaviorType: item.behaviorType,
        trigger: item.trigger,
        severity: item.severity,
        durationMinutes: item.durationMinutes ? Number(item.durationMinutes) : null,
        interventionUsed: item.interventionUsed,
        outcome: item.outcome,
        notes: item.notes,
      }))

    try {
      setSubmitting(true)

      await submitServiceDocumentation({
        appointmentId,
        ...formData,
        ispGoalProgress: validGoalProgress,
        behaviorEvents: validBehaviorEvents,
      })

      setSubmitted(true)
      alert("Service documentation submitted.")
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!canSubmit) {
    return (
      <EmptyState
        title="Service Documentation"
        message="Clock out before submitting documentation."
      />
    )
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-3xl border border-green-100 bg-green-50 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-green-700">
          Documentation Submitted
        </h2>
        <p className="mt-2 text-green-700">
          Submitted for supervisor review.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Service Documentation</h2>
        <p className="mt-1 text-blue-100">
          Complete shift notes, ISP progress, behavior incidents, and signature.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <Section title="Shift Documentation" badge="Required">
          <div className="grid gap-4 md:grid-cols-2">
            <TextArea
              name="shiftTasksCompleted"
              label="Shift Tasks Completed"
              value={formData.shiftTasksCompleted}
              onChange={handleChange}
            />

            <TextArea
              name="adlsCompleted"
              label="ADLs Completed"
              value={formData.adlsCompleted}
              onChange={handleChange}
            />

            <TextArea
              name="goalProgressNotes"
              label="General Goal Progress Notes"
              value={formData.goalProgressNotes}
              onChange={handleChange}
            />

            <TextArea
              name="dailyServiceNotes"
              label="Daily Service Notes"
              value={formData.dailyServiceNotes}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section title="ISP Goal Progress" badge={`${goalProgressList.length} Added`}>
          <SectionHeaderText>
            Track progress for one or multiple active ISP goals worked on during this shift.
          </SectionHeaderText>

          <button
            type="button"
            onClick={addGoalProgress}
            disabled={ispGoals.length === 0}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-300"
          >
            + Add ISP Goal Progress
          </button>

          {ispGoals.length === 0 ? (
            <SmallEmpty message="No active ISP goals found for this client." />
          ) : goalProgressList.length === 0 ? (
            <SmallEmpty message="No ISP progress added yet." />
          ) : (
            <div className="mt-5 space-y-4">
              {goalProgressList.map((item, index) => {
                const selectedGoal = ispGoals.find(
                  (goal) => String(goal.id) === String(item.goalId)
                )

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5"
                  >
                    <CardHeader
                      title={`Goal Progress #${index + 1}`}
                      onRemove={() => removeGoalProgress(index)}
                    />

                    <select
                      value={item.goalId}
                      onChange={(e) =>
                        updateGoalProgress(index, "goalId", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                      required
                    >
                      <option value="">Select ISP Goal</option>
                      {ispGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.goalTitle}
                        </option>
                      ))}
                    </select>

                    {selectedGoal && (
                      <div className="mt-3 rounded-xl bg-white p-4">
                        <p className="font-semibold text-slate-800">
                          {selectedGoal.goalTitle}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedGoal.goalDescription}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-indigo-700">
                          Category: {selectedGoal.category} | Target:{" "}
                          {selectedGoal.targetDate || "—"}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <select
                        value={item.progressStatus}
                        onChange={(e) =>
                          updateGoalProgress(index, "progressStatus", e.target.value)
                        }
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      >
                        <option value="IMPROVED">Improved</option>
                        <option value="MAINTAINED">Maintained</option>
                        <option value="REGRESSED">Regressed</option>
                        <option value="NOT_ADDRESSED">Not Addressed</option>
                      </select>

                      <select
                        value={item.promptLevel}
                        onChange={(e) =>
                          updateGoalProgress(index, "promptLevel", e.target.value)
                        }
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      >
                        <option value="INDEPENDENT">Independent</option>
                        <option value="VERBAL_PROMPT">Verbal Prompt</option>
                        <option value="PHYSICAL_ASSIST">Physical Assist</option>
                        <option value="FULL_ASSIST">Full Assist</option>
                      </select>
                    </div>

                    <textarea
                      value={item.progressNote}
                      onChange={(e) =>
                        updateGoalProgress(index, "progressNote", e.target.value)
                      }
                      rows="3"
                      placeholder="Describe progress, support provided, and client response..."
                      className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
                      required
                    />
                  </div>
                )
              })}
            </div>
          )}
        </Section>

       <Section title="Behavior Incident Cards" badge={`${behaviorEvents.length} Added`}>
  <SectionHeaderText>
    Add behavior incidents only if they occurred during this shift.
  </SectionHeaderText>

  <button
    type="button"
    onClick={addBehaviorEvent}
    className="mt-4 w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
  >
    + Add Behavior Incident
  </button>

  {behaviorEvents.length === 0 ? (
    <SmallEmpty message="No behavior incidents added." />
  ) : (
    <div className="mt-5 space-y-5">
      {behaviorEvents.map((item, index) => (
        <div
          key={index}
          className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm"
        >
          <CardHeader
            title={`Behavior Incident #${index + 1}`}
            onRemove={() => removeBehaviorEvent(index)}
          />

          <div className="space-y-4">
            <SelectBox
              label="Behavior Type"
              value={item.behaviorType}
              options={behaviorTypes}
              onChange={(value) =>
                updateBehaviorEvent(index, "behaviorType", value)
              }
            />

            <SelectBox
              label="Trigger"
              value={item.trigger}
              options={triggers}
              onChange={(value) =>
                updateBehaviorEvent(index, "trigger", value)
              }
            />

            <SelectBox
              label="Severity"
              value={item.severity}
              options={severities}
              onChange={(value) =>
                updateBehaviorEvent(index, "severity", value)
              }
            />

            <InputBox
              label="Duration"
              type="number"
              value={item.durationMinutes}
              placeholder="Minutes"
              onChange={(value) =>
                updateBehaviorEvent(index, "durationMinutes", value)
              }
            />

            <SelectBox
              label="Outcome"
              value={item.outcome}
              options={outcomes}
              onChange={(value) =>
                updateBehaviorEvent(index, "outcome", value)
              }
            />

            <TextAreaBox
              label="Intervention Used"
              value={item.interventionUsed}
              placeholder="What did staff do?"
              onChange={(value) =>
                updateBehaviorEvent(index, "interventionUsed", value)
              }
            />

            <TextAreaBox
              label="Incident Notes"
              value={item.notes}
              placeholder="What happened before, during, and after?"
              onChange={(value) =>
                updateBehaviorEvent(index, "notes", value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  )}
</Section>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="shiftCompleted"
              checked={formData.shiftCompleted}
              onChange={handleChange}
            />

            <span className="font-semibold text-blue-700">
              I confirm this shift was completed.
            </span>
          </label>
        </div>

        <Section title="Caregiver Signature" badge="Required">
          <SignaturePadField
            label="Caregiver Signature"
            value={formData.caregiverSignature}
            onChange={(signatureDataUrl) =>
              setFormData({
                ...formData,
                caregiverSignature: signatureDataUrl,
              })
            }
          />
        </Section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300"
        >
          {submitting ? "Submitting..." : "Submit Documentation"}
        </button>
      </form>
    </div>
  )
}

function Section({ title, badge, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>

        {badge && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {badge}
          </span>
        )}
      </div>

      {children}
    </section>
  )
}

function SectionHeaderText({ children }) {
  return <p className="text-sm text-slate-500">{children}</p>
}

function CardHeader({ title, onRemove }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h4 className="font-bold text-slate-800">{title}</h4>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
      >
        Remove
      </button>
    </div>
  )
}

function TextArea({ name, label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

function SelectBox({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function InputBox({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

function TextAreaBox({ label, value, placeholder, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows="4"
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

function SmallEmpty({ message }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
      {message}
    </div>
  )
}

function EmptyState({ title, message }) {
  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  )
}

export default CaregiverServiceDocumentationForm