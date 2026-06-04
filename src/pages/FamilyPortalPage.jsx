import { useEffect, useState } from "react"
import FamilyAppointmentsTab from "../components/family/FamilyAppointmentsTab"
import FamilyVisitNotesTab from "../components/family/FamilyVisitNotesTab"
import FamilyDocumentsTab from "../components/family/FamilyDocumentsTab"
import FamilyMedicationsTab from "../components/family/FamilyMedicationsTab"
import FamilyCareTeamTab from "../components/family/FamilyCareTeamTab"
import FamilyNotificationsTab from "../components/family/FamilyNotificationsTab"
import FamilyTimelineTab from "../components/family/FamilyTimelineTab"
import FamilyMessagesTab from "../components/family/FamilyMessagesTab"
import api from "../api/axios"

function FamilyPortalPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    async function loadFamilyDashboard() {
      try {
        setLoading(true)
        setErrorMessage("")

        const response = await api.get("/family-portal/dashboard")

        setDashboard(response.data)
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to load family portal."
        )
      } finally {
        setLoading(false)
      }
    }

    loadFamilyDashboard()
  }, [])

  if (loading) {
    return <div className="p-10 text-gray-500">Loading family portal...</div>
  }

  if (errorMessage) {
    return <div className="p-10 text-red-600">{errorMessage}</div>
  }

  if (!dashboard) {
    return <div className="p-10 text-gray-500">No family portal data found.</div>
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-900 p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-widest text-blue-200">
          Family Care Portal
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Welcome, {dashboard.familyName}
        </h1>

        <p className="mt-3 text-blue-100">
          Care updates for {dashboard.clientName}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <TabButton
          label="Dashboard"
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
        />

        <TabButton
          label="Appointments"
          active={activeTab === "appointments"}
          onClick={() => setActiveTab("appointments")}
        />

        <TabButton
          label="Visit Notes"
          active={activeTab === "visitNotes"}
          onClick={() => setActiveTab("visitNotes")}
        />

        <TabButton
          label="Medications"
          active={activeTab === "medications"}
          onClick={() => setActiveTab("medications")}
        />

        <TabButton
          label="Documents"
          active={activeTab === "documents"}
          onClick={() => setActiveTab("documents")}
        />

        <TabButton
          label="Notifications"
          active={activeTab === "notifications"}
          onClick={() => setActiveTab("notifications")}
        />

        <TabButton
          label="Care Team"
          active={activeTab === "care-team"}
          onClick={() => setActiveTab("care-team")}
        />

        <TabButton
          label="Timeline"
          active={activeTab === "timeline"}
          onClick={() => setActiveTab("timeline")}
        />

        <TabButton
          label="Messages"
          active={activeTab === "messages"}
          onClick={() => setActiveTab("messages")}
        />
      </div>

      {activeTab === "dashboard" && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            <FamilyCard
              title="Upcoming Visits"
              value={dashboard.upcomingAppointments}
            />

            <FamilyCard
              title="Completed Visits"
              value={dashboard.completedVisits}
            />

            <FamilyCard
              title="Visit Notes"
              value={dashboard.recentVisitNotes}
            />

            <FamilyCard
              title="Documents"
              value={dashboard.sharedDocuments}
            />

            <FamilyCard
              title="Medications"
              value={dashboard.activeMedications}
            />
          </div>

          <div className="mt-8 rounded-3xl bg-white p-8 shadow">
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Care Summary
            </h2>

            <p className="mt-3 text-slate-600">
              This portal shows approved visit updates, care notes, documents,
              medication information, and upcoming appointments for your loved one.
            </p>
          </div>
        </>
      )}

      {activeTab === "appointments" && <FamilyAppointmentsTab />}
      {activeTab === "visitNotes" && <FamilyVisitNotesTab />}
      {activeTab === "documents" && <FamilyDocumentsTab />}
      {activeTab === "medications" && <FamilyMedicationsTab />}
      {activeTab === "notifications" && <FamilyNotificationsTab />}
      {activeTab === "timeline" && <FamilyTimelineTab />}
      {activeTab === "messages" && <FamilyMessagesTab />}
      {activeTab === "care-team" && <FamilyCareTeamTab />}
    </div>
  )
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 font-semibold ${
        active ? "bg-blue-600 text-white" : "bg-white text-slate-700"
      }`}
    >
      {label}
    </button>
  )
}

function FamilyCard({ title, value }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>

      <h2 className="mt-3 text-4xl font-black text-slate-900">
        {value ?? 0}
      </h2>
    </div>
  )
}

export default FamilyPortalPage