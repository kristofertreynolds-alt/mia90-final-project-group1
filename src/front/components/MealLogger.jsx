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
          <button className="icon-btn">🎙️</button>
          <button className="icon-btn">📷</button>
        </div>
        <button className="log-meal-btn" onClick={handleLog}>
          ✈️ Log meal
        </button>
      </div>
    </div>
  );
}