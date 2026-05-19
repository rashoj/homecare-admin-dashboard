// import api from "../api/axios"

// export const login = async (email, password) => {

//   const response = await api.post("/auth/login", {
//     email,
//     password,
//   })

//   return response.data
// }
import api from "../api/axios"

export async function login(credentials) {
  const response = await api.post("/auth/login", credentials, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  return response.data
}

export async function register(payload) {
  const response = await api.post("/auth/register", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  return response.data
}