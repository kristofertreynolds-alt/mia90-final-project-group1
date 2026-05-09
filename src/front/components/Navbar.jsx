import React from "react";
import { Link } from "react-router-dom";

export const Navbar = ({ userName = "JD" }) => {
  return (
    <div className="header-card">

      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="40" height="40" rx="10" fill="#f97316" />
            <text x="17" y="29" style={{ fontSize: 24, fontWeight: 500, fill: "#fff", fontFamily: "system-ui, sans-serif" }}>c</text>
            <circle cx="31" cy="9"  r="4"   fill="#fff" opacity="0.9" />
            <circle cx="36" cy="16" r="2.5" fill="#fff" opacity="0.55" />
            <circle cx="35" cy="24" r="2"   fill="#fff" opacity="0.3" />
          </svg>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#f97316", lineHeight: 1.1, fontFamily: "system-ui, sans-serif" }}>caloric</div>
            <div style={{ fontSize: 18, fontWeight: 400, color: "#1a1a1a", lineHeight: 1.1, fontFamily: "system-ui, sans-serif" }}>AI</div>
          </div>
        </div>
      </Link>

      <div style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "#fde8d8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 500,
        color: "#c2440a",
        cursor: "pointer",
      }}>
        {userName}
      </div>

    </div>
  );
}