"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

const AUTH_CSS = `
/* ============ Meridian Auth (shared) ============ */
.auth *{box-sizing:border-box}
.auth{--line:#e7e7e3;--t1:#1a1a1e;--t2:#5f5f68;--t3:#6b6b76;--ac:#4f46e5;--ach:#4338ca;--red:#dc2626;--paper:#fafaf9;--card:#fff;--sunken:#f1f1ee;--on-ac:#fff;--ac-soft:#eef2ff;--red-soft:#fef2f2;--red-soft-b:#fecaca;color:var(--t1);background:var(--paper);min-height:100vh;font-family:inherit}
html[data-theme="dark"] .auth{--line:#2a2a30;--t1:#f0f0f2;--t2:#a1a1ac;--t3:#8b8b96;--ac:#818cf8;--ach:#a5b4fc;--red:#f87171;--paper:#111113;--card:#1c1c1f;--sunken:#26262b;--on-ac:#111113;--ac-soft:#232347;--red-soft:#2b1b1b;--red-soft-b:#5c2b2b}
.auth-split{display:flex;min-height:100vh}
.auth-pane{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;position:relative;background:var(--paper)}
.auth-card{width:100%;max-width:400px}
.auth-brandrow{display:flex;align-items:center;gap:10px;margin-bottom:28px}
.auth-mark{width:34px;height:34px;background:#4f46e5;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.auth-mark svg{width:18px;height:18px}
.auth-name{font-size:15px;font-weight:800;letter-spacing:-.01em;color:var(--t1)}
.auth-h1{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin:0 0 8px}
.auth-sub{font-size:14px;font-weight:500;color:var(--t2);margin:0 0 26px}
.auth-err{display:flex;align-items:flex-start;gap:10px;background:var(--red-soft);border:1px solid var(--red-soft-b);color:var(--red);padding:11px 14px;border-radius:10px;font-size:13px;font-weight:500;margin-bottom:18px}
.auth-err svg{flex-shrink:0;margin-top:1px}
.auth-form{display:flex;flex-direction:column;gap:16px}
.auth-lbl{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:7px}
.auth-in{width:100%;height:46px;padding:0 14px;background:var(--card);border:1px solid var(--line);border-radius:10px;font:inherit;font-size:14px;font-weight:500;color:var(--t1);outline:none;transition:border-color .15s ease,box-shadow .15s ease}
.auth-in::placeholder{color:var(--t3);opacity:.7}
.auth-in:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac-soft)}
.auth-row{display:flex;align-items:center;justify-content:space-between}
.auth-hint{font-size:12px;font-weight:500;color:var(--t3);margin-top:6px}
.auth-btn{width:100%;height:46px;margin-top:6px;background:var(--ac);color:var(--on-ac);border:none;border-radius:10px;font:inherit;font-size:14px;font-weight:700;letter-spacing:.01em;cursor:pointer;transition:background .15s ease,transform .06s ease,opacity .15s ease}
.auth-btn:hover{background:var(--ach)}
.auth-btn:active{transform:translateY(1px)}
.auth-btn:disabled{opacity:.55;cursor:wait;transform:none}
.auth-btn:focus-visible,.auth-link:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.auth-foot{font-size:13px;font-weight:500;color:var(--t2);text-align:center;margin:24px 0 0}
.auth-link{color:var(--ac);font-weight:700;text-decoration:none;border-radius:4px}
.auth-link:hover{color:var(--ach);text-decoration:underline}
.auth-toggle{position:absolute;top:18px;right:20px;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:none;border-radius:10px;background:transparent;color:var(--t2);cursor:pointer;transition:background .15s ease,color .15s ease}
.auth-toggle:hover{background:var(--sunken);color:var(--t1)}
.auth-toggle:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
/* Brand pane — constant dark world in both themes */
.auth-brand{display:none;position:relative;flex:0 0 44%;background:#111113;border-left:1px solid #26262b;overflow:hidden}
.auth-brand::before{content:"";position:absolute;top:-180px;right:-120px;width:520px;height:520px;border-radius:50%;background:radial-gradient(closest-side,rgba(99,102,241,.16),transparent)}
.auth-brand-in{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:flex-end;min-height:100vh;padding:44px 48px}
.auth-brand-top{position:absolute;top:44px;left:48px;display:flex;align-items:center;gap:10px}
.auth-brand-top .auth-name{color:#f0f0f2}
.auth-bpanel{width:100%;max-width:380px;background:#1c1c1f;border:1px solid #26262b;border-radius:14px;padding:20px 22px;margin-bottom:40px}
.auth-bhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.auth-bcrumb{font-size:10px;font-weight:700;letter-spacing:.1em;color:#8b8b96;text-transform:uppercase}
.auth-bpill{font-size:10px;font-weight:700;letter-spacing:.08em;color:#a5b4fc;background:#232347;border-radius:5px;padding:3px 8px;text-transform:uppercase}
.auth-bignum{font-size:30px;font-weight:800;letter-spacing:-.02em;color:#f0f0f2;line-height:1;font-variant-numeric:tabular-nums}
.auth-bunit{font-size:12px;font-weight:600;color:#a1a1ac;margin-left:6px}
.auth-btrack{height:6px;background:#2e2e34;border-radius:999px;overflow:hidden;margin:10px 0 18px}
.auth-bfill{height:100%;border-radius:999px;background:#818cf8}
.auth-brow{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.auth-blbl{width:32px;font-size:10px;font-weight:700;letter-spacing:.06em;color:#a1a1ac}
.auth-bmini{flex:1;height:5px;background:#2e2e34;border-radius:999px;overflow:hidden}
.auth-bmini i{display:block;height:100%;border-radius:999px}
.auth-bval{width:64px;text-align:right;font-size:11px;font-weight:600;color:#a1a1ac;font-variant-numeric:tabular-nums}
.auth-bval.over{color:#f87171}
.auth-bheat{display:grid;grid-template-columns:repeat(17,1fr);gap:3px;margin-top:16px}
.auth-bheat i{aspect-ratio:1;border-radius:2px;background:#26262b}
.auth-bheat i.l1{background:#232347}.auth-bheat i.l2{background:#3730a3}.auth-bheat i.l3{background:#4f46e5}.auth-bheat i.l4{background:#818cf8}
.auth-btitle{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.12;color:#f0f0f2;margin:0 0 14px;max-width:380px}
.auth-bsign{display:flex;align-items:center;gap:12px}
.auth-bsign i{width:28px;height:2px;background:#818cf8;border-radius:2px}
.auth-bsign span{font-size:11px;font-weight:700;letter-spacing:.18em;color:#a1a1ac;text-transform:uppercase}
@media(min-width:1024px){
  .auth-brand{display:block}
  .auth-brandrow{display:none}
}
@media(prefers-reduced-motion:reduce){.auth *{transition:none!important;animation:none!important}}
`;

// Deterministic heatmap pattern (safe for SSR hydration — integer math only)
const HEAT = Array.from({ length: 119 }, (_, i) => {
  const v = ((i * 73) % 19) + ((i * 31) % 7);
  return v > 22 ? 4 : v > 17 ? 3 : v > 12 ? 2 : v > 7 ? 1 : 0;
});

const LogoMark = () => (
  <div className="auth-mark" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  </div>
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password);

      if (!result.success) {
        setError(result.error || 'Registration failed');
        setLoading(false);
      }
      // If successful, the register function will redirect via window.location.href
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <style>{AUTH_CSS}</style>
      <div className="auth-split">
        {/* Form pane — follows the user's theme */}
        <main className="auth-pane">
          <button
            onClick={toggleTheme}
            className="auth-toggle"
            role="switch"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-checked={theme === "dark"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="20" height="20" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <div className="auth-card">
            <div className="auth-brandrow">
              <LogoMark />
              <span className="auth-name">NutriGain</span>
            </div>

            <h1 className="auth-h1">Create your account</h1>
            <p className="auth-sub">Set your targets once — then log meals and training in seconds.</p>

            {error && (
              <div className="auth-err" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="17" height="17" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div>
                <label htmlFor="name" className="auth-lbl">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="auth-in"
                  placeholder="Alex Carter"
                />
              </div>

              <div>
                <label htmlFor="email" className="auth-lbl">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="auth-in"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="auth-lbl">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-in"
                  placeholder="At least 6 characters"
                  aria-describedby="pw-hint"
                />
                <p id="pw-hint" className="auth-hint">Use at least 6 characters.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="auth-lbl">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-in"
                  placeholder="Repeat your password"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="auth-foot">
              Already have an account?{" "}
              <Link href="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </main>

        {/* Brand pane — the product's data, not a stock photo */}
        <aside className="auth-brand" aria-hidden="true">
          <div className="auth-brand-in">
            <div className="auth-brand-top">
              <LogoMark />
              <span className="auth-name">NutriGain</span>
            </div>

            <div className="auth-bpanel">
              <div className="auth-bhead">
                <span className="auth-bcrumb">Today · Fri Sep 12</span>
                <span className="auth-bpill">On track</span>
              </div>
              <div>
                <span className="auth-bignum">1,984</span>
                <span className="auth-bunit">/ 2,000 kcal</span>
              </div>
              <div className="auth-btrack"><div className="auth-bfill" style={{ width: "92%" }} /></div>

              <div className="auth-brow">
                <span className="auth-blbl">PRO</span>
                <span className="auth-bmini"><i style={{ width: "87%", background: "#a78bfa" }} /></span>
                <span className="auth-bval">105 / 120 g</span>
              </div>
              <div className="auth-brow">
                <span className="auth-blbl">CARB</span>
                <span className="auth-bmini"><i style={{ width: "100%", background: "#f87171" }} /></span>
                <span className="auth-bval over">231 / 170 g</span>
              </div>
              <div className="auth-brow">
                <span className="auth-blbl">FAT</span>
                <span className="auth-bmini"><i style={{ width: "63%", background: "#34d399" }} /></span>
                <span className="auth-bval">76 / 60 g</span>
              </div>

              <div className="auth-bheat">
                {HEAT.map((lvl, i) => (
                  <i key={i} className={lvl ? `l${lvl}` : undefined} />
                ))}
              </div>
            </div>

            <h2 className="auth-btitle">Track your macros. Dominate your goals.</h2>
            <div className="auth-bsign">
              <i />
              <span>Built for athletes</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
