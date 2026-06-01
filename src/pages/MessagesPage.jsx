import { useEffect, useState } from "react"
import { MessageSquare, Send, RefreshCw } from "lucide-react"

function MessagesPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyMessage, setReplyMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [debugUserId, setDebugUserId] = useState(null)

  const user = getUser()
  const activeUserId = debugUserId || user?.id

  useEffect(() => {
    if (activeUserId) {
      loadConversations()
    }
  }, [activeUserId])

  async function loadConversations() {
    try {
      setLoading(true)

      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        `http://localhost:8080/api/messages/conversations/user/${activeUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to load conversations.")
      }

      const data = await response.json()
      setConversations(data)

      if (data.length > 0) {
        await openConversation(data[0])
      } else {
        setSelectedConversation(null)
        setMessages([])
      }
    } catch (error) {
      alert(error.message || "Failed to load conversations.")
    } finally {
      setLoading(false)
    }
  }

  async function openConversation(conversation) {
    try {
      setSelectedConversation(conversation)

      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        `http://localhost:8080/api/messages/conversations/${conversation.id}/user/${activeUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to load messages.")
      }

      setMessages(await response.json())
    } catch (error) {
      alert(error.message || "Failed to load messages.")
    }
  }

  async function sendReply(e) {
    e.preventDefault()

    if (!selectedConversation || !replyMessage.trim()) {
      return
    }

    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        `http://localhost:8080/api/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderUserId: activeUserId,
            messageBody: replyMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send message.")
      }

      setReplyMessage("")
      await openConversation(selectedConversation)
      await loadConversations()
    } catch (error) {
      alert(error.message || "Failed to send message.")
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading messages...</p>
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="font-bold">Debug Login Info</p>
        <p>User ID: {user?.id || "Missing"}</p>
        <p>Name: {user?.name || user?.fullName || "Missing"}</p>
        <p>Role: {user?.role || "Missing"}</p>
        <p>Active Query User ID: {activeUserId || "Missing"}</p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setDebugUserId(2)}
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
          >
            Force Admin ID 2
          </button>

          <button
            onClick={() => {
              setDebugUserId(null)
              loadConversations()
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 font-bold text-white"
          >
            <RefreshCw size={15} />
            Reload
          </button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
          Communication Center
        </p>

        <h2 className="mt-2 text-4xl font-black text-slate-900">
          Messages
        </h2>

        <p className="mt-2 text-slate-500">
          Review and respond to secure family and agency conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <MessageSquare size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Inbox
              </h3>
              <p className="text-sm text-slate-500">
                {conversations.length} conversations
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-500">
                No conversations found.
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => openConversation(conversation)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedConversation?.id === conversation.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-900">
                      {conversation.subject}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {conversation.lastMessage || "No messages yet."}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(conversation.lastMessageAt || conversation.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="flex min-h-[680px] flex-col rounded-3xl bg-white shadow-sm">
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <MessageSquare size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    Select a conversation
                  </h3>

                  <p className="mt-2 text-slate-500">
                    Choose a conversation from the inbox to respond.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 p-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedConversation.subject}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedConversation.type}
                  </p>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-6">
                  {messages.length === 0 ? (
                    <p className="text-slate-500">No messages yet.</p>
                  ) : (
                    messages.map((message) => {
                      const isMine = message.senderUserId === activeUserId

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                              isMine
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-800"
                            }`}
                          >
                            <p className="text-sm font-bold">
                              {message.senderName}
                            </p>

                            <p className="mt-2 whitespace-pre-wrap">
                              {message.messageBody}
                            </p>

                            <p
                              className={`mt-2 text-xs ${
                                isMine ? "text-blue-100" : "text-slate-400"
                              }`}
                            >
                              {formatDate(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <form onSubmit={sendReply} className="border-t border-slate-100 p-4">
                  <div className="flex gap-3">
                    <input
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
                    >
                      <Send size={18} />
                      Send
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getUser() {
  const savedUser = localStorage.getItem("homecare_user")
  return savedUser ? JSON.parse(savedUser) : { id: null }
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

export default MessagesPage