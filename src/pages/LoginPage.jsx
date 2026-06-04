import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/authService"
import { saveAuth } from "../services/authStorage"

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    try {
      setLoading(true)

      const data = await login({ email, password })

      if (data.role !== "ADMIN") {
        alert("This login is only for admins.")
        return
      }

      const token = data.token || data.jwt || data.accessToken

      if (!token) {
        alert("Login succeeded, but backend did not return a token.")
        return
      }

      const user = {
        id: data.id,
        fullName: data.fullName,
        name: data.fullName || data.email,
        email: data.email,
        role: data.role,
      }

      saveAuth(token, user)

      if (onLogin) {
        onLogin(user)
      }

navigate("/dashboard", { replace: true })
    } catch (error) {
      console.error("LOGIN ERROR:", error)
      alert(error.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-3xl font-bold text-slate-800">
          HomeCare Admin
        </h1>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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