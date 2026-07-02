import { useState } from "react"
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
  FileCheck,
  BriefcaseBusiness,
  DollarSign,
  MessageSquare,
  Stethoscope,
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { NavLink } from "react-router-dom"

function AdminLayout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

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
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`sticky top-0 flex h-screen flex-col justify-between border-r border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <div>
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 font-black text-white">
                C
              </div>

              {!collapsed && (
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    CareBridge
                  </h1>
                  <p className="text-xs font-semibold text-slate-400">
                    Home Care OS
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {!collapsed && (
            <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
              <Search size={17} className="text-slate-400" />
              <input
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          )}

          <nav
            className="mt-4 h-[calc(100vh-180px)] space-y-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <SidebarLink collapsed={collapsed} to="/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
            <SidebarLink collapsed={collapsed} to="/clients" icon={<Users size={20} />} text="Clients" />
            <SidebarLink collapsed={collapsed} to="/caregivers" icon={<Users size={20} />} text="Caregivers" />
            <SidebarLink collapsed={collapsed} to="/scheduler" icon={<Calendar size={20} />} text="Scheduler" />
            <SidebarLink collapsed={collapsed} to="/appointments" icon={<Calendar size={20} />} text="Appointments" />
            <SidebarLink collapsed={collapsed} to="/open-shifts" icon={<BriefcaseBusiness size={20} />} text="Open Shifts" />
            <SidebarLink collapsed={collapsed} to="/calendar" icon={<Calendar size={20} />} text="Calendar" />

            <Divider collapsed={collapsed} />

            <SidebarLink collapsed={collapsed} to="/evv-alerts" icon={<Bell size={20} />} text="EVV Alerts" />
            <SidebarLink collapsed={collapsed} to="/evv-exceptions" icon={<AlertTriangle size={20} />} text="EVV Exceptions" />
            <SidebarLink collapsed={collapsed} to="/clock-records" icon={<Clock3 size={20} />} text="Clock Records" />
            <SidebarLink collapsed={collapsed} to="/visit-notes" icon={<ClipboardCheck size={20} />} text="Visit Notes" />
            <SidebarLink collapsed={collapsed} to="/service-documentation-review" icon={<ClipboardList size={20} />} text="Service Docs" />
            <SidebarLink collapsed={collapsed} to="/mar-review" icon={<Stethoscope size={20} />} text="MAR Review" />
            <SidebarLink collapsed={collapsed} to="/incidents" icon={<AlertTriangle size={20} />} text="Incidents" />

            <Divider collapsed={collapsed} />

            <SidebarLink collapsed={collapsed} to="/compliance" icon={<ShieldCheck size={20} />} text="Compliance" />
            <SidebarLink collapsed={collapsed} to="/documents" icon={<FileText size={20} />} text="Documents" />
            <SidebarLink collapsed={collapsed} to="/authorizations" icon={<FileCheck size={20} />} text="Authorizations" />
            <SidebarLink collapsed={collapsed} to="/client-risk" icon={<Activity size={20} />} text="Client Risk" />

            <Divider collapsed={collapsed} />

            <SidebarLink collapsed={collapsed} to="/billing-payroll" icon={<DollarSign size={20} />} text="Billing & Payroll" />
            <SidebarLink collapsed={collapsed} to="/payroll" icon={<DollarSign size={20} />} text="Payroll" />
            <SidebarLink collapsed={collapsed} to="/reports" icon={<TrendingUp size={20} />} text="Reports" />
            <SidebarLink collapsed={collapsed} to="/messages" icon={<MessageSquare size={20} />} text="Messages" />
            <SidebarLink collapsed={collapsed} to="/notifications" icon={<Bell size={20} />} text="Notifications" />
          </nav>
        </div>

        <div className="border-t border-slate-100 p-3">
          <button
            onClick={logout}
            className={`flex w-full items-center rounded-2xl text-sm font-bold text-red-600 transition hover:bg-red-50 ${
              collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"
            }`}
          >
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-400">
                Agency Operations
              </p>
              <h2 className="text-xl font-black text-slate-900">
                CareBridge Workspace
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-black text-slate-800">Admin</p>
                <p className="text-xs font-semibold text-slate-400">Agency User</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarLink({ to, icon, text, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? text : ""}
      className={({ isActive }) =>
        `group relative flex items-center rounded-2xl text-sm font-bold transition ${
          collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"
        } ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute left-0 h-7 w-1 rounded-r-full bg-blue-600" />
          )}

          <span>{icon}</span>

          {!collapsed && <span>{text}</span>}
        </>
      )}
    </NavLink>
  )
}

function Divider({ collapsed }) {
  return (
    <div
      className={`my-3 border-t border-slate-100 ${
        collapsed ? "mx-2" : "mx-4"
      }`}
    />
  )
}

export default AdminLayout