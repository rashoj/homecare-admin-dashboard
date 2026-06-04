import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("homecare_auth_token")

  const isValidJwt =
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.split(".").length === 3

  if (isValidJwt) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api