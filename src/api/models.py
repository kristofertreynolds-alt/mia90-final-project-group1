from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    # Relationships
    profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="user", uselist=False)
    meals: Mapped[list["Meal"]] = relationship("Meal", back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
        }


class UserProfile(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), unique=True)

    # Profile
    full_name: Mapped[str] = mapped_column(String(120), nullable=True)
    age: Mapped[int] = mapped_column(Integer(), nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)

    # Body — metric
    weight_kg: Mapped[float] = mapped_column(Float(), nullable=True)
    height_cm: Mapped[float] = mapped_column(Float(), nullable=True)

    # Preferences
    unit: Mapped[str] = mapped_column(String(10), nullable=True)  # "imperial" o "metric" — solo para saber cómo mostrar
    activity: Mapped[str] = mapped_column(String(30), nullable=True)
    weight_goal: Mapped[str] = mapped_column(String(30), nullable=True)
    weekly_rate: Mapped[float] = mapped_column(Float(), nullable=True)

    # Goals
    goal_calories: Mapped[int] = mapped_column(Integer(), nullable=True)
    goal_protein: Mapped[int] = mapped_column(Integer(), nullable=True)
    goal_carbs: Mapped[int] = mapped_column(Integer(), nullable=True)
    goal_fat: Mapped[int] = mapped_column(Integer(), nullable=True)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="profile")

    def serialize(self):
        return {
            "profile": {
                "name":   self.full_name,
                "age":    self.age,
                "gender": self.gender,
            },
            "health": {
                "weight_kg": self.weight_kg,
                "height_cm": self.height_cm,
            },
            "unit":       self.unit,
            "activity":   self.activity,
            "weightGoal": self.weight_goal,
            "weeklyRate": self.weekly_rate,
            "goals": {
                "calories": self.goal_calories or 2000,
                "protein":  self.goal_protein  or 150,
                "carbs":    self.goal_carbs    or 250,
                "fat":      self.goal_fat      or 65,
            }
        }


class Meal(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    type: Mapped[str] = mapped_column(String(20), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    time: Mapped[str] = mapped_column(String(20), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="meals")
    nutrition: Mapped["Nutrition"] = relationship("Nutrition", back_populates="meal", uselist=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "description": self.description,
            "time": self.time,
            "icon": self._get_icon(),
            "calories": self.nutrition.calories if self.nutrition else 0,
            "protein": self.nutrition.protein if self.nutrition else 0,
            "carbs": self.nutrition.carbs if self.nutrition else 0,
            "fat": self.nutrition.fat if self.nutrition else 0,
        }

    def _get_icon(self):
        icons = {"Breakfast": "☀️", "Lunch": "🌤️", "Dinner": "🌙", "Snack": "🍎"}
        return icons.get(self.type, "🍽️")


class Nutrition(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meal.id"))
    calories: Mapped[int] = mapped_column(Integer(), nullable=False)
    protein: Mapped[float] = mapped_column(Float(), nullable=False)
    carbs: Mapped[float] = mapped_column(Float(), nullable=False)
    fat: Mapped[float] = mapped_column(Float(), nullable=False)

    # Relationship
    meal: Mapped["Meal"] = relationship("Meal", back_populates="nutrition")

    def serialize(self):
        return {
            "id": self.id,
            "meal_id": self.meal_id,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
        }