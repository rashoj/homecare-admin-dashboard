import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FraudDashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFraudData = async () => {
    try {
      setLoading(true);
      const [summaryRes, alertsRes] = await Promise.all([
        api.get("/fraud-alerts/summary"),
        api.get("/fraud-alerts/open"),
      ]);

      setSummary(summaryRes.data);
      setAlerts(alertsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    await api.put(`/fraud-alerts/${id}/resolve`);
    loadFraudData();
  };

  useEffect(() => {
    loadFraudData();
  }, []);

  if (loading) return <div className="p-6">Loading fraud dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fraud Intelligence Center</h1>
        <p className="text-gray-500">
          Detect suspicious EVV, MAR, visit, and billing activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Open Alerts" value={summary?.openAlerts ?? 0} />
        <Card title="High Alerts" value={summary?.highAlerts ?? 0} />
        <Card title="Critical Alerts" value={summary?.criticalAlerts ?? 0} />
        <Card title="Total Risk Score" value={summary?.totalRiskScore ?? 0} />
      </div>

      <div className="bg-white rounded-xl shadow border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Open Fraud Alerts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Alert</th>
                <th className="p-3">Caregiver</th>
                <th className="p-3">Client</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Visit</th>
                <th className="p-3">Detected</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-t">
                  <td className="p-3 font-semibold">{alert.severity}</td>
                  <td className="p-3">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-gray-500">{alert.description}</div>
                  </td>
                  <td className="p-3">{alert.caregiverName || "-"}</td>
                  <td className="p-3">{alert.clientName || "-"}</td>
                  <td className="p-3">{alert.riskScore}</td>
                  <td className="p-3">#{alert.visitId}</td>
                  <td className="p-3">
                    {alert.detectedAt
                      ? new Date(alert.detectedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 rounded bg-black text-white text-xs"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">
                    No open fraud alerts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow border p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}