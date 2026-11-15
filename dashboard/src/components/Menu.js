import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "profile" | "shortcuts" | null

  const [userProfile, setUserProfile] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get("username");
    const urlEmail = urlParams.get("email");

    const saved = localStorage.getItem("zerodha_user_profile");
    const baseProfile = saved
      ? JSON.parse(saved)
      : {
          name: "User",
          email: "user@gmail.com",
          phone: "+91 98765 43210",
          pan: "ABCDE1234F",
          dematId: "1208160012345678",
          bank: "HDFC Bank •••• 4821",
        };

    if (urlUsername || urlEmail) {
      const updated = {
        ...baseProfile,
        name: urlUsername || (urlEmail ? urlEmail.split("@")[0] : baseProfile.name),
        email: urlEmail || baseProfile.email,
      };
      localStorage.setItem("zerodha_user_profile", JSON.stringify(updated));
      return updated;
    }

    return baseProfile;
  });

  useEffect(() => {
    if (window.location.search.includes("email=") || window.location.search.includes("username=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...userProfile,
      name: editName.trim() || "Ankit",
      email: editEmail.trim() || "ankit@zerodha.com",
    };
    setUserProfile(updated);
    localStorage.setItem("zerodha_user_profile", JSON.stringify(updated));
    setActiveModal(null);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const isLocal = window.location.hostname === "localhost";
    window.location.href = isLocal
      ? "http://localhost:3000/login"
      : "https://zerodha-frontend-xft8.onrender.com/login";
  };

  const initials = userProfile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <img src="logo.png" alt="TradeX Logo" style={{ width: "36px" }} />
        <span
          style={{
            fontWeight: 700,
            fontSize: "1.05rem",
            color: "#387ed1",
            letterSpacing: "0.5px",
          }}
        >
          TradeX
        </span>
      </div>
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />

        {/* Profile Button + Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            className="profile"
            onClick={handleProfileClick}
            style={{ userSelect: "none", cursor: "pointer" }}
          >
            <div className="avatar">{initials || "U"}</div>
            <p className="username">{userProfile.email || userProfile.name}</p>
          </div>

          {isProfileDropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "46px",
                width: "240px",
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    color: "#333",
                  }}
                >
                  {userProfile.name}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#777",
                    marginTop: "2px",
                  }}
                >
                  {userProfile.email}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "0.68rem",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    padding: "2px 7px",
                    borderRadius: "10px",
                    fontWeight: 500,
                  }}
                >
                  Demat Active
                </span>
              </div>

              {/* Menu Links */}
              <div style={{ padding: "6px 0" }}>
                <div
                  onClick={() => {
                    setEditName(userProfile.name);
                    setEditEmail(userProfile.email);
                    setActiveModal("profile");
                    setIsProfileDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                >
                  👤 My Profile & Account
                </div>

                <div
                  onClick={() => {
                    handleMenuClick(2);
                    navigate("/holdings");
                    setIsProfileDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                >
                  📊 Console (Portfolio)
                </div>

                <div
                  onClick={() => {
                    handleMenuClick(4);
                    navigate("/funds");
                    setIsProfileDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                >
                  💳 Manage Funds
                </div>

                <div
                  onClick={() => {
                    handleMenuClick(6);
                    navigate("/apps");
                    setIsProfileDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                >
                  🧩 Connected Apps (Coin)
                </div>

                <div
                  onClick={() => {
                    setActiveModal("shortcuts");
                    setIsProfileDropdownOpen(false);
                  }}
                  style={dropdownItemStyle}
                >
                  ⌨️ Keyboard Shortcuts
                </div>

                <a
                  href="https://zerodha.com/varsity"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...dropdownItemStyle,
                    display: "block",
                    textDecoration: "none",
                  }}
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  📘 Varsity & Help Center
                </a>
              </div>

              {/* Logout */}
              <div
                onClick={handleLogout}
                style={{
                  ...dropdownItemStyle,
                  borderTop: "1px solid #f0f0f0",
                  color: "#e53935",
                  fontWeight: 500,
                }}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Profile Modal */}
      {activeModal === "profile" && (
        <div style={modalOverlayStyle} onClick={() => setActiveModal(null)}>
          <div
            style={modalBoxStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 14px", color: "#333", fontWeight: 500 }}>
              Account Profile ({userProfile.email})
            </h3>
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: "10px" }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  background: "#f9f9f9",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  color: "#555",
                  lineHeight: "1.7",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <strong>Demat (BO) ID:</strong> {userProfile.dematId}
                </div>
                <div>
                  <strong>PAN:</strong> {userProfile.pan}
                </div>
                <div>
                  <strong>Linked Bank:</strong> {userProfile.bank}
                </div>
                <div>
                  <strong>Segments:</strong> NSE, BSE, MF, Equity
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    padding: "8px 14px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-blue"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {activeModal === "shortcuts" && (
        <div style={modalOverlayStyle} onClick={() => setActiveModal(null)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px", color: "#333", fontWeight: 500 }}>
              Kite Keyboard Shortcuts
            </h3>
            <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: "2" }}>
              <div>
                <kbd style={kbdStyle}>B</kbd> Buy selected watchlist stock
              </div>
              <div>
                <kbd style={kbdStyle}>S</kbd> Sell selected watchlist stock
              </div>
              <div>
                <kbd style={kbdStyle}>D</kbd> Go to Dashboard
              </div>
              <div>
                <kbd style={kbdStyle}>O</kbd> Go to Orders
              </div>
              <div>
                <kbd style={kbdStyle}>H</kbd> Go to Holdings
              </div>
              <div>
                <kbd style={kbdStyle}>F</kbd> Go to Funds
              </div>
            </div>
            <div style={{ textAlign: "right", marginTop: "16px" }}>
              <button
                onClick={() => setActiveModal(null)}
                className="btn btn-blue"
                style={{ border: "none", cursor: "pointer" }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const dropdownItemStyle = {
  padding: "9px 16px",
  fontSize: "0.82rem",
  color: "#444",
  cursor: "pointer",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalBoxStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "6px",
  width: "340px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  color: "#666",
  marginBottom: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: "3px",
  boxSizing: "border-box",
  fontSize: "0.85rem",
};

const kbdStyle = {
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "3px",
  padding: "2px 7px",
  marginRight: "8px",
  fontSize: "0.78rem",
  fontWeight: 600,
};

export default Menu;
