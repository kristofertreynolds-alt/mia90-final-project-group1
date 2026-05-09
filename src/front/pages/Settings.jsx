import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Settings = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [unit, setUnit] = useState("imperial");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
  });

  const [health, setHealth] = useState({
    weight: "",
    height_ft: "",
    height_in: "",
    height_cm: "",
    weight_kg: "",
  });

  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  });

  const [activity, setActivity] = useState("moderate");
  const [weightGoal, setWeightGoal] = useState("maintain");
  const [weeklyRate, setWeeklyRate] = useState(0.5);

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const getWeightKg = () => {
    if (unit === "imperial") return parseFloat(health.weight) * 0.453592;
    return parseFloat(health.weight_kg);
  };

  const getHeightCm = () => {
    if (unit === "imperial") {
      return (parseFloat(health.height_ft) * 12 + parseFloat(health.height_in)) * 2.54;
    }
    return parseFloat(health.height_cm);
  };

  const getBMI = () => {
    const heightCm = getHeightCm();
    const weightKg = getWeightKg();
    if (!heightCm || !weightKg) return null;
    return (weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1);
  };

  const getBMR = () => {
    const weightKg = getWeightKg();
    const heightCm = getHeightCm();
    const age = parseFloat(profile.age);
    const gender = profile.gender;
    if (!weightKg || !heightCm || !age || !gender) return null;
    if (gender === "male") {
      return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
    } else if (gender === "female") {
      return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age);
    }
    return null;
  };

  const getTDEE = () => {
    const bmr = getBMR();
    if (!bmr) return null;
    return Math.round(bmr * activityMultipliers[activity]);
  };

  const getBMILabel = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
    if (bmi < 25)   return { label: "Healthy",     color: "#22c55e" };
    if (bmi < 30)   return { label: "Overweight",  color: "#eab308" };
    return { label: "Obese", color: "#ef4444" };
  };

  useEffect(() => {
    const tdee = getTDEE();
    if (!tdee) return;
    const weeklyRateKg = unit === "imperial" ? weeklyRate * 0.453592 : weeklyRate;
    const dailyDelta = Math.round((weeklyRateKg * 7700) / 7);
    let targetCalories = tdee;
    if (weightGoal === "lose") targetCalories = Math.max(1200, tdee - dailyDelta);
    if (weightGoal === "gain") targetCalories = tdee + dailyDelta;
    const protein = Math.round((targetCalories * 0.30) / 4);
    const fat     = Math.round((targetCalories * 0.25) / 9);
    const carbs   = Math.round((targetCalories * 0.45) / 4);
    setGoals({ calories: targetCalories, protein, carbs, fat });
  }, [activity, weightGoal, weeklyRate, health, profile.age, profile.gender, unit]);

  const bmi = getBMI();
  const bmr = getBMR();
  const tdee = getTDEE();
  const bmiInfo = getBMILabel(bmi);

  const handleSave = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem("token");
      const payload = { profile, health, goals, activity, unit, weightGoal, weeklyRate };
      const response = await fetch(`${backendUrl}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  return (
    <div className="app-bg">
      <div className="container-app">

        {/* Header */}
        <div className="settings-topbar">
          <button className="settings-back" onClick={() => navigate("/")}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <h1 className="settings-page-title">Settings</h1>
          <button className="settings-save-btn" onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save"}
          </button>
        </div>

        {/* 1. Units */}
        <div className="settings-card">
          <div className="settings-section-label">Units</div>
          <div className="unit-toggle">
            <button className={`unit-btn ${unit === "imperial" ? "active" : ""}`} onClick={() => setUnit("imperial")}>
              Imperial (lbs, ft)
            </button>
            <button className={`unit-btn ${unit === "metric" ? "active" : ""}`} onClick={() => setUnit("metric")}>
              Metric (kg, cm)
            </button>
          </div>
        </div>

        {/* 2. Profile */}
        <div className="settings-card">
          <div className="settings-section-label">Profile</div>
          <div className="settings-fields">
            <div className="settings-field">
              <label className="field-label">Full Name</label>
              <input className="field-input" type="text" placeholder="Jorge"
                value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="settings-field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" placeholder="jorge@email.com"
                value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div className="settings-field-row">
              <div className="settings-field">
                <label className="field-label">Age</label>
                <input className="field-input" type="number" placeholder="25"
                  value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
              </div>
              <div className="settings-field">
                <label className="field-label">Gender</label>
                <div className="gender-toggle">
                  {["male", "female", "other"].map((g) => (
                    <button
                      key={g}
                      className={`gender-btn ${profile.gender === g ? "active" : ""}`}
                      onClick={() => setProfile({ ...profile, gender: g })}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Health Metrics */}
        <div className="settings-card">
          <div className="settings-section-label">Health Metrics</div>
          <div className="settings-fields">
            {unit === "imperial" ? (
              <>
                <div className="settings-field">
                  <label className="field-label">Weight (lbs)</label>
                  <input className="field-input" type="number" placeholder="170"
                    value={health.weight} onChange={(e) => setHealth({ ...health, weight: e.target.value })} />
                </div>
                <div className="settings-field-row">
                  <div className="settings-field">
                    <label className="field-label">Height (ft)</label>
                    <input className="field-input" type="number" placeholder="5"
                      value={health.height_ft} onChange={(e) => setHealth({ ...health, height_ft: e.target.value })} />
                  </div>
                  <div className="settings-field">
                    <label className="field-label">Height (in)</label>
                    <input className="field-input" type="number" placeholder="11"
                      value={health.height_in} onChange={(e) => setHealth({ ...health, height_in: e.target.value })} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="settings-field">
                  <label className="field-label">Weight (kg)</label>
                  <input className="field-input" type="number" placeholder="77"
                    value={health.weight_kg} onChange={(e) => setHealth({ ...health, weight_kg: e.target.value })} />
                </div>
                <div className="settings-field">
                  <label className="field-label">Height (cm)</label>
                  <input className="field-input" type="number" placeholder="180"
                    value={health.height_cm} onChange={(e) => setHealth({ ...health, height_cm: e.target.value })} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. BMI */}
        <div className="settings-card">
          <div className="settings-section-label">BMI Calculator</div>
          {bmi ? (
            <div className="bmi-result">
              <div className="bmi-number" style={{ color: bmiInfo.color }}>{bmi}</div>
              <div className="bmi-label" style={{ color: bmiInfo.color }}>{bmiInfo.label}</div>
              <div className="bmi-bar-bg">
                <div className="bmi-bar-track">
                  <div className="bmi-segment" style={{ background: "#3b82f6", flex: 1 }} />
                  <div className="bmi-segment" style={{ background: "#22c55e", flex: 1 }} />
                  <div className="bmi-segment" style={{ background: "#eab308", flex: 1 }} />
                  <div className="bmi-segment" style={{ background: "#ef4444", flex: 1 }} />
                </div>
                <div className="bmi-indicator"
                  style={{ left: `${Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100)}%` }} />
              </div>
              <div className="bmi-range-labels">
                <span>Underweight</span>
                <span>Healthy</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>
          ) : (
            <div className="bmi-empty">Enter your height, weight, age and gender above to calculate your BMI</div>
          )}
        </div>

        {/* 5. Activity Level */}
        <div className="settings-card">
          <div className="settings-section-label">Activity Level</div>
          <div className="activity-options">
            {[
              { key: "sedentary",   label: "Sedentary",   desc: "Little or no exercise" },
              { key: "light",       label: "Light",       desc: "Exercise 1–3 days/week" },
              { key: "moderate",    label: "Moderate",    desc: "Exercise 3–5 days/week" },
              { key: "active",      label: "Active",      desc: "Exercise 6–7 days/week" },
              { key: "very_active", label: "Very Active", desc: "Hard exercise + physical job" },
            ].map((a) => (
              <div key={a.key}
                className={`activity-option ${activity === a.key ? "active" : ""}`}
                onClick={() => setActivity(a.key)}
              >
                <div className="activity-dot" />
                <div>
                  <div className="activity-label">{a.label}</div>
                  <div className="activity-desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. BMR */}
        <div className="settings-card bmr-card">
          <div className="settings-section-label">Basal Metabolic Rate (BMR)</div>
          {bmr ? (
            <div className="bmr-result">
              <div className="bmr-hero">
                <div className="bmr-number">{bmr.toLocaleString()}</div>
                <div className="bmr-unit">calories / day</div>
              </div>
              <div className="bmr-description">
                This is how many calories your body burns at complete rest — just to keep you alive.
              </div>
              {tdee && (
                <div className="tdee-section">
                  <div className="tdee-label">With your activity level</div>
                  <div className="tdee-number">{tdee.toLocaleString()}</div>
                  <div className="tdee-sublabel">Total Daily Energy Expenditure (TDEE)</div>
                  <div className="tdee-desc">
                    This is your true daily calorie burn. Eat at this number to maintain your weight.
                  </div>
                  <div className="bmr-breakdown">
                    <div className="bmr-stat">
                      <span className="bmr-stat-label">To lose weight</span>
                      <span className="bmr-stat-value" style={{ color: "#3b82f6" }}>{(tdee - 500).toLocaleString()} cal</span>
                    </div>
                    <div className="bmr-stat">
                      <span className="bmr-stat-label">To maintain</span>
                      <span className="bmr-stat-value" style={{ color: "#22c55e" }}>{tdee.toLocaleString()} cal</span>
                    </div>
                    <div className="bmr-stat">
                      <span className="bmr-stat-label">To gain weight</span>
                      <span className="bmr-stat-value" style={{ color: "#f97316" }}>{(tdee + 500).toLocaleString()} cal</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bmi-empty">Enter your height, weight, age and gender above to calculate your BMR</div>
          )}
        </div>

        {/* 7. Weight Goal */}
        <div className="settings-card">
          <div className="settings-section-label">Weight Goal</div>
          <div className="weight-goal-options">
            {[
              { key: "lose",     label: "Lose Weight",     icon: "↓", color: "#3b82f6" },
              { key: "maintain", label: "Maintain Weight", icon: "→", color: "#22c55e" },
              { key: "gain",     label: "Gain Weight",     icon: "↑", color: "#f97316" },
            ].map((w) => (
              <div key={w.key}
                className={`weight-goal-option ${weightGoal === w.key ? "active" : ""}`}
                style={weightGoal === w.key ? { borderColor: w.color, background: `${w.color}10` } : {}}
                onClick={() => setWeightGoal(w.key)}
              >
                <div className="weight-goal-icon" style={{ color: w.color }}>{w.icon}</div>
                <div className="weight-goal-label">{w.label}</div>
              </div>
            ))}
          </div>

          {weightGoal !== "maintain" && (
            <div className="rate-section">
              <div className="rate-header">
                <span className="field-label">Weekly {weightGoal === "lose" ? "loss" : "gain"} rate</span>
                <span className="rate-value">{weeklyRate} {unit === "imperial" ? "lbs" : "kg"} / week</span>
              </div>
              <input
                type="range"
                className="goal-slider"
                min={0.25}
                max={unit === "imperial" ? 2 : 1}
                step={0.25}
                value={weeklyRate}
                onChange={(e) => setWeeklyRate(parseFloat(e.target.value))}
              />
              <div className="rate-labels">
                <span>Slow & steady</span>
                <span>Aggressive</span>
              </div>
              <div className="rate-tip">
                {weeklyRate <= 0.5
                  ? "✓ This is a safe and sustainable rate"
                  : weeklyRate <= 1
                  ? "⚠ Moderate pace — stay consistent"
                  : "⚠ Aggressive — make sure you're eating enough nutrients"}
              </div>
            </div>
          )}
        </div>

        {/* 8. Daily Goals */}
        <div className="settings-card">
          <div className="settings-section-label">Daily Goals</div>
          {tdee && (
            <div className="goals-auto-badge">
              ✦ Auto-calculated based on your profile
            </div>
          )}
          <div className="settings-fields" style={{ marginTop: 16 }}>
            {[
              { key: "calories", label: "Calories", unit: "kcal", min: 1000, max: 5000, step: 50 },
              { key: "protein",  label: "Protein",  unit: "g",    min: 0,    max: 300,  step: 5  },
              { key: "carbs",    label: "Carbs",    unit: "g",    min: 0,    max: 600,  step: 5  },
              { key: "fat",      label: "Fat",      unit: "g",    min: 0,    max: 200,  step: 5  },
            ].map((g) => (
              <div key={g.key} className="goal-slider-row">
                <div className="goal-slider-header">
                  <span className="goal-slider-label">{g.label}</span>
                  <span className="goal-slider-value">
                    {goals[g.key]} <span className="goal-slider-unit">{g.unit}</span>
                  </span>
                </div>
                <input
                  type="range"
                  className="goal-slider"
                  min={g.min}
                  max={g.max}
                  step={g.step}
                  value={goals[g.key]}
                  onChange={(e) => setGoals({ ...goals, [g.key]: parseInt(e.target.value) })}
                />
                <div className="goal-slider-minmax">
                  <span>{g.min}{g.unit}</span>
                  <span>{g.max}{g.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9. Danger Zone */}
        <div className="settings-card settings-danger-card">
          <div className="settings-section-label" style={{ color: "#ef4444" }}>Danger Zone</div>
          <p className="danger-desc">These actions are permanent and cannot be undone.</p>
          <div className="danger-buttons">
            <button className="danger-btn">Reset all goals to default</button>
            <button className="danger-btn danger-btn-red">Delete my account</button>
          </div>
        </div>

        {/* Save */}
        <button className="settings-save-bottom" onClick={handleSave}>
          {saved ? "✓ Changes Saved!" : "Save Changes"}
        </button>

      </div>
    </div>
  );
};