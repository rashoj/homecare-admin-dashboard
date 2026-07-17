import { useState } from "react"
import { Bot, Send, X, Sparkles } from "lucide-react"
import { askCareBridgeAI } from "../../services/aiCopilotService"
import AIChatMessage from "./AIChatMessage"
import AIQuickActions from "./AIQuickActions"
import AITypingIndicator from "./AITypingIndicator"

function AICopilotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m CareBridge Copilot. Ask me about today’s operations, EVV alerts, open shifts, or incidents.",
      cards: [],
      actions: [],
    },
  ])

 async function sendMessage(messageText) {
  const message = messageText || input

  if (!message.trim() || loading) {
    return
  }

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: message,
    },
  ])

  setInput("")
  setLoading(true)

  try {
    const data = await askCareBridgeAI(message)

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          data.answer ||
          "I could not generate a response.",

        cards: Array.isArray(data.cards)
          ? data.cards
          : [],

        actions: Array.isArray(data.actions)
          ? data.actions
          : [],

        details: Array.isArray(data.details)
          ? data.details
          : [],

        category: data.category || null,

        severity: data.severity || null,
      },
    ])
  } catch (error) {
    console.error(
      "CareBridge Copilot request failed:",
      error
    )

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "I’m having trouble connecting to CareBridge AI right now. Please try again.",
        cards: [],
        actions: [],
        details: [],
        category: null,
        severity: null,
      },
    ])
  } finally {
    setLoading(false)
  }
}

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-blue-700 px-5 py-4 font-black text-white shadow-2xl shadow-blue-900/30 transition hover:-translate-y-1 hover:bg-blue-800"
        >
          <Bot size={22} />
          CareBridge AI
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[720px] w-[460px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/25">
          <div className="bg-gradient-to-br from-blue-800 to-indigo-700 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Sparkles size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-black">CareBridge Copilot</h3>
                  <p className="text-xs font-semibold text-blue-100">
                    Enterprise Operations Assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat label="Ask" value="Summary" />
              <MiniStat label="Review" value="EVV" />
              <MiniStat label="Check" value="Risk" />
            </div>
          </div>

          <AIQuickActions onSelect={sendMessage} />

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
            {messages.map((message, index) => (
              <AIChatMessage key={index} message={message} />
            ))}

            {loading && <AITypingIndicator />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CareBridge..."
                className="w-full bg-transparent text-sm outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-700 p-2 text-white hover:bg-blue-800 disabled:bg-slate-300"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-[11px] font-bold text-blue-100">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  )
}

export default AICopilotWidget