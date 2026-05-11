import { useState } from "react";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MEAL_ICONS = { Breakfast: "☀️", Lunch: "🌤️", Dinner: "🌙", Snack: "🍎" };

function estimateNutrition(description) {
  const lower = description.toLowerCase();
  let calories = 300, protein = 20, carbs = 30, fat = 12;
  if (lower.includes("salad"))     { calories = 200; protein = 10; carbs = 15; fat = 10; }
  if (lower.includes("chicken"))   { calories += 150; protein += 30; }
  if (lower.includes("rice"))      { calories += 200; carbs += 45; }
  if (lower.includes("ice cream")) { calories = 279; protein = 5; carbs = 32; fat = 15; }
  if (lower.includes("pizza"))     { calories = 500; protein = 18; carbs = 60; fat = 20; }
  if (lower.includes("burger"))    { calories = 550; protein = 30; carbs = 45; fat = 28; }
  if (lower.includes("egg"))       { calories = 155; protein = 13; carbs = 1; fat = 11; }
  if (lower.includes("oatmeal"))   { calories = 300; protein = 10; carbs = 54; fat = 5; }
  return { calories, protein, carbs, fat };
}

export default function MealLogger({ onLogMeal }) {
  const [text, setText] = useState("");
  const [mealType, setMealType] = useState("Snack");

  const handleLog = () => {
    if (!text.trim()) return;
    const nutrition = estimateNutrition(text);
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    onLogMeal({
      id: Date.now(),
      type: mealType,
      icon: MEAL_ICONS[mealType],
      description: text.trim(),
      time: timeStr,
      ...nutrition,
    });
    setText("");
  };

  return (
    <div className="meal-logger-card">
      <div className="meal-type-buttons">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`meal-type-btn ${mealType === t ? "active" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>
      <textarea
        className="meal-logger-textarea"
        placeholder="Describe your meal..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleLog())
        }
      />
      <div className="meal-logger-footer">
        <div className="meal-logger-icons">
          <button className="icon-btn" title="Voice input">
            <svg width="18" height="18" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6"/>
            </svg>
          </button>
          <button className="icon-btn" title="Photo">
            <svg width="18" height="18" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>
        <button className="log-meal-btn" onClick={handleLog}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Log meal
        </button>
      </div>
    </div>
  );
}