import { useEffect, useMemo, useState } from "react"
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
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarDays,
  WalletCards,
  FolderOpen,
} from "lucide-react"

import { NavLink, useLocation } from "react-router-dom"
import AICopilotWidget from "./ai/AICopilotWidget"

const navigationGroups = [
  {
    id: "overview",
    title: "Overview",
    icon: LayoutDashboard,
    items: [
      {
        to: "/dashboard",
        text: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        to: "/ai-operations-center",
        text: "AI Operations",
        icon: Activity,
      },
      {
        to: "/reports",
        text: "Reports",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "scheduling",
    title: "Scheduling",
    icon: CalendarDays,
    items: [
      {
        to: "/scheduler",
        text: "Scheduler",
        icon: CalendarDays,
      },
      {
        to: "/calendar",
        text: "Calendar",
        icon: Calendar,
      },
      {
        to: "/appointments",
        text: "Appointments",
        icon: Calendar,
      },
      {
        to: "/open-shifts",
        text: "Open Shifts",
        icon: BriefcaseBusiness,
      },
    ],
  },
  {
    id: "care-management",
    title: "Care Management",
    icon: Users,
    items: [
      {
        to: "/clients",
        text: "Clients",
        icon: Users,
      },
      {
        to: "/caregivers",
        text: "Caregivers",
        icon: UserCheck,
      },
      {
        to: "/visit-notes",
        text: "Visit Notes",
        icon: ClipboardCheck,
      },
      {
        to: "/service-documentation-review",
        text: "Service Docs",
        icon: ClipboardList,
      },
      {
        to: "/mar-review",
        text: "MAR Review",
        icon: Stethoscope,
      },
      {
        to: "/client-risk",
        text: "Client Risk",
        icon: Activity,
      },
    ],
  },
  {
    id: "evv-compliance",
    title: "EVV & Compliance",
    icon: ShieldCheck,
    items: [
      {
        to: "/clock-records",
        text: "Clock Records",
        icon: Clock3,
      },
      {
        to: "/evv-alerts",
        text: "EVV Alerts",
        icon: Bell,
      },
      {
        to: "/evv-exceptions",
        text: "EVV Exceptions",
        icon: AlertTriangle,
      },
      {
        to: "/incidents",
        text: "Incidents",
        icon: AlertTriangle,
      },
      {
        to: "/compliance",
        text: "Compliance",
        icon: ShieldCheck,
      },
      {
        to: "/authorizations",
        text: "Authorizations",
        icon: FileCheck,
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    icon: WalletCards,
    items: [
      {
        to: "/billing-payroll",
        text: "Billing & Payroll",
        icon: DollarSign,
      },
      {
        to: "/payroll",
        text: "Payroll",
        icon: DollarSign,
      },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    icon: FolderOpen,
    items: [
      {
        to: "/documents",
        text: "Documents",
        icon: FileText,
      },
      {
        to: "/messages",
        text: "Messages",
        icon: MessageSquare,
      },
      {
        to: "/notifications",
        text: "Notifications",
        icon: Bell,
      },
    ],
  },
]

function AdminLayout({ children, onLogout, user }) {
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const activeGroupId = useMemo(() => {
    const activeGroup = navigationGroups.find((group) =>
      group.items.some(
        (item) =>
          location.pathname === item.to ||
          location.pathname.startsWith(`${item.to}/`)
      )
    )

    return activeGroup?.id || "overview"
  }, [location.pathname])

  const [openGroups, setOpenGroups] = useState(() => ({
    overview: true,
    scheduling: true,
    "care-management": true,
    "evv-compliance": true,
    finance: true,
    resources: true,
  }))

  useEffect(() => {
    setOpenGroups((current) => ({
      ...current,
      [activeGroupId]: true,
    }))
  }, [activeGroupId])

  const filteredGroups = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return navigationGroups
    }

    return navigationGroups
      .map((group) => {
        const groupMatches = group.title
          .toLowerCase()
          .includes(normalizedSearch)

        const matchingItems = group.items.filter((item) =>
          item.text.toLowerCase().includes(normalizedSearch)
        )

        if (groupMatches) {
          return group
        }

        return {
          ...group,
          items: matchingItems,
        }
      })
      .filter((group) => group.items.length > 0)
  }, [searchTerm])

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

  const toggleGroup = (groupId) => {
    if (collapsed) {
      setCollapsed(false)

      setOpenGroups((current) => ({
        ...current,
        [groupId]: true,
      }))

      return
    }

    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }))
  }

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.email ||
    "Admin"

  const displayRole =
    user?.role
      ?.replace("ROLE_", "")
      ?.replaceAll("_", " ") ||
    "Agency User"

  const userInitial =
    displayName?.trim()?.charAt(0)?.toUpperCase() || "A"

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-4"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-black text-white shadow-sm shadow-blue-200">
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
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="mx-auto mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {!collapsed && (
            <div className="mx-4 mt-4 flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <Search size={17} className="text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search navigation..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          )}

          <nav
            className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-5 [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredGroups.length > 0 ? (
              <div className="space-y-2">
                {filteredGroups.map((group) => (
                  <SidebarGroup
                    key={group.id}
                    group={group}
                    collapsed={collapsed}
                    isOpen={
                      searchTerm.trim()
                        ? true
                        : Boolean(openGroups[group.id])
                    }
                    isActive={group.id === activeGroupId}
                    onToggle={() => toggleGroup(group.id)}
                  />
                ))}
              </div>
            ) : (
              !collapsed && (
                <div className="mx-2 rounded-2xl bg-slate-50 px-4 py-5 text-center">
                  <p className="text-sm font-bold text-slate-600">
                    No navigation results
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another search term.
                  </p>
                </div>
              )
            )}
          </nav>
        </div>

        <div className="shrink-0 border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={logout}
            title={collapsed ? "Logout" : ""}
            className={`flex w-full items-center rounded-2xl text-sm font-bold text-red-600 transition hover:bg-red-50 ${
              collapsed
                ? "justify-center px-3 py-3"
                : "gap-3 px-4 py-3"
            }`}
          >
            <LogOut size={19} />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setCollapsed((current) => !current)
              }
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-400">
                Agency Operations
              </p>

              <h2 className="truncate text-xl font-black text-slate-900">
                CareBridge Workspace
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <NavLink
              to="/notifications"
              aria-label="Open notifications"
              className="relative rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </NavLink>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2.5 md:px-4 md:py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                {userInitial}
              </div>

              <div className="hidden max-w-48 md:block">
                <p className="truncate text-sm font-black text-slate-800">
                  {displayName}
                </p>

                <p className="truncate text-xs font-semibold capitalize text-slate-400">
                  {displayRole.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>

        <AICopilotWidget />
      </div>
    </div>
  )
}

function SidebarGroup({
  group,
  collapsed,
  isOpen,
  isActive,
  onToggle,
}) {
  const GroupIcon = group.icon

  if (collapsed) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={onToggle}
          title={group.title}
          aria-label={group.title}
          className={`flex w-full items-center justify-center rounded-2xl px-3 py-3 transition ${
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <GroupIcon size={20} />
        </button>

        {isOpen && (
          <div className="space-y-1">
            {group.items.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                text={item.text}
                collapsed
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <GroupIcon
            size={18}
            className={
              isActive ? "text-blue-600" : "text-slate-400"
            }
          />

          <span className="text-[11px] font-black uppercase tracking-[0.14em]">
            {group.title}
          </span>
        </div>

        {isOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      <div
        className={`grid transition-all duration-300 ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-1 space-y-1 pb-2">
            {group.items.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                text={item.text}
                collapsed={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  text,
  collapsed,
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? text : ""}
      className={({ isActive }) =>
        `group relative flex items-center rounded-2xl text-sm font-bold transition ${
          collapsed
            ? "justify-center px-3 py-3"
            : "gap-3 py-3 pl-10 pr-4"
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

          <Icon
            size={19}
            className={
              isActive
                ? "text-blue-600"
                : "text-slate-400 transition group-hover:text-slate-700"
            }
          />

          {!collapsed && (
            <span className="truncate">{text}</span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default AdminLayout