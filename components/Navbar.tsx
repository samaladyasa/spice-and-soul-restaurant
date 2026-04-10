"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { username, isAdmin, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav>
      <div className="logo">Spice &amp; Soul</div>
      <ul className={navOpen ? "active" : ""}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/services">Menu &amp; Services</Link>
        </li>
        {isAdmin && (
          <li>
            <Link href="/admin">Admin</Link>
          </li>
        )}
        <li>
          {username ? (
            <Link
              href="#"
              id="authBtn"
              style={{
                color: "white",
                background: "#27ae60",
                padding: "5px 15px",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              Hi, {username}
            </Link>
          ) : (
            <Link
              href="/login"
              id="authBtn"
              style={{
                color: "#d35400",
                background: "var(--bg-surface-alt)",
                padding: "5px 15px",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>
          )}
        </li>
      </ul>

      <div className="user-settings" ref={menuRef}>
        <div
          className="dots-icon"
          onClick={() => {
            setMenuOpen((prev) => !prev);
            setNavOpen((prev) => !prev);
          }}
        >
          &#8942;
        </div>
        <div
          className={`settings-dropdown${menuOpen ? " show-menu" : ""}`}
          id="settingsMenu"
        >
          <div
            className="user-name-display"
            id="menuUserName"
            style={{
              display: username ? "block" : "none",
              padding: "10px",
              fontWeight: "bold",
              borderBottom: "1px solid var(--border-color)",
              color: "#d35400",
            }}
          >
            {username || "Guest"}
          </div>
          <button onClick={toggleTheme}>🌓 Change Theme</button>
          <button onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
