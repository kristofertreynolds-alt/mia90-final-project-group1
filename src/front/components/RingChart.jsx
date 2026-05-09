export default function RingChart({ value, goal, color, label, unit = "" }) {
  const pct = Math.min(value / goal, 1);
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = pct * circ;

  return (
    <div className="macro-item">
      <div className="ring-wrap">
        <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
          <circle cx="35" cy="35" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="7" />
          <circle
            cx="35" cy="35" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="ring-center">
          <span className="ring-value" style={{ color }}>{value}</span>
          <span className="ring-goal">/{goal}{unit}</span>
        </div>
      </div>
      <div className="macro-label">{label}</div>
    </div>
  );
}