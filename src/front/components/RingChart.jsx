export default function RingChart({ value, goal, color, label, unit = "" }) {
  const pct = Math.min(value / goal, 1);
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = pct * circ;

  return (
    <div className="macro-item">
      <div className="ring-wrap">
        <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
          <circle
            cx="45" cy="45" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
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