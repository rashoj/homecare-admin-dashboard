import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/authService"
import { saveAuth } from "../services/authStorage"

function FamilyLoginPage({ onLogin }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    try {
      setLoading(true)

      const data = await login({ email, password })

      if (data.role !== "FAMILY_MEMBER") {
        alert("This login is only for family members.")
        return
      }

      const user = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      }

      saveAuth(data.token, user)
      onLogin(user)

      navigate("/family-portal")
    } catch (error) {
      console.error(error)
      alert("Invalid family login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Family Portal
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Family Sign In
        </h1>

        <p className="mt-2 text-slate-500">
          View care updates, visits, documents, and medication information.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="family@test.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}

export default FamilyLoginPage