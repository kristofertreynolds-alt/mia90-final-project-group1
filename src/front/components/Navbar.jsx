import React from "react";
import { Link } from "react-router-dom";

export const Navbar = ({ userName = "JD" }) => {
  return (
    <div className="header-card">

      <Link to="/">
        <svg width="130" height="40" viewBox="0 0 130 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 3 A17 17 0 1 1 6.4 32.3" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          <circle cx="6.4" cy="32.3" r="2.8" fill="#f97316" />
          <rect x="17.5" y="24" width="5" height="11" rx="2.5" fill="#1a1a1a" />
          <rect x="17.5" y="15" width="5" height="10" rx="1.5" fill="#1a1a1a" />
          <rect x="11"   y="6"  width="4" height="11" rx="2"   fill="#1a1a1a" />
          <rect x="17.5" y="6"  width="4" height="11" rx="2"   fill="#1a1a1a" />
          <rect x="24"   y="6"  width="4" height="11" rx="2"   fill="#1a1a1a" />
          <circle cx="33.5" cy="7.5" r="4"   fill="#f97316" />
          <circle cx="33.5" cy="7.5" r="1.8" fill="#fff" />
          <text x="46" y="17" style={{ fontSize: 15, fontWeight: 500, fill: "#f97316", fontFamily: "system-ui, sans-serif" }}>caloric</text>
          <text x="46" y="35" style={{ fontSize: 15, fontWeight: 400, fill: "#1a1a1a", fontFamily: "system-ui, sans-serif" }}>AI</text>
        </svg>
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