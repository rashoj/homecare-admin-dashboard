import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getClientById } from "../services/clientApi"

import ClientClockRecordsTab from "../components/client/ClientClockRecordsTab"
import ClientCaregiversTab from "../components/client/ClientCaregiversTab"
import ClientAppointmentsTab from "../components/client/ClientAppointmentsTab"
import ClientVisitNotesTab from "../components/client/ClientVisitNotesTab"
import MedicationMARPanel from "../components/medications/MedicationMARPanel"
import ClientRiskSafetyTab from "../components/client/ClientRiskSafetyTab"
import ClientISPGoalsTab from "../components/client/ClientISPGoalsTab"
import ClientBehaviorIncidentCardsTab from "../components/client/ClientBehaviorIncidentCardsTab"
import ClientBillingTab from "../components/client/ClientBillingTab"
import ClientDocumentsTab from "../components/client/ClientDocumentsTab"

function ClientDetailsPage() {
  const { clientId } = useParams()

  const [client, setClient] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "appointments", label: "Appointments" },
    { id: "clockRecords", label: "Clock Records" },
    { id: "visitNotes", label: "Visit Notes" },
    { id: "medications", label: "Medications" },
    { id: "risk", label: "Risk & Safety" },
    { id: "ispGoals", label: "ISP / Goals" },
    { id: "behavior", label: "Behavior Tracking" },
    { id: "documents", label: "Documents" },
    { id: "billing", label: "Billing" },
    { id: "caregivers", label: "Caregivers" },
  ]

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        setErrorMessage("")

        const data = await getClientById(clientId)
        setClient(data)
      } catch (error) {
        setErrorMessage(error.message || "Failed to load client.")
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      loadClient()
    }
  }, [clientId])

  if (loading) {
    return <p className="text-gray-500">Loading client details...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (!client) {
    return <p className="text-gray-500">Client not found.</p>
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.fullName}
            </h1>

            <p className="mt-1 text-gray-500">
              {client.address || "No address provided"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              client.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {client.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <InfoCard
            color="blue"
            label="Phone"
            value={client.phoneNumber || "Not provided"}
          />

          <InfoCard
            color="purple"
            label="Gender"
            value={client.gender || "Not provided"}
          />

          <InfoCard
            color="orange"
            label="Mobility"
            value={client.mobilityStatus || "Not provided"}
          />

          <InfoCard
            color="green"
            label="Emergency Contact"
            value={client.emergencyContactName || "Not provided"}
          />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-2xl bg-white p-2 shadow">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Client Overview
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <OverviewField
                label="Date of Birth"
                value={client.dateOfBirth || "Not provided"}
              />

              <OverviewField
                label="Emergency Contact Phone"
                value={client.emergencyContactPhone || "Not provided"}
              />

              <OverviewField
                label="Medical Conditions"
                value={client.medicalConditions || "No conditions listed"}
                wide
              />

              <OverviewField
                label="Allergies"
                value={client.allergies || "No allergies listed"}
                wide
              />

              <OverviewField
                label="Care Plan"
                value={client.carePlan || "No care plan available"}
                wide
              />
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <ClientAppointmentsTab clientId={clientId} />
        )}

        {activeTab === "clockRecords" && (
          <ClientClockRecordsTab clientId={clientId} />
        )}

        {activeTab === "visitNotes" && (
          <ClientVisitNotesTab clientId={clientId} />
        )}

        {activeTab === "medications" && (
          <MedicationMARPanel clientId={clientId} />
        )}

        {activeTab === "risk" && (
          <ClientRiskSafetyTab clientId={clientId} />
        )}

        {activeTab === "ispGoals" && (
          <ClientISPGoalsTab clientId={clientId} />
        )}

        {activeTab === "behavior" && (
          <ClientBehaviorIncidentCardsTab clientId={clientId} />
        )}

       {activeTab === "documents" && (
  <ClientDocumentsTab clientId={clientId} />
)}

        {activeTab === "billing" && (
          <ClientBillingTab clientId={clientId} />
        )}

        {activeTab === "caregivers" && (
          <ClientCaregiversTab clientId={clientId} />
        )}
      </div>
    </div>
  )
}

function InfoCard({ color, label, value }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    green: "bg-green-50 text-green-700",
  }

  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

function OverviewField({ label, value, wide }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  )
}

function TabPlaceholder({ title, clientId }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      <p className="mt-2 text-gray-500">
        Backend data for client #{clientId} will load here next.
      </p>
    </div>
  )
}

export default ClientDetailsPage