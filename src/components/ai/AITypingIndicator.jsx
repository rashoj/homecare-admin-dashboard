function AITypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:240ms]" />
      <span className="ml-2">CareBridge is thinking...</span>
    </div>
  )
}

export default AITypingIndicator