import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/authService"
import { saveAuth } from "../services/authStorage"

function LoginPage({ onLogin }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogin(e) {
    e.preventDefault()

    try {
      setLoading(true)
      setErrorMessage("")

      const data = await login({ email, password })

      const token = data.token || data.jwt || data.accessToken

      const userFromResponse = data.user || data

      const user = {
        id: userFromResponse.id,
        fullName: userFromResponse.fullName,
        name:
          userFromResponse.fullName ||
          userFromResponse.name ||
          userFromResponse.email,
        email: userFromResponse.email,
        role: userFromResponse.role,
      }

      const allowedRoles = [
        "PLATFORM_OWNER",
        "PLATFORM_ADMIN",
        "AGENCY_ADMIN",
        "SCHEDULER",
        "SUPERVISOR",
        "FINANCE",
        "ADMIN",
      ]

      if (!allowedRoles.includes(user.role)) {
        setErrorMessage("This login is only for platform and agency staff.")
        return
      }

      if (!token) {
        setErrorMessage("Login succeeded, but backend did not return a token.")
        return
      }

      saveAuth(token, user)

      if (onLogin) {
        onLogin(user)
      }

      if (user.role === "PLATFORM_OWNER" || user.role === "PLATFORM_ADMIN") {
        navigate("/platform-dashboard", { replace: true })
        return
      }

      navigate("/dashboard", { replace: true })
    } catch (error) {
      console.error("LOGIN ERROR:", error)
      setErrorMessage(error.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
      >
        <h1 className="mb-2 text-3xl font-bold text-slate-800">
          Homecare Staff Login
        </h1>

        <p className="mb-6 text-sm text-slate-500">
          Sign in as platform owner, platform admin, or agency staff.
        </p>

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="admin@homecare.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}

export default LoginPage