import { useState } from "react";

export default function LoggedMeals({ meals, onDelete }) {
  const [expanded, setExpanded] = useState(null);

  if (meals.length === 0) return null;

  return (
    <div className="logged-meals-section">
      <div className="logged-meals-title">Logged Meals</div>
      {meals.map((meal) => (
        <div key={meal.id}>
          <div
            className="meal-card"
            onClick={() => setExpanded(expanded === meal.id ? null : meal.id)}
          >
            <div className="meal-icon">{meal.icon}</div>
            <div className="meal-info">
              <div className="meal-header">
                <span className="meal-type">{meal.type}</span>
                <span className="meal-time">🕐 {meal.time}</span>
              </div>
              <div className="meal-desc">{meal.description}</div>
              <div className="meal-macros">
                <span className="cal">{meal.calories} cal</span>
                <span className="p">{meal.protein}g P</span>
                <span className="c">{meal.carbs}g C</span>
                <span className="f">{meal.fat}g F</span>
              </div>
            </div>
            <div className="meal-chevron">{expanded === meal.id ? "▲" : "▼"}</div>
          </div>

          {expanded === meal.id && (
            <div className="meal-expanded">
              <strong>Full description:</strong> {meal.description}
              <br />
              <strong>Nutrition:</strong> {meal.calories} kcal · {meal.protein}g protein ·{" "}
              {meal.carbs}g carbs · {meal.fat}g fat
              <br />
              <button className="btn-delete" onClick={() => onDelete(meal.id)}>
                🗑 Delete meal
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}