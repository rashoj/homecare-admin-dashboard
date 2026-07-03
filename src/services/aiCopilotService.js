import api from "../api/axios"

export async function askCareBridgeAI(message) {
  const response = await api.post("/ai-copilot/ask", {
    message,
  })

  return response.data
}

export async function getAIOperationsCenter() {
  const response = await api.get("/ai-copilot/operations-center")
  return response.data
}