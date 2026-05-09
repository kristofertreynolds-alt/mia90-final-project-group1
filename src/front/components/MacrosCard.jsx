import RingChart from "./RingChart";

export default function MacrosCard({ totals, goals }) {
  return (
    <div className="macros-card">
      <div className="macros-title">Today's Macros</div>
      <div className="macros-grid">
        <RingChart value={totals.calories} goal={goals.calories} color="#f97316" label="Calories" />
        <RingChart value={totals.protein}  goal={goals.protein}  color="#3b82f6" label="Protein"  unit="g" />
        <RingChart value={totals.carbs}    goal={goals.carbs}    color="#eab308" label="Carbs"    unit="g" />
        <RingChart value={totals.fat}      goal={goals.fat}      color="#a855f7" label="Fat"      unit="g" />
      </div>
    </div>
  );
}