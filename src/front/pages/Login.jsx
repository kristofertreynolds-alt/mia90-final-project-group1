import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Login = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        setError("");

        if (!form.email || !form.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: form.email, password: form.password })
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({
                    type: "login",
                    payload: {
                        token: data.access_token,
                        user: data.user
                    }
                });

                setForm({ email: "", password: "" });
                navigate("/");
            } else {
                setError(data.msg || "Invalid email or password");
            }

        } catch (error) {
            console.error("Connection error:", error);
            setError("The server is not responding. Check if Flask is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-bg auth-page">
            <div className="auth-container">

                <div className="auth-logo">
                    <svg width="52" height="52" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="40" height="40" rx="12" fill="#f97316"/>
                        <text x="17" y="29" style={{ fontSize: 24, fontWeight: 500, fill: "#fff", fontFamily: "system-ui, sans-serif" }}>c</text>
                        <circle cx="31" cy="9" r="4" fill="#fff" opacity="0.9"/>
                        <circle cx="36" cy="16" r="2.5" fill="#fff" opacity="0.55"/>
                        <circle cx="35" cy="24" r="2" fill="#fff" opacity="0.3"/>
                    </svg>
                    <div>
                        <div className="auth-logo-caloric">caloric</div>
                        <div className="auth-logo-ai">AI</div>
                    </div>
                </div>

                <div className="auth-card">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Log in to continue your journey</p>

                    {error && (
                        <div className="auth-error">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="auth-fields">

                        <div className="settings-field">
                            <label className="field-label">Email</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="16" height="16" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                    <path d="M2 7l10 7 10-7"/>
                                </svg>
                                <input
                                    className="field-input auth-input"
                                    type="email"
                                    placeholder="jorge@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                />
                            </div>
                        </div>

                        <div className="settings-field">
                            <label className="field-label">Password</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="16" height="16" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input
                                    className="field-input auth-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                />
                                <button className="auth-show-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="auth-forgot">
                        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                    </div>

                    <button
                        className="auth-submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <div className="auth-spinner" /> : "Log in"}
                    </button>

                    <div className="auth-divider">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-text">or</span>
                        <div className="auth-divider-line" />
                    </div>

                    <div className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/signup" className="auth-link auth-link-bold">Sign up</Link>
                    </div>

                </div>
            </div>
        </div>
    );
};