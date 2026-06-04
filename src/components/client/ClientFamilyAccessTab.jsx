import { useState } from "react"
import {
  createFamilyUser,
  assignFamilyAccess,
} from "../../services/familyAccessService"

function ClientFamilyAccessTab({ clientId }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  })

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const familyUser = await createFamilyUser(formData)

      await assignFamilyAccess({
        clientId: Number(clientId),
        familyUserId: familyUser.id,
      })

      alert("Family member created and linked successfully.")

      setFormData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
      })
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.message ||
          "Failed to create family access."
      )
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Family Access
      </h2>

      <p className="mt-2 text-slate-500">
        Create a family login for this client.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 max-w-xl"
      >
        <input
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({
              ...formData,
              phoneNumber: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Temporary Password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          Create Family Login
        </button>
      </form>
    </div>
  )
}

export default ClientFamilyAccessTab