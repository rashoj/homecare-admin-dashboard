const actions = [
  "Summarize today's agency operations",
  "Show open shifts",
  "Review EVV exceptions",
  "Summarize incidents",
]

function AIQuickActions({ onSelect }) {
  return (
    <div className="border-b border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
        Quick Actions
      </p>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => onSelect(action)}
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AIQuickActions