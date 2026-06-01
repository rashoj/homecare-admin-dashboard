import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import ClientsPage from "./pages/ClientsPage"
import CaregiverLoginPage from "./pages/CaregiverLoginPage"
import ClientDetailsPage from "./pages/ClientDetailsPage"
import CaregiversPage from "./pages/CaregiversPage"
import CaregiverDetailsPage from "./pages/CaregiverDetailsPage"
import CaregiverPortalPage from "./pages/CaregiverPortalPage"
import CompliancePage from "./pages/CompliancePage"
import AppointmentsPage from "./pages/AppointmentsPage"
import DocumentsPage from "./pages/DocumentsPage"
import MedicationsPage from "./pages/MedicationsPage"
import ClockRecordsPage from "./pages/ClockRecordsPage"
import VisitNotesPage from "./pages/VisitNotesPage"
import CalendarPage from "./pages/CalendarPage"
import PayrollPage from "./pages/PayrollPage"
import ReportsPage from "./pages/ReportsPage"
import ServiceDocumentationReviewPage from "./pages/ServiceDocumentationReviewPage"
import IncidentsPage from "./pages/IncidentsPage"
import ClientRiskPage from "./pages/ClientRiskPage"
import AuthorizationsPage from "./pages/AuthorizationsPage"
import BillingPayrollPage from "./pages/BillingPayrollPage"
import EVVExceptionsPage from "./pages/EVVExceptionsPage"
import EVVAlertsPage from "./pages/EVVAlertsPage"
import MARReviewPage from "./pages/MARReviewPage"
import FamilyLoginPage from "./pages/FamilyLoginPage"
import FamilyPortalPage from "./pages/FamilyPortalPage"
import MessagesPage from "./pages/MessagesPage"


import AdminLayout from "./components/AdminLayout"


function App() {
  const [user, setUser] = useState(null)

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/admin-login"
            element={<LoginPage onLogin={setUser} />}
          />

          <Route
            path="/caregiver-login"
            element={<CaregiverLoginPage />}
          />

          <Route
            path="/family-login"
            element={<FamilyLoginPage onLogin={setUser} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (user.role === "FAMILY_MEMBER") {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/family-portal" element={<FamilyPortalPage />} />
          <Route path="*" element={<Navigate to="/family-portal" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (user.role === "CAREGIVER") {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/caregiver" element={<CaregiverPortalPage />} />
          <Route path="*" element={<Navigate to="/caregiver" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage user={user} />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
                <Route path="/caregivers" element={<CaregiversPage />} />
                <Route path="/caregivers/:id" element={<CaregiverDetailsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/medications" element={<MedicationsPage />} />
                <Route path="/mar-review" element={<MARReviewPage />} />
                <Route path="/clock-records" element={<ClockRecordsPage />} />
                <Route path="/visit-notes" element={<VisitNotesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/billing-payroll" element={<BillingPayrollPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route
                  path="/service-documentation-review"
                  element={<ServiceDocumentationReviewPage />}
                />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/client-risk" element={<ClientRiskPage />} />
                <Route path="/authorizations" element={<AuthorizationsPage />} />
                <Route path="/evv-alerts" element={<EVVAlertsPage />} />
                <Route path="/evv-exceptions" element={<EVVExceptionsPage />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App