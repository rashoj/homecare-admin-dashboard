import { useEffect, useState } from "react"
import SignaturePadField from "../common/SignaturePadField"
import {
  getDueMedicationsByClient,
  logMedication,
} from "../../services/medicationService.js"

function CaregiverMARPanel({ clientId, caregiverId }) {
  const [dueMedications, setDueMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)

  const [forms, setForms] = useState({})

  useEffect(() => {
    loadDueMedications()
  }, [clientId])

  async function loadDueMedications() {
    try {
      setLoading(true)
      const data = await getDueMedicationsByClient(clientId)
      setDueMedications(data)

      const initialForms = {}

      data.forEach((med) => {
        initialForms[med.medicationId] = {
          status: "GIVEN",
          notes: "",
          prn: false,
          prnReason: "",
          refusalReason: "",
          missedReason: "",
          caregiverSignature: "",
        }
      })

      setForms(initialForms)
    } finally {
      setLoading(false)
    }
  }

  function updateForm(medicationId, field, value) {
    setForms({
      ...forms,
      [medicationId]: {
        ...forms[medicationId],
        [field]: value,
      },
    })
  }

  async function handleSubmit(medication) {
    const form = forms[medication.medicationId]

    if (!form.caregiverSignature) {
      alert("Caregiver signature is required.")
      return
    }

    if (form.status === "REFUSED" && !form.refusalReason.trim()) {
      alert("Refusal reason is required.")
      return
    }

    if (form.status === "MISSED" && !form.missedReason.trim()) {
      alert("Missed reason is required.")
      return
    }

    if (form.status === "PRN_GIVEN" && !form.prnReason.trim()) {
      alert("PRN reason is required.")
      return
    }

    try {
      setSubmittingId(medication.medicationId)

      await logMedication({
        medicationId: medication.medicationId,
        caregiverId,
        status: form.status,
        scheduledAt: medication.scheduledAt,
        notes: form.notes,
        prn: form.status === "PRN_GIVEN",
        prnReason: form.prnReason,
        refusalReason: form.refusalReason,
        missedReason: form.missedReason,
        caregiverSignature: form.caregiverSignature,
      })

      alert("Medication log submitted.")
      await loadDueMedications()
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading MAR...</p>
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Medication Pass</h2>
        <p className="mt-1 text-emerald-100">
          Review due medications and document administration status.
        </p>
      </div>

      <div className="space-y-5 p-6">
        {dueMedications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
            No due medications found for this client.
          </div>
        ) : (
          dueMedications.map((medication) => {
            const form = forms[medication.medicationId]

            return (
              <div
                key={medication.medicationId}
                className={`rounded-3xl border p-5 shadow-sm ${
                  medication.alreadyLogged
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {medication.frequency}
                      </span>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        Due {formatTime(medication.scheduledAt)}
                      </span>

                      {medication.alreadyLogged && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Logged
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-slate-900">
                      {medication.medicationName}
                    </h3>

                    <p className="mt-1 font-semibold text-slate-700">
                      {medication.dosage}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      {medication.instructions || "No instructions provided."}
                    </p>
                  </div>
                </div>

                {!medication.alreadyLogged && form && (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Medication Status
                      </label>

                      <select
                        value={form.status}
                        onChange={(e) =>
                          updateForm(
                            medication.medicationId,
                            "status",
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                      >
                        <option value="GIVEN">Given</option>
                        <option value="REFUSED">Refused</option>
                        <option value="MISSED">Missed</option>
                        <option value="HELD">Held</option>
                        <option value="PRN_GIVEN">PRN Given</option>
                      </select>
                    </div>

                    {form.status === "REFUSED" && (
                      <ReasonBox
                        label="Refusal Reason"
                        value={form.refusalReason}
                        onChange={(value) =>
                          updateForm(
                            medication.medicationId,
                            "refusalReason",
                            value
                          )
                        }
                      />
                    )}

                    {form.status === "MISSED" && (
                      <ReasonBox
                        label="Missed Reason"
                        value={form.missedReason}
                        onChange={(value) =>
                          updateForm(
                            medication.medicationId,
                            "missedReason",
                            value
                          )
                        }
                      />
                    )}

                    {form.status === "PRN_GIVEN" && (
                      <ReasonBox
                        label="PRN Reason"
                        value={form.prnReason}
                        onChange={(value) =>
                          updateForm(
                            medication.medicationId,
                            "prnReason",
                            value
                          )
                        }
                      />
                    )}

                    <ReasonBox
                      label="Notes"
                      value={form.notes}
                      onChange={(value) =>
                        updateForm(medication.medicationId, "notes", value)
                      }
                    />

                    <SignaturePadField
                      label="Caregiver Signature"
                      value={form.caregiverSignature}
                      onChange={(signatureDataUrl) =>
                        updateForm(
                          medication.medicationId,
                          "caregiverSignature",
                          signatureDataUrl
                        )
                      }
                    />

                    <button
                      type="button"
                      disabled={submittingId === medication.medicationId}
                      onClick={() => handleSubmit(medication)}
                      className="w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300"
                    >
                      {submittingId === medication.medicationId
                        ? "Submitting..."
                        : "Submit MAR Entry"}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function ReasonBox({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="3"
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </div>
  )
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }) : "—"
}

export default CaregiverMARPanel