import { Bot, User, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

function AIChatMessage({ message }) {
  const navigate = useNavigate()
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "bg-blue-700 text-white"
            : "border border-slate-200 bg-white text-slate-700 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-line">{message.content}</p>

        {!isUser && message.cards?.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {message.cards.map((card, index) => (
              <AICard key={`${card.title}-${index}`} card={card} />
            ))}
          </div>
        )}

        {!isUser && message.actions?.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                onClick={() => navigate(action.route)}
                className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
              >
                {action.label}
                <ArrowRight size={14} />
              </button>
            ))}
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

function AICard({ card }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    red: "bg-red-50 text-red-700 border-red-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  }

  return (
    <div
      className={`rounded-xl border p-3 ${
        tones[card.tone] || tones.slate
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-wide opacity-75">
        {card.title}
      </p>
      <p className="mt-1 text-xl font-black">{card.value}</p>
      <p className="mt-1 text-[11px] font-bold opacity-75">
        {card.subtitle}
      </p>
    </div>
  )
}

export default AIChatMessage