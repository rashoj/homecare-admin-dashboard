import { useEffect, useState } from "react"
import { MessageSquare, Send, Plus } from "lucide-react"

function FamilyMessagesTab() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])

  const [subject, setSubject] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        "http://localhost:8080/api/family-portal/messages/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      setConversations(data)

      if (data.length > 0) {
        openConversation(data[0])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function openConversation(conversation) {
    try {
      setSelectedConversation(conversation)

      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        `http://localhost:8080/api/family-portal/messages/conversations/${conversation.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setMessages(await response.json())
    } catch (error) {
      console.error(error)
    }
  }

  async function createConversation() {
    if (!subject.trim()) {
      alert("Subject required")
      return
    }

    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        "http://localhost:8080/api/family-portal/messages/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            type: "FAMILY_AGENCY",
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      setSubject("")

      await loadConversations()
    } catch (error) {
      alert(error.message)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        `http://localhost:8080/api/family-portal/messages/conversations/${selectedConversation.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messageBody: newMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setNewMessage("")

      await openConversation(selectedConversation)
      await loadConversations()
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading messages...</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">
          Conversations
        </h2>

        <div className="mb-5 space-y-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Conversation subject"
            className="w-full rounded-xl border px-4 py-3"
          />

          <button
            onClick={createConversation}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white"
          >
            <Plus size={16} />
            New Conversation
          </button>
        </div>

        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => openConversation(conversation)}
              className={`cursor-pointer rounded-2xl p-4 transition ${
                selectedConversation?.id === conversation.id
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-slate-50"
              }`}
            >
              <h3 className="font-bold">
                {conversation.subject}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {conversation.lastMessage || "No messages yet"}
              </p>

              {conversation.unreadCount > 0 && (
                <div className="mt-2 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                  {conversation.unreadCount} unread
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow xl:col-span-2">
        {!selectedConversation ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquare
                size={60}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 text-slate-500">
                Select a conversation
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-2xl font-bold">
              {selectedConversation.subject}
            </h2>

            <div className="mb-6 max-h-[500px] space-y-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      {message.senderName}
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(
                        message.sentAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-700">
                    {message.messageBody}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
                placeholder="Type your message..."
                className="flex-1 rounded-xl border px-4 py-3"
              />

              <button
                onClick={sendMessage}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FamilyMessagesTab