import { useState } from "react";
import GreetingCard from "../components/GreetingCard";
import MealLogger from "../components/MealLogger";
import MacrosCard from "../components/MacrosCard";
import GoalsCard from "../components/GoalsCard";
import LoggedMeals from "../components/LoggedMeals";
import { Navbar } from "../components/Navbar";

const dailyGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

const initialMeals = [
  {
    id: 1, type: "Snack", icon: "🍎",
    description: "One bowl of vanilla ice cream.",
    time: "11:00 PM", calories: 279, protein: 5, carbs: 32, fat: 15,
  },
  {
    id: 2, type: "Lunch", icon: "🌤️",
    description: "One bowl of caesar salad with 4 oz of grilled chicken",
    time: "10:33 PM", calories: 661, protein: 48, carbs: 25, fat: 42,
  },
];

export const Home = () => {
  const [meals, setMeals] = useState(initialMeals);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleLogMeal = (newMeal) => setMeals((prev) => [newMeal, ...prev]);
  const handleDeleteMeal = (id) => setMeals((prev) => prev.filter((m) => m.id !== id));
  

  return (
    <div className="app-bg">
      <div className="container-app">
        <Navbar />
        <GreetingCard
          caloriesPercent={Math.round((totals.calories / dailyGoals.calories) * 100)}
          userName="Jorge"
        />
        <MealLogger onLogMeal={handleLogMeal} />
        <MacrosCard totals={totals} goals={dailyGoals} />
        <GoalsCard totals={totals} goals={dailyGoals} />
        <LoggedMeals meals={meals} onDelete={handleDeleteMeal} />
      </div>
    </div>
);
};