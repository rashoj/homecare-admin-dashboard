import { useEffect, useState } from "react"
import {
  createISPGoal,
  createISPPlan,
  getActiveISPGoalsByClient,
  getISPPlansByClient,
  getISPProgressByClient,
} from "../../services/ispApi"

function ClientISPGoalsTab({ clientId }) {
  const [plans, setPlans] = useState([])
  const [goals, setGoals] = useState([])
  const [progressLogs, setProgressLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const [planForm, setPlanForm] = useState({
    planName: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const [goalForm, setGoalForm] = useState({
    ispPlanId: "",
    goalTitle: "",
    goalDescription: "",
    category: "ADL",
    targetDate: "",
  })

  useEffect(() => {
    loadData()
  }, [clientId])

  async function loadData() {
    try {
      setLoading(true)

      const [plansData, goalsData, progressData] = await Promise.all([
        getISPPlansByClient(clientId),
        getActiveISPGoalsByClient(clientId),
        getISPProgressByClient(clientId),
      ])

      console.log("CLIENT ID FROM PAGE:", clientId)
    console.log("ISP PLANS FROM API:", plansData)

      setPlans(plansData)
      setGoals(goalsData)
      setProgressLogs(progressData)

      if (plansData.length > 0) {
        setGoalForm((prev) => ({
          ...prev,
          ispPlanId: String(prev.ispPlanId || plansData[0].id),
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePlan(e) {
    e.preventDefault()

    const createdPlan = await createISPPlan({
      clientId: Number(clientId),
      ...planForm,
    })

    setPlanForm({
      planName: "",
      startDate: "",
      endDate: "",
      notes: "",
    })

    setGoalForm((prev) => ({
      ...prev,
      ispPlanId: String(createdPlan.id),
    }))

    await loadData()
    alert("ISP plan created.")
  }

  async function handleCreateGoal(e) {
    e.preventDefault()

    if (!goalForm.ispPlanId) {
      alert("Please select an ISP plan first.")
      return
    }

    await createISPGoal({
      clientId: Number(clientId),
      ispPlanId: Number(goalForm.ispPlanId),
      goalTitle: goalForm.goalTitle,
      goalDescription: goalForm.goalDescription,
      category: goalForm.category,
      targetDate: goalForm.targetDate,
    })

    setGoalForm((prev) => ({
      ...prev,
      goalTitle: "",
      goalDescription: "",
      category: "ADL",
      targetDate: "",
    }))

    await loadData()
    alert("ISP goal created.")
  }

  if (loading) {
    return <p className="text-slate-500">Loading ISP goals...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">ISP / Goals</h2>
        <p className="mt-1 text-slate-500">
          Manage client ISP plans, goals, and progress tracking.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={handleCreatePlan}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Create ISP Plan
          </h3>

          <div className="space-y-3">
            <input
              value={planForm.planName}
              onChange={(e) =>
                setPlanForm({ ...planForm, planName: e.target.value })
              }
              placeholder="Plan name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                value={planForm.startDate}
                onChange={(e) =>
                  setPlanForm({ ...planForm, startDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="date"
                value={planForm.endDate}
                onChange={(e) =>
                  setPlanForm({ ...planForm, endDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <textarea
              value={planForm.notes}
              onChange={(e) =>
                setPlanForm({ ...planForm, notes: e.target.value })
              }
              placeholder="Plan notes"
              rows="3"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
              Create Plan
            </button>
          </div>
        </form>

        <form
          onSubmit={handleCreateGoal}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Create Goal
          </h3>

          <div className="space-y-3">
            <select
              value={goalForm.ispPlanId}
              onChange={(e) =>
                setGoalForm({ ...goalForm, ispPlanId: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            >
              <option value="">Select ISP Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={String(plan.id)}>
                  {plan.planName}
                </option>
              ))}
            </select>

            <input
              value={goalForm.goalTitle}
              onChange={(e) =>
                setGoalForm({ ...goalForm, goalTitle: e.target.value })
              }
              placeholder="Goal title"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />

            <textarea
              value={goalForm.goalDescription}
              onChange={(e) =>
                setGoalForm({
                  ...goalForm,
                  goalDescription: e.target.value,
                })
              }
              placeholder="Goal description"
              rows="3"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={goalForm.category}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, category: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="ADL">ADL</option>
                <option value="BEHAVIOR">Behavior</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="COMMUNITY">Community</option>
                <option value="SAFETY">Safety</option>
              </select>

              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, targetDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <button className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
              Create Goal
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
  <h3 className="mb-4 text-lg font-bold text-slate-800">
    ISP Plans
  </h3>

  {plans.length === 0 ? (
    <p className="text-slate-500">No ISP plans found.</p>
  ) : (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-800">
                {plan.planName}
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                {plan.startDate} → {plan.endDate}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {plan.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-700">
            {plan.notes || "No notes provided."}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Active ISP Goals
          </h3>

          {goals.length === 0 ? (
            <p className="text-slate-500">No active goals found.</p>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {goal.goalTitle}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {goal.goalDescription}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {goal.category}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    Target: {goal.targetDate || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Progress History
          </h3>

          {progressLogs.length === 0 ? (
            <p className="text-slate-500">No goal progress logged yet.</p>
          ) : (
            <div className="space-y-4">
              {progressLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h4 className="font-bold text-slate-800">
                    {log.goalTitle}
                  </h4>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge text={log.progressStatus} color="green" />
                    <Badge text={log.promptLevel} color="blue" />
                  </div>

                  <p className="mt-3 text-sm text-slate-700">
                    {log.progressNote}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Badge({ text, color }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[color]}`}>
      {text}
    </span>
  )
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—"
}

export default ClientISPGoalsTab