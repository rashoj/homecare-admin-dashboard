import { useEffect, useState } from "react"
import { Mail, User, Shield } from "lucide-react"

function FamilyCareTeamTab() {
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    loadCareTeam()
  }, [])

  async function loadCareTeam() {
    try {
      const token = localStorage.getItem("homecare_auth_token")

      const response = await fetch(
        "http://localhost:8080/api/family-portal/care-team",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to load care team.")
      }

      setCaregivers(await response.json())
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading care team...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Care Team
        </h2>

        <p className="mt-2 text-slate-500">
          Caregivers currently assigned to your loved one.
        </p>
      </div>

      {caregivers.length === 0 ? (
        <p className="text-slate-500">
          No caregivers assigned.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {caregivers.map((caregiver) => (
            <div
              key={caregiver.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <User className="text-blue-700" size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {caregiver.caregiverName}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {caregiver.caregiverRole}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail size={16} />
                  {caregiver.caregiverEmail}
                </div>

                {caregiver.primaryCaregiver && (
                  <div className="flex items-center gap-2 rounded-xl bg-green-100 px-3 py-2 text-sm font-semibold text-green-700">
                    <Shield size={16} />
                    Primary Caregiver
                  </div>
                )}

                <div className="rounded-xl bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 font-semibold text-green-600">
                    Active
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FamilyCareTeamTab