import axios from "axios"
import { getToken } from "../services/authStorage"

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
  //baseURL: "http://localhost:8080/api",
  baseURL: import.meta.env.VITE_API_BASE_URL
})

api.interceptors.request.use(
  (config) => {
    const isAuthRequest =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register")

    if (!isAuthRequest) {
      const token = getToken()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default api