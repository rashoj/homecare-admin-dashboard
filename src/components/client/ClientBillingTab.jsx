import { useEffect, useState } from "react"

function ClientBillingTab({ clientId }) {
  const [billingRecords, setBillingRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadBillingRecords() {
      try {
        setLoading(true)
        setErrorMessage("")

        const token = localStorage.getItem("homecare_auth_token")

        const response = await fetch(
          `http://localhost:8080/api/billing-records/client/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load billing records.")
        }

        const data = await response.json()
        setBillingRecords(data)
      } catch (error) {
        setErrorMessage(error.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      loadBillingRecords()
    }
  }, [clientId])

  if (loading) {
    return <p className="text-gray-500">Loading billing records...</p>
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>
  }

  if (billingRecords.length === 0) {
    return <p className="text-gray-500">No billing records found for this client.</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Billing Records</h2>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Service Date</th>
              <th className="px-4 py-3">Authorization</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Claim #</th>
              <th className="px-4 py-3">Paid</th>
            </tr>
          </thead>

          <tbody>
            {billingRecords.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="px-4 py-3 text-gray-700">
                  {record.serviceDate || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {record.authorizationNumber || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {Number(record.units || 0).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  ${Number(record.billingRate || 0).toFixed(2)}
                </td>

                <td className="px-4 py-3 font-semibold text-gray-900">
                  ${Number(record.amount || 0).toFixed(2)}
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {record.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {record.claimNumber || "—"}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  ${Number(record.paidAmount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClientBillingTab