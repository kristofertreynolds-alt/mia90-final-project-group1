import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BADGES = [
  { id: 1, icon: "🔥", label: "First Meal Logged",  desc: "You logged your very first meal",     earned: true  },
  { id: 2, icon: "⚡", label: "3 Day Streak",        desc: "Logged meals 3 days in a row",        earned: true  },
  { id: 3, icon: "💪", label: "Protein Goal Hit",    desc: "Hit your protein goal for the day",   earned: true  },
  { id: 4, icon: "🥗", label: "5 Meals Logged",      desc: "Logged 5 total meals",                earned: true  },
  { id: 5, icon: "🎯", label: "7 Day Streak",        desc: "Logged meals 7 days in a row",        earned: false },
  { id: 6, icon: "🏆", label: "Goal Reached",        desc: "Reached your weight goal",            earned: false },
  { id: 7, icon: "📅", label: "30 Day Streak",       desc: "Logged meals 30 days in a row",       earned: false },
  { id: 8, icon: "🌟", label: "All Macros Hit",      desc: "Hit every macro goal in one day",     earned: false },
  { id: 9, icon: "💎", label: "90 Day Journey",      desc: "Been on your journey for 90 days",    earned: false },
];

const MILESTONES = [
  { label: "Joined Caloric AI",  date: "May 1, 2026",  done: true  },
  { label: "First meal logged",  date: "May 1, 2026",  done: true  },
  { label: "3-day streak",       date: "May 4, 2026",  done: true  },
  { label: "Hit protein goal",   date: "May 6, 2026",  done: true  },
  { label: "7-day streak",       date: "Upcoming",     done: false },
  { label: "Reach weight goal",  date: "Upcoming",     done: false },
];

export const Profile = () => {
  const {store, dispatch} = useGlobalReducer();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [streak] = useState(4);

  const settings = {
    name: "Jorge",
    weightGoal: "lose",
    weeklyRate: 0.5,
    currentWeight: 185,
    targetWeight: 165,
    unit: "imperial",
    goalCalories: 1850,
    goalProtein: 140,
    goalCarbs: 185,
    goalFat: 55,
  };

  const weightToLose = settings.currentWeight - settings.targetWeight;
  const weeksNeeded = Math.ceil(weightToLose / settings.weeklyRate);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);
  const targetDateStr = targetDate.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const progressPct = Math.round(((settings.currentWeight - (settings.currentWeight - 5)) / weightToLose) * 100);
  const daysLeft = weeksNeeded * 7;

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const goalLabel = { lose: "Weight Loss", gain: "Weight Gain", maintain: "Maintenance" }[settings.weightGoal];
  const goalColor = { lose: "#3b82f6", gain: "#f97316", maintain: "#22c55e" }[settings.weightGoal];

  const earnedBadges   = BADGES.filter((b) => b.earned);
  const unearnedBadges = BADGES.filter((b) => !b.earned);

  return (
    <div className="app-bg">
      <div className="container-app">

        <div className="settings-topbar">
          <button className="settings-back" onClick={() => navigate("/")}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <h1 className="settings-page-title">Profile</h1>
          <button className="settings-save-btn" onClick={() => navigate("/settings")}>
            Edit
          </button>
        </div>

        <div className="settings-card profile-hero-card">
          <div className="profile-photo-wrap" onClick={() => fileRef.current.click()}>
            {photo ? (
              <img src={photo} alt="Profile" className="profile-photo" />
            ) : (
              <div className="profile-initials">
                {settings.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-photo-overlay">
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>
          <div className="profile-hero-info">
            <h2 className="profile-name">{store.user?.full_name || store.user?.email}</h2> 
            <div className="profile-goal-pill" style={{ background: `${goalColor}18`, color: goalColor }}>
              {goalLabel} Goal
            </div>
          </div>
          <div className="profile-streak-wrap">
            <div className="profile-streak-number">🔥 {streak}</div>
            <div className="profile-streak-label">day streak</div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-section-label">Goal Progress</div>
          <div className="goal-progress-hero">
            <div className="goal-progress-weights">
              <div className="goal-weight-item">
                <div className="goal-weight-value">{settings.currentWeight}</div>
                <div className="goal-weight-label">Current {settings.unit === "imperial" ? "lbs" : "kg"}</div>
              </div>
              <div className="goal-progress-arrow">
                <svg width="32" height="16" fill="none" viewBox="0 0 32 16">
                  <path d="M0 8h28M22 2l8 6-8 6" stroke={goalColor} strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="goal-weight-item">
                <div className="goal-weight-value" style={{ color: goalColor }}>{settings.targetWeight}</div>
                <div className="goal-weight-label">Target {settings.unit === "imperial" ? "lbs" : "kg"}</div>
              </div>
            </div>

            <div className="goal-progress-bar-wrap">
              <div className="goal-progress-bar-bg">
                <div className="goal-progress-bar-fill" style={{ width: `${progressPct}%`, background: goalColor }} />
              </div>
              <div className="goal-progress-pct" style={{ color: goalColor }}>{progressPct}% there</div>
            </div>

            <div className="goal-timeline-card" style={{ borderColor: `${goalColor}30`, background: `${goalColor}08` }}>
              <div className="goal-timeline-row">
                <div className="goal-timeline-item">
                  <div className="goal-timeline-value">{weightToLose}</div>
                  <div className="goal-timeline-label">{settings.unit === "imperial" ? "lbs" : "kg"} to go</div>
                </div>
                <div className="goal-timeline-divider" />
                <div className="goal-timeline-item">
                  <div className="goal-timeline-value">{daysLeft}</div>
                  <div className="goal-timeline-label">days left</div>
                </div>
                <div className="goal-timeline-divider" />
                <div className="goal-timeline-item">
                  <div className="goal-timeline-value" style={{ fontSize: "0.9rem" }}>{settings.weeklyRate}</div>
                  <div className="goal-timeline-label">{settings.unit === "imperial" ? "lbs" : "kg"}/week</div>
                </div>
              </div>
              <div className="goal-target-date">
                <svg width="13" height="13" fill="none" stroke={goalColor} strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Target date: <strong>{targetDateStr}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-section-label">Daily Targets</div>
          <div className="profile-targets-grid">
            {[
              { label: "Calories", value: settings.goalCalories, unit: "kcal", color: "#f97316" },
              { label: "Protein",  value: settings.goalProtein,  unit: "g",    color: "#3b82f6" },
              { label: "Carbs",    value: settings.goalCarbs,    unit: "g",    color: "#eab308" },
              { label: "Fat",      value: settings.goalFat,      unit: "g",    color: "#a855f7" },
            ].map((t) => (
              <div key={t.label} className="profile-target-card">
                <div className="profile-target-value" style={{ color: t.color }}>{t.value}</div>
                <div className="profile-target-unit">{t.unit}</div>
                <div className="profile-target-label">{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-section-label">Milestones</div>
          <div className="milestones-list">
            {MILESTONES.map((m, i) => (
              <div key={i} className="milestone-item">
                <div className={`milestone-dot ${m.done ? "done" : ""}`}>
                  {m.done && (
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                {i < MILESTONES.length - 1 && (
                  <div className={`milestone-line ${m.done ? "done" : ""}`} />
                )}
                <div className="milestone-content">
                  <div className={`milestone-label ${m.done ? "done" : ""}`}>{m.label}</div>
                  <div className="milestone-date">{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-section-label">Badges Earned</div>
          <div className="badges-grid">
            {earnedBadges.map((b) => (
              <div key={b.id} className="badge-item earned">
                <div className="badge-icon">{b.icon}</div>
                <div className="badge-label">{b.label}</div>
                <div className="badge-desc">{b.desc}</div>
              </div>
            ))}
          </div>
          <div className="badges-locked-label">Locked</div>
          <div className="badges-grid">
            {unearnedBadges.map((b) => (
              <div key={b.id} className="badge-item locked">
                <div className="badge-icon locked-icon">{b.icon}</div>
                <div className="badge-label">{b.label}</div>
                <div className="badge-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card profile-quote-card">
          <div className="profile-quote-icon">✦</div>
          <div className="profile-quote">"The secret of getting ahead is getting started."</div>
          <div className="profile-quote-author">— Mark Twain</div>
        </div>

      </div>
    </div>
  );
};