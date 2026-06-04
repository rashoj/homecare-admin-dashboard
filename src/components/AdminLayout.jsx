import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Bell,
  Clock3,
  LogOut,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  Activity,
  FileCheck
} from "lucide-react"

import { Link } from "react-router-dom"
import { DollarSign } from "lucide-react"

function AdminLayout({ children, onLogout }) {
  const logout = () => {
    if (onLogout) {
      onLogout()
      return
    }

    localStorage.removeItem("homecare_auth_token")
    localStorage.removeItem("homecare_user")
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex w-64 flex-col justify-between bg-slate-900 p-6 text-white">
        <div>
          <h1 className="mb-10 text-3xl font-bold">HomeCare AI</h1>

          <div className="space-y-3">
            <SidebarLink
              to="/"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
            />

            <SidebarLink
              to="/clients"
              icon={<Users size={20} />}
              text="Clients"
            />

            <SidebarLink
              to="/appointments"
              icon={<Calendar size={20} />}
              text="Appointments"
            />

            <SidebarLink
              to="/clock-records"
              icon={<Clock3 size={20} />}
              text="Clock Records"
            />
            <SidebarLink
  to="/service-documentation-review"
  icon={<ClipboardList size={20} />}
  text="Service Docs"
/>

            <SidebarLink
              to="/visit-notes"
              icon={<ClipboardCheck size={20} />}
              text="Visit Notes"
            />
            <SidebarLink
  to="/client-risk"
  icon={<Activity size={20} />}
  text="Client Risk"
/>
<SidebarLink
  to="/authorizations"
  icon={<FileCheck size={20} />}
  text="Authorizations"
/>
<SidebarLink
  to="/billing-payroll"
  icon={<DollarSign size={20} />}
  text="Billing & Payroll"
/>
            <SidebarLink
              to="/compliance"
              icon={<ShieldCheck size={20} />}
              text="Compliance"
            />

            <SidebarLink
              to="/documents"
              icon={<FileText size={20} />}
              text="Documents"
            />
            <SidebarLink
  to="/incidents"
  icon={<AlertTriangle size={20} />}
  text="Incidents"
/>

            <SidebarLink
              to="/notifications"
              icon={<Bell size={20} />}
              text="Notifications"
            />

            <SidebarLink
              to="/calendar"
              icon={<Calendar size={20} />}
              text="Calendar"
            />
           <SidebarLink
  to="/evv-exceptions"
  icon={<AlertTriangle size={20} />}
  text="EVV Exceptions"
/>
<SidebarLink
  to="/evv-alerts"
  icon={<Bell size={20} />}
  text="EVV Alerts"
/>
<SidebarLink
  to="/mar-review"
  icon={<FileCheck size={20} />}
  text="MAR Review"
/>

            <SidebarLink
              to="/reports"
              icon={<TrendingUp size={20} />}
              text="Reports"
            />

            <SidebarLink
              to="/payroll"
              icon={<DollarSign size={20} />}
              text="Payroll"
            />

            <SidebarLink
              to="/caregivers"
              icon={<Users size={20} />}
              text="Caregivers"
            />
            <SidebarLink
  to="/messages"
  icon={<Bell size={20} />}
  text="Messages"
/>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-3 transition hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

function SidebarLink({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex cursor-pointer items-center gap-3 rounded-xl p-4 transition hover:bg-slate-800"
    >
      {icon}

      <span>{text}</span>
    </Link>
  )
}

export default AdminLayout