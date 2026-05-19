// Calculates consecutive days streak from meals array
export const calculateStreak = (meals) => {
  if (!meals || meals.length === 0) return 0;

  // Get unique dates from meals, filter out null dates
  const mealDates = new Set(
    meals.map(meal => meal.date).filter(Boolean)
  );

  if (mealDates.size === 0) return 0;

  // Count consecutive days backwards from today
  let streak = 0;
  const checkDate = new Date();

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0]; // "2026-05-19"
    if (mealDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};