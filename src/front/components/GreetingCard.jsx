export default function GreetingCard({ caloriesPercent }) {
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dateStr = now
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  return (
    <div className="greeting-card">
      <div className="greeting-date">{dateStr}</div>
      <h1 className="greeting-title">
        Good <span>{timeOfDay}.</span>
      </h1>
      <p className="greeting-sub">What did you eat today?</p>
      <p className="greeting-calories">{caloriesPercent}% of daily calories used</p>
    </div>
  );
}