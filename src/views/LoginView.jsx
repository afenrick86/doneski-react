import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function LoginView() {
  const { signIn, createParentAccount } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter a username and password.");
      return;
    }

    if (isSetup && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSetup) {
        await createParentAccount(username.trim(), password);
      } else {
        await signIn(username.trim(), password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      const code = err.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials"
      ) {
        setError("Incorrect username or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("A parent account already exists. Sign in instead.");
        setIsSetup(false);
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Try again in a moment.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
    setSubmitting(false);
  }

  return (
    <div id="login-view">
      <div id="login-card">
        <img id="login-logo" src="/doneski-logo.svg" alt="Doneski" />
        <h2 id="login-heading">{isSetup ? "Create Parent Account" : "Sign In"}</h2>
        {isSetup && (
          <p className="login-hint">
            Set up your parent account to get started. Kid accounts are created from Settings after you sign in.
          </p>
        )}
        <form id="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete={isSetup ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button id="login-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : isSetup ? "Create Account" : "Sign In"}
          </button>
        </form>
        <button
          id="login-switch-btn"
          type="button"
          onClick={() => { setIsSetup(s => !s); setError(""); }}
        >
          {isSetup ? "Already have an account? Sign in" : "First time? Create parent account"}
        </button>
      </div>
    </div>
  );
}
