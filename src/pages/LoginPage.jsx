import { useState } from "react"
import { login } from "../services/authService"
import { saveAuth } from "../services/authStorage"

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
  e.preventDefault()

  try {
    setLoading(true)

const data = await login({
  email,
  password,
})
    console.log("LOGIN RESPONSE:", data)

    const token = data.token || data.jwt || data.accessToken

    if (!token) {
      alert("Login succeeded, but backend did not return a token.")
      return
    }

    const user = data.user || {
      id: data.id,
      name: data.name || data.fullName || data.email,
      email: data.email,
      role: data.role,
    }

    saveAuth(token, user)

    onLogin(user)
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    alert("Invalid credentials")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          HomeCare Admin
        </h1>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Email</label>

          <input
            type="email"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            placeholder="admin@homecare.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Password</label>

          <input
            type="password"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}

export default LoginPage