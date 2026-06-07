import { NavLink } from "react-router-dom"
import {
  BarChart3,
  ClipboardList,
  Home,
  LogOut,
  Mail,
  MonitorCog,
   Building2
} from "lucide-react"

function PlatformLayout({ children, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-200 bg-slate-950 text-white">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700">
              <MonitorCog size={24} />
            </div>

            <div>
              <h1 className="text-xl font-black">Homecare</h1>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Platform
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          <PlatformNavLink to="/platform-dashboard" icon={<BarChart3 size={18} />}>
            Dashboard
          </PlatformNavLink>

          <PlatformNavLink to="/platform/demo-requests" icon={<ClipboardList size={18} />}>
            Demo Requests
          </PlatformNavLink>

          <PlatformNavLink to="/platform/contact-requests" icon={<Mail size={18} />}>
            Contact Requests
          </PlatformNavLink>

          <PlatformNavLink to="/platform/organizations" icon={<Building2 size={18} />}>
  Organizations
</PlatformNavLink>

          <div className="my-4 border-t border-white/10" />

          <PlatformNavLink to="/dashboard" icon={<Home size={18} />}>
            Agency Admin
          </PlatformNavLink>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 min-h-screen flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

function PlatformNavLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition ${
          isActive
            ? "bg-blue-700 text-white shadow-lg shadow-blue-900/30"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}

export default PlatformLayout