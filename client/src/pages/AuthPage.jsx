import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">
          <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
            <rect x="2" y="2" width="42" height="42" rx="10" fill="#f5b800" />
            <circle cx="23" cy="23" r="14" fill="none" stroke="#262d36" strokeWidth="2.5" />
            <path d="M23 9 L28 25 L23 22 L18 25 Z" fill="#262d36" />
            <path d="M23 37 L18 21 L23 24 L28 21 Z" fill="#262d36" opacity=".35" />
          </svg>
          <div>
            <h1><span>Path Finder</span> · Smart Parking</h1>
            <small>{isLogin ? "Log in to open the dashboard" : "Create your account"}</small>
          </div>
        </div>

        {!isLogin && (
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={set("name")} autoComplete="name" required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={set("password")}
                 autoComplete={isLogin ? "current-password" : "new-password"} minLength={isLogin ? undefined : 8} required />
          {!isLogin && <p className="hint">At least 8 characters.</p>}
        </div>

        {error && <div className="err" role="alert">{error}</div>}

        <button className="btn" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}</button>

        <p className="switch">
          {isLogin ? <>No account? <Link to="/register">Register</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}
        </p>
      </form>
    </div>
  );
}
