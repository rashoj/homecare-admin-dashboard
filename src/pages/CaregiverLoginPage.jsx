import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { saveAuth } from "../services/authStorage"

function CaregiverLoginPage({ onLogin }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setLoading(true)
      setErrorMessage("")

      const response = await api.post("/auth/login", formData)
      const data = response.data

      console.log("CAREGIVER LOGIN RESPONSE:", data)

      const role = data.role?.replace("ROLE_", "")

      if (role !== "CAREGIVER") {
        setErrorMessage("This login is only for caregivers.")
        return
      }

      const token = data.token || data.jwt || data.accessToken

      if (!token) {
        setErrorMessage("Login succeeded, but token was missing.")
        return
      }

      const user = {
        id: data.id,
        fullName: data.fullName,
        name: data.fullName || data.email,
        email: data.email,
        role: "CAREGIVER",
      }

      saveAuth(token, user)

      if (onLogin) {
        onLogin(user)
      }

      navigate("/caregiver", { replace: true })
    } catch (error) {
      console.error("CAREGIVER LOGIN ERROR:", error)
      setErrorMessage(
        error.response?.data?.message || "Invalid email or password."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-slate-800">
          Caregiver Login
        </h1>

        <p className="mt-2 text-slate-500">
          Sign in to view today&apos;s assigned visit.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CaregiverLoginPage