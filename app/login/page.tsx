"use client";
import { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/Notification";

function LoginPageContent() {
  const { login, signup, confirmSignup, resendCode, forgotPassword, confirmNewPassword } = useAuth();
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "confirm">("login");
  const [showFormToggle, setShowFormToggle] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [confirmCode, setConfirmCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showNewPasswordPopup, setShowNewPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState({ text: "", type: "" });
  const [newPasswordMessage, setNewPasswordMessage] = useState({ text: "", type: "" });

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    try {
      await login(loginEmail.trim().toLowerCase(), loginPassword);
      showNotification("Welcome back!", "success");
      setTimeout(() => (window.location.href = redirectTo), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      showNotification(msg, "error");
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    const name = signupName.trim();
    const email = signupEmail.trim().toLowerCase();
    const password = signupPassword;

    if (!name || !email || !password) {
      showNotification("Please fill in all fields.", "error");
      return;
    }

    try {
      await signup(email, password, name);
      setPendingEmail(email);
      localStorage.setItem("pendingSignupName", name);
      showNotification("Verification code sent to your email!", "success");
      setActiveTab("confirm");
      setShowFormToggle(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed. Please try again.";
      showNotification(msg, "error");
    }
  }

  async function handleConfirmSignup(e: FormEvent) {
    e.preventDefault();
    const email = pendingEmail;
    const code = confirmCode.trim();
    if (!email || !code) {
      showNotification("Please enter the verification code.", "error");
      return;
    }

    try {
      await confirmSignup(email, code);
      localStorage.removeItem("pendingSignupName");
      showNotification("Account verified! Please login.", "success");
      setActiveTab("login");
      setShowFormToggle(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      showNotification(msg, "error");
    }
  }

  async function handleResendCode() {
    if (!pendingEmail) {
      showNotification("No pending signup found. Please sign up again.", "error");
      return;
    }
    try {
      await resendCode(pendingEmail);
      showNotification("New verification code sent!", "success");
    } catch {
      showNotification("Error resending code.", "error");
    }
  }

  async function handlePasswordReset(e: FormEvent) {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    if (!email) {
      setResetMessage({ text: "Please enter your email address", type: "error" });
      return;
    }
    setResetMessage({ text: "Sending verification code...", type: "" });

    try {
      await forgotPassword(email);
      setShowResetPopup(false);
      setResetMessage({ text: "", type: "" });
      showNotification("Verification code sent to " + email, "success");
      setTimeout(() => {
        setShowNewPasswordPopup(true);
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setNewPasswordMessage({ text: "", type: "" });
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset code";
      setResetMessage({ text: msg, type: "error" });
    }
  }

  async function handleNewPassword(e: FormEvent) {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setNewPasswordMessage({ text: "Please enter the verification code", type: "error" });
      return;
    }
    if (!newPassword || !confirmPassword) {
      setNewPasswordMessage({ text: "Please fill in all fields", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNewPasswordMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    if (newPassword.length < 8) {
      setNewPasswordMessage({ text: "Password must be at least 8 characters", type: "error" });
      return;
    }
    setNewPasswordMessage({ text: "Resetting password...", type: "" });

    try {
      await confirmNewPassword(resetEmail.trim().toLowerCase(), verificationCode.trim(), newPassword);
      setShowNewPasswordPopup(false);
      showNotification("Password reset successfully! Please login with your new password.", "success");
      setTimeout(() => {
        setResetEmail("");
        setActiveTab("login");
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error resetting password";
      setNewPasswordMessage({ text: msg, type: "error" });
    }
  }

  if (!mounted) return null;

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          {showFormToggle && (
            <div className="form-toggle" style={{ display: "flex", background: "var(--bg-surface-alt)", borderRadius: "30px", padding: "5px", marginBottom: "25px" }}>
              <button
                className={`toggle-btn${activeTab === "login" ? " active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`toggle-btn${activeTab === "signup" ? " active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {activeTab === "login" && (
            <form className="auth-form" onSubmit={handleLogin}>
              <h3>Welcome Back!</h3>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>
              <button type="submit" className="submit-btn">Login</button>
              <p className="form-footer" style={{ marginTop: "15px", textAlign: "center" }}>
                <span className="forgot-password-link" onClick={() => { setShowResetPopup(true); setResetEmail(""); setResetMessage({ text: "", type: "" }); }} style={{ color: "#d35400", cursor: "pointer", textDecoration: "underline" }}>
                  Forgot Password?
                </span>
              </p>
            </form>
          )}

          {activeTab === "signup" && (
            <form className="auth-form" onSubmit={handleSignup}>
              <h3>Create Account</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required value={signupName} onChange={(e) => setSignupName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Create a password (min 8 chars)" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
              </div>
              <button type="submit" className="submit-btn">Sign Up</button>
            </form>
          )}

          {activeTab === "confirm" && (
            <form className="auth-form" onSubmit={handleConfirmSignup}>
              <h3>Verify Your Email</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>A verification code has been sent to your email. Please enter it below.</p>
              <div className="form-group">
                <label>Verification Code</label>
                <input type="text" placeholder="Enter 6-digit code" required maxLength={6} value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} />
              </div>
              <button type="submit" className="submit-btn">Verify &amp; Create Account</button>
              <p className="form-footer" style={{ marginTop: "10px", textAlign: "center" }}>
                <span className="forgot-password-link" onClick={handleResendCode} style={{ color: "#d35400", cursor: "pointer", textDecoration: "underline" }}>Resend Code</span>
              </p>
            </form>
          )}
        </div>
      </div>

      <div className={`reset-overlay${showResetPopup ? " show" : ""}`} onClick={() => setShowResetPopup(false)}></div>
      <div className={`reset-popup${showResetPopup ? " show" : ""}`}>
        <h3>Reset Password</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "14px" }}>Enter your email address and we&apos;ll send you a verification code.</p>
        <form onSubmit={handlePasswordReset}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your registered email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            {resetMessage.text && <div className={`reset-message ${resetMessage.type}`}>{resetMessage.text}</div>}
          </div>
          <div className="btn-group" style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
            <button type="button" onClick={() => setShowResetPopup(false)} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: 600, background: "var(--bg-surface-alt)", color: "var(--text-secondary)" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: 600, background: "#d35400", color: "white" }}>Send Code</button>
          </div>
        </form>
      </div>

      <div className={`reset-overlay${showNewPasswordPopup ? " show" : ""}`} onClick={() => setShowNewPasswordPopup(false)}></div>
      <div className={`reset-popup${showNewPasswordPopup ? " show" : ""}`}>
        <h3>Create New Password</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "14px" }}>Enter the verification code sent to your email and your new password.</p>
        <form onSubmit={handleNewPassword}>
          <div className="form-group">
            <label>Verification Code</label>
            <input type="text" placeholder="Enter 6-digit code" required maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Enter new password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {newPasswordMessage.text && <div className={`reset-message ${newPasswordMessage.type}`}>{newPasswordMessage.text}</div>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm new password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="btn-group" style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
            <button type="button" onClick={() => setShowNewPasswordPopup(false)} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: 600, background: "var(--bg-surface-alt)", color: "var(--text-secondary)" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: 600, background: "#d35400", color: "white" }}>Reset Password</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
