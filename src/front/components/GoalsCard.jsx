function GoalRow({ name, value, goal, color, unit = "" }) {
  const pct = Math.min(Math.round((value / goal) * 100), 100);
  return (
    <div className="goal-row">
      <div className="goal-row-header">
        <span className="goal-name">{name}</span>
        <span className="goal-value" style={{ color }}>
          {value}{unit}
          <span style={{ color: "#888", fontWeight: 400 }}> / {goal}{unit}</span>
        </span>
      </div>
      <div className="goal-bar-bg">
        <div className="goal-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="goal-bar-meta">
        <span>0</span>
        <span className="goal-pct" style={{ color }}>{pct}%</span>
        <span>Goal: {goal}{unit}</span>
      </div>
    </div>
  );
}

export default function GoalsCard({ totals, goals }) {
  return (
    <div className="goals-card">
      <div className="goals-progress-label">Progress</div>
      <div className="goals-title">Goals</div>
      <GoalRow name="Calories" value={totals.calories} goal={goals.calories} color="#f97316" />
      <GoalRow name="Protein"  value={totals.protein}  goal={goals.protein}  color="#3b82f6" unit="g" />
      <GoalRow name="Carbs"    value={totals.carbs}    goal={goals.carbs}    color="#eab308" unit="g" />
      <GoalRow name="Fat"      value={totals.fat}      goal={goals.fat}      color="#a855f7" unit="g" />
    </div>
  );
}