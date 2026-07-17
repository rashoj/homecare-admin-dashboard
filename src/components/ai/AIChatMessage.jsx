import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  CircleUserRound,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function AIChatMessage({ message }) {
  const navigate = useNavigate()
  const isUser = message.role === "user"

  return (
    <div
      className={`flex gap-3 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "bg-blue-700 text-white"
            : "border border-slate-200 bg-white text-slate-700 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-line">
          {message.content}
        </p>

        {!isUser &&
          message.cards?.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {message.cards.map(
                (card, index) => (
                  <AICard
                    key={`${card.title}-${index}`}
                    card={card}
                  />
                )
              )}
            </div>
          )}

        {!isUser &&
          message.details?.length > 0 && (
            <div className="mt-5 space-y-3">
              <DetailSectionHeader
                category={message.category}
                count={message.details.length}
              />

              {message.details.map(
                (detail, index) => (
                  <AIDetailCard
                    key={`${detail.category}-${detail.title}-${index}`}
                    detail={detail}
                    onOpen={() => {
                      if (detail.route) {
                        navigate(detail.route)
                      }
                    }}
                  />
                )
              )}
            </div>
          )}

        {!isUser &&
          message.actions?.length > 0 && (
            <div className="mt-4 space-y-2">
              {message.actions.map(
                (action, index) => (
                  <button
                    key={`${action.label}-${index}`}
                    onClick={() =>
                      navigate(action.route)
                    }
                    className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
                  >
                    {action.label}

                    <ArrowRight size={14} />
                  </button>
                )
              )}
            </div>
          )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-700">
          <User size={18} />
        </div>
      )}
    </div>
  )
}

function DetailSectionHeader({
  category,
  count,
}) {
  const configuration =
    getCategoryConfiguration(category)

  const Icon = configuration.icon

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${configuration.iconStyle}`}
        >
          <Icon size={14} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          {configuration.sectionTitle}
        </p>
      </div>

      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
        {count}
      </span>
    </div>
  )
}

function AICard({ card }) {
  const tones = {
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",

    green:
      "border-green-100 bg-green-50 text-green-700",

    red:
      "border-red-100 bg-red-50 text-red-700",

    orange:
      "border-orange-100 bg-orange-50 text-orange-700",

    slate:
      "border-slate-100 bg-slate-50 text-slate-700",
  }

  return (
    <div
      className={`rounded-xl border p-3 ${
        tones[card.tone] ||
        tones.slate
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide opacity-75">
        {card.title}
      </p>

      <p className="mt-1 text-xl font-black">
        {card.value}
      </p>

      <p className="mt-1 text-[10px] font-bold leading-4 opacity-75">
        {card.subtitle}
      </p>
    </div>
  )
}

function AIDetailCard({
  detail,
  onOpen,
}) {
  const configuration =
    getCategoryConfiguration(
      detail.category
    )

  const severity =
    getSeverityConfiguration(
      detail.severity
    )

  const Icon = configuration.icon

  const metadataEntries = Object.entries(
    detail.metadata || {}
  )

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${severity.wrapper}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${configuration.iconStyle}`}
          >
            <Icon size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${severity.badge}`}
              >
                {formatSeverity(
                  detail.severity
                )}
              </span>

              {detail.status && (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {formatLabel(
                    detail.status
                  )}
                </span>
              )}
            </div>

            <h4 className="mt-3 break-words text-sm font-black text-slate-950">
              {detail.title ||
                configuration.fallbackTitle}
            </h4>

            <p
              className={`mt-1 text-[11px] font-black uppercase tracking-wide ${configuration.labelStyle}`}
            >
              {formatLabel(
                detail.subtitle
              )}
            </p>
          </div>
        </div>

        {detail.description && (
          <p className="mt-4 rounded-xl bg-white/70 px-3 py-2.5 text-xs leading-5 text-slate-600">
            {detail.description}
          </p>
        )}

        {metadataEntries.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2 rounded-2xl border border-white/80 bg-white/75 p-3">
            {metadataEntries.map(
              ([label, value]) => (
                <MetadataRow
                  key={label}
                  label={label}
                  value={value}
                />
              )
            )}
          </div>
        )}
      </div>

      {detail.route && (
        <button
          onClick={onOpen}
          className="flex w-full items-center justify-between border-t border-black/5 bg-white/70 px-4 py-3 text-xs font-black text-slate-800 transition hover:bg-white hover:text-blue-700"
        >
          {configuration.actionLabel}

          <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

function MetadataRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="text-slate-400">
          {getMetadataIcon(label)}
        </div>

        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="max-w-[58%] break-words text-right text-xs font-bold text-slate-700">
        {value || "—"}
      </p>
    </div>
  )
}

function getCategoryConfiguration(
  category
) {
  const configurations = {
    EVV: {
      icon: ShieldCheck,
      iconStyle:
        "bg-orange-100 text-orange-700",
      labelStyle:
        "text-orange-700",
      sectionTitle:
        "EVV Priority Records",
      actionLabel:
        "Review EVV Exception",
      fallbackTitle:
        "EVV Record",
    },

    INCIDENT: {
      icon: AlertTriangle,
      iconStyle:
        "bg-red-100 text-red-700",
      labelStyle:
        "text-red-700",
      sectionTitle:
        "Incident Records",
      actionLabel:
        "Open Incident",
      fallbackTitle:
        "Incident",
    },

    OPEN_SHIFT: {
      icon: Clock3,
      iconStyle:
        "bg-blue-100 text-blue-700",
      labelStyle:
        "text-blue-700",
      sectionTitle:
        "Staffing Records",
      actionLabel:
        "Open Shift",
      fallbackTitle:
        "Open Shift",
    },

    CLIENT: {
      icon: HeartPulse,
      iconStyle:
        "bg-violet-100 text-violet-700",
      labelStyle:
        "text-violet-700",
      sectionTitle:
        "Client Profiles",
      actionLabel:
        "Open Client Profile",
      fallbackTitle:
        "Client",
    },

    CAREGIVER: {
      icon: Users,
      iconStyle:
        "bg-emerald-100 text-emerald-700",
      labelStyle:
        "text-emerald-700",
      sectionTitle:
        "Caregiver Profiles",
      actionLabel:
        "Open Caregiver Profile",
      fallbackTitle:
        "Caregiver",
    },
  }

  return (
    configurations[category] || {
      icon: Stethoscope,
      iconStyle:
        "bg-slate-100 text-slate-700",
      labelStyle:
        "text-slate-600",
      sectionTitle:
        "Operational Records",
      actionLabel:
        "Open Record",
      fallbackTitle:
        "Operational Record",
    }
  )
}

function getSeverityConfiguration(
  severity
) {
  const configurations = {
    CRITICAL: {
      wrapper:
        "border-red-200 bg-red-50",
      badge:
        "bg-red-600 text-white",
    },

    HIGH: {
      wrapper:
        "border-orange-200 bg-orange-50",
      badge:
        "bg-orange-600 text-white",
    },

    MEDIUM: {
      wrapper:
        "border-yellow-200 bg-yellow-50",
      badge:
        "bg-yellow-500 text-white",
    },

    LOW: {
      wrapper:
        "border-green-200 bg-green-50",
      badge:
        "bg-green-600 text-white",
    },

    NORMAL: {
      wrapper:
        "border-slate-200 bg-slate-50",
      badge:
        "bg-slate-600 text-white",
    },
  }

  return (
    configurations[severity] ||
    configurations.NORMAL
  )
}

function formatSeverity(value) {
  if (!value || value === "NORMAL") {
    return "Normal"
  }

  return formatLabel(value)
}

function getMetadataIcon(label) {
  const normalized =
    label?.toLowerCase() || ""

  if (
    normalized.includes("caregiver") ||
    normalized.includes("role")
  ) {
    return (
      <CircleUserRound size={13} />
    )
  }

  if (
    normalized.includes("date") ||
    normalized.includes("created") ||
    normalized.includes("expires")
  ) {
    return <CalendarDays size={13} />
  }

  if (
    normalized.includes("evv") ||
    normalized.includes("incident")
  ) {
    return <AlertTriangle size={13} />
  }

  return <ArrowRight size={13} />
}

function formatLabel(value) {
  if (!value) {
    return "—"
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

export default AIChatMessage