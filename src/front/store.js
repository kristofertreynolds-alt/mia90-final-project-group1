export const initialStore = () => {
  return {
    message: null,
    meals: [],
    token: sessionStorage.getItem("token") || null,
    user: JSON.parse(sessionStorage.getItem("user")) || null,
    dailyGoals: { calories: 2000, protein: 150, carbs: 250, fat: 65 }
  }
}

export default function storeReducer(store, action = {}) {
    switch (action.type) {
    case 'login':
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      return { ...store, token: action.payload.token, user: action.payload.user };

    case 'logout':
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return { ...store, token: null, user: null, meals: [] };

    case 'set_meals':
      return { ...store, meals: action.payload };

    case 'add_meal':
      return { ...store, meals: [action.payload, ...store.meals] };

    case 'delete_meal':
      return { ...store, meals: store.meals.filter((meal) => meal.id !== action.payload) };

    case 'set_goals':
      return { ...store, dailyGoals: action.payload };

    case 'update_user':
    return {
        ...store,
        user: { ...store.user, ...action.payload }
    };

    default:
      throw Error('Unknown action.');
  }
}
