import api from "../api/axios"

export async function createFamilyUser(payload) {
  const response = await api.post("/auth/register", {
    ...payload,
    role: "FAMILY_MEMBER",
  })

  return response.data
}

export async function assignFamilyAccess(payload) {
  const response = await api.post(
    "/client-family-access",
    payload
  )

  return response.data
}