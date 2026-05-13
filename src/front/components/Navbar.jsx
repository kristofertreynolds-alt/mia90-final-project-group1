import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = ({ userName = "JD" }) => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  return (
    <div className="header-card">

      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="40" height="40" rx="10" fill="#f97316"/>
            <text x="17" y="29" style={{ fontSize: 24, fontWeight: 500, fill: "#fff", fontFamily: "system-ui, sans-serif" }}>c</text>
            <circle cx="31" cy="9"  r="4"   fill="#fff" opacity="0.9"/>
            <circle cx="36" cy="16" r="2.5" fill="#fff" opacity="0.55"/>
            <circle cx="35" cy="24" r="2"   fill="#fff" opacity="0.3"/>
          </svg>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#f97316", lineHeight: 1.1, fontFamily: "system-ui, sans-serif" }}>caloric</div>
            <div style={{ fontSize: 18, fontWeight: 400, color: "#1a1a1a", lineHeight: 1.1, fontFamily: "system-ui, sans-serif" }}>AI</div>
          </div>
        </div>
      </Link>

      <div className="nav-avatar-wrap">
        <div className="nav-avatar">
          {userName}
        </div>

        <div className="nav-dropdown">
          <div className="nav-dropdown-header">
            <div className="nav-dropdown-avatar">{userName}</div>
            <div>
              <div className="nav-dropdown-name">My Account</div>
              <div className="nav-dropdown-email">user@email.com</div>
            </div>
          </div>

          <div className="nav-dropdown-divider" />

          <Link to="/settings" className="nav-dropdown-item">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </Link>

          <Link to="/profile" className="nav-dropdown-item">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </Link>

          <div className="nav-dropdown-divider" />

          <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log out
          </button>
        </div>
      </div>

    </div>
  );
}
