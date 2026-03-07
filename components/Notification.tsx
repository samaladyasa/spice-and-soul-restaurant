"use client";
import { useCallback } from "react";

type NotificationType = "success" | "error" | "info";

export function useNotification() {
  const showNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      const colors: Record<string, string> = {
        success: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        error: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        info: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
      };
      const icons: Record<string, string> = {
        success: "✓",
        error: "✕",
        info: "ℹ",
      };

      const existingOverlay = document.getElementById("notifOverlay");
      const existingPopup = document.getElementById("notifPopup");
      if (existingOverlay) existingOverlay.remove();
      if (existingPopup) existingPopup.remove();

      const popup = document.createElement("div");
      popup.id = "notifPopup";
      popup.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:${colors[type]};padding:40px;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,0.5);z-index:10000;text-align:center;max-width:450px;color:white;`;
      popup.innerHTML = `
        <div style="font-size:48px;margin-bottom:20px;">${icons[type]}</div>
        <p style="margin-bottom:20px;color:white;font-size:16px;line-height:1.6;">${message}</p>
        <button onclick="document.getElementById('notifPopup').remove(); document.getElementById('notifOverlay').remove()" style="background:white;color:${type === "error" ? "#e74c3c" : "#667eea"};border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:16px;font-weight:600;">OK</button>
      `;

      const overlay = document.createElement("div");
      overlay.id = "notifOverlay";
      overlay.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;";
      overlay.onclick = () => {
        overlay.remove();
        popup.remove();
      };

      document.body.appendChild(overlay);
      document.body.appendChild(popup);

      setTimeout(() => {
        if (popup.parentElement && overlay.parentElement) {
          popup.remove();
          overlay.remove();
        }
      }, 3000);
    },
    []
  );

  return showNotification;
}
