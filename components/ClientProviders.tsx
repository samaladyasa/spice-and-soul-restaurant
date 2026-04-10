"use client";
import { ReactNode, useEffect, useCallback } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const foodEmojis = ["🍛","🌶️","🍚","🫓","🍰","🥘","🧁","🍵","🥗","🍢","🫕","🍋","✨","🔥"];

export default function ClientProviders({ children }: { children: ReactNode }) {
  const spawnBurst = useCallback((x: number, y: number) => {
    const count = 6 + Math.floor(Math.random() * 4); // 6-9 emojis
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "click-burst";
      el.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 50;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 20; // bias upward
      const dur = 600 + Math.random() * 400;
      const rot = (Math.random() - 0.5) * 60;
      const size = 14 + Math.random() * 8;

      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.fontSize = size + "px";
      el.style.setProperty("--dx", dx + "px");
      el.style.setProperty("--dy", dy + "px");
      el.style.setProperty("--rot", rot + "deg");
      el.style.animationDuration = dur + "ms";
      el.style.animationDelay = (i * 25) + "ms";

      document.body.appendChild(el);
      setTimeout(() => el.remove(), dur + i * 25 + 50);
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isButton = target.closest(
        "a, button, .btn-primary, .btn-secondary, .btn-white, .btn-nav, " +
        ".btn-add, .submit-btn, .toggle-btn, .filter-btn, .btn-view-cart, " +
        "[role=button], .hero-buttons a"
      );
      if (isButton) {
        spawnBurst(e.clientX, e.clientY);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [spawnBurst]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
