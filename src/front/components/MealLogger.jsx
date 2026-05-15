import { useState, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MEAL_ICONS = { Breakfast: "☀️", Lunch: "🌤️", Dinner: "🌙", Snack: "🍎" };

async function analyzeWithClaude(description, mealType, imageBase64 = null, mediaType = "image/jpeg") {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  //const token = localStorage.getItem("token");
  const token = sessionStorage.getItem("token");

  const response = await fetch(`${backendUrl}/api/analyze-meal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      description,
      image_base64: imageBase64,
      media_type: mediaType,
      meal_type: mealType
    }),
  });

  if (!response.ok) throw new Error("Failed to analyze meal");
  return await response.json();
}

export default function MealLogger({ onLogMeal }) {
  // const { dispatch } = useGlobalReducer(); <---

  const [text, setText] = useState("");
  const [mealType, setMealType] = useState("Snack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleLog = async () => {
    if (!text.trim() && !imageBase64) return;
    setLoading(true);
    setError("");

    try {
      const nutrition = await analyzeWithClaude(text, mealType, imageBase64, mediaType);
      const timeStr = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      onLogMeal({
        id: Date.now(),
        type: mealType,
        icon: MEAL_ICONS[mealType],
        description: nutrition.description || text.trim(),
        time: timeStr,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      });

      //       const mealData = {
      //   type: mealType,
      //   description: nutrition.description || text.trim(), <----
      //   time: timeStr,
      //   calories: nutrition.calories,
      //   protein: nutrition.protein,
      //   carbs: nutrition.carbs,
      //   fat: nutrition.fat,
      // };

      // const response = await fetch(`${backendUrl}/api/meals`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(mealData),
      // });

      // if (!response.ok) throw new Error("Failed to save meal"); <------
      // const savedMeal = await response.json();

      // // Paso 3 — agregar al store global
      // dispatch({
      //   type: "add_meal",
      //   payload: { ...savedMeal, icon: MEAL_ICONS[mealType] }
      // });

      setText("");
      setPreview(null);
      setImageBase64(null);
    } catch (err) {
      setError("Could not analyze meal. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setError("Voice input failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      setPreview(result);
      setImageBase64(result.split(",")[1]);
      setMediaType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPreview(null);
    setImageBase64(null);
    fileRef.current.value = "";
  };

  return (
    <div className="meal-logger-card">

      {/* Meal type buttons */}
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

      {/* Photo preview */}
      {preview && (
        <div className="meal-photo-preview">
          <img src={preview} alt="Meal" className="meal-photo-img" />
          <button className="meal-photo-remove" onClick={removePhoto}>
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Text input */}
      <textarea
        className="meal-logger-textarea"
        placeholder={imageBase64 ? "Add a description (optional)..." : "Describe your meal..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleLog())
        }
      />

      {/* Error */}
      {error && (
        <div className="meal-logger-error">{error}</div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="meal-logger-listening">
          <div className="listening-dot" />
          <div className="listening-dot" />
          <div className="listening-dot" />
          <span>Listening...</span>
        </div>
      )}

      {/* Footer */}
      <div className="meal-logger-footer">
        <div className="meal-logger-icons">

          {/* Voice button */}
          <button
            className={`icon-btn ${isListening ? "icon-btn-active" : ""}`}
            title={isListening ? "Stop listening" : "Voice input"}
            onClick={handleVoice}
          >
            <svg
              width="18" height="18" fill="none"
              stroke={isListening ? "#f97316" : "#1a1a1a"}
              strokeWidth="2" viewBox="0 0 24 24"
            >
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6"/>
            </svg>
          </button>

          {/* Photo button */}
          <button
            className="icon-btn"
            title="Upload photo"
            onClick={() => fileRef.current.click()}
          >
            <svg width="18" height="18" fill="none" stroke="#1a1a1a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhoto}
          />

        </div>

        {/* Log button */}
        <button
          className="log-meal-btn"
          onClick={handleLog}
          disabled={loading || (!text.trim() && !imageBase64)}
        >
          {loading ? (
            <div className="meal-logger-spinner" />
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Log meal
            </>
          )}
        </button>

      </div>
    </div>
  );
}