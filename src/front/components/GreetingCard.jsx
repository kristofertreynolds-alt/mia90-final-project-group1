export default function GreetingCard({ caloriesPercent, userName = "there" }) {
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
        Good {timeOfDay}, <span>{userName}.</span>
      </h1>
      <p className="greeting-sub">What did you eat today?</p>
    </div>
  );
}