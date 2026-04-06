import { useState, useEffect, useCallback, useRef } from "react";
import { speak, stopSpeech, getVoiceInfo, setOpenAIKey, getOpenAIKey, setTTSVoice, getTTSVoice, setAccent, getAccent, storage } from "./platform.js";
import { TaliqLogo, TaliqIcon, SplashScreen, BRAND } from "./brand.jsx";

// ===== USER STORAGE SYSTEM =====
// Per-user storage: all keys prefixed with user ID
let _currentUserId = null;

const userStorage = {
  setUser(uid) { _currentUserId = uid; },
  getUser() { return _currentUserId; },
  _key(key) { return _currentUserId ? "u_" + _currentUserId + "_" + key : key; },
  async get(key) { return storage.get(userStorage._key(key)); },
  async set(key, value) { return storage.set(userStorage._key(key), value); },
  async delete(key) { return storage.delete(userStorage._key(key)); },
};

// Password hashing using Web Crypto (SHA-256) — no external libraries
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + ":" + password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Accounts management (global, not per-user)
async function getAccounts() {
  try { const r = await storage.get("app-accounts"); return r && r.value ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveAccounts(accounts) {
  await storage.set("app-accounts", JSON.stringify(accounts));
}
async function getActiveSession() {
  try { const r = await storage.get("app-active-session"); return r && r.value ? JSON.parse(r.value) : null; } catch { return null; }
}
async function setActiveSession(session) {
  if (session) await storage.set("app-active-session", JSON.stringify(session));
  else await storage.delete("app-active-session");
}

// OAuth Configuration — set via environment variables or hardcode below
const OAUTH_CONFIG = {
  google: "972075058278-3gn7ggjsiojm1gtd1of1qsetq50iofng.apps.googleusercontent.com",
  facebook: import.meta.env.VITE_FACEBOOK_APP_ID || "",
  apple: import.meta.env.VITE_APPLE_CLIENT_ID || "",
};

// Decode JWT payload (Google ID token) without external libraries
function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch { return null; }
}

// Load external script dynamically (cached)
const _loadedScripts = {};
function loadScript(src, id) {
  if (_loadedScripts[id]) return _loadedScripts[id];
  _loadedScripts[id] = new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement("script");
    s.id = id; s.src = src; s.async = true; s.defer = true;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return _loadedScripts[id];
}

// Google Sign-In using Google Identity Services
async function googleSignIn() {
  if (!OAUTH_CONFIG.google) throw new Error("Google Client ID غير مُعدّ");
  await loadScript("https://accounts.google.com/gsi/client", "google-gsi");
  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: OAUTH_CONFIG.google,
      callback: (response) => {
        const payload = decodeJwtPayload(response.credential);
        if (payload) resolve({ uid: "g_" + payload.sub, displayName: payload.name || payload.email, email: payload.email, provider: "google", avatar: payload.picture });
        else reject(new Error("فشل قراءة بيانات Google"));
      },
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: open popup manually
        window.google.accounts.id.renderButton(document.createElement("div"), { type: "standard" });
        // Use the OAuth2 popup flow instead
        const popup = window.open(
          "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + encodeURIComponent(OAUTH_CONFIG.google) + "&redirect_uri=" + encodeURIComponent(window.location.origin) + "&response_type=id_token&scope=openid%20profile%20email&nonce=" + Date.now(),
          "google-login", "width=500,height=600"
        );
        if (!popup) reject(new Error("المتصفح منع النافذة المنبثقة — فعّل pop-ups"));
        // Listen for redirect
        const interval = setInterval(() => {
          try {
            if (popup.closed) { clearInterval(interval); reject(new Error("تم إغلاق نافذة تسجيل الدخول")); return; }
            const url = popup.location.href;
            if (url.startsWith(window.location.origin)) {
              clearInterval(interval); popup.close();
              const hash = new URL(url).hash.substring(1);
              const params = new URLSearchParams(hash);
              const idToken = params.get("id_token");
              if (idToken) {
                const payload = decodeJwtPayload(idToken);
                if (payload) resolve({ uid: "g_" + payload.sub, displayName: payload.name || payload.email, email: payload.email, provider: "google", avatar: payload.picture });
                else reject(new Error("فشل قراءة بيانات Google"));
              } else reject(new Error("لم يتم الحصول على التوكن"));
            }
          } catch { /* cross-origin, keep waiting */ }
        }, 500);
      }
    });
  });
}

// Facebook Login using Facebook SDK
async function facebookSignIn() {
  if (!OAUTH_CONFIG.facebook) throw new Error("Facebook App ID غير مُعدّ");
  await loadScript("https://connect.facebook.net/en_US/sdk.js", "facebook-sdk");
  if (!window.FB._initialized) {
    window.FB.init({ appId: OAUTH_CONFIG.facebook, cookie: true, xfbml: false, version: "v19.0" });
    window.FB._initialized = true;
  }
  return new Promise((resolve, reject) => {
    window.FB.login((loginResponse) => {
      if (loginResponse.authResponse) {
        window.FB.api("/me", { fields: "id,name,email,picture.width(100)" }, (user) => {
          resolve({ uid: "fb_" + user.id, displayName: user.name, email: user.email || "", provider: "facebook", avatar: user.picture?.data?.url });
        });
      } else reject(new Error("تم إلغاء تسجيل الدخول بفيسبوك"));
    }, { scope: "public_profile,email" });
  });
}

// Apple Sign-In using Apple JS SDK
async function appleSignIn() {
  if (!OAUTH_CONFIG.apple) throw new Error("Apple Client ID غير مُعدّ");
  await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", "apple-signin");
  window.AppleID.auth.init({
    clientId: OAUTH_CONFIG.apple,
    scope: "name email",
    redirectURI: window.location.origin,
    usePopup: true,
  });
  const response = await window.AppleID.auth.signIn();
  const payload = decodeJwtPayload(response.authorization.id_token);
  const name = response.user ? (response.user.name.firstName + " " + response.user.name.lastName) : (payload?.email || "Apple User");
  return { uid: "ap_" + payload.sub, displayName: name, email: payload?.email || "", provider: "apple" };
}

// Unified OAuth handler
async function oauthSignIn(provider) {
  if (provider === "google") return googleSignIn();
  if (provider === "facebook") return facebookSignIn();
  if (provider === "apple") return appleSignIn();
  throw new Error("مزود غير معروف");
}

// ===== AUTH SCREEN =====
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login, register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccountsList] = useState([]);
  const [showProfiles, setShowProfiles] = useState(false);

  useEffect(() => { (async () => { const a = await getAccounts(); setAccountsList(a); if (a.length > 0) setShowProfiles(true); })(); }, []);

  async function handleRegister() {
    setError("");
    if (!username.trim() || !password.trim()) { setError("أدخل اسم المستخدم وكلمة المرور"); return; }
    if (username.trim().length < 3) { setError("اسم المستخدم لازم ٣ حروف على الأقل"); return; }
    if (password.trim().length < 4) { setError("كلمة المرور لازم ٤ حروف على الأقل"); return; }
    setLoading(true);
    const accs = await getAccounts();
    if (accs.find(a => a.username.toLowerCase() === username.trim().toLowerCase())) {
      setError("اسم المستخدم مستخدم — اختر غيره"); setLoading(false); return;
    }
    const uid = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const salt = crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
    const hash = await hashPassword(password.trim(), salt);
    const account = { uid, username: username.trim(), displayName: (displayName.trim() || username.trim()), hash, salt, provider: "local", created: new Date().toISOString() };
    accs.push(account);
    await saveAccounts(accs);
    await setActiveSession({ uid: account.uid, username: account.username, displayName: account.displayName });
    setLoading(false);
    onLogin(account);
  }

  async function handleLogin() {
    setError("");
    if (!username.trim() || !password.trim()) { setError("أدخل اسم المستخدم وكلمة المرور"); return; }
    setLoading(true);
    const accs = await getAccounts();
    const acc = accs.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
    if (!acc) { setError("المستخدم غير موجود"); setLoading(false); return; }
    const hash = await hashPassword(password.trim(), acc.salt);
    if (hash !== acc.hash) { setError("كلمة المرور غلط"); setLoading(false); return; }
    await setActiveSession({ uid: acc.uid, username: acc.username, displayName: acc.displayName });
    setLoading(false);
    onLogin(acc);
  }

  async function quickLogin(acc) {
    await setActiveSession({ uid: acc.uid, username: acc.username, displayName: acc.displayName });
    onLogin(acc);
  }

  const inputStyle = { width: "100%", padding: "var(--sp-4)", borderRadius: "var(--r-lg)", fontFamily: "inherit", fontSize: "var(--fs-sm)", background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", color: "var(--c-text)", outline: "none", marginBottom: "var(--sp-3)", textAlign: "right" };
  const btnStyle = { width: "100%", padding: "var(--sp-4)", borderRadius: "var(--r-lg)", border: "none", fontFamily: "inherit", fontSize: "var(--fs-md)", fontWeight: 700, cursor: "pointer" };

  // Quick profile selection if accounts exist
  if (showProfiles && accounts.length > 0 && mode === "login") return (
    <div dir="rtl" className="auth-wrapper" style={{ fontFamily: "inherit" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <TaliqLogo size={44} />
          <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-text)", marginTop: "var(--sp-4)" }}>من يتدرب اليوم؟</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-5)" }}>
          {accounts.map(acc => (
            <button key={acc.uid} onClick={() => quickLogin(acc)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-4)", borderRadius: "var(--r-lg)", border: "1px solid rgba(29,78,216,0.12)", background: "rgba(29,78,216,0.04)", cursor: "pointer", textAlign: "right", fontFamily: "inherit" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--c-accent),var(--c-success))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-lg)", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{acc.displayName.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-text)" }}>{acc.displayName}</div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>@{acc.username}</div>
              </div>
              <div style={{ fontSize: "var(--fs-lg)", color: "var(--c-accent)" }}>←</div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--sp-2)" }}>
          <button onClick={() => setShowProfiles(false)} style={{ flex: 1, padding: "var(--sp-3)", borderRadius: "var(--r-md)", border: "1px solid rgba(0,0,0,0.06)", background: "transparent", color: "var(--c-text-secondary)", fontFamily: "inherit", fontSize: "var(--fs-sm)", cursor: "pointer" }}>تسجيل دخول بحساب آخر</button>
          <button onClick={() => { setMode("register"); setShowProfiles(false); }} style={{ flex: 1, padding: "var(--sp-3)", borderRadius: "var(--r-md)", border: "none", background: "var(--c-accent)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>حساب جديد</button>
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="auth-wrapper" style={{ fontFamily: "inherit" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <TaliqLogo size={44} />
          <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-text)", marginTop: "var(--sp-4)" }}>{mode === "register" ? "حساب جديد" : "تسجيل الدخول"}</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginTop: "var(--sp-2)" }}>{mode === "register" ? "سجّل وابدأ رحلتك في اكتساب الإنجليزية" : "أدخل بياناتك لمتابعة التدريب"}</div>
        </div>

        {mode === "register" && (
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="الاسم (يظهر في ملفك الشخصي)" style={inputStyle} />
        )}
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" style={{ ...inputStyle, direction: "ltr", textAlign: "left", fontFamily: 'inherit', letterSpacing: '0.02em' }} autoComplete="username" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" type="password" style={{ ...inputStyle, direction: "ltr", textAlign: "left", fontFamily: 'inherit', letterSpacing: '0.02em' }} autoComplete={mode === "register" ? "new-password" : "current-password"}
          onKeyDown={e => { if (e.key === "Enter") { mode === "register" ? handleRegister() : handleLogin(); } }}
        />

        {error && <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-error)", textAlign: "center", marginBottom: "var(--sp-3)", padding: "var(--sp-2)", background: "rgba(220,38,38,0.08)", borderRadius: "var(--r-sm)" }}>{error}</div>}

        <button onClick={mode === "register" ? handleRegister : handleLogin} disabled={loading} style={{ ...btnStyle, background: loading ? "#a1a1aa" : "linear-gradient(135deg,var(--c-accent),var(--c-accent-hover))", color: "#fff", marginBottom: "var(--sp-3)" }}>
          {loading ? "..." : mode === "register" ? "إنشاء حساب" : "دخول"}
        </button>

        <div style={{ textAlign: "center" }}>
          {mode === "login" ? (
            <button onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: "var(--c-accent)", fontFamily: "inherit", fontSize: "var(--fs-sm)", cursor: "pointer" }}>ما عندك حساب؟ <b>سجّل الآن</b></button>
          ) : (
            <button onClick={() => { setMode("login"); setError(""); setShowProfiles(accounts.length > 0); }} style={{ background: "none", border: "none", color: "var(--c-accent)", fontFamily: "inherit", fontSize: "var(--fs-sm)", cursor: "pointer" }}>عندك حساب؟ <b>سجّل دخول</b></button>
          )}
        </div>

        {/* OAuth providers */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-tertiary)", textAlign: "center", marginBottom: "var(--sp-3)" }}>أو سجّل عن طريق</div>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            {[
              { name: "Google", key: "google", icon: "G", color: "#4285f4", bg: "rgba(66,133,244,0.1)", configured: !!OAUTH_CONFIG.google },
              { name: "Apple", key: "apple", icon: "", color: "var(--c-text)", bg: "rgba(0,0,0,0.04)", configured: !!OAUTH_CONFIG.apple },
              { name: "Facebook", key: "facebook", icon: "f", color: "#1877f2", bg: "rgba(24,119,242,0.1)", configured: !!OAUTH_CONFIG.facebook },
            ].map(p => (
              <button key={p.name} disabled={loading} onClick={async () => {
                if (!p.configured) { setError(p.name + " غير مُعدّ — أضف VITE_" + p.key.toUpperCase() + "_CLIENT_ID"); return; }
                setError(""); setLoading(true);
                try {
                  const oauthUser = await oauthSignIn(p.key);
                  // Find or create account
                  const accs = await getAccounts();
                  let acc = accs.find(a => a.provider === oauthUser.provider && a.uid === oauthUser.uid);
                  if (!acc) {
                    acc = { uid: oauthUser.uid, username: oauthUser.uid, displayName: oauthUser.displayName, email: oauthUser.email || "", provider: oauthUser.provider, avatar: oauthUser.avatar || "", hash: "", salt: "", created: new Date().toISOString() };
                    accs.push(acc);
                    await saveAccounts(accs);
                  }
                  await setActiveSession({ uid: acc.uid, username: acc.username, displayName: acc.displayName });
                  setLoading(false);
                  onLogin(acc);
                } catch (err) {
                  setLoading(false);
                  setError(err.message || "فشل تسجيل الدخول");
                }
              }} style={{ flex: 1, padding: "var(--sp-3)", borderRadius: "var(--r-md)", border: "1px solid " + (p.configured ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.02)"), background: p.configured ? p.bg : "rgba(0,0,0,0.02)", color: p.configured ? p.color : "#a1a1aa", fontFamily: "inherit", fontSize: "var(--fs-md)", fontWeight: 700, cursor: p.configured ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-2)", opacity: p.configured ? 1 : 0.5 }}>
                <span>{p.icon}</span>
                <span style={{ fontSize: "var(--fs-xs)", fontFamily: "inherit", fontWeight: 600 }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

  /* ===== DESIGN TOKENS ===== */
  :root {
    /* Colors — warm neutral palette */
    --c-bg: #f5f3f0;
    --c-surface: #ffffff;
    --c-surface-raised: #ffffff;
    --c-surface-hover: #faf9f7;
    --c-surface-sunken: #efeee9;
    --c-border: #e0ded8;
    --c-border-light: #eae8e4;
    --c-text: #1c1917;
    --c-text-secondary: #57534e;
    --c-text-tertiary: #a8a29e;
    --c-text-muted: #d6d3d1;
    --c-accent: #1d4ed8;
    --c-accent-hover: #1e40af;
    --c-accent-soft: #dbeafe;
    --c-accent-light: rgba(29,78,216,0.06);
    --c-accent-border: rgba(29,78,216,0.15);
    --c-success: #16a34a;
    --c-success-soft: #dcfce7;
    --c-success-light: rgba(22,163,74,0.06);
    --c-error: #dc2626;
    --c-error-soft: #fef2f2;
    --c-error-light: rgba(220,38,38,0.06);
    --c-warn: #ca8a04;
    --c-warn-soft: #fef9c3;
    --c-warn-light: rgba(202,138,4,0.06);

    /* Typography Scale (modular — 1.2 ratio) */
    --fs-xs: 0.75rem;    /* 12px */
    --fs-sm: 0.8125rem;  /* 13px */
    --fs-base: 0.9375rem;/* 15px */
    --fs-md: 1.0625rem;  /* 17px */
    --fs-lg: 1.25rem;    /* 20px */
    --fs-xl: 1.5rem;     /* 24px */
    --fs-2xl: 1.875rem;  /* 30px */

    /* Spacing Scale (8px base) */
    --sp-1: 4px;
    --sp-2: 8px;
    --sp-3: 12px;
    --sp-4: 16px;
    --sp-5: 20px;
    --sp-6: 24px;
    --sp-7: 32px;
    --sp-8: 40px;
    --sp-9: 48px;
    --sp-10: 64px;

    /* Radius */
    --r-sm: 6px;
    --r-md: 10px;
    --r-lg: 14px;
    --r-xl: 20px;
    --r-full: 9999px;

    /* Shadows — layered for depth */
    --sh-sm: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
    --sh-md: 0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04);
    --sh-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
    --sh-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06);
    --sh-glow: 0 0 20px rgba(29,78,216,0.12);

    /* Transitions */
    --tr-fast: 0.15s ease;
    --tr-base: 0.2s ease;
  }

  /* ===== RESET ===== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--c-bg);
    background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
    background-size: 24px 24px;
    color: var(--c-text);
    font-family: 'Noto Kufi Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: var(--fs-base);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ===== RESPONSIVE CONTAINER ===== */
  .app-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 0 var(--sp-5);
    padding-bottom: var(--sp-10);
  }
  @media (max-width: 480px) {
    .app-container { padding: 0 var(--sp-4); padding-bottom: var(--sp-9); }
    :root {
      --fs-xs: 0.6875rem;
      --fs-sm: 0.75rem;
      --fs-base: 0.875rem;
      --fs-md: 1rem;
      --fs-lg: 1.125rem;
      --fs-xl: 1.375rem;
      --fs-2xl: 1.625rem;
    }
  }
  @media (min-width: 768px) {
    .app-container { max-width: 720px; padding: 0 var(--sp-7); }
  }

  /* ===== CARD SYSTEM — with real depth ===== */
  .card {
    background: var(--c-surface);
    border: none;
    border-radius: var(--r-xl);
    padding: var(--sp-6);
    margin-bottom: var(--sp-5);
    box-shadow: var(--sh-md);
    animation: fadeUp 0.3s ease;
    transition: box-shadow var(--tr-base), transform var(--tr-base);
  }
  .card:hover { box-shadow: var(--sh-lg); }
  .card--accent {
    background: var(--c-accent-soft);
    box-shadow: var(--sh-sm);
    border: 1px solid var(--c-accent-border);
  }
  .card--success {
    background: var(--c-success-soft);
    box-shadow: var(--sh-sm);
    border: 1px solid rgba(22,163,74,0.12);
  }
  .card--warn {
    background: var(--c-warn-soft);
    box-shadow: var(--sh-sm);
    border: 1px solid rgba(202,138,4,0.12);
  }
  .card--flat {
    box-shadow: none;
    border: 1px solid var(--c-border-light);
    padding: var(--sp-4);
  }
  .card--interactive {
    cursor: pointer;
  }
  .card--interactive:hover {
    transform: translateY(-2px);
    box-shadow: var(--sh-lg);
  }

  /* ===== BUTTON SYSTEM ===== */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    font-family: inherit;
    font-weight: 600;
    font-size: var(--fs-base);
    border: none;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: transform var(--tr-fast), background var(--tr-base), opacity var(--tr-base);
    min-height: 44px;
    padding: var(--sp-3) var(--sp-5);
    line-height: 1.4;
  }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.5; cursor: default; }
  .btn--primary {
    background: var(--c-accent);
    color: #fff;
    box-shadow: 0 2px 4px rgba(29,78,216,0.25), 0 1px 2px rgba(29,78,216,0.15);
  }
  .btn--primary:hover:not(:disabled) {
    background: var(--c-accent-hover);
    box-shadow: 0 4px 8px rgba(29,78,216,0.3), 0 2px 4px rgba(29,78,216,0.2);
    transform: translateY(-1px);
  }
  .btn--secondary {
    background: var(--c-surface);
    color: var(--c-accent);
    border: 1px solid var(--c-accent-border);
    box-shadow: var(--sh-sm);
  }
  .btn--secondary:hover:not(:disabled) {
    background: var(--c-accent-soft);
    box-shadow: var(--sh-md);
  }
  .btn--ghost {
    background: transparent;
    color: var(--c-text-secondary);
  }
  .btn--ghost:hover:not(:disabled) {
    background: var(--c-surface-sunken);
  }
  .btn--success {
    background: var(--c-success);
    color: #fff;
    box-shadow: 0 2px 4px rgba(22,163,74,0.25);
  }
  .btn--danger {
    background: transparent;
    color: var(--c-error);
    border: 1px solid rgba(220,38,38,0.15);
  }
  .btn--sm {
    font-size: var(--fs-sm);
    min-height: 36px;
    padding: var(--sp-2) var(--sp-3);
  }
  .btn--lg {
    font-size: var(--fs-md);
    min-height: 52px;
    padding: var(--sp-4) var(--sp-6);
    font-weight: 700;
    border-radius: var(--r-lg);
  }
  .btn--full { width: 100%; }

  /* ===== INPUT SYSTEM ===== */
  .input {
    width: 100%;
    font-family: inherit;
    font-size: var(--fs-base);
    padding: var(--sp-4);
    border: 2px solid var(--c-border);
    border-radius: var(--r-lg);
    background: var(--c-surface);
    color: var(--c-text);
    outline: none;
    transition: border-color var(--tr-base), box-shadow var(--tr-base);
    min-height: 52px;
  }
  .input:focus {
    border-color: var(--c-accent);
    box-shadow: 0 0 0 4px var(--c-accent-light), var(--sh-md);
  }
  .input::placeholder { color: var(--c-text-muted); }
  .input--mono {
    font-family: 'IBM Plex Mono', monospace;
    direction: ltr;
    text-align: left;
  }
  textarea.input { min-height: 100px; resize: vertical; line-height: 1.8; }

  /* ===== TAB NAVIGATION — modern pill style ===== */
  .tabs {
    display: flex;
    gap: var(--sp-2);
    margin-bottom: var(--sp-6);
    padding: var(--sp-1);
    background: var(--c-surface-sunken);
    border-radius: var(--r-lg);
  }
  .tab {
    flex: 1;
    padding: var(--sp-3) var(--sp-3);
    border: none;
    background: transparent;
    color: var(--c-text-tertiary);
    font-family: inherit;
    font-size: var(--fs-sm);
    font-weight: 600;
    cursor: pointer;
    border-radius: var(--r-md);
    transition: all var(--tr-base);
    min-height: 44px;
    text-align: center;
  }
  .tab:hover { color: var(--c-text-secondary); background: rgba(255,255,255,0.5); }
  .tab--active {
    color: var(--c-accent);
    background: var(--c-surface);
    box-shadow: var(--sh-sm);
  }

  /* ===== HEADER ===== */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--sp-5) 0 var(--sp-4);
  }
  .header__badges {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-1);
    padding: 6px var(--sp-3);
    border-radius: var(--r-full);
    font-size: var(--fs-xs);
    font-weight: 600;
    background: var(--c-surface);
    color: var(--c-accent);
    font-family: 'IBM Plex Mono', monospace;
    box-shadow: var(--sh-sm);
    border: 1px solid var(--c-border-light);
  }
  .badge--success {
    color: var(--c-success);
  }

  /* ===== EXERCISE GRID (Training tab) ===== */
  .exercise-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--sp-3);
  }
  .exercise-grid .card {
    margin-bottom: 0;
    cursor: pointer;
    transition: transform var(--tr-base), box-shadow var(--tr-base);
    border: 1px solid var(--c-border-light);
  }
  .exercise-grid .card:hover {
    transform: translateY(-3px);
    box-shadow: var(--sh-lg);
    border-color: var(--c-accent-border);
  }
  @media (min-width: 480px) {
    .exercise-grid { grid-template-columns: 1fr 1fr; }
  }

  /* ===== PROGRESS GRID ===== */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-3);
  }
  @media (max-width: 380px) {
    .stats-grid { grid-template-columns: 1fr; gap: var(--sp-2); }
  }

  /* ===== PHRASE CATEGORIES (horizontal scroll) ===== */
  .pill-scroll {
    display: flex;
    gap: var(--sp-2);
    overflow-x: auto;
    padding-bottom: var(--sp-2);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .pill-scroll::-webkit-scrollbar { display: none; }
  .pill {
    flex-shrink: 0;
    padding: var(--sp-2) var(--sp-4);
    border-radius: var(--r-full);
    border: none;
    background: var(--c-surface);
    color: var(--c-text-secondary);
    font-family: inherit;
    font-size: var(--fs-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--tr-base);
    min-height: 40px;
    white-space: nowrap;
    box-shadow: var(--sh-sm);
  }
  .pill:hover { background: var(--c-surface-hover); box-shadow: var(--sh-md); }
  .pill--active {
    background: var(--c-accent);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(29,78,216,0.25);
  }

  /* ===== WEEK CIRCLES ===== */
  .week-row {
    display: flex;
    gap: var(--sp-2);
    flex-wrap: wrap;
    justify-content: center;
  }
  .week-dot {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--fs-xs);
    font-weight: 700;
    border: 2px solid var(--c-border);
    transition: all var(--tr-base);
    background: var(--c-surface);
    box-shadow: var(--sh-sm);
  }
  .week-dot--done { background: var(--c-accent); border-color: var(--c-accent); color: #fff; box-shadow: 0 2px 4px rgba(29,78,216,0.2); }
  .week-dot--current { border-color: var(--c-accent); color: var(--c-accent); box-shadow: var(--sh-glow); }
  .week-dot--future { opacity: 0.3; box-shadow: none; }

  /* ===== PROGRESS BAR ===== */
  .progress-bar {
    height: 8px;
    border-radius: var(--r-full);
    background: var(--c-surface-sunken);
    overflow: hidden;
  }
  .progress-bar__fill {
    height: 100%;
    border-radius: var(--r-full);
    background: linear-gradient(90deg, var(--c-accent), #3b82f6);
    transition: width 0.4s ease;
  }

  /* ===== STEP INDICATOR ===== */
  .steps {
    display: flex;
    gap: var(--sp-1);
    margin-bottom: var(--sp-6);
  }
  .steps__bar {
    flex: 1;
    height: 6px;
    border-radius: var(--r-full);
    background: var(--c-surface-sunken);
    transition: background 0.3s;
    overflow: hidden;
  }
  .steps__bar--done { background: var(--c-success); }
  .steps__bar--active { background: linear-gradient(90deg, var(--c-accent), #3b82f6); }

  /* ===== SECTION HEADERS ===== */
  .section-title {
    font-size: var(--fs-sm);
    font-weight: 700;
    color: var(--c-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--sp-4);
  }

  /* ===== HERO CARD (Today's session) — Cambly/Preply level ===== */
  .hero-card {
    background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #3b82f6 100%);
    color: #fff;
    border-radius: var(--r-xl);
    padding: var(--sp-8) var(--sp-7);
    margin-bottom: var(--sp-6);
    box-shadow: 0 12px 28px rgba(29,78,216,0.25), 0 4px 8px rgba(29,78,216,0.15);
    animation: fadeUp 0.4s ease;
    position: relative;
    overflow: hidden;
  }
  .hero-card::before {
    content: '';
    position: absolute;
    top: -40%; right: -20%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero-card::after {
    content: '';
    position: absolute;
    bottom: -30%; left: -10%;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero-card h2 { font-size: var(--fs-xl); font-weight: 800; margin-bottom: var(--sp-2); position: relative; z-index: 1; }
  .hero-card p { font-size: var(--fs-base); opacity: 0.8; position: relative; z-index: 1; line-height: 1.6; }
  .hero-card .hero-quote {
    font-size: var(--fs-sm); opacity: 0.6; font-style: italic;
    margin-bottom: var(--sp-5); position: relative; z-index: 1;
    border-right: 2px solid rgba(255,255,255,0.3); padding-right: var(--sp-3);
  }

  /* ===== STATS CARD ===== */
  .stat-card {
    background: var(--c-surface);
    border-radius: var(--r-xl);
    padding: var(--sp-5) var(--sp-4);
    text-align: center;
    box-shadow: var(--sh-md);
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--c-accent), #3b82f6);
  }
  .stat-card__value {
    font-size: var(--fs-2xl);
    font-weight: 800;
    color: var(--c-accent);
    font-family: 'IBM Plex Mono', monospace;
    line-height: 1;
    margin-bottom: var(--sp-2);
  }
  .stat-card__label {
    font-size: var(--fs-xs);
    color: var(--c-text-tertiary);
    font-weight: 500;
  }

  /* ===== AUTH SCREEN ===== */
  .auth-wrapper {
    min-height: 100vh; min-height: 100dvh;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 100%);
    padding: var(--sp-5);
  }
  .auth-card {
    max-width: 420px; width: 100%;
    background: var(--c-surface);
    border-radius: var(--r-xl);
    padding: var(--sp-8) var(--sp-7);
    box-shadow: var(--sh-xl);
    animation: fadeUp 0.5s ease;
  }
  @media (max-width: 480px) {
    .auth-card { padding: var(--sp-6) var(--sp-5); border-radius: var(--r-lg); }
  }

  /* ===== ONBOARDING ===== */
  .onboard-wrapper {
    min-height: 100vh; min-height: 100dvh;
    display: flex; align-items: center; justify-content: center;
    background: var(--c-bg);
    background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
    background-size: 24px 24px;
    padding: var(--sp-5);
  }
  .onboard-card {
    max-width: 500px; width: 100%;
    background: var(--c-surface);
    border-radius: var(--r-xl);
    padding: var(--sp-8) var(--sp-7);
    box-shadow: var(--sh-xl);
    animation: fadeUp 0.4s ease;
  }
  @media (max-width: 480px) {
    .onboard-card { padding: var(--sp-6) var(--sp-5); }
  }

  /* ===== ENGLISH TEXT — readable sans-serif ===== */
  [dir="ltr"], [style*="direction: ltr"], [style*="direction:ltr"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    letter-spacing: -0.01em;
  }

  /* ===== UTILITY CLASSES ===== */
  .text-center { text-align: center; }
  .text-left { text-align: left; direction: ltr; }
  .text-mono { font-family: 'IBM Plex Mono', monospace; }
  .text-muted { color: var(--c-text-tertiary); }
  .text-accent { color: var(--c-accent); }
  .text-success { color: var(--c-success); }
  .text-error { color: var(--c-error); }
  .fw-600 { font-weight: 600; }
  .fw-700 { font-weight: 700; }
  .mb-2 { margin-bottom: var(--sp-2); }
  .mb-3 { margin-bottom: var(--sp-3); }
  .mb-4 { margin-bottom: var(--sp-4); }
  .mb-5 { margin-bottom: var(--sp-5); }
  .mt-4 { margin-top: var(--sp-4); }
  .mt-5 { margin-top: var(--sp-5); }

  /* ===== CHAT BUBBLES ===== */
  .chat-row { display: flex; gap: var(--sp-2); margin-bottom: var(--sp-3); align-items: flex-start; }
  .chat-row--sent { flex-direction: row-reverse; }
  .chat-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-xs); font-weight: 700; flex-shrink: 0;
    background: var(--c-surface-sunken); color: var(--c-text-secondary);
  }
  .chat-avatar--sent { background: var(--c-accent); color: #fff; }
  .bubble {
    max-width: 80%; padding: var(--sp-3) var(--sp-4);
    font-size: var(--fs-sm); direction: ltr; text-align: left; line-height: 1.7;
    box-shadow: var(--sh-sm);
  }
  .bubble--sent { background: var(--c-accent); color: #fff; border-radius: var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg); }
  .bubble--received { background: var(--c-surface); color: var(--c-text); border-radius: var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm); }

  /* ===== SHADOW LINE (Shadowing exercise) ===== */
  .shadow-line {
    padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md);
    margin-bottom: var(--sp-2); font-size: var(--fs-sm);
    direction: ltr; text-align: left; line-height: 1.7;
    transition: all 0.3s; display: flex; align-items: center; gap: var(--sp-2);
    background: rgba(0,0,0,0.015); border: 1px solid rgba(0,0,0,0.03);
    color: var(--c-text-secondary);
  }
  .shadow-line--current {
    background: var(--c-accent-light); border-color: var(--c-accent-border);
    color: var(--c-accent-hover); font-weight: 600; font-size: var(--fs-base);
    transform: scale(1.01); box-shadow: var(--sh-sm);
  }
  .shadow-line--past { color: var(--c-text-tertiary); }

  /* ===== TOGGLE BUTTON (Settings) ===== */
  .toggle-btn {
    padding: var(--sp-2) var(--sp-3); border-radius: var(--r-sm);
    border: 1px solid var(--c-border); background: transparent;
    color: var(--c-text-secondary); font-family: inherit;
    font-size: var(--fs-sm); cursor: pointer; transition: all var(--tr-base);
    min-height: 36px;
  }
  .toggle-btn:hover { background: var(--c-surface-hover); }
  .toggle-btn--active {
    border-color: var(--c-accent-border); background: var(--c-accent-light);
    color: var(--c-accent); font-weight: 600;
  }

  /* ===== WORD OPTION (Sentence building) ===== */
  .word-btn {
    padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md);
    border: 1px solid var(--c-border-light); background: var(--c-surface);
    cursor: pointer; transition: all 0.2s; font-family: inherit;
    font-size: var(--fs-sm); direction: ltr; box-shadow: var(--sh-sm);
  }
  .word-btn:hover { border-color: var(--c-accent-border); box-shadow: var(--sh-md); }
  .word-btn--selected { opacity: 0.4; border-color: var(--c-success); background: var(--c-success-light); }

  /* ===== STEP BADGE (Daily session) ===== */
  .step-badge {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-sm); font-weight: 700; transition: all 0.3s;
    background: var(--c-surface-sunken); color: var(--c-text-tertiary);
  }
  .step-badge--done { background: var(--c-success); color: #fff; box-shadow: 0 2px 4px rgba(22,163,74,0.2); }
  .step-badge--active { background: var(--c-accent); color: #fff; box-shadow: 0 0 12px rgba(29,78,216,0.3); }

  /* ===== PHRASE ITEM ===== */
  .phrase-item {
    display: flex; align-items: center; gap: var(--sp-3);
    padding: var(--sp-3); border-radius: var(--r-md);
    margin-bottom: var(--sp-2); cursor: pointer; transition: all var(--tr-base);
    background: rgba(0,0,0,0.015); border: 1px solid rgba(0,0,0,0.03);
  }
  .phrase-item:hover { background: rgba(0,0,0,0.03); }
  .phrase-item--done { background: var(--c-success-light); border-color: rgba(22,163,74,0.12); }
  .phrase-item--review { background: var(--c-accent-light); border-color: var(--c-accent-border); }
  .phrase-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-xs); font-weight: 700; flex-shrink: 0;
    background: var(--c-border); color: var(--c-text-tertiary);
    transition: all var(--tr-base);
  }
  .phrase-circle--active { background: var(--c-accent); color: #fff; }
  .phrase-circle--done { background: var(--c-success); color: #fff; }

  /* ===== OPTION ITEM (Quiz, exercises) ===== */
  .option-item {
    padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md);
    margin-bottom: var(--sp-2); cursor: pointer;
    font-size: var(--fs-sm); direction: ltr; text-align: left; line-height: 1.7;
    transition: all 0.2s; border: 1px solid rgba(0,0,0,0.04);
    background: rgba(0,0,0,0.015);
  }
  .option-item:hover { background: rgba(0,0,0,0.04); border-color: var(--c-accent-border); }
  .option-item--correct { background: var(--c-success-light); border-color: rgba(22,163,74,0.3); }
  .option-item--wrong { background: var(--c-error-light); border-color: rgba(220,38,38,0.3); }
  .option-item--picked { box-shadow: var(--sh-sm); }
  .option-item--dim { opacity: 0.3; }

  /* ===== RESPONSIVE FIXES ===== */
  @media (max-width: 380px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .hero-card { padding: var(--sp-5); }
    .card { padding: var(--sp-4); }
    .step-badge { width: 30px; height: 30px; font-size: var(--fs-xs); }
  }
  @media (min-width: 1024px) {
    .app-container { max-width: 800px; }
  }

  /* ===== ANIMATIONS (subtle only) ===== */
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Global button base */
  button { transition: transform var(--tr-fast), opacity var(--tr-base); }
`;

const SHADOW_LINES = [
  ["Good morning. How are you today?", "I would like a cup of coffee, please.", "Excuse me, where is the nearest pharmacy?", "Thank you very much for your help.", "Can I have the bill, please?", "I need to make an appointment.", "Could you speak more slowly, please?", "I'm sorry, I didn't understand that.", "What time does the store close?", "Have a nice day!"],
  ["I've been living here for about five years.", "Could you recommend a good restaurant nearby?", "I need to reschedule my appointment to next week.", "The weather has been really nice lately.", "I'm looking for something in a medium size.", "Let me check my calendar and get back to you.", "I appreciate your patience with this.", "Would it be possible to get a refund?", "I'll send you the details by email.", "That's exactly what I was looking for."],
  ["I've been meaning to bring this up for a while now.", "Based on what you're saying, I think we should consider another option.", "I completely understand your concern, and here's what I suggest.", "Would it be possible to explore a different approach to this?", "Let me walk you through the details so we're on the same page.", "I want to make sure we're aligned before we move forward.", "From my experience, this tends to work better in the long run.", "I'd appreciate it if you could look into this for me.", "Let me summarize what we've discussed so far.", "I believe this is the best path forward given the circumstances."],
];
const STORIES = [
  { t: "رحلة إلى لندن", lines: ["Faisal had always dreamed of visiting London.", "He booked his flight and hotel online by himself.", "At the airport, he asked for directions in English.", "Excuse me, which gate is for the London flight?", "The flight attendant smiled and pointed the way.", "In London, he took the underground to his hotel.", "He ordered fish and chips at a local restaurant.", "The waiter asked, Would you like anything to drink?", "Just water, please, Faisal replied with confidence.", "He realized his English was better than he thought."] },
  { t: "عند الدكتور", lines: ["Huda moved to a new city and needed a doctor.", "She called the clinic to book an appointment.", "I would like to see a doctor this week, she said.", "The receptionist asked about her symptoms.", "I have had a headache for three days, Huda explained.", "The doctor examined her carefully and asked questions.", "Have you been under a lot of stress recently?", "Yes, I just moved and started a new routine.", "The doctor recommended rest and staying hydrated.", "Huda left feeling relieved and understood."] },
  { t: "اجتماع أولياء الأمور", lines: ["Tariq went to his daughter's school for a meeting.", "The teacher greeted him in English warmly.", "Thank you for coming. Sara is a wonderful student.", "She is very good at math but needs help with reading.", "Tariq listened carefully and took mental notes.", "What can I do at home to help her, he asked.", "Read with her for fifteen minutes every night.", "That sounds simple enough, Tariq said.", "He felt proud that he understood the whole conversation.", "On the way home, he started planning their reading time."] },
  { t: "التسوق أونلاين", lines: ["Mona wanted to buy a laptop from an international store.", "She compared prices and read reviews in English.", "This one has great battery life, one review said.", "She added it to her cart and went to checkout.", "The website asked for her shipping address.", "She typed everything carefully in English.", "A chat window popped up asking if she needed help.", "Yes, does this ship to Saudi Arabia, she typed.", "The agent confirmed and gave her a tracking number.", "The laptop arrived in perfect condition a week later."] },
  { t: "مقابلة العمل", lines: ["Ahmed prepared carefully for his interview.", "He reviewed the company website and recent news.", "Tell me about yourself, the interviewer began.", "Ahmed spoke about his ten years of experience.", "He mentioned specific projects he was proud of.", "The interviewer was impressed by his preparation.", "What motivates you in your career, she asked.", "Solving problems and helping my team grow, he said.", "Both sides felt the interview went very well.", "Ahmed received an offer the following week."] },
  { t: "في المطعم", lines: ["Salma and her husband went to a nice restaurant.", "Good evening. A table for two, please, she said.", "The waiter brought the menu and explained the specials.", "Tonight we have grilled salmon with lemon sauce.", "That sounds delicious. I will have that, Salma said.", "Her husband ordered a steak, medium well.", "They enjoyed their meal and had a great conversation.", "Could we have the dessert menu, please, she asked.", "They shared a chocolate cake and drank coffee.", "The evening was perfect from start to finish."] },
  { t: "الجار الجديد", lines: ["A new family moved in next door to Youssef.", "He decided to welcome them with a friendly visit.", "Hi, I am Youssef. Welcome to the neighborhood.", "The neighbor smiled and introduced his family.", "We just moved from Canada, the neighbor explained.", "If you need anything, please do not hesitate to ask.", "They talked about the best schools and grocery stores.", "Youssef recommended his favorite local restaurant.", "They exchanged phone numbers before saying goodbye.", "A simple conversation turned into a real friendship."] },
  { t: "أول يوم في الدورة", lines: ["Layla signed up for an online photography course.", "The instructor spoke English with a British accent.", "Welcome everyone. Let me introduce myself first.", "She took notes in English for the first time.", "Today we will learn about lighting and composition.", "The instructor showed examples and asked for opinions.", "Layla typed in the chat, I think the second photo is better.", "Great observation, the instructor replied.", "She felt a rush of confidence after being noticed.", "By the end of the class, she had learned ten new words."] },
];
const PROMPTS = [
  { en: "Describe your favorite place to visit", ar: "وصف مكانك المفضل", starters: ["My favorite place is...", "I usually go there when...", "What I love about it is...", "The last time I visited, I...", "I would recommend it because..."] },
  { en: "Talk about a meal you love to cook", ar: "أكلة تحب تسويها", starters: ["One of my favorite dishes is...", "To make it, you need...", "First, you start by...", "The secret ingredient is...", "I learned this recipe from..."] },
  { en: "Explain something you learned recently", ar: "شيء تعلمته مؤخراً", starters: ["Recently, I learned about...", "What surprised me was...", "The most interesting part is...", "I learned it by...", "I want to learn more about..."] },
  { en: "Describe your ideal weekend", ar: "وصف نهاية أسبوع مثالية", starters: ["My perfect weekend starts with...", "In the morning, I like to...", "For lunch, I usually...", "In the afternoon, I enjoy...", "By the evening, I feel..."] },
  { en: "Talk about a trip you took", ar: "رحلة سويتها", starters: ["A few years ago, I traveled to...", "The best part of the trip was...", "I tried... for the first time.", "One funny thing that happened was...", "I would go back because..."] },
  { en: "Describe a person who influenced you", ar: "شخص أثّر فيك", starters: ["Someone who really influenced me is...", "I met this person when...", "What I admire about them is...", "They taught me that...", "Because of them, I now..."] },
  { en: "Explain your job to a stranger", ar: "اشرح وظيفتك لشخص غريب", starters: ["I work in the field of...", "Basically, what I do is...", "A typical day looks like...", "The best part about my job is...", "The most challenging thing is..."] },
  { en: "Talk about a goal for this year", ar: "هدف تبي تأكّده هالسنة", starters: ["One of my goals this year is...", "The reason I chose this goal is...", "To achieve it, I need to...", "So far, I have...", "By the end of the year, I hope to..."] },
  { en: "Describe how you spend your evenings", ar: "كيف تقضي أمسياتك", starters: ["After a long day, I usually...", "Sometimes I like to...", "My family and I often...", "If I have free time, I...", "Before I sleep, I always..."] },
  { en: "Talk about a hobby or skill you enjoy", ar: "هواية أو مهارة تستمتع فيها", starters: ["I've been doing... for about...", "I got into it because...", "What I enjoy most about it is...", "It has taught me...", "I would recommend it to anyone who..."] },
  { en: "Describe a challenge you overcame", ar: "تحدي تغلبت عليه", starters: ["A few years ago, I faced...", "The hardest part was...", "I tried to solve it by...", "What helped me the most was...", "Looking back, I learned that..."] },
  { en: "Talk about what makes a good friend", ar: "صفات الصديق الجيد", starters: ["In my opinion, a good friend is someone who...", "One important quality is...", "For example, my best friend...", "I also believe that...", "The best friendships I've seen..."] },
];
const PHRASES = [
  { cat: "التعارف والمجاملات", icon: "٦", items: [
    { en: "Nice to meet you. Where are you from?", ar: "تشرفنا. من وين أنت؟" },
    { en: "I've heard great things about you.", ar: "سمعت عنك أشياء حلوة." },
    { en: "How long have you been living here?", ar: "من متى وأنت ساكن هنا؟" },
    { en: "What do you do for a living?", ar: "وش شغلك؟ (سؤال مهذب)" },
    { en: "It was really nice talking to you.", ar: "كان ممتع إني أتكلم معك." },
  ]},
  { cat: "السفر والمطار", icon: "٧", items: [
    { en: "Excuse me, where is gate number seven?", ar: "لو سمحت، وين بوابة رقم ٧؟" },
    { en: "I'd like to check in for my flight, please.", ar: "أبي أسوي تشيك إن لرحلتي." },
    { en: "Is there a direct flight or do I have a layover?", ar: "في رحلة مباشرة أو عندي توقف؟" },
    { en: "Could you help me find my connecting flight?", ar: "تقدر تساعدني ألاقي رحلتي المتصلة؟" },
    { en: "My luggage didn't arrive. Where can I report this?", ar: "شنطتي ما وصلت. وين أبلّغ؟" },
  ]},
  { cat: "المطاعم والطلبات", icon: "١", items: [
    { en: "A table for two, please.", ar: "طاولة لشخصين، لو سمحت." },
    { en: "What do you recommend from the menu?", ar: "وش تنصح من القائمة؟" },
    { en: "I'm allergic to nuts. Does this contain any?", ar: "عندي حساسية مكسرات. هل فيها؟" },
    { en: "Could we have the bill, please?", ar: "ممكن الحساب لو سمحت؟" },
    { en: "The food was excellent. Thank you.", ar: "الأكل كان ممتاز. شكراً لك." },
  ]},
  { cat: "المواعيد والاتصالات", icon: "١٠", items: [
    { en: "I'd like to make an appointment, please.", ar: "أبي أحجز موعد لو سمحت." },
    { en: "Is it possible to reschedule to next week?", ar: "ممكن أأجّل الموعد للأسبوع الجاي؟" },
    { en: "I'm calling to follow up on my request.", ar: "أتصل أتابع طلبي." },
    { en: "Could you transfer me to the right department?", ar: "ممكن تحوّلني للقسم المختص؟" },
    { en: "Thank you for your help. Have a nice day.", ar: "شكراً على مساعدتك. يوم سعيد." },
  ]},
  { cat: "إبداء الرأي والنقاش", icon: "٢٥", items: [
    { en: "I see it differently. From my perspective...", ar: "أشوفها بشكل مختلف. من وجهة نظري..." },
    { en: "That's a good point. I also think...", ar: "نقطة ممتازة. وأنا أيضاً أشوف..." },
    { en: "I agree overall, but I have one concern.", ar: "بشكل عام متفق، بس عندي تحفّظ." },
    { en: "Could you explain why you think that?", ar: "تقدر توضّح ليش تشوف كذا؟" },
    { en: "Let me think about it and get back to you.", ar: "خلني أفكر فيها وأرجعلك." },
  ]},
  { cat: "عبارات إنقاذ", icon: "🛟", items: [
    { en: "Sorry, I didn't catch that. Could you repeat?", ar: "آسف ما فهمت. تقدر تعيد؟" },
    { en: "Could you speak a bit more slowly, please?", ar: "ممكن تتكلم أبطأ شوي؟" },
    { en: "What does that word mean exactly?", ar: "وش معنى هالكلمة بالضبط؟" },
    { en: "How do you say... in English?", ar: "كيف تقول... بالإنجليزي؟" },
    { en: "I understand, but let me make sure...", ar: "فاهم، بس خلني أتأكد..." },
  ]},
  { cat: "العمل والاجتماعات", icon: "💼", items: [
    { en: "Let me give you a quick update on this.", ar: "خلني أعطيك تحديث سريع." },
    { en: "I'd like to suggest a different approach.", ar: "أبي أقترح طريقة ثانية." },
    { en: "Can we agree on the next steps?", ar: "نقدر نتفق على الخطوات الجاية؟" },
    { en: "I'll take care of this and follow up.", ar: "أنا آخذها على عاتقي وأتابع." },
    { en: "Let me summarize what we discussed.", ar: "خلني ألخّص اللي ناقشناه." },
  ]},
];
const MOTIV = [
  "تخيّل نفسك ترد على الأجنبي بثقة بدون تفكير — تمرّن على جملتين اليوم وبتكون أقرب",
  "المشكلة مو ذكاءك — المشكلة كانت الطريقة. هالبرنامج مبني على أبحاث اكتساب اللغة الحقيقية",
  "٥ دقائق اليوم = جملة جديدة تطلع منك تلقائياً لما تحتاجها في الحياة الحقيقية",
  "الجمل الجاهزة = سلاحك السري. في المطعم، الفندق، المطار — جاهز لأي موقف",
  "لا تترجم في راسك — ردّد الجملة الإنجليزية مباشرة. عقلك يبني مسار جديد كل مرة",
  "بعد ٤ أسابيع: تطلب في المطعم، تحجز بالفندق، تتكلم مع جيرانك — كله بثقة",
  "كل مرة تتكلم لوحدك بالإنجليزي، لسانك يتعوّد ويصير أسرع. الحرج يختفي بالتكرار",
  "آخر مرة تمرّنت؟ اليوم تكمل السلسلة. حتى ٥ دقائق تسوي فرق",
];

const CONVERSATIONS = [
  { title: "في الفندق", icon: "٣", steps: [
    { speaker: "موظف الاستقبال", text: "Good evening. Welcome to our hotel. Do you have a reservation?", prompt: "أكّد حجزك", opts: ["Yes, I have a reservation under the name Al-Rashid.", "I think I booked something online recently.", "I'm here to stay at the hotel."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "I found it. A double room for three nights. Could I see your ID?", prompt: "أعطِ معلوماتك", opts: ["Of course. Here's my passport. Is breakfast included?", "Sure, let me look for it in my bag.", "Yes, here you go."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Breakfast is from 7 to 10. Your room is on the fifth floor.", prompt: "اسأل عن الخدمات", opts: ["Great. Is there a gym and pool available for guests?", "That sounds fine. Thank you.", "OK, I'll find it."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Yes, both are on the second floor. Open until 10 PM.", prompt: "اطلب شيء إضافي", opts: ["Perfect. Could I also get some extra towels sent to the room?", "That's nice to know. Thank you.", "I'll check them out later."], ans: 0 },
    { speaker: "موظف الاستقبال", text: "Absolutely. Is there anything else I can help you with?", prompt: "اشكره واختم", opts: ["That's everything. Thank you so much for your help.", "No, I think that's all for now.", "I'm fine, thanks."], ans: 0 },
  ]},
  { title: "عند الطبيب", icon: "٢", steps: [
    { speaker: "الطبيب", text: "Good morning. What brings you in today?", prompt: "اشرح أعراضك", opts: ["I've been having a persistent headache for the past three days, along with some fatigue.", "My head hurts and I feel tired.", "I haven't been feeling well lately."], ans: 0 },
    { speaker: "الطبيب", text: "I see. Have you experienced any other symptoms like fever or nausea?", prompt: "أجب بتفصيل", opts: ["No fever, but I've noticed some mild dizziness, especially in the morning.", "I don't think so. Maybe a little.", "Not really, just the headache."], ans: 0 },
    { speaker: "الطبيب", text: "Have you been under a lot of stress recently? Any changes in sleep?", prompt: "اشرح وضعك", opts: ["Yes, actually. I've been sleeping less than usual and my schedule has been very hectic.", "Kind of. I've been busy with a lot of things.", "Maybe a little stressed, nothing major."], ans: 0 },
    { speaker: "الطبيب", text: "I'd recommend some blood tests just to be safe. I'll also prescribe something for the headache.", prompt: "اسأل عن العلاج", opts: ["That sounds good. How often should I take the medication, and are there any side effects?", "OK, I'll do the blood tests. Thank you.", "Sure, whatever you recommend."], ans: 0 },
    { speaker: "الطبيب", text: "Take it twice daily with food. Come back in a week if it doesn't improve.", prompt: "اشكره وأكّد", opts: ["Thank you, doctor. I'll follow your advice and schedule a follow-up if needed.", "OK, I'll come back if it doesn't get better.", "Thanks for seeing me today."], ans: 0 },
  ]},
  { title: "اجتماع أولياء أمور", icon: "٤", steps: [
    { speaker: "المعلم/ة", text: "Thank you for coming. Your son Omar is a bright student.", prompt: "اشكره واسأل", opts: ["Thank you. I'm glad to hear that. How is he doing in his main subjects?", "That's great to hear. Thank you.", "Good, I was hoping he was doing well."], ans: 0 },
    { speaker: "المعلم/ة", text: "He's excellent in math and science, but he needs to improve his reading.", prompt: "اسأل عن التفاصيل", opts: ["I see. Could you give me specific examples of where he's struggling?", "I noticed that at home too.", "What can we do about that?"], ans: 0 },
    { speaker: "المعلم/ة", text: "He reads slowly and sometimes skips words. I think more practice at home would help.", prompt: "اقترح خطة", opts: ["That makes sense. What if we start with fifteen minutes of reading together every evening?", "I'll try to read with him more.", "We'll work on it at home."], ans: 0 },
    { speaker: "المعلم/ة", text: "That would be wonderful. I can also send home some recommended books.", prompt: "وافق واسأل", opts: ["I'd really appreciate that. Are there any apps or websites you'd also recommend?", "Sure, that would be helpful. Thank you.", "OK, please send them."], ans: 0 },
    { speaker: "المعلم/ة", text: "Yes, I'll email you a list. Feel free to reach out if you have any questions.", prompt: "اختم بشكر", opts: ["Thank you so much for your time and guidance. I'll stay in touch.", "Great, thanks for everything.", "I appreciate it. Have a good day."], ans: 0 },
  ]},
  { title: "استئجار شقة", icon: "🏠", steps: [
    { speaker: "صاحب الشقة", text: "Hi, thanks for coming to see the apartment. Let me show you around.", prompt: "اسأل عن التفاصيل", opts: ["Thank you. I'm really interested. How many bedrooms does it have?", "It looks nice. Tell me more about it.", "Thanks. I saw the ad online."], ans: 0 },
    { speaker: "صاحب الشقة", text: "It has two bedrooms, one bathroom, and a balcony. Utilities are included.", prompt: "اسأل عن الشروط", opts: ["That's great. What's the monthly rent, and is there a minimum lease period?", "How much is the rent per month?", "That sounds reasonable."], ans: 0 },
    { speaker: "صاحب الشقة", text: "It's fifteen hundred a month with a one-year lease. Two months deposit required.", prompt: "فاوض بأدب", opts: ["I see. Would you consider fourteen hundred if I pay three months upfront?", "That's a bit high. Could you lower it?", "Let me think about the price."], ans: 0 },
    { speaker: "صاحب الشقة", text: "I could do fourteen fifty with three months upfront. That's the best I can offer.", prompt: "وافق واسأل", opts: ["That works for me. When would the apartment be available to move in?", "OK, I'll take it at that price.", "Sure, let's go with that."], ans: 0 },
    { speaker: "صاحب الشقة", text: "You can move in on the first of next month. I'll prepare the contract.", prompt: "أكّد وأنهِ", opts: ["Perfect. I'll review the contract and have it signed by the end of the week.", "Great, I'll be ready by then.", "Sounds good. Thank you."], ans: 0 },
  ]},
  { title: "مكالمة خدمة العملاء", icon: "٥", steps: [
    { speaker: "موظف الخدمة", text: "Thank you for calling. How can I help you today?", prompt: "اشرح مشكلتك", opts: ["Hi, I placed an order last week and it still hasn't arrived. My order number is five-seven-three.", "I have a problem with my order.", "My order is late."], ans: 0 },
    { speaker: "موظف الخدمة", text: "I'm sorry about that. Let me check the status for you. One moment please.", prompt: "انتظر بأدب", opts: ["Of course, take your time. I appreciate you looking into this.", "Sure, no problem.", "OK, I'll wait."], ans: 0 },
    { speaker: "موظف الخدمة", text: "It looks like the package was delayed due to a shipping issue. It should arrive by Thursday.", prompt: "اسأل عن التعويض", opts: ["I understand. Since it's significantly late, is there any compensation you can offer?", "OK, as long as it arrives by Thursday.", "That's fine then."], ans: 0 },
    { speaker: "موظف الخدمة", text: "I can offer you free shipping on your next order. Would that work?", prompt: "وافق واطلب تأكيد", opts: ["That would be great. Could you send me a confirmation email with the details?", "Sure, that's fine. Thank you.", "OK, I'll accept that."], ans: 0 },
    { speaker: "موظف الخدمة", text: "Absolutely. Is there anything else I can help you with?", prompt: "اشكره واختم", opts: ["No, that's everything. Thank you for resolving this so quickly.", "No, that's all. Thanks.", "I'm good. Bye."], ans: 0 },
  ]},
];

const QUICK_RESP = [
  { sit: "أنت في مطعم والنادل يسألك عن طلبك", opts: ["I'll have the grilled chicken, please. And a glass of water.", "I want chicken and water.", "Give me the chicken.", "Whatever you recommend."], ans: 0 },
  { sit: "شخص يتكلم بسرعة وما فهمت عليه", opts: ["Sorry, could you speak a bit more slowly? I want to make sure I understand.", "Can you repeat that?", "I didn't hear you.", "What did you say?"], ans: 0 },
  { sit: "تبي تسأل عن الاتجاهات في مدينة جديدة", opts: ["Excuse me, could you tell me how to get to the nearest metro station?", "Where is the metro?", "I need to go to the metro.", "How do I get there?"], ans: 0 },
  { sit: "حد يمدح شغلك وتبي ترد بتواضع", opts: ["Thank you, I really appreciate that. It was a team effort.", "Thanks a lot.", "Oh, it was nothing.", "Yeah, I worked hard."], ans: 0 },
  { sit: "تبي ترفض دعوة بأدب", opts: ["I really appreciate the invitation, but I won't be able to make it this time.", "Sorry, I can't come.", "No thanks.", "I'm busy that day."], ans: 0 },
  { sit: "تبي تسأل الدكتور عن الدواء", opts: ["How often should I take this, and are there any side effects I should know about?", "When do I take the medicine?", "Is this safe?", "What does this do?"], ans: 0 },
  { sit: "تبي تشتكي على منتج بأدب", opts: ["I purchased this last week and it's not working properly. Is it possible to get a replacement?", "This doesn't work. I want my money back.", "I have a problem with this.", "This product is broken."], ans: 0 },
  { sit: "جارك الجديد يسلّم عليك وتبي تتعرف عليه", opts: ["Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.", "Hi, I live next door.", "Hello.", "I'm your neighbor."], ans: 0 },
  { sit: "تبي تعبّر عن رأيك بأدب في نقاش", opts: ["I see it differently. From my perspective, I think there's another way to look at it.", "I disagree with that.", "That's not right.", "I have a different idea."], ans: 0 },
  { sit: "شخص يسألك عن شغلك وتبي تشرح ببساطة", opts: ["I work in project management. Basically, I help teams deliver their work on time.", "I'm a manager.", "I work at a company.", "I do project stuff."], ans: 0 },
];

const QUIZ_BANK = [
  { q: "وصلت الفندق وتبي تأكد حجزك — وش أفضل جملة؟", opts: ["I have a reservation under the name Al-Rashid.", "I booked a room. Check please.", "I want my room now.", "There should be a booking."], ans: 0 },
  { q: "ما فهمت كلام شخص يتكلم بسرعة — كيف تطلب يبطّئ بأدب؟", opts: ["Could you speak a bit more slowly, please?", "Talk slower.", "I can't understand you.", "You're speaking too fast."], ans: 0 },
  { q: "تبي ترفض عرض بأدب بدون ما تزعل الشخص", opts: ["I really appreciate the offer, but I'll have to pass this time.", "No thanks.", "I don't want it.", "Maybe later."], ans: 0 },
  { q: "الدكتور يسألك عن أعراضك — كيف تشرح بدقة؟", opts: ["I've been having a persistent headache for three days, along with some fatigue.", "My head hurts.", "I feel bad.", "I have pain."], ans: 0 },
  { q: "في المطعم، النادل يسأل عن طلبك — وش الأنسب؟", opts: ["I'll have the grilled salmon, please. And could I get a glass of water?", "Give me salmon and water.", "Salmon.", "I want to eat fish."], ans: 0 },
  { q: "تبي تعبّر عن رأي مختلف بأدب في نقاش", opts: ["I see it differently. From my perspective...", "That's wrong.", "I don't agree at all.", "No, I think the opposite."], ans: 0 },
  { q: "شخص يمدحك — كيف ترد بتواضع واحترافية؟", opts: ["Thank you, I really appreciate that. It was a team effort.", "Yeah, I know.", "Thanks.", "It was nothing really."], ans: 0 },
  { q: "تبي تسأل عن الاتجاهات بأدب في مدينة جديدة", opts: ["Excuse me, could you tell me how to get to the nearest metro station?", "Where is the metro?", "Metro?", "I need to go somewhere."], ans: 0 },
  { q: "تبي تشتكي على منتج معيب بشكل محترف", opts: ["I purchased this last week and it's not working properly. Is it possible to get a replacement?", "This is broken. Fix it.", "I want my money back now.", "This doesn't work at all."], ans: 0 },
  { q: "جارك الجديد يسلّم عليك — كيف تكسر الجليد؟", opts: ["Nice to meet you! I'm Omar. Welcome to the neighborhood.", "Hi.", "You're new here?", "Hello, I live here."], ans: 0 },
];

// ===== CEFR-ALIGNED PLACEMENT TEST =====
// Adaptive test based on Cambridge/IELTS/EF SET standards
// Covers: Grammar, Vocabulary, Reading Comprehension, Pragmatics
// Levels: A1 (Beginner) → C2 (Mastery)

const CEFR_LEVELS = [
  { code: "A1", name: "مبتدئ", nameEn: "Beginner", color: "var(--c-error)", desc: "تعرف كلمات وجمل بسيطة جداً. تقدر تعرّف نفسك وتسأل أسئلة أساسية.", tip: "ركّز على حفظ الجمل الأساسية والمفردات اليومية. ابدأ بتمارين الظل مع الجمل القصيرة." },
  { code: "A2", name: "ما قبل المتوسط", nameEn: "Elementary", color: "var(--c-warn)", desc: "تفهم جمل متكررة في مواضيع يومية. تقدر تتواصل في مواقف بسيطة ومباشرة.", tip: "وسّع مفرداتك وركّز على تركيب جمل بسيطة. استخدم تمرين 'تفكير بصوت عالٍ' يومياً." },
  { code: "B1", name: "متوسط", nameEn: "Intermediate", color: "var(--c-accent)", desc: "تفهم النقاط الرئيسية في محادثات واضحة. تقدر تتعامل مع أغلب المواقف اليومية.", tip: "ابدأ بالمحادثات التفاعلية وركّز على ربط الأفكار. تمرّن على الجمل الجاهزة لمواقف الحياة." },
  { code: "B2", name: "فوق المتوسط", nameEn: "Upper-Intermediate", color: "var(--c-accent)", desc: "تفهم أفكار معقدة وتقدر تتفاعل بطلاقة مع متحدثين أصليين بدون جهد كبير.", tip: "ركّز على الدقة في التعبير والمصطلحات المتخصصة. تمرّن على العروض التقديمية والتفاوض." },
  { code: "C1", name: "متقدم", nameEn: "Advanced", color: "var(--c-accent)", desc: "تفهم نصوص طويلة ومعقدة وتقدر تعبّر عن نفسك بطلاقة وعفوية في أي موقف مهني.", tip: "ركّز على الفروق الدقيقة في اللغة والتعابير الاصطلاحية. تمرّن على المحادثات المتقدمة." },
  { code: "C2", name: "إتقان", nameEn: "Mastery", color: "var(--c-success)", desc: "تفهم كل شيء تقريباً وتقدر تعبّر بدقة عالية حتى في المواقف الأكثر تعقيداً.", tip: "حافظ على مستواك بالممارسة المستمرة. ركّز على الأسلوب والبلاغة في التواصل المهني." },
];

const LEVEL_TEST = [
  // ===== A1 - GRAMMAR =====
  { level: 0, type: "grammar", q: "She ___ a teacher.", opts: ["is", "are", "am", "be"], ans: 0 },
  { level: 0, type: "grammar", q: "I ___ from Saudi Arabia.", opts: ["am", "is", "are", "be"], ans: 0 },
  { level: 0, type: "grammar", q: "___ you like coffee?", opts: ["Do", "Does", "Is", "Are"], ans: 0 },
  { level: 0, type: "grammar", q: "There ___ three books on the table.", opts: ["are", "is", "has", "have"], ans: 0 },
  { level: 0, type: "vocab", q: "The opposite of 'hot' is ___.", opts: ["cold", "warm", "cool", "big"], ans: 0 },
  { level: 0, type: "vocab", q: "You eat breakfast in the ___.", opts: ["morning", "night", "evening", "afternoon"], ans: 0 },

  // ===== A2 - GRAMMAR & VOCAB =====
  { level: 1, type: "grammar", q: "She ___ to work every day.", opts: ["goes", "go", "going", "gone"], ans: 0 },
  { level: 1, type: "grammar", q: "I ___ my homework last night.", opts: ["did", "do", "done", "does"], ans: 0 },
  { level: 1, type: "grammar", q: "He is ___ than his brother.", opts: ["taller", "more tall", "tallest", "most tall"], ans: 0 },
  { level: 1, type: "vocab", q: "To 'postpone' a meeting means to ___.", opts: ["delay it", "cancel it", "start it", "end it"], ans: 0 },
  { level: 1, type: "vocab", q: "A 'colleague' is someone who ___.", opts: ["works with you", "lives near you", "teaches you", "manages you"], ans: 0 },
  { level: 1, type: "pragmatics", q: "Someone says 'How are you?' — What is the best response?", opts: ["I'm fine, thank you. And you?", "Yes.", "What?", "My name is Ahmed."], ans: 0 },

  // ===== B1 - GRAMMAR, VOCAB, READING =====
  { level: 2, type: "grammar", q: "If it rains tomorrow, I ___ stay home.", opts: ["will", "would", "am", "had"], ans: 0 },
  { level: 2, type: "grammar", q: "The report ___ by the team yesterday.", opts: ["was completed", "completed", "is completed", "has completed"], ans: 0 },
  { level: 2, type: "grammar", q: "She has been working here ___ five years.", opts: ["for", "since", "from", "during"], ans: 0 },
  { level: 2, type: "grammar", q: "I wish I ___ more time to finish the project.", opts: ["had", "have", "has", "having"], ans: 0 },
  { level: 2, type: "vocab", q: "'We need to streamline the process' means we need to ___.", opts: ["make it more efficient", "stop it", "restart it", "complicate it"], ans: 0 },
  { level: 2, type: "vocab", q: "A 'deadline' is ___.", opts: ["the last date to finish something", "a type of meeting", "a company policy", "a work schedule"], ans: 0 },
  { level: 2, type: "reading", q: "Read: 'The meeting was rescheduled due to unforeseen circumstances. All attendees will be notified of the new date.' — Why was the meeting moved?", opts: ["Unexpected events happened", "No one wanted to attend", "The room was too small", "It was a holiday"], ans: 0 },
  { level: 2, type: "pragmatics", q: "Your manager asks for your opinion in a meeting. What do you say?", opts: ["From my perspective, I think we should consider...", "I don't know.", "Whatever you decide.", "Ask someone else."], ans: 0 },

  // ===== B2 - GRAMMAR, VOCAB, READING, PRAGMATICS =====
  { level: 3, type: "grammar", q: "Had I known about the issue earlier, I ___ it differently.", opts: ["would have handled", "will handle", "handle", "am handling"], ans: 0 },
  { level: 3, type: "grammar", q: "The project, ___ was started last year, is almost complete.", opts: ["which", "what", "who", "where"], ans: 0 },
  { level: 3, type: "grammar", q: "Not only ___ the presentation well, but he also answered every question.", opts: ["did he deliver", "he delivered", "he did deliver", "delivered he"], ans: 0 },
  { level: 3, type: "grammar", q: "By the time the client arrives, we ___ the proposal.", opts: ["will have finished", "finished", "are finishing", "finish"], ans: 0 },
  { level: 3, type: "vocab", q: "'The CEO alluded to potential layoffs during the earnings call.' — 'Alluded to' means ___.", opts: ["indirectly mentioned", "directly announced", "denied", "celebrated"], ans: 0 },
  { level: 3, type: "vocab", q: "'We need to mitigate the risks associated with this investment.' — 'Mitigate' means ___.", opts: ["reduce or lessen", "increase", "ignore", "calculate"], ans: 0 },
  { level: 3, type: "reading", q: "Read: 'While the quarterly results exceeded expectations, the board remains cautious about Q4 projections given the volatile market conditions and rising inflation rates.' — What is the board's attitude?", opts: ["Careful despite good results", "Very optimistic", "Completely negative", "Indifferent"], ans: 0 },
  { level: 3, type: "reading", q: "Read: 'The merger, though initially met with skepticism from stakeholders, has proven to be a strategic masterstroke that significantly enhanced market share.' — The merger was ___.", opts: ["Doubted at first but successful", "Always popular", "A complete failure", "Never completed"], ans: 0 },
  { level: 3, type: "pragmatics", q: "A colleague presents an idea you disagree with. What is the most professional response?", opts: ["I see your point, but have we considered the potential risks?", "That's completely wrong.", "Sure, whatever.", "I disagree. Next topic."], ans: 0 },
  { level: 3, type: "pragmatics", q: "You need to deliver bad news to your team about a delayed project. How do you start?", opts: ["I want to be transparent with you about a challenge we're facing.", "This is all your fault.", "Bad news, everyone.", "I don't want to talk about it."], ans: 0 },

  // ===== C1 - GRAMMAR, VOCAB, READING, PRAGMATICS =====
  { level: 4, type: "grammar", q: "Seldom ___ such a comprehensive analysis of market trends.", opts: ["have I seen", "I have seen", "I saw", "did I saw"], ans: 0 },
  { level: 4, type: "grammar", q: "___ the circumstances, I believe we should proceed with caution.", opts: ["Given", "Giving", "Gave", "Being given"], ans: 0 },
  { level: 4, type: "grammar", q: "The report is believed ___ several inaccuracies.", opts: ["to contain", "containing", "to containing", "that contains"], ans: 0 },
  { level: 4, type: "grammar", q: "Were the board ___ the full extent of the losses, they would have acted sooner.", opts: ["to realize", "realizing", "realized", "realizes"], ans: 0 },
  { level: 4, type: "vocab", q: "'The new policy has far-reaching ramifications for the industry.' — 'Ramifications' means ___.", opts: ["complex consequences", "simple benefits", "minor changes", "no effects"], ans: 0 },
  { level: 4, type: "vocab", q: "'Her cogent argument persuaded the entire board.' — 'Cogent' means ___.", opts: ["clear and convincing", "long and boring", "emotional and dramatic", "confusing"], ans: 0 },
  { level: 4, type: "vocab", q: "'The company's fiscal prudence during the downturn proved prescient.' — 'Prescient' means ___.", opts: ["showing foresight about the future", "showing ignorance", "being wasteful", "being careless"], ans: 0 },
  { level: 4, type: "reading", q: "Read: 'The ostensible rationale for the restructuring was cost reduction; however, insiders suggest it was primarily aimed at consolidating the CEO's authority over previously autonomous divisions.' — The real reason for restructuring was likely ___.", opts: ["To give the CEO more control", "To save money", "To hire more people", "To expand divisions"], ans: 0 },
  { level: 4, type: "reading", q: "Read: 'Notwithstanding the apparent consensus, several board members harbored reservations that, while unexpressed publicly, influenced subsequent voting patterns.' — What happened?", opts: ["Some members secretly disagreed despite appearing to agree", "Everyone fully agreed", "The vote was cancelled", "Members expressed their concerns openly"], ans: 0 },
  { level: 4, type: "pragmatics", q: "You need to push back on an unrealistic deadline from a senior executive. What do you say?", opts: ["I appreciate the urgency. To ensure quality, could we explore a phased delivery approach?", "That's impossible and you know it.", "Fine, but don't blame me if it fails.", "I'll try my best."], ans: 0 },

  // ===== C2 - GRAMMAR, VOCAB, READING, PRAGMATICS =====
  { level: 5, type: "grammar", q: "Little ___ that the decision would have such profound implications.", opts: ["did they realize", "they realized", "they did realize", "realized they"], ans: 0 },
  { level: 5, type: "grammar", q: "So pervasive ___ that virtually no sector of the economy remained unaffected.", opts: ["was the impact", "the impact was", "the impact", "were the impact"], ans: 0 },
  { level: 5, type: "grammar", q: "___ it not for the intervention of the regulatory body, the merger would have proceeded unchallenged.", opts: ["Were", "Was", "Had", "If"], ans: 0 },
  { level: 5, type: "vocab", q: "'The interlocutor's obfuscation of the salient points rendered the negotiation futile.' — This sentence means the speaker ___.", opts: ["deliberately made key points unclear, making talks useless", "clearly explained everything", "successfully negotiated", "ended the meeting early"], ans: 0 },
  { level: 5, type: "vocab", q: "'Her perspicacious analysis of the geopolitical landscape proved invaluable.' — 'Perspicacious' means ___.", opts: ["showing keen mental perception and understanding", "superficial and brief", "emotional and biased", "lengthy and detailed"], ans: 0 },
  { level: 5, type: "reading", q: "Read: 'The paradox inherent in the company's strategy—pursuing aggressive expansion while simultaneously advocating for fiscal austerity—was not lost on analysts, who questioned whether such cognitive dissonance could yield sustainable growth.' — The analysts think the strategy is ___.", opts: ["Contradictory and potentially unsustainable", "Brilliant and innovative", "Simple and clear", "Risky but likely to succeed"], ans: 0 },
  { level: 5, type: "reading", q: "Read: 'The CEO's resignation, ostensibly precipitated by health concerns, coincided suspiciously with the emergence of an accounting scandal, leading commentators to infer a causal nexus between the two events.' — Commentators believe ___.", opts: ["The resignation was actually caused by the scandal, not health", "Health was the real reason", "There was no scandal", "The CEO was forced out by the board"], ans: 0 },
  { level: 5, type: "pragmatics", q: "You discover a critical flaw in a strategy that your CEO personally championed in front of the board. How do you address it?", opts: ["I've been reviewing the implementation details and identified an area where we might want to stress-test our assumptions before proceeding further.", "Your strategy is flawed.", "I think there's a problem but it's probably fine.", "I'll just fix it quietly and not say anything."], ans: 0 },

  // ===== LISTENING QUESTIONS (FIX 2) — audio-based, one per level =====
  { level: 0, type: "listening", q: "♪ Listen: 'I would like a cup of coffee, please.' — What does the speaker want?", audio: "I would like a cup of coffee, please.", opts: ["A cup of coffee", "A cup of tea", "A glass of water", "A sandwich"], ans: 0 },
  { level: 1, type: "listening", q: "♪ Listen: 'The store closes at nine o'clock on weekdays.' — When does the store close?", audio: "The store closes at nine o'clock on weekdays.", opts: ["9 PM on weekdays", "9 AM on weekdays", "10 PM every day", "8 PM on weekends"], ans: 0 },
  { level: 2, type: "listening", q: "♪ Listen: 'I've been waiting for over thirty minutes and my order still hasn't arrived.' — What is the problem?", audio: "I've been waiting for over thirty minutes and my order still hasn't arrived.", opts: ["The order is very late", "The food is cold", "The wrong order arrived", "The restaurant is closed"], ans: 0 },
  { level: 3, type: "listening", q: "♪ Listen: 'While the proposal has merit, I believe we should consider the long-term implications before committing resources.' — What is the speaker's position?", audio: "While the proposal has merit, I believe we should consider the long-term implications before committing resources.", opts: ["Cautiously supportive but wants more analysis", "Fully against the proposal", "Enthusiastically in favor", "Indifferent to the outcome"], ans: 0 },
  { level: 4, type: "listening", q: "♪ Listen: 'Notwithstanding the initial setbacks, the project has demonstrated remarkable resilience and is now on track to exceed its original projections.' — What happened to the project?", audio: "Notwithstanding the initial setbacks, the project has demonstrated remarkable resilience and is now on track to exceed its original projections.", opts: ["It struggled early but recovered and is now exceeding expectations", "It failed completely", "It was cancelled and restarted", "It met exactly the original targets"], ans: 0 },
  { level: 5, type: "listening", q: "♪ Listen: 'The ostensible rationale for the restructuring belied a more nuanced set of motivations that only became apparent in retrospect.' — What does this mean?", audio: "The ostensible rationale for the restructuring belied a more nuanced set of motivations that only became apparent in retrospect.", opts: ["The stated reasons were not the real reasons, which only became clear later", "The restructuring was fully transparent from the start", "Everyone understood the reasons immediately", "The restructuring had no clear purpose"], ans: 0 },
];

const LEVEL_IDX = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
const TYPE_LABELS = { grammar: "قواعد", vocab: "مفردات", reading: "فهم القراءة", pragmatics: "تواصل", listening: "استماع" };
const TYPE_ICONS = { grammar: "⌘", vocab: "V", reading: "R", pragmatics: "P", listening: "L" };

// ===== SPEECH UI COMPONENTS (engine is in platform.js) =====
function SpeakBtn({ text, rate, size, color }) {
  const [playing, setPlaying] = useState(false);
  function play() {
    setPlaying(true);
    const u = speak(text, rate || 0.85);
    if (u) {
      u.onend = () => setPlaying(false);
      setTimeout(() => setPlaying(false), 15000);
    } else setPlaying(false);
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); play(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: size || 16, padding: 2, opacity: playing ? 1 : 0.5, color: color || "#1d4ed8", transition: ".2s", flexShrink: 0 }} title="استمع">{playing ? "♪" : "♪"}</button>
  );
}

function VoiceBadge() {
  const info = getVoiceInfo();
  const colors = { openai: "#059669", native: "#059669", neural: "#1d4ed8", basic: "#1d4ed8" };
  const bgs = { openai: "rgba(5,150,105,0.15)", native: "rgba(5,150,105,0.15)", neural: "rgba(29,78,216,0.15)", basic: "rgba(29,78,216,0.15)" };
  return <span style={{ fontSize: "var(--fs-xs)", padding: "2px 6px", borderRadius: "var(--r-sm)", background: bgs[info.tier], color: colors[info.tier], fontWeight: 600 }}>{info.label}</span>;
}

// ===== LISTENING COMPREHENSION =====
const LISTEN_ITEMS = [
  { text: "Excuse me, where is the nearest pharmacy?", q: "ماذا يسأل المتحدث؟", opts: ["يسأل عن أقرب صيدلية", "يسأل عن أقرب مطعم", "يسأل عن الوقت", "يسأل عن الطريق للفندق"], ans: 0 },
  { text: "I'd like to make an appointment for next Tuesday, please.", q: "ماذا يريد المتحدث؟", opts: ["يبي يحجز موعد يوم الثلاثاء", "يبي يلغي موعد", "يبي يغيّر موعده ليوم الأحد", "يبي يسأل عن المواعيد المتاحة"], ans: 0 },
  { text: "The flight has been delayed by approximately two hours.", q: "ما هو الخبر؟", opts: ["الرحلة تأخرت ساعتين", "الرحلة ألغيت", "الرحلة تقدمت ساعتين", "البوابة تغيّرت"], ans: 0 },
  { text: "Could you speak a bit more slowly? I want to make sure I understand.", q: "ماذا يطلب المتحدث؟", opts: ["يطلب إن الشخص يتكلم أبطأ", "يطلب إن الشخص يتكلم أعلى", "يطلب إن الشخص يتوقف عن الكلام", "يطلب إن الشخص يكرر كل شيء"], ans: 0 },
  { text: "I purchased this item last week and unfortunately it stopped working after two days.", q: "ما هي المشكلة؟", opts: ["اشترى شيء وخرب بعد يومين", "اشترى شيء غالي جداً", "نسي يشتري شيء", "المنتج ما وصل أصلاً"], ans: 0 },
  { text: "We've been living in this neighborhood for about three years now, and we really enjoy it.", q: "ماذا يقول المتحدث عن الحي؟", opts: ["ساكن فيه ٣ سنوات ومبسوط", "ساكن فيه ٣ أشهر", "يبي ينتقل من الحي", "ما يحب الحي"], ans: 0 },
  { text: "I'm allergic to peanuts, so could you please check if this dish contains any nuts?", q: "ماذا يخبر الشخص النادل؟", opts: ["عنده حساسية مكسرات ويبي يتأكد من الأكل", "ما يحب طعم المكسرات", "يبي يضيف مكسرات", "يسأل عن أسعار الأطباق"], ans: 0 },
  { text: "The doctor recommended that I get some rest and drink plenty of water.", q: "ماذا نصح الطبيب؟", opts: ["راحة وشرب ماء كثير", "أخذ دواء قوي", "عملية جراحية", "تحاليل دم فورية"], ans: 0 },
  { text: "Thank you for your time today. I'll send you a follow-up email with all the details.", q: "ماذا سيفعل المتحدث؟", opts: ["يرسل إيميل متابعة بالتفاصيل", "يتصل بكرة", "يحدد موعد ثاني", "يلغي الاتفاق"], ans: 0 },
  { text: "I see it differently. From my perspective, I think we should consider the long-term impact.", q: "ما موقف المتحدث؟", opts: ["عنده رأي مختلف ويبي يفكرون بالمدى البعيد", "يوافق تماماً", "ما عنده رأي", "يبي ينهي النقاش"], ans: 0 },
];

// ===== DICTATION =====
const DICTATION_ITEMS = [
  "I would like a table for two, please.",
  "Could you speak more slowly?",
  "I have a reservation under my name.",
  "The flight has been delayed by two hours.",
  "Thank you for your help. Have a nice day.",
  "I need to reschedule my appointment.",
  "Nice to meet you. Where are you from?",
  "I see it differently from my perspective.",
  "Is it possible to get a refund?",
  "How long have you been living here?",
  "I appreciate your patience with this.",
  "What do you recommend from the menu?",
];

// ===== DAILY DEEP PROCESSING SCENARIOS =====
// Each scenario is ONE topic processed through 6 cognitive layers
const DAILY_SCENARIOS = [
  { title: "في المطعم", icon: "١", dialogue: [
    { speaker: "أنت", text: "Good evening. A table for two, please." },
    { speaker: "النادل", text: "Of course. Would you prefer indoor or outdoor seating?" },
    { speaker: "أنت", text: "Indoor, please. Could we have the menu?" },
    { speaker: "النادل", text: "Here you go. Our special today is grilled salmon." },
    { speaker: "أنت", text: "That sounds great. I'll have that, please." },
    { speaker: "النادل", text: "Excellent choice. And for drinks?" },
    { speaker: "أنت", text: "Just water, please. Thank you." },
  ],
  keyPhrases: [
    { en: "A table for two, please.", ar: "طاولة لشخصين، لو سمحت." },
    { en: "Could we have the menu?", ar: "ممكن القائمة؟" },
    { en: "I'll have that, please.", ar: "آخذ هذا، لو سمحت." },
  ],
  producePrompt: "أنت في مطعم. النادل يسألك عن طلبك. اكتب ردك:",
  produceModel: "I'll have the grilled chicken, please. And could I get a glass of water?",
  noticingTips: ["\"I'll have\" أقوى وأكثر أدباً من \"I want\" — لاحظ الفرق", "\"please\" في نهاية الطلب = أساسي في الثقافة الإنجليزية", "السؤال الإضافي (glass of water) يُظهر طلاقة وثقة"],
  listenQ: { q: "وين تصير هالمحادثة؟", opts: ["مطعم", "مطار", "بنك"], ans: 0 },
  challenge: "اليوم: اطلب قهوتك من أي كافيه بالإنجليزي. حتى لو جملة وحدة." },

  { title: "عند الدكتور", icon: "٢", dialogue: [
    { speaker: "الطبيب", text: "Good morning. What brings you in today?" },
    { speaker: "أنت", text: "I've been having a headache for three days." },
    { speaker: "الطبيب", text: "I see. Any other symptoms? Fever or nausea?" },
    { speaker: "أنت", text: "No fever, but I've been feeling dizzy in the morning." },
    { speaker: "الطبيب", text: "Have you been under stress recently?" },
    { speaker: "أنت", text: "Yes, my schedule has been very hectic lately." },
    { speaker: "الطبيب", text: "I'll prescribe something. Take it twice daily with food." },
  ],
  keyPhrases: [
    { en: "I've been having a headache for three days.", ar: "عندي صداع من ٣ أيام." },
    { en: "I've been feeling dizzy in the morning.", ar: "أحس بدوخة الصبح." },
    { en: "My schedule has been very hectic lately.", ar: "جدولي كان مزدحم جداً مؤخراً." },
  ],
  producePrompt: "أنت عند الدكتور. اشرح أعراضك بالتفصيل:",
  produceModel: "I've been having a persistent headache for the past three days, along with some fatigue and dizziness.",
  noticingTips: ["\"I've been having\" (present perfect continuous) أدق من \"I have\" — يوصف شيء مستمر", "\"persistent\" كلمة طبية مهمة = مستمر ما يروح", "تحديد المدة (three days) + أعراض إضافية (fatigue) = الدكتور يفهمك أسرع"],
  listenQ: { q: "وش مشكلة المتحدث؟", opts: ["صداع ودوخة", "ألم في الظهر", "مشكلة في النظر"], ans: 0 },
  challenge: "اليوم: لو أحد سألك How are you — رد بجملة كاملة بدل fine." },

  { title: "في الفندق", icon: "٣", dialogue: [
    { speaker: "الموظف", text: "Good evening. Welcome. Do you have a reservation?" },
    { speaker: "أنت", text: "Yes, under the name Al-Rashid. For three nights." },
    { speaker: "الموظف", text: "Found it. Could I see your passport?" },
    { speaker: "أنت", text: "Of course. Here you go. Is breakfast included?" },
    { speaker: "الموظف", text: "Yes, from seven to ten. Your room is on the fifth floor." },
    { speaker: "أنت", text: "Great. Is there a gym available for guests?" },
    { speaker: "الموظف", text: "Yes, on the second floor. Open until ten PM." },
  ],
  keyPhrases: [
    { en: "I have a reservation under the name Al-Rashid.", ar: "عندي حجز باسم الراشد." },
    { en: "Is breakfast included?", ar: "الفطور مشمول؟" },
    { en: "Is there a gym available for guests?", ar: "في نادي رياضي للنزلاء؟" },
  ],
  producePrompt: "وصلت الفندق. سوِّ check-in واسأل عن الخدمات:",
  produceModel: "I have a reservation under the name Al-Rashid for three nights. Is breakfast included, and is there a pool?",
  noticingTips: ["\"under the name\" = الطريقة الصحيحة لذكر اسم الحجز", "\"Is breakfast included?\" = سؤال ذكي يُظهر إنك مسافر متمرس", "ذكر عدد الليالي فوراً = يسهّل على الموظف ويُظهر وضوحك"],
  listenQ: { q: "كم ليلة الحجز؟", opts: ["٣ ليالي", "ليلة وحدة", "أسبوع"], ans: 0 },
  challenge: "اليوم: افتح موقع فندق وحاول تقرأ صفحة الخدمات بالإنجليزي بدون ترجمة." },

  { title: "اجتماع أولياء أمور", icon: "٤", dialogue: [
    { speaker: "المعلمة", text: "Thank you for coming. Sara is a wonderful student." },
    { speaker: "أنت", text: "Thank you. How is she doing in her main subjects?" },
    { speaker: "المعلمة", text: "She's great in math, but needs help with reading." },
    { speaker: "أنت", text: "Could you give me specific examples?" },
    { speaker: "المعلمة", text: "She reads slowly and sometimes skips words." },
    { speaker: "أنت", text: "What if we start with fifteen minutes of reading every evening?" },
    { speaker: "المعلمة", text: "That would be wonderful. I'll send home some books." },
  ],
  keyPhrases: [
    { en: "How is she doing in her main subjects?", ar: "كيف مستواها في المواد الرئيسية؟" },
    { en: "Could you give me specific examples?", ar: "تقدر تعطيني أمثلة محددة؟" },
    { en: "What if we start with fifteen minutes of reading every evening?", ar: "وش رأيك نبدأ بـ ١٥ دقيقة قراءة كل مساء؟" },
  ],
  producePrompt: "المعلمة تقول إن ابنك يحتاج تحسين في القراءة. اقترح خطة:",
  produceModel: "That makes sense. What if we start with fifteen minutes of reading together every evening? Are there any books you'd recommend?",
  noticingTips: ["\"That makes sense\" = بداية قوية تُظهر إنك فاهم ومتفاعل", "\"What if we...\" = اقتراح بأدب أقوى من \"We should\"", "السؤال في النهاية (books you'd recommend) = يُظهر اهتمام حقيقي"],
  listenQ: { q: "وش تحتاج البنت تحسّن؟", opts: ["القراءة", "الرياضيات", "الرسم"], ans: 0 },
  challenge: "اليوم: اقرأ لعيالك قصة قصيرة بالإنجليزي — حتى لو مو perfect." },

  { title: "مكالمة خدمة العملاء", icon: "٥", dialogue: [
    { speaker: "الموظف", text: "Thank you for calling. How can I help you?" },
    { speaker: "أنت", text: "I placed an order last week and it hasn't arrived." },
    { speaker: "الموظف", text: "I'm sorry. Let me check. One moment please." },
    { speaker: "أنت", text: "Of course, take your time." },
    { speaker: "الموظف", text: "It was delayed. It should arrive by Thursday." },
    { speaker: "أنت", text: "Since it's late, is there any compensation?" },
    { speaker: "الموظف", text: "I can offer free shipping on your next order." },
  ],
  keyPhrases: [
    { en: "I placed an order last week and it hasn't arrived.", ar: "طلبت أوردر الأسبوع الماضي وما وصل." },
    { en: "Of course, take your time.", ar: "طبعاً، خذ وقتك." },
    { en: "Since it's late, is there any compensation?", ar: "بما إنه تأخر، في أي تعويض؟" },
  ],
  producePrompt: "طلبك تأخر أسبوع. اتصل بخدمة العملاء واشرح المشكلة:",
  produceModel: "Hi, I placed an order last week, order number 573, and it still hasn't arrived. Could you check the status for me?",
  noticingTips: ["ذكر رقم الطلب فوراً = يوفر وقت ويُظهر تنظيمك", "\"it still hasn't arrived\" أفضل من \"it didn't come\" — أدق لغوياً", "\"Could you check\" = طلب مهذب أقوى من \"check please\""],
  listenQ: { q: "وش المشكلة؟", opts: ["الطلب ما وصل", "المنتج مكسور", "السعر غلط"], ans: 0 },
  challenge: "اليوم: لو اشتريت شيء أونلاين — اقرأ صفحة الـ FAQ بالإنجليزي." },

  { title: "التعارف مع شخص جديد", icon: "٦", dialogue: [
    { speaker: "الشخص", text: "Hi! I don't think we've met. I'm David." },
    { speaker: "أنت", text: "Nice to meet you, David. I'm Omar." },
    { speaker: "الشخص", text: "So, what do you do for a living?" },
    { speaker: "أنت", text: "I work in project management. How about you?" },
    { speaker: "الشخص", text: "I'm in software engineering. How long have you been here?" },
    { speaker: "أنت", text: "About five years now. Where are you from originally?" },
    { speaker: "الشخص", text: "I'm from Toronto. It's great to meet you!" },
  ],
  keyPhrases: [
    { en: "Nice to meet you. I'm Omar.", ar: "تشرفنا. أنا عمر." },
    { en: "I work in project management.", ar: "أشتغل في إدارة المشاريع." },
    { en: "How long have you been here?", ar: "من متى وأنت هنا؟" },
  ],
  producePrompt: "شخص جديد يسألك عن نفسك. عرّف نفسك وسأله:",
  produceModel: "Nice to meet you! I'm Omar. I work in project management. I've been living here for about five years. What about you?",
  noticingTips: ["التسلسل: تحية → اسم → شغل → معلومة شخصية → سؤال = بناء محادثة احترافي", "\"What about you?\" في النهاية = تحوّل المحادثة من monologue لـ dialogue", "\"I've been living here for...\" أفضل من \"I live here since...\" — هذا خطأ شائع"],
  listenQ: { q: "وش شغل المتحدث؟", opts: ["إدارة مشاريع", "هندسة برمجيات", "تسويق"], ans: 0 },
  challenge: "اليوم: لو قابلت أي شخص أجنبي — قل Nice to meet you وسأله سؤال واحد." },

  { title: "في المطار", icon: "٧", dialogue: [
    { speaker: "الموظفة", text: "Good morning. May I see your passport and ticket?" },
    { speaker: "أنت", text: "Of course. Here they are. I'd like a window seat." },
    { speaker: "الموظفة", text: "Let me check. Yes, 14A is available." },
    { speaker: "أنت", text: "Perfect. Do I have a layover or is it direct?" },
    { speaker: "الموظفة", text: "It's direct. Boarding starts at gate 7 in one hour." },
    { speaker: "أنت", text: "Thank you. Where is the nearest lounge?" },
    { speaker: "الموظفة", text: "Turn right after security. Enjoy your flight!" },
  ],
  keyPhrases: [
    { en: "I'd like a window seat, please.", ar: "أبي مقعد جنب النافذة." },
    { en: "Do I have a layover or is it direct?", ar: "عندي توقف أو مباشر؟" },
    { en: "Where is the nearest lounge?", ar: "وين أقرب صالة انتظار؟" },
  ],
  producePrompt: "أنت في المطار تسوي check-in. تكلم مع الموظفة:",
  produceModel: "Here's my passport. I'd like a window seat if possible. Is this a direct flight or do I have a layover?",
  noticingTips: ["\"I'd like\" أفضل من \"I want\" = أكثر أدباً في الطلبات", "\"if possible\" = تُظهر إنك مرن ومهذب", "السؤال عن الـ layover = يُظهر إنك مسافر واعي ومتمكن"],
  listenQ: { q: "هل الرحلة مباشرة؟", opts: ["نعم مباشرة", "فيها توقف", "ما ذكر"], ans: 0 },
  challenge: "اليوم: لو رحت أي مكان فيه موظف — سأل سؤال واحد بالإنجليزي." },

  { title: "في الصيدلية", icon: "٨", dialogue: [
    { speaker: "الصيدلي", text: "Good afternoon. How can I help you?" },
    { speaker: "أنت", text: "I need something for a sore throat." },
    { speaker: "الصيدلي", text: "How long have you had it?" },
    { speaker: "أنت", text: "About two days. It gets worse at night." },
    { speaker: "الصيدلي", text: "I'd recommend these lozenges. Take one every four hours." },
    { speaker: "أنت", text: "Are there any side effects I should know about?" },
    { speaker: "الصيدلي", text: "They might cause mild drowsiness. Avoid driving after taking them." },
  ],
  keyPhrases: [
    { en: "I need something for a sore throat.", ar: "أبي شيء لالتهاب الحلق." },
    { en: "It gets worse at night.", ar: "يزيد بالليل." },
    { en: "Are there any side effects I should know about?", ar: "في أي أعراض جانبية لازم أعرفها؟" },
  ],
  producePrompt: "أنت في صيدلية. اشرح أعراضك واسأل عن الدواء:",
  produceModel: "I need something for a sore throat. I've had it for two days and it gets worse at night. Are there any side effects?",
  noticingTips: ["\"I need something for...\" = الطريقة المثالية لطلب دواء بدون ما تعرف اسمه", "وصف متى يزيد (at night) = يساعد الصيدلي يعطيك الدواء المناسب", "السؤال عن side effects = يُظهر وعي صحي ويحميك"],
  listenQ: { q: "وش يشتكي منه؟", opts: ["التهاب حلق", "صداع", "ألم بطن"], ans: 0 },
  challenge: "اليوم: اقرأ نشرة أي دواء عندك بالبيت — الجانب الإنجليزي." },

  { title: "في السوبرماركت", icon: "٩", dialogue: [
    { speaker: "أنت", text: "Excuse me, where can I find the dairy section?" },
    { speaker: "الموظف", text: "It's in aisle three, on your right." },
    { speaker: "أنت", text: "Thank you. Do you have any organic milk?" },
    { speaker: "الموظف", text: "Yes, it's on the top shelf. We have two brands." },
    { speaker: "أنت", text: "Great. Also, is there a bakery section here?" },
    { speaker: "الموظف", text: "Yes, at the back of the store, next to the deli." },
    { speaker: "أنت", text: "Perfect. Thank you for your help." },
  ],
  keyPhrases: [
    { en: "Where can I find the dairy section?", ar: "وين قسم الألبان؟" },
    { en: "Do you have any organic milk?", ar: "عندكم حليب عضوي؟" },
    { en: "Is there a bakery section here?", ar: "في قسم مخبوزات هنا؟" },
  ],
  producePrompt: "أنت في سوبرماركت أجنبي. اسأل عن مكان المنتجات:",
  produceModel: "Excuse me, where can I find the dairy section? Also, do you have any organic products?",
  noticingTips: ["\"Where can I find...\" أفضل من \"Where is...\" = أكثر أدباً وطبيعية", "\"Do you have any...\" = طريقة مهذبة للسؤال عن توفر منتج", "\"Also\" لربط سؤالين = يُظهر طلاقة في المحادثة"],
  listenQ: { q: "وش يدوّر عليه؟", opts: ["قسم الألبان", "قسم اللحوم", "قسم الخضار"], ans: 0 },
  challenge: "اليوم: لو دخلت أي محل — اقرأ أسماء المنتجات بالإنجليزي في بالك." },

  { title: "حجز موعد بالتلفون", icon: "١٠", dialogue: [
    { speaker: "الموظفة", text: "Good morning, City Dental Clinic. How can I help you?" },
    { speaker: "أنت", text: "I'd like to make an appointment, please." },
    { speaker: "الموظفة", text: "Sure. Is this your first visit with us?" },
    { speaker: "أنت", text: "Yes, it's my first time. I need a checkup." },
    { speaker: "الموظفة", text: "We have availability on Tuesday at 2 PM or Thursday at 10 AM." },
    { speaker: "أنت", text: "Thursday at 10 works perfectly for me." },
    { speaker: "الموظفة", text: "Great. Could I have your full name and phone number?" },
  ],
  keyPhrases: [
    { en: "I'd like to make an appointment, please.", ar: "أبي أحجز موعد لو سمحت." },
    { en: "It's my first time. I need a checkup.", ar: "أول مرة عندكم. أبي فحص." },
    { en: "Thursday at 10 works perfectly for me.", ar: "الخميس الساعة ١٠ يناسبني تماماً." },
  ],
  producePrompt: "اتصل بعيادة أسنان واحجز موعد:",
  produceModel: "I'd like to make an appointment for a dental checkup. This would be my first visit. Do you have anything available this week?",
  noticingTips: ["\"I'd like to make an appointment\" = الجملة السحرية لأي حجز", "\"works perfectly for me\" أقوى من \"OK\" — تُظهر حسم وثقة", "تحديد نوع الزيارة (checkup) = يساعد العيادة تجهّز لك"],
  listenQ: { q: "متى الموعد؟", opts: ["الخميس ١٠ الصبح", "الثلاثاء ٢ الظهر", "السبت ٩ الصبح"], ans: 0 },
  challenge: "اليوم: احجز أي موعد بالتلفون — حتى لو بالعربي، فكّر كيف تقولها بالإنجليزي." },

  { title: "طلب توصيل أونلاين", icon: "١١", dialogue: [
    { speaker: "أنت", text: "Hi, I'd like to place an order for delivery." },
    { speaker: "الموظف", text: "Sure! What would you like to order?" },
    { speaker: "أنت", text: "Two chicken burgers and a large fries, please." },
    { speaker: "الموظف", text: "Would you like any drinks with that?" },
    { speaker: "أنت", text: "Yes, two colas, please. How long will delivery take?" },
    { speaker: "الموظف", text: "About thirty to forty minutes. Can I have your address?" },
    { speaker: "أنت", text: "Sure. It's 24 King Street, apartment 5B." },
  ],
  keyPhrases: [
    { en: "I'd like to place an order for delivery.", ar: "أبي أطلب توصيل." },
    { en: "How long will delivery take?", ar: "كم يأخذ التوصيل؟" },
    { en: "It's 24 King Street, apartment 5B.", ar: "العنوان: ٢٤ شارع الملك، شقة 5B." },
  ],
  producePrompt: "اتصل بمطعم واطلب أكل توصيل:",
  produceModel: "Hi, I'd like to place a delivery order. I'll have two chicken burgers, a large fries, and two colas. How long will it take?",
  noticingTips: ["\"I'd like to place an order\" أفضل من \"I want to order\" = احترافي أكثر", "تجميع الطلب في جملة وحدة = يوفر وقت ويُظهر وضوح", "السؤال عن الوقت = سؤال ذكي يُظهر إنك مهتم بالتفاصيل"],
  listenQ: { q: "وش طلب؟", opts: ["برقرين وبطاطس", "بيتزا وسلطة", "سمك وأرز"], ans: 0 },
  challenge: "اليوم: اطلب من أي مطعم أونلاين وحاول تقرأ القائمة الإنجليزية." },

  { title: "في البنك", icon: "١٢", dialogue: [
    { speaker: "الموظف", text: "Welcome. How can I assist you today?" },
    { speaker: "أنت", text: "I'd like to open a savings account, please." },
    { speaker: "الموظف", text: "Of course. Do you have any ID with you?" },
    { speaker: "أنت", text: "Yes, here's my passport and a proof of address." },
    { speaker: "الموظف", text: "Is there a minimum balance required?" },
    { speaker: "أنت", text: "What are the fees for international transfers?" },
    { speaker: "الموظف", text: "There's a flat fee of fifteen dollars per transfer." },
  ],
  keyPhrases: [
    { en: "I'd like to open a savings account.", ar: "أبي أفتح حساب توفير." },
    { en: "Here's my passport and a proof of address.", ar: "هذا جوازي وإثبات عنوان." },
    { en: "What are the fees for international transfers?", ar: "كم رسوم التحويلات الدولية؟" },
  ],
  producePrompt: "أنت في بنك أجنبي. اشرح ماذا تحتاج واسأل عن الرسوم:",
  produceModel: "I'd like to open a savings account. Here's my passport. Could you tell me about the fees for international transfers?",
  noticingTips: ["\"I'd like to open\" = الطريقة القياسية لفتح حساب", "تجهيز الأوراق وتقديمها فوراً (Here's my passport) = يُظهر تنظيم واحترافية", "\"What are the fees for...\" = سؤال مالي مهم لازم تتقنه"],
  listenQ: { q: "وش يبي يسوي؟", opts: ["يفتح حساب توفير", "يأخذ قرض", "يغيّر كلمة السر"], ans: 0 },
  challenge: "اليوم: افتح تطبيق بنكك وحوّل اللغة للإنجليزي ٥ دقائق." },

  { title: "استئجار سيارة", icon: "١٣", dialogue: [
    { speaker: "الموظف", text: "Good morning. Would you like to rent a car?" },
    { speaker: "أنت", text: "Yes, I need a car for five days." },
    { speaker: "الموظف", text: "We have compact, sedan, and SUV options." },
    { speaker: "أنت", text: "I'd prefer an SUV. What's the daily rate?" },
    { speaker: "الموظف", text: "It's eighty dollars per day, including insurance." },
    { speaker: "أنت", text: "Does that include unlimited mileage?" },
    { speaker: "الموظف", text: "Yes, unlimited mileage and roadside assistance." },
  ],
  keyPhrases: [
    { en: "I need a car for five days.", ar: "أبي سيارة لمدة ٥ أيام." },
    { en: "What's the daily rate?", ar: "كم السعر اليومي؟" },
    { en: "Does that include unlimited mileage?", ar: "هل يشمل كيلومترات مفتوحة؟" },
  ],
  producePrompt: "تبي تستأجر سيارة في السفر. اسأل عن الخيارات والأسعار:",
  produceModel: "I'd like to rent an SUV for five days. What's the daily rate, and does it include insurance and unlimited mileage?",
  noticingTips: ["تحديد النوع + المدة في جملة وحدة = واضح ومباشر", "\"What's the daily rate\" أفضل من \"How much\" = أكثر تحديداً", "السؤال عن insurance و mileage = أسئلة مسافر متمرس"],
  listenQ: { q: "كم سعر اليوم؟", opts: ["80 دولار", "50 دولار", "120 دولار"], ans: 0 },
  challenge: "اليوم: ادخل أي موقع تأجير سيارات واقرأ الشروط بالإنجليزي." },

  { title: "شكوى في الفندق", icon: "١٤", dialogue: [
    { speaker: "أنت", text: "Excuse me, I have an issue with my room." },
    { speaker: "الموظف", text: "I'm sorry to hear that. What's the problem?" },
    { speaker: "أنت", text: "The air conditioning isn't working properly." },
    { speaker: "الموظف", text: "I apologize for the inconvenience. Let me check." },
    { speaker: "أنت", text: "Also, the hot water isn't working in the bathroom." },
    { speaker: "الموظف", text: "I'll send maintenance right away. Would you like to move to another room?" },
    { speaker: "أنت", text: "Yes, that would be great. Thank you for handling this quickly." },
  ],
  keyPhrases: [
    { en: "I have an issue with my room.", ar: "عندي مشكلة في غرفتي." },
    { en: "The air conditioning isn't working properly.", ar: "المكيّف ما يشتغل صح." },
    { en: "Thank you for handling this quickly.", ar: "شكراً إنك تعاملت مع الموضوع بسرعة." },
  ],
  producePrompt: "في الفندق، غرفتك فيها مشكلة. اشرح الشكوى بأدب:",
  produceModel: "Excuse me, I have an issue with my room. The air conditioning isn't working and there's no hot water. Would it be possible to move to another room?",
  noticingTips: ["\"I have an issue with\" أفضل من \"There is a problem\" = تركيز على تجربتك", "وصف المشاكل بوضوح (AC + hot water) = يسرّع الحل", "\"Would it be possible to...\" = طلب مهذب جداً أقوى من \"Can I\""],
  listenQ: { q: "وش المشكلة في الغرفة؟", opts: ["المكيف والماء الحار", "التلفزيون", "الواي فاي"], ans: 0 },
  challenge: "اليوم: لو واجهت أي مشكلة — فكّر كيف تشرحها بالإنجليزي." },

  // ===== WEEK 3-4 SCENARIOS =====
  { title: "في المقهى", icon: "☕", dialogue: [
    { speaker: "الباريستا", text: "Hi! What can I get for you today?" },
    { speaker: "أنت", text: "I'd like a large cappuccino, please." },
    { speaker: "الباريستا", text: "Would you like that with whole milk or oat milk?" },
    { speaker: "أنت", text: "Oat milk, please. And could I add an extra shot?" },
    { speaker: "الباريستا", text: "Sure! For here or to go?" },
    { speaker: "أنت", text: "To go, please. How much is that?" },
    { speaker: "الباريستا", text: "That'll be five fifty. Tap or cash?" },
  ], keyPhrases: [
    { en: "I'd like a large cappuccino, please.", ar: "أبي كابتشينو كبير لو سمحت." },
    { en: "Could I add an extra shot?", ar: "ممكن أضيف شوت إضافي؟" },
    { en: "To go, please.", ar: "للطريق لو سمحت." },
  ], producePrompt: "أنت في كافيه. اطلب مشروبك بالتفصيل:", produceModel: "I'd like a large iced latte with oat milk, please. To go. Could I also get a blueberry muffin?", noticingTips: ["\"I'd like\" بدل \"I want\" = أدب أساسي", "التفاصيل (large, oat milk, extra shot) تُظهر طلاقة", "\"To go\" vs \"For here\" = مصطلح يومي لازم تعرفه"], challenge: "اليوم: اطلب من أي كافيه بالإنجليزي — حتى لو في تطبيق توصيل." },

  { title: "إرجاع منتج", icon: "🔄", dialogue: [
    { speaker: "الموظف", text: "How can I help you today?" },
    { speaker: "أنت", text: "I'd like to return this shirt. I bought it last week." },
    { speaker: "الموظف", text: "Do you have the receipt?" },
    { speaker: "أنت", text: "Yes, here it is. The size doesn't fit properly." },
    { speaker: "الموظف", text: "Would you prefer an exchange or a refund?" },
    { speaker: "أنت", text: "I'd prefer a refund, please. Is that possible?" },
    { speaker: "الموظف", text: "Absolutely. I'll process that for you right away." },
  ], keyPhrases: [
    { en: "I'd like to return this. I bought it last week.", ar: "أبي أرجع هذا. شريته الأسبوع الماضي." },
    { en: "The size doesn't fit properly.", ar: "المقاس ما يناسب." },
    { en: "I'd prefer a refund, please.", ar: "أفضّل استرجاع المبلغ لو سمحت." },
  ], producePrompt: "اشتريت شيء ومقاسه غلط. ارجع المحل واشرح:", produceModel: "I'd like to return this shirt. I bought it last week but the size doesn't fit. Do you have the receipt? Yes, here it is. I'd prefer a refund if possible.", noticingTips: ["\"I'd like to return\" = الجملة القياسية للإرجاع", "ذكر السبب (doesn't fit) = يسرّع العملية", "\"I'd prefer\" أقوى من \"I want\" = أدب + وضوح"], challenge: "اليوم: لو عندك شيء تبي ترجعه — فكّر كيف تشرح بالإنجليزي." },

  { title: "طلب تاكسي", icon: "🚕", dialogue: [
    { speaker: "أنت", text: "Hi, could you take me to the airport, please?" },
    { speaker: "السائق", text: "Sure. Which terminal?" },
    { speaker: "أنت", text: "Terminal two, the international departures." },
    { speaker: "السائق", text: "No problem. It should take about thirty minutes." },
    { speaker: "أنت", text: "That's fine. Is there a lot of traffic at this time?" },
    { speaker: "السائق", text: "A little, but we should make it in time." },
    { speaker: "أنت", text: "Great. Could you drop me off at the main entrance?" },
  ], keyPhrases: [
    { en: "Could you take me to the airport, please?", ar: "ممكن توصلني المطار؟" },
    { en: "Is there a lot of traffic at this time?", ar: "في زحمة هالوقت؟" },
    { en: "Could you drop me off at the main entrance?", ar: "ممكن تنزلني عند المدخل الرئيسي؟" },
  ], producePrompt: "ركبت تاكسي وتبي توصل مكان محدد:", produceModel: "Could you take me to the Hilton Hotel on King Street, please? How long will it take, and is there much traffic?", noticingTips: ["\"Could you take me to\" = الطريقة المهذبة لطلب وجهة", "\"drop me off at\" = مصطلح أساسي يعني 'نزّلني عند'", "السؤال عن الوقت والزحمة = محادثة طبيعية مع السائق"], challenge: "اليوم: لو ركبت أي وسيلة نقل — فكّر كيف توصف وجهتك بالإنجليزي." },

  { title: "اشتراك نادي رياضي", icon: "", dialogue: [
    { speaker: "الموظف", text: "Welcome! Are you interested in joining our gym?" },
    { speaker: "أنت", text: "Yes, I'd like to know about your membership options." },
    { speaker: "الموظف", text: "We have monthly and annual plans. Would you like a tour?" },
    { speaker: "أنت", text: "That would be great. What facilities do you have?" },
    { speaker: "الموظف", text: "We have a pool, sauna, group classes, and a personal trainer option." },
    { speaker: "أنت", text: "Interesting. How much is the monthly plan?" },
    { speaker: "الموظف", text: "It's two hundred per month. No contract required." },
  ], keyPhrases: [
    { en: "I'd like to know about your membership options.", ar: "أبي أعرف عن خيارات الاشتراك." },
    { en: "What facilities do you have?", ar: "وش المرافق اللي عندكم؟" },
    { en: "How much is the monthly plan?", ar: "كم الاشتراك الشهري؟" },
  ], producePrompt: "تبي تشترك في نادي. اسأل عن الخدمات والأسعار:", produceModel: "I'm interested in joining. What membership options do you have? I'd like to know about the facilities and the monthly rate.", noticingTips: ["\"I'm interested in joining\" = بداية مهذبة أقوى من \"I want to join\"", "\"What facilities do you have?\" = سؤال شامل ذكي", "\"No contract required\" = عبارة مهمة تسمعها كثير — يعني بدون التزام"], challenge: "اليوم: ادخل موقع أي نادي رياضي واقرأ صفحة الاشتراكات بالإنجليزي." },

  { title: "مقابلة عمل", icon: "١٦", dialogue: [
    { speaker: "المقابِل", text: "Thank you for coming. Tell me a little about yourself." },
    { speaker: "أنت", text: "I have ten years of experience in project management." },
    { speaker: "المقابِل", text: "What would you say is your biggest strength?" },
    { speaker: "أنت", text: "I'm good at organizing teams and meeting deadlines." },
    { speaker: "المقابِل", text: "Can you give me an example?" },
    { speaker: "أنت", text: "Last year, I led a project that finished two weeks ahead of schedule." },
    { speaker: "المقابِل", text: "Impressive. Do you have any questions for us?" },
  ], keyPhrases: [
    { en: "I have ten years of experience in project management.", ar: "عندي ١٠ سنوات خبرة في إدارة المشاريع." },
    { en: "I'm good at organizing teams and meeting deadlines.", ar: "أجيد تنظيم الفرق والالتزام بالمواعيد." },
    { en: "Last year, I led a project that finished ahead of schedule.", ar: "السنة الماضية، قدت مشروع خلص قبل الموعد." },
  ], producePrompt: "المقابِل يسألك 'Tell me about yourself'. أجب:", produceModel: "I have ten years of experience in my field. I'm passionate about solving problems and leading teams. In my last role, I successfully delivered a major project ahead of schedule.", noticingTips: ["\"Tell me about yourself\" = أشهر سؤال — جهّز إجابة من 3 جمل", "ذكر رقم (ten years) + إنجاز محدد (ahead of schedule) = إجابة قوية", "\"Do you have any questions for us?\" = دائماً سأل سؤال — يُظهر اهتمام"], challenge: "اليوم: جهّز إجابة 'Tell me about yourself' من 3 جمل وقلها بصوت عالٍ." },

  { title: "عند البقالة", icon: "🏪", dialogue: [
    { speaker: "أنت", text: "Excuse me, do you have any fresh bread today?" },
    { speaker: "البائع", text: "Yes, we just baked a new batch. White or whole wheat?" },
    { speaker: "أنت", text: "Whole wheat, please. And I'll also take a dozen eggs." },
    { speaker: "البائع", text: "Anything else?" },
    { speaker: "أنت", text: "Yes, do you have any local honey?" },
    { speaker: "البائع", text: "We do. It's on the shelf behind you." },
    { speaker: "أنت", text: "Perfect. That's everything. How much is the total?" },
  ], keyPhrases: [
    { en: "Do you have any fresh bread today?", ar: "عندكم خبز طازج اليوم؟" },
    { en: "I'll also take a dozen eggs.", ar: "وبآخذ كمان درزن بيض." },
    { en: "That's everything. How much is the total?", ar: "هذا كل شيء. كم المجموع؟" },
  ], producePrompt: "أنت في بقالة. اطلب ما تحتاجه:", produceModel: "Good morning. I'd like some fresh bread, a dozen eggs, and a bottle of olive oil, please. Is there anything on sale today?", noticingTips: ["\"Do you have any...\" = الطريقة المهذبة للسؤال عن توفر منتج", "\"a dozen\" = 12 — مصطلح شائع جداً في التسوق", "\"That's everything\" = طريقة أنيقة لإنهاء الطلب"], challenge: "اليوم: في أي محل، اقرأ أسماء 5 منتجات بالإنجليزي." },

  { title: "حجز مطعم بالتلفون", icon: "📲", dialogue: [
    { speaker: "الموظف", text: "Good evening, La Piazza restaurant. How may I help you?" },
    { speaker: "أنت", text: "I'd like to make a reservation for this Saturday, please." },
    { speaker: "الموظف", text: "Of course. How many guests and what time?" },
    { speaker: "أنت", text: "Four guests at seven thirty in the evening." },
    { speaker: "الموظف", text: "We have a table available. Indoor or outdoor?" },
    { speaker: "أنت", text: "Indoor, please. And is there a kids' menu available?" },
    { speaker: "الموظف", text: "Yes, we do. May I have a name for the reservation?" },
  ], keyPhrases: [
    { en: "I'd like to make a reservation for this Saturday.", ar: "أبي أحجز لهالسبت." },
    { en: "Four guests at seven thirty.", ar: "٤ أشخاص الساعة ٧:٣٠." },
    { en: "Is there a kids' menu available?", ar: "في قائمة أطفال؟" },
  ], producePrompt: "اتصل بمطعم واحجز طاولة لعائلتك:", produceModel: "I'd like to make a reservation for Saturday evening at seven thirty. We'll be four guests, including two children. Do you have a kids' menu?", noticingTips: ["\"I'd like to make a reservation\" = نفس بنية حجز الفندق والعيادة", "تحديد العدد + الوقت في جملة واحدة = واضح ومباشر", "السؤال عن kids' menu = يُظهر تخطيط عملي"], challenge: "اليوم: لو بتطلع مع عائلتك — فكّر كيف تحجز بالإنجليزي." },

  { title: "عند الكهربائي/السباك", icon: "١٤", dialogue: [
    { speaker: "أنت", text: "Hi, I'm having a problem with my kitchen sink. It's leaking." },
    { speaker: "الفني", text: "I see. How long has it been leaking?" },
    { speaker: "أنت", text: "It started about two days ago. It gets worse when I use hot water." },
    { speaker: "الفني", text: "It looks like the pipe needs to be replaced." },
    { speaker: "أنت", text: "How long will that take, and how much will it cost?" },
    { speaker: "الفني", text: "About an hour. The total would be around eighty dollars." },
    { speaker: "أنت", text: "That sounds reasonable. Please go ahead." },
  ], keyPhrases: [
    { en: "I'm having a problem with my kitchen sink. It's leaking.", ar: "عندي مشكلة في مغسلة المطبخ. فيها تسريب." },
    { en: "How long will that take, and how much will it cost?", ar: "كم يأخذ وقت وكم التكلفة؟" },
    { en: "That sounds reasonable. Please go ahead.", ar: "يبدو معقول. تفضّل ابدأ." },
  ], producePrompt: "عندك مشكلة بالبيت واستدعيت فني. اشرح المشكلة:", produceModel: "I'm having a problem with my air conditioning. It's making a strange noise and not cooling properly. It started yesterday.", noticingTips: ["\"I'm having a problem with...\" = بداية مثالية لأي شكوى", "وصف الأعراض بالتفصيل (leaking, strange noise) = يساعد الفني", "\"That sounds reasonable\" = موافقة مهذبة على السعر"], challenge: "اليوم: فكّر بأي جهاز في بيتك — كيف توصف مشكلته بالإنجليزي؟" },

  // ===== WEEKS 4-6: 13 more scenarios (total 35 = 5 weeks) =====
  { title: "في محل الجوالات", icon: "٥", dialogue: [{ speaker: "البائع", text: "Welcome! Looking for anything specific today?" }, { speaker: "أنت", text: "Yes, I'm looking for a new phone with a good camera." }, { speaker: "البائع", text: "I'd recommend this model. It has a great camera and battery." }, { speaker: "أنت", text: "How much storage does it have?" }, { speaker: "البائع", text: "128 or 256 gigabytes." }, { speaker: "أنت", text: "I'll take the 256. Does it come with a warranty?" }, { speaker: "البائع", text: "Yes, two years included." }], keyPhrases: [{ en: "I'm looking for a new phone with a good camera.", ar: "أدوّر جوال جديد كاميرته حلوة." }, { en: "How much storage does it have?", ar: "كم مساحة التخزين؟" }, { en: "Does it come with a warranty?", ar: "يجي معاه ضمان؟" }], producePrompt: "تبي تشتري جوال جديد. اسأل:", produceModel: "I'm looking for a new smartphone with a good camera and at least 256GB. What do you recommend?", noticingTips: ["\"I'm looking for\" = أفضل بداية للتسوق", "\"Does it come with\" = سؤال ذكي عن المُضاف", "تحديد المواصفات مباشرة = يوفر وقت"], challenge: "اليوم: اقرأ مواصفات جوالك بالإنجليزي." },

  { title: "في البريد", icon: "📮", dialogue: [{ speaker: "الموظف", text: "How can I help you?" }, { speaker: "أنت", text: "I'd like to send this package to London, please." }, { speaker: "الموظف", text: "Standard or express?" }, { speaker: "أنت", text: "How long does express take?" }, { speaker: "الموظف", text: "Three to five business days." }, { speaker: "أنت", text: "Express, please. I need it there by next week." }, { speaker: "الموظف", text: "Forty-five dollars. Would you like tracking?" }], keyPhrases: [{ en: "I'd like to send this package to London.", ar: "أبي أرسل هالطرد للندن." }, { en: "How long does express take?", ar: "كم يأخذ الإكسبرس؟" }, { en: "Would you like tracking?", ar: "تبي رقم تتبع؟" }], producePrompt: "تبي ترسل طرد لخارج البلد:", produceModel: "I'd like to send this package to London via express. How long will it take and how much does it cost? I'd also like tracking.", noticingTips: ["\"via express\" = طريقة أنيقة لتحديد الشحن", "\"business days\" = أيام عمل (بدون ويكند)", "طلب tracking = تفكير عملي"], challenge: "اليوم: تتبع أي شحنة واقرأ حالتها بالإنجليزي." },

  { title: "تسجيل دورة أونلاين", icon: "💻", dialogue: [{ speaker: "الموقع", text: "Ready to start learning?" }, { speaker: "أنت", text: "I'd like to sign up for the digital marketing course." }, { speaker: "الموقع", text: "Self-paced or live?" }, { speaker: "أنت", text: "What's the difference in price?" }, { speaker: "الموقع", text: "Self-paced is ninety-nine. Live is one-ninety-nine with weekly sessions." }, { speaker: "أنت", text: "I'll go with self-paced. I have a busy schedule." }, { speaker: "الموقع", text: "You'll have lifetime access to all materials." }], keyPhrases: [{ en: "I'd like to sign up for the course.", ar: "أبي أسجّل في الدورة." }, { en: "What's the difference in price?", ar: "وش الفرق بالسعر؟" }, { en: "I have a busy schedule.", ar: "جدولي مزدحم." }], producePrompt: "تبي تسجّل في دورة أونلاين:", produceModel: "I'm interested in the photography course. What's the difference between self-paced and live? I have a busy schedule, so flexibility is important.", noticingTips: ["\"sign up for\" = التسجيل في شيء", "\"What's the difference\" = سؤال مقارنة مهم", "ذكر السبب = يساعد في الاختيار"], challenge: "اليوم: ادخل منصة تعليمية واقرأ وصف دورة بالإنجليزي." },

  { title: "طلب إجازة من العمل", icon: "🏖️", dialogue: [{ speaker: "المدير", text: "You wanted to see me?" }, { speaker: "أنت", text: "Yes, I'd like to request some time off next month." }, { speaker: "المدير", text: "How many days?" }, { speaker: "أنت", text: "A week, from the fifteenth to the twenty-second." }, { speaker: "المدير", text: "That should be fine. Reachable for emergencies?" }, { speaker: "أنت", text: "I'll have my phone. Email for non-urgent matters." }, { speaker: "المدير", text: "Submit the request and I'll approve it." }], keyPhrases: [{ en: "I'd like to request some time off.", ar: "أبي أطلب إجازة." }, { en: "From the fifteenth to the twenty-second.", ar: "من ١٥ إلى ٢٢." }, { en: "I'd prefer email for non-urgent matters.", ar: "أفضّل الإيميل للأمور غير العاجلة." }], producePrompt: "تبي تطلب إجازة من مديرك:", produceModel: "I'd like to request a week off next month. I'll make sure all my tasks are completed before I leave.", noticingTips: ["\"request time off\" = طلب إجازة رسمياً", "تحديد التواريخ بدقة = احترافية", "ذكر خطة التغطية = مسؤولية"], challenge: "اليوم: اكتب إيميل قصير بالإنجليزي." },

  { title: "التعريف بنفسك في مناسبة", icon: "١٥", dialogue: [{ speaker: "شخص", text: "Hi! I don't think we've met." }, { speaker: "أنت", text: "Nice to meet you! I'm Khalid." }, { speaker: "شخص", text: "What do you do?" }, { speaker: "أنت", text: "I work in finance. I manage investments." }, { speaker: "شخص", text: "How long have you been doing that?" }, { speaker: "أنت", text: "About eight years. I enjoy the analytical side." }, { speaker: "شخص", text: "We should exchange contacts!" }], keyPhrases: [{ en: "I work in finance. I manage investments.", ar: "أشتغل في المالية. أدير استثمارات." }, { en: "I enjoy the analytical side of it.", ar: "أستمتع بالجانب التحليلي." }, { en: "We should exchange contacts!", ar: "لازم نتبادل أرقام!" }], producePrompt: "شخص جديد يسألك عن نفسك:", produceModel: "I'm Khalid. I work in engineering — about ten years. I'm passionate about renewable energy. What about you?", noticingTips: ["اسم → مجال → خبرة → شغف = بناء طبيعي", "\"I'm passionate about\" = تعبير قوي عن الاهتمام", "\"What about you?\" = تحوّل المحادثة لحوار"], challenge: "اليوم: حضّر تعريف عن نفسك من 4 جمل وقله بصوت عالٍ." },

  { title: "في محطة القطار", icon: "🚂", dialogue: [{ speaker: "الموظف", text: "Where would you like to go?" }, { speaker: "أنت", text: "One ticket to Manchester, please." }, { speaker: "الموظف", text: "Single or return?" }, { speaker: "أنت", text: "Return. What time is the next train?" }, { speaker: "الموظف", text: "Ten fifteen from platform four." }, { speaker: "أنت", text: "Do I need to reserve a seat?" }, { speaker: "الموظف", text: "Recommended during peak hours." }], keyPhrases: [{ en: "One ticket to Manchester, please.", ar: "تذكرة واحدة لمانشستر." }, { en: "Single or return?", ar: "ذهاب أو ذهاب وإياب؟" }, { en: "Do I need to reserve a seat?", ar: "لازم أحجز مقعد؟" }], producePrompt: "تبي تشتري تذكرة قطار:", produceModel: "I'd like a return ticket to Edinburgh. What time is the next train, and which platform?", noticingTips: ["\"single\" = ذهاب / \"return\" = ذهاب وإياب", "\"platform\" = رصيف القطار", "\"peak hours\" = ساعات الذروة"], challenge: "اليوم: تعلّم ٣ مصطلحات مواصلات بالإنجليزي." },

  { title: "شكوى على خدمة إنترنت", icon: "٢٦", dialogue: [{ speaker: "الموظف", text: "How can I assist you?" }, { speaker: "أنت", text: "My internet has been very slow for the past week." }, { speaker: "الموظف", text: "Let me check your account." }, { speaker: "أنت", text: "I'm paying for 100 megabits but only getting 20." }, { speaker: "الموظف", text: "There might be an issue in your area. We'll send a technician." }, { speaker: "أنت", text: "When? And will I get a credit for the downtime?" }, { speaker: "الموظف", text: "Tomorrow. I'll apply a credit to your bill." }], keyPhrases: [{ en: "My internet has been very slow for the past week.", ar: "النت بطيء من أسبوع." }, { en: "I'm paying for 100 megabits but only getting 20.", ar: "أدفع ١٠٠ ميقا وما أحصل إلا ٢٠." }, { en: "Will I get a credit for the downtime?", ar: "بتعوّضوني؟" }], producePrompt: "النت بطيء من أسبوع. اتصل بالشركة:", produceModel: "My internet has been extremely slow for a week. I'm paying for 100 megabits but only getting 20. Can you send a technician and credit my account?", noticingTips: ["المقارنة (paying for X but getting Y) = شكوى قوية", "\"credit\" = تعويض/خصم على الفاتورة", "\"downtime\" = فترة الانقطاع"], challenge: "اليوم: اقرأ فاتورة بالإنجليزي وافهم البنود." },

  { title: "في العيادة البصرية", icon: "👓", dialogue: [{ speaker: "الطبيب", text: "When was your last eye exam?" }, { speaker: "أنت", text: "Two years ago. I'm having trouble seeing far away." }, { speaker: "الطبيب", text: "Can you read the third line?" }, { speaker: "أنت", text: "The first two letters, but the rest is blurry." }, { speaker: "الطبيب", text: "You need a new prescription. Glasses or contacts?" }, { speaker: "أنت", text: "Glasses, please. Any frame recommendations?" }, { speaker: "الطبيب", text: "Let me show you some options." }], keyPhrases: [{ en: "I'm having trouble seeing things far away.", ar: "أشوف البعيد بصعوبة." }, { en: "The rest is blurry.", ar: "الباقي ضبابي." }, { en: "Would you like glasses or contacts?", ar: "تبي نظارات أو عدسات؟" }], producePrompt: "رحت عيادة العيون. اشرح مشكلتك:", produceModel: "I've been having trouble seeing far away, especially when driving at night. I think I need a new prescription.", noticingTips: ["\"blurry\" = ضبابي — كلمة طبية يومية", "\"prescription\" = وصفة — للنظارات والأدوية", "\"I've been having trouble\" + ing = مشكلة مستمرة"], challenge: "اليوم: تعلم ٣ كلمات طبية جديدة بالإنجليزي." },

  { title: "شراء تذاكر سينما", icon: "🎬", dialogue: [{ speaker: "الموظف", text: "What movie would you like to see?" }, { speaker: "أنت", text: "Two tickets for the seven o'clock showing." }, { speaker: "الموظف", text: "Regular or IMAX?" }, { speaker: "أنت", text: "IMAX. Any seats in the middle?" }, { speaker: "الموظف", text: "Row G, seats 8 and 9." }, { speaker: "أنت", text: "I'll take those. And a large popcorn." }, { speaker: "الموظف", text: "Thirty-eight dollars total." }], keyPhrases: [{ en: "Two tickets for the seven o'clock showing.", ar: "تذكرتين لعرض الساعة ٧." }, { en: "Any seats in the middle?", ar: "في مقاعد بالنص؟" }, { en: "I'll take those.", ar: "آخذهم." }], producePrompt: "تبي تشتري تذاكر سينما:", produceModel: "I'd like four tickets for the eight o'clock showing. Do you have seats together in the middle? And a large popcorn.", noticingTips: ["\"showing\" = عرض فيلم", "\"seats together\" = مقاعد متجاورة", "طلب الأكل مع التذاكر = طبيعي وطلاقة"], challenge: "اليوم: اقرأ أوقات عرض أي فيلم بالإنجليزي." },

  { title: "مقابلة الجيران الجدد", icon: "🏡", dialogue: [{ speaker: "أنت", text: "Hi! We just moved in next door." }, { speaker: "الجار", text: "Welcome! I'm Mark. How are you settling in?" }, { speaker: "أنت", text: "Pretty well. Everyone's been friendly." }, { speaker: "الجار", text: "Where did you move from?" }, { speaker: "أنت", text: "Downtown. We wanted a quieter area for the kids." }, { speaker: "الجار", text: "There's a great park around the corner." }, { speaker: "أنت", text: "That's exactly what we were looking for!" }], keyPhrases: [{ en: "We just moved in next door.", ar: "توّنا انتقلنا بالبيت الجنب." }, { en: "How are you settling in?", ar: "كيف التأقلم؟" }, { en: "We wanted a quieter area for the kids.", ar: "نبي منطقة أهدأ للأطفال." }], producePrompt: "جيرانك الجدد يسلّمون عليك:", produceModel: "Hi! We just moved in last week. I'm Khalid. We wanted a quieter neighborhood for the kids. How long have you been here?", noticingTips: ["\"settle in\" = تتأقلم — تعبير شائع", "ذكر سبب الانتقال = يفتح محادثة", "السؤال بالنهاية = يحوّل لحوار"], challenge: "اليوم: فكّر كيف تصف حيّك بـ ٣ جمل إنجليزية." },

  { title: "تحويل أموال", icon: "💸", dialogue: [{ speaker: "الموظف", text: "How can I help?" }, { speaker: "أنت", text: "I'd like to make an international transfer." }, { speaker: "الموظف", text: "Which country?" }, { speaker: "أنت", text: "The UK. Three thousand pounds." }, { speaker: "الموظف", text: "The rate is 4.7 riyals per pound." }, { speaker: "أنت", text: "How long will it take?" }, { speaker: "الموظف", text: "One to two business days." }], keyPhrases: [{ en: "I'd like to make an international transfer.", ar: "أبي حوالة دولية." }, { en: "The exchange rate is 4.7 per pound.", ar: "سعر الصرف ٤.٧ للباوند." }, { en: "How long will it take to arrive?", ar: "كم يأخذ توصل؟" }], producePrompt: "تبي تحوّل فلوس لخارج:", produceModel: "I'd like to make an international transfer to the UK. Three thousand pounds. What's the exchange rate, and how long will it take?", noticingTips: ["\"international transfer\" = تحويل دولي", "\"exchange rate\" = سعر الصرف", "\"business days\" = أيام عمل"], challenge: "اليوم: اعرف سعر صرف عملة واحدة بالإنجليزي." },

  { title: "استلام توصيل", icon: "١١", dialogue: [{ speaker: "المندوب", text: "Delivery for apartment 5B?" }, { speaker: "أنت", text: "Yes, that's me. Where do I sign?" }, { speaker: "المندوب", text: "Right here. Can I see some ID?" }, { speaker: "أنت", text: "Sure. Can I check the package first?" }, { speaker: "المندوب", text: "Of course. Take your time." }, { speaker: "أنت", text: "Everything looks good. Thank you." }, { speaker: "المندوب", text: "Have a great day!" }], keyPhrases: [{ en: "Where do I sign?", ar: "وين أوقّع؟" }, { en: "Can I check the package first?", ar: "ممكن أتأكّد أول؟" }, { en: "Everything looks good.", ar: "كل شيء تمام." }], producePrompt: "المندوب وصل وعنده طرد:", produceModel: "Yes, that's me. Before I sign, can I check the package? Everything looks good. Thank you!", noticingTips: ["\"Where do I sign?\" = سؤال بسيط مهم", "التأكّد قبل التوقيع = حقك", "\"Everything looks good\" = تأكيد طبيعي مختصر"], challenge: "اليوم: لو وصلك توصيل — قل Thank you." },

  { title: "طلب تاكسي", icon: "🚕", dialogue: [{ speaker: "أنت", text: "Could you take me to the airport, please?" }, { speaker: "السائق", text: "Sure. Which terminal?" }, { speaker: "أنت", text: "Terminal two, international departures." }, { speaker: "السائق", text: "About thirty minutes." }, { speaker: "أنت", text: "Is there much traffic now?" }, { speaker: "السائق", text: "A little, but we should make it." }, { speaker: "أنت", text: "Could you drop me off at the main entrance?" }], keyPhrases: [{ en: "Could you take me to the airport?", ar: "ممكن توصلني المطار؟" }, { en: "Is there much traffic?", ar: "في زحمة؟" }, { en: "Could you drop me off at the main entrance?", ar: "ممكن تنزلني عند المدخل الرئيسي؟" }], producePrompt: "ركبت تاكسي:", produceModel: "Could you take me to the Hilton Hotel on King Street? How long will it take?", noticingTips: ["\"Could you take me to\" = طلب مهذب للوجهة", "\"drop me off at\" = نزّلني عند", "السؤال عن الوقت = محادثة طبيعية"], challenge: "اليوم: فكّر كيف توصف وجهتك بالإنجليزي." },
  // ========== BLOCK 3: SOCIAL & RELATIONSHIPS (Weeks 5-6) ==========
  { title: "دعوة صديق للعشاء", icon: "🍷", dialogue: [{ speaker: "أنت", text: "Hey! Are you free this Friday evening?" }, { speaker: "الصديق", text: "I think so. What do you have in mind?" }, { speaker: "أنت", text: "I'd love to have you over for dinner. We're grilling." }, { speaker: "الصديق", text: "That sounds great! What time should I come?" }, { speaker: "أنت", text: "Around seven. Feel free to bring your family." }, { speaker: "الصديق", text: "Can I bring anything?" }, { speaker: "أنت", text: "That would be lovely. See you Friday!" }], keyPhrases: [{ en: "Are you free this Friday evening?", ar: "فاضي يوم الجمعة؟" }, { en: "I'd love to have you over for dinner.", ar: "يسعدني تتعشى عندنا." }, { en: "Feel free to bring your family.", ar: "جيب عائلتك براحتك." }], producePrompt: "ادعو صديقك للعشاء:", produceModel: "Are you free this Saturday? I'd love to have you and your family over for dinner around seven.", noticingTips: ["\"I'd love to have you over\" = دعوة دافئة", "\"Feel free to\" = تعبير كرم"], challenge: "اليوم: ادعُ شخص لشيء بسيط." },
  { title: "تهنئة بمولود", icon: "👶", dialogue: [{ speaker: "أنت", text: "Congratulations! I heard the wonderful news!" }, { speaker: "الصديق", text: "Thank you! We're thrilled." }, { speaker: "أنت", text: "How is the baby doing?" }, { speaker: "الصديق", text: "A boy. Perfectly healthy." }, { speaker: "أنت", text: "That's amazing. What did you name him?" }, { speaker: "الصديق", text: "Adam." }, { speaker: "أنت", text: "Beautiful name. I'd love to visit when you're ready." }], keyPhrases: [{ en: "Congratulations! I heard the wonderful news!", ar: "مبروك! سمعت الخبر!" }, { en: "How is the baby doing?", ar: "كيف حال البيبي؟" }, { en: "I'd love to visit when you're ready.", ar: "أزوركم لما تكونون جاهزين." }], producePrompt: "صديقك جاه مولود. هنّئه:", produceModel: "Congratulations! I'm so happy for you. How is the baby doing? I'd love to visit and bring something for the little one.", noticingTips: ["\"I'm so happy for you\" = أقوى من مجرد Congratulations", "\"the little one\" = تعبير حنون"], challenge: "اليوم: اكتب تهنئة بالإنجليزي." },
  { title: "اعتذار عن تأخير", icon: "⏰", dialogue: [{ speaker: "أنت", text: "I'm really sorry I'm late. Traffic was terrible." }, { speaker: "الصديق", text: "No worries. These things happen." }, { speaker: "أنت", text: "I should have left earlier." }, { speaker: "الصديق", text: "Don't worry about it." }, { speaker: "أنت", text: "Thank you for being so understanding." }, { speaker: "الصديق", text: "Of course. Let's get started." }, { speaker: "أنت", text: "I really appreciate your patience." }], keyPhrases: [{ en: "I'm really sorry I'm late.", ar: "آسف جداً على التأخير." }, { en: "I should have left earlier.", ar: "كان لازم أطلع بدري." }, { en: "I appreciate your patience.", ar: "أقدّر صبرك." }], producePrompt: "تأخرت على موعد:", produceModel: "I'm so sorry for being late. Traffic was much worse than expected. I should have planned better. Thank you for waiting.", noticingTips: ["\"I should have\" = كان لازم — تعبير ندم", "\"I appreciate your patience\" = أقوى من sorry المتكررة"], challenge: "اليوم: لو تأخرت — قل I'm sorry بالإنجليزي." },
  { title: "رد على دعوة", icon: "٢٧", dialogue: [{ speaker: "المضيف", text: "We're having a gathering Saturday. Can you make it?" }, { speaker: "أنت", text: "I'd love to come! What's the occasion?" }, { speaker: "المضيف", text: "Just a casual get-together." }, { speaker: "أنت", text: "Sounds perfect. What time?" }, { speaker: "المضيف", text: "Around six." }, { speaker: "أنت", text: "Should I bring anything?" }, { speaker: "المضيف", text: "Just yourself!" }], keyPhrases: [{ en: "I'd love to come!", ar: "يسعدني أجي!" }, { en: "What's the occasion?", ar: "وش المناسبة؟" }, { en: "Should I bring anything?", ar: "أجيب شيء معي؟" }], producePrompt: "أحد دعاك. رد:", produceModel: "I'd love to come! What time should I be there, and should I bring anything?", noticingTips: ["\"I'd love to come\" = قبول حماسي", "\"Should I bring anything\" = يُظهر ذوق"], challenge: "اليوم: لو دعاك أحد — جاوب بجملة كاملة." },
  { title: "طلب نصيحة", icon: "💭", dialogue: [{ speaker: "أنت", text: "Can I ask you for some advice?" }, { speaker: "الصديق", text: "Of course! What's on your mind?" }, { speaker: "أنت", text: "I'm thinking about changing careers." }, { speaker: "الصديق", text: "That's big. What's making you consider it?" }, { speaker: "أنت", text: "I feel like I've stopped growing." }, { speaker: "الصديق", text: "Have you thought about what you'd do instead?" }, { speaker: "أنت", text: "Technology, but I'd need new skills." }], keyPhrases: [{ en: "Can I ask you for some advice?", ar: "ممكن أسألك نصيحة؟" }, { en: "I feel like I've stopped growing.", ar: "أحس إني وقفت عن التطور." }, { en: "I'd need to learn new skills.", ar: "أحتاج أتعلم مهارات جديدة." }], producePrompt: "اسأل صديقك نصيحة:", produceModel: "Can I ask your advice? I'm thinking about changing careers. I feel stuck and want to try something in technology.", noticingTips: ["\"Can I ask you for some advice\" = بداية مثالية", "\"I feel like\" = وصف مشاعر بدون مبالغة"], challenge: "اليوم: فكّر بقرار مهم — كيف تشرحه بالإنجليزي؟" },
  { title: "مجاملة والرد عليها", icon: "😊", dialogue: [{ speaker: "شخص", text: "I love your jacket! Where did you get it?" }, { speaker: "أنت", text: "Thank you! I got it from a store downtown." }, { speaker: "شخص", text: "It really suits you." }, { speaker: "أنت", text: "That's very kind of you to say." }, { speaker: "شخص", text: "I've been looking for something similar." }, { speaker: "أنت", text: "I can send you the name of the store." }, { speaker: "شخص", text: "That would be great!" }], keyPhrases: [{ en: "That's very kind of you to say.", ar: "كلامك لطيف جداً." }, { en: "It really suits you.", ar: "فعلاً يناسبك." }, { en: "I can send you the details.", ar: "أقدر أرسلك التفاصيل." }], producePrompt: "شخص مدحك. رد:", produceModel: "Thank you, that's really kind! I actually got it on sale. I can send you the link if you're interested.", noticingTips: ["\"That's kind of you\" = رد متواضع على المجاملة", "\"It suits you\" = مجاملة شائعة"], challenge: "اليوم: امدح شخص بالإنجليزي." },
  { title: "تعزية ومواساة", icon: "🤲", dialogue: [{ speaker: "أنت", text: "I was so sorry to hear about your loss." }, { speaker: "الصديق", text: "Thank you. It's been difficult." }, { speaker: "أنت", text: "Please know that I'm here for you." }, { speaker: "الصديق", text: "That means a lot." }, { speaker: "أنت", text: "Is there anything I can do?" }, { speaker: "الصديق", text: "Just having someone to talk to helps." }, { speaker: "أنت", text: "I'm always a phone call away." }], keyPhrases: [{ en: "I was sorry to hear about your loss.", ar: "تأسفت لما سمعت." }, { en: "I'm here for you.", ar: "أنا موجود لك." }, { en: "I'm always a phone call away.", ar: "اتصل عليّ بأي وقت." }], producePrompt: "صديقك فقد شخص عزيز:", produceModel: "I'm deeply sorry for your loss. Please know that I'm here for you, whatever you need.", noticingTips: ["\"I was sorry to hear\" = التعزية القياسية", "\"I'm here for you\" = دعم قوي ومختصر"], challenge: "اليوم: تعلّم 3 عبارات تعزية بالإنجليزي." },
  { title: "تقديم شخص لشخص", icon: "🫱🏼‍🫲🏽", dialogue: [{ speaker: "أنت", text: "Sarah, I'd like you to meet my friend Khalid." }, { speaker: "أنت", text: "Khalid, this is Sarah from marketing." }, { speaker: "سارة", text: "Nice to meet you!" }, { speaker: "خالد", text: "Likewise! Omar has told me great things." }, { speaker: "أنت", text: "You two have a lot in common." }, { speaker: "سارة", text: "Really? Like what?" }, { speaker: "أنت", text: "You're both into photography." }], keyPhrases: [{ en: "I'd like you to meet my friend.", ar: "أبي أعرّفك على صديقي." }, { en: "Likewise!", ar: "وأنا كذلك!" }, { en: "You have a lot in common.", ar: "بينكم أشياء مشتركة." }], producePrompt: "عرّف صديقين على بعض:", produceModel: "Hey Sarah, I'd like you to meet my colleague Ahmed. I think you two would really get along!", noticingTips: ["\"I'd like you to meet\" = تعريف رسمي", "\"Likewise\" = بديل أنيق لـ nice to meet you too"], challenge: "اليوم: فكّر كيف تعرّف شخصين بالإنجليزي." },
  { title: "شكر على هدية", icon: "🎁", dialogue: [{ speaker: "أنت", text: "This is beautiful! You really didn't have to!" }, { speaker: "الصديق", text: "I saw it and thought of you." }, { speaker: "أنت", text: "That's so thoughtful. I love it!" }, { speaker: "الصديق", text: "I'm glad you like it." }, { speaker: "أنت", text: "The craftsmanship is amazing." }, { speaker: "الصديق", text: "A small shop in the old town." }, { speaker: "أنت", text: "Thank you. This really made my day." }], keyPhrases: [{ en: "You really didn't have to!", ar: "ما كان لازم تتعب نفسك!" }, { en: "That's so thoughtful.", ar: "ذوق عالي منك." }, { en: "This made my day.", ar: "سعّدت يومي." }], producePrompt: "أحد أهداك. اشكره:", produceModel: "This is absolutely beautiful! You really didn't have to. That's so thoughtful of you!", noticingTips: ["\"You didn't have to\" = تواضع + تقدير", "\"This made my day\" = فرح حقيقي"], challenge: "اليوم: اشكر شخص بأكثر من Thank you." },
  { title: "محادثة جار عن مشكلة", icon: "🏠", dialogue: [{ speaker: "أنت", text: "Hi, sorry to bother you. Do you have a minute?" }, { speaker: "الجار", text: "Sure, what's up?" }, { speaker: "أنت", text: "I wanted to talk about the noise late at night." }, { speaker: "الجار", text: "Oh, was it too loud?" }, { speaker: "أنت", text: "After midnight it gets a bit much. The kids wake up." }, { speaker: "الجار", text: "I had no idea. I'll keep it down." }, { speaker: "أنت", text: "I appreciate that. Thanks for understanding." }], keyPhrases: [{ en: "Sorry to bother you.", ar: "آسف أزعجك." }, { en: "I wanted to talk about the noise.", ar: "بغيت أتكلم عن الإزعاج." }, { en: "Thanks for understanding.", ar: "شكراً على تفهّمك." }], producePrompt: "جارك يسوي إزعاج. تكلم بأدب:", produceModel: "Sorry to bother you. The noise after midnight has been waking the kids. Would it be possible to keep it down?", noticingTips: ["\"Sorry to bother you\" = بداية مثالية لموضوع حساس", "\"Thanks for understanding\" = إنهاء يحفظ العلاقة"], challenge: "اليوم: فكّر بموقف محرج — كيف تتعامل بالإنجليزي؟" },
  { title: "دردشة في الانتظار", icon: "٢٣", dialogue: [{ speaker: "شخص", text: "Long wait today, isn't it?" }, { speaker: "أنت", text: "Yeah, about twenty minutes already." }, { speaker: "شخص", text: "I hope it won't be much longer." }, { speaker: "أنت", text: "Me too. Are you here for a checkup?" }, { speaker: "شخص", text: "Yes, routine. You?" }, { speaker: "أنت", text: "Same. Every six months." }, { speaker: "شخص", text: "Good discipline." }], keyPhrases: [{ en: "Long wait today, isn't it?", ar: "الانتظار طويل اليوم، صح؟" }, { en: "I hope it won't be much longer.", ar: "إن شاء الله ما يطول." }, { en: "Are you here for a checkup?", ar: "جاي فحص؟" }], producePrompt: "شخص يسولفك في الانتظار:", produceModel: "Yeah, quite a wait. Are you here for a checkup too? I try to come every six months.", noticingTips: ["tag questions (isn't it?) = تفتح محادثة", "small talk = مهارة اجتماعية أساسية"], challenge: "اليوم: سولف مع أي شخص غريب — حتى بالعربي." },
  { title: "مكالمة صديق قديم", icon: "١٠", dialogue: [{ speaker: "أنت", text: "Hey! It's been ages! How have you been?" }, { speaker: "الصديق", text: "Great to hear from you! I'm doing well." }, { speaker: "أنت", text: "What are you up to these days?" }, { speaker: "الصديق", text: "Started a new job last month." }, { speaker: "أنت", text: "That's awesome! We should catch up over coffee." }, { speaker: "الصديق", text: "Absolutely! When?" }, { speaker: "أنت", text: "This weekend? My treat." }], keyPhrases: [{ en: "It's been ages!", ar: "من زمان!" }, { en: "What are you up to these days?", ar: "وش أخبارك؟" }, { en: "We should catch up. My treat.", ar: "لازم نتسولف. أنا أدفع." }], producePrompt: "تكلم صديق قديم:", produceModel: "Hey! It's been so long! How have you been? Let's catch up this weekend — my treat!", noticingTips: ["\"It's been ages\" = من زمان", "\"catch up\" = نلحّق أخبار بعض", "\"My treat\" = أنا أدفع"], challenge: "اليوم: أرسل رسالة لصديق قديم." },
  { title: "إلغاء خطة بأدب", icon: "🙏", dialogue: [{ speaker: "أنت", text: "I'm sorry, but I need to cancel tonight." }, { speaker: "الصديق", text: "Is everything okay?" }, { speaker: "أنت", text: "Yes, something came up with work." }, { speaker: "الصديق", text: "I understand." }, { speaker: "أنت", text: "Can we reschedule for next week?" }, { speaker: "الصديق", text: "Sure, that works." }, { speaker: "أنت", text: "Thanks for being flexible. I'll make it up to you." }], keyPhrases: [{ en: "Something came up.", ar: "طرأ شيء." }, { en: "Can we reschedule?", ar: "نقدر نأجّل؟" }, { en: "I'll make it up to you.", ar: "بعوّضك." }], producePrompt: "تحتاج تلغي خطة:", produceModel: "I'm really sorry, but I can't make it tonight. Something came up. Could we reschedule for next week? I'll make it up to you!", noticingTips: ["\"Something came up\" = العذر الأكثر شيوعاً", "\"I'll make it up to you\" = يحفظ العلاقة"], challenge: "اليوم: تدرّب: Something came up بصوت عالٍ." },
  { title: "شكوى لطيفة في مطعم", icon: "١", dialogue: [{ speaker: "أنت", text: "Excuse me, I think there's an issue with my order." }, { speaker: "النادل", text: "I'm sorry. What's the problem?" }, { speaker: "أنت", text: "I ordered well-done, but this seems medium." }, { speaker: "النادل", text: "Let me take it back." }, { speaker: "أنت", text: "Thank you. I appreciate it." }, { speaker: "النادل", text: "Here's the corrected order." }, { speaker: "أنت", text: "Perfect now. No worries at all." }], keyPhrases: [{ en: "I think there's an issue with my order.", ar: "أعتقد في مشكلة بطلبي." }, { en: "I ordered well-done but this seems medium.", ar: "طلبت well-done بس هذا medium." }, { en: "No worries at all.", ar: "أبداً عادي." }], producePrompt: "طلبك جا غلط. اشتكِ بأدب:", produceModel: "Excuse me, I think there's an issue. I ordered the steak well-done but this looks medium. Would you mind checking?", noticingTips: ["\"I think there might be\" = شكوى ناعمة", "\"No worries at all\" = ختام إيجابي"], challenge: "اليوم: تعلّم: rare, medium, well-done." },

  // ========== BLOCK 4: WORK & PROFESSIONAL (Weeks 7-8) ==========
  { title: "عرض تقديمي", icon: "٢٤", dialogue: [{ speaker: "أنت", text: "Good morning everyone. Thank you for joining." }, { speaker: "أنت", text: "Today I'll be presenting our quarterly results." }, { speaker: "الحضور", text: "Could you zoom in on that chart?" }, { speaker: "أنت", text: "Of course. As you can see, revenue increased by fifteen percent." }, { speaker: "الحضور", text: "What contributed to that growth?" }, { speaker: "أنت", text: "Mainly our expansion into new markets." }, { speaker: "أنت", text: "Any other questions before I move to the next slide?" }], keyPhrases: [{ en: "Thank you for joining.", ar: "شكراً لحضوركم." }, { en: "As you can see, revenue increased by fifteen percent.", ar: "كما تشوفون، الإيرادات زادت ١٥٪." }, { en: "Any questions before I move on?", ar: "أسئلة قبل ما أكمل؟" }], producePrompt: "افتح عرض تقديمي:", produceModel: "Good morning everyone. Thank you for being here. Today I'll walk you through our quarterly results. As you can see from this chart, we've seen a fifteen percent increase in revenue.", noticingTips: ["\"Thank you for joining\" = فتح احترافي", "\"As you can see\" = ربط الكلام بالعرض", "\"Before I move on\" = تحكم بالمحادثة"], challenge: "اليوم: قدّم أي فكرة بـ 3 جمل إنجليزية بصوت عالٍ." },
  { title: "طلب زيادة راتب", icon: "💰", dialogue: [{ speaker: "أنت", text: "I'd like to discuss my compensation, if you have a moment." }, { speaker: "المدير", text: "Sure. What's on your mind?" }, { speaker: "أنت", text: "I've taken on additional responsibilities this year." }, { speaker: "المدير", text: "I've noticed that. You've been doing great work." }, { speaker: "أنت", text: "I'd like to discuss a salary adjustment that reflects my contributions." }, { speaker: "المدير", text: "What figure did you have in mind?" }, { speaker: "أنت", text: "Based on my research, a fifteen percent increase would be fair." }], keyPhrases: [{ en: "I'd like to discuss my compensation.", ar: "أبي نتكلم عن راتبي." }, { en: "I've taken on additional responsibilities.", ar: "أخذت مسؤوليات إضافية." }, { en: "A fifteen percent increase would be fair.", ar: "زيادة ١٥٪ تكون عادلة." }], producePrompt: "تبي تطلب زيادة من مديرك:", produceModel: "I'd like to discuss my compensation. Over the past year, I've taken on additional responsibilities and delivered strong results. I believe a fifteen percent adjustment would be fair.", noticingTips: ["\"compensation\" أفضل من \"salary\" = أكثر احترافية", "\"salary adjustment\" أفضل من \"raise\" = دبلوماسي", "ذكر الإنجازات قبل الطلب = يقوّي موقفك"], challenge: "اليوم: اكتب ٣ إنجازات لك بالإنجليزي." },
  { title: "اجتماع مع عميل", icon: "١٥", dialogue: [{ speaker: "العميل", text: "Thanks for meeting with us today." }, { speaker: "أنت", text: "Thank you for your time. I'm excited to discuss the proposal." }, { speaker: "العميل", text: "We've reviewed it. We have some concerns about the timeline." }, { speaker: "أنت", text: "I understand. Could you be more specific about your concerns?" }, { speaker: "العميل", text: "We need delivery by March, not April." }, { speaker: "أنت", text: "That's tight but achievable if we start immediately." }, { speaker: "العميل", text: "That works. Let's move forward." }], keyPhrases: [{ en: "I'm excited to discuss the proposal.", ar: "متحمس نناقش العرض." }, { en: "Could you be more specific about your concerns?", ar: "ممكن توضّح تحفظاتك أكثر؟" }, { en: "That's tight but achievable.", ar: "ضيق لكن ممكن ننجزه." }], producePrompt: "العميل عنده تحفظات على مشروعك:", produceModel: "I understand your concerns about the timeline. If we start immediately and allocate additional resources, we can deliver by March.", noticingTips: ["\"Could you be more specific\" = طلب توضيح احترافي", "\"tight but achievable\" = واقعي وإيجابي", "تقديم حل مع الموافقة = قوة تفاوضية"], challenge: "اليوم: فكّر بمشكلة في شغلك — كيف تشرحها بالإنجليزي؟" },
  { title: "إيميل متابعة", icon: "📧", dialogue: [{ speaker: "أنت", text: "I wanted to follow up on our meeting from last week." }, { speaker: "الزميل", text: "Yes, I've been meaning to get back to you." }, { speaker: "أنت", text: "Have you had a chance to review the documents?" }, { speaker: "الزميل", text: "I have. I think we need to revise section three." }, { speaker: "أنت", text: "I agree. I'll make the changes and send an updated version by Friday." }, { speaker: "الزميل", text: "That would be great." }, { speaker: "أنت", text: "I'll copy you on the email. Let me know if you need anything else." }], keyPhrases: [{ en: "I wanted to follow up on our meeting.", ar: "بغيت أتابع بخصوص اجتماعنا." }, { en: "Have you had a chance to review?", ar: "لحقت تراجع؟" }, { en: "I'll send an updated version by Friday.", ar: "بأرسل نسخة محدّثة يوم الجمعة." }], producePrompt: "تبي تتابع بعد اجتماع:", produceModel: "I wanted to follow up on our meeting last Tuesday. Have you had a chance to review the proposal? I can make any changes and send an updated version by end of week.", noticingTips: ["\"follow up on\" = المتابعة — فعل أساسي في العمل", "\"Have you had a chance to\" = أدب في السؤال عن تقدم العمل", "\"I'll copy you\" = أنسخك في الإيميل"], challenge: "اليوم: اكتب إيميل متابعة قصير بالإنجليزي." },
  { title: "التعامل مع خلاف في العمل", icon: "⚖️", dialogue: [{ speaker: "الزميل", text: "I don't think your approach will work." }, { speaker: "أنت", text: "I appreciate your honesty. Can you help me understand your concerns?" }, { speaker: "الزميل", text: "The timeline is unrealistic and the budget is too low." }, { speaker: "أنت", text: "Those are valid points. What if we adjusted both?" }, { speaker: "الزميل", text: "I'd need to see the numbers first." }, { speaker: "أنت", text: "Fair enough. I'll prepare a revised plan by tomorrow." }, { speaker: "الزميل", text: "That sounds good. I appreciate you listening." }], keyPhrases: [{ en: "I appreciate your honesty.", ar: "أقدّر صراحتك." }, { en: "Can you help me understand your concerns?", ar: "ممكن تساعدني أفهم تحفظاتك؟" }, { en: "Those are valid points.", ar: "نقاط صحيحة." }], producePrompt: "زميلك يعارض فكرتك:", produceModel: "I appreciate your perspective. You raise valid points about the timeline. What if we explored a compromise? I'll prepare a revised plan.", noticingTips: ["\"I appreciate your honesty\" = يحوّل الخلاف لحوار", "\"valid points\" = اعتراف بالآخر = يهدّئ", "\"Fair enough\" = تقبّل مختصر ومحترف"], challenge: "اليوم: فكّر بخلاف سابق — كيف تعيد صياغته باحترافية؟" },
  { title: "مقابلة توظيف (أنت تقابل)", icon: "١٨", dialogue: [{ speaker: "أنت", text: "Thank you for coming in. Tell me about your experience." }, { speaker: "المرشح", text: "I have five years in software development." }, { speaker: "أنت", text: "What interests you about this position?" }, { speaker: "المرشح", text: "The opportunity to work on innovative projects." }, { speaker: "أنت", text: "Can you describe a challenging project you've led?" }, { speaker: "المرشح", text: "I led a team of eight on a product launch last year." }, { speaker: "أنت", text: "Impressive. We'll be in touch within a week." }], keyPhrases: [{ en: "Tell me about your experience.", ar: "كلمني عن خبرتك." }, { en: "What interests you about this position?", ar: "وش يجذبك في هالوظيفة؟" }, { en: "We'll be in touch within a week.", ar: "بنتواصل معك خلال أسبوع." }], producePrompt: "أنت تقابل مرشح وظيفة:", produceModel: "Thank you for coming. I'd like to start by hearing about your experience and what interests you about this role.", noticingTips: ["\"Tell me about\" = أشهر سؤال في المقابلات", "\"What interests you\" = أفضل من \"Why do you want\"", "\"We'll be in touch\" = إنهاء مهذب بدون وعد"], challenge: "اليوم: حضّر 3 أسئلة مقابلة بالإنجليزي." },
  { title: "تقديم فكرة لمديرك", icon: "٢٥", dialogue: [{ speaker: "أنت", text: "Do you have five minutes? I have an idea I'd like to run by you." }, { speaker: "المدير", text: "Sure, go ahead." }, { speaker: "أنت", text: "I think we could save twenty percent on costs by automating the reports." }, { speaker: "المدير", text: "Interesting. How would that work?" }, { speaker: "أنت", text: "There's a tool that generates reports automatically from our data." }, { speaker: "المدير", text: "What's the cost of implementing it?" }, { speaker: "أنت", text: "About two thousand upfront, but it pays for itself in three months." }], keyPhrases: [{ en: "I have an idea I'd like to run by you.", ar: "عندي فكرة أبي آخذ رأيك فيها." }, { en: "We could save twenty percent by automating.", ar: "نقدر نوفر ٢٠٪ بالأتمتة." }, { en: "It pays for itself in three months.", ar: "يرجع تكلفته في ٣ شهور." }], producePrompt: "عندك فكرة حلوة وتبي تقنع مديرك:", produceModel: "I have an idea I'd like to run by you. I believe we could save significant costs by automating our reporting process. The tool costs two thousand but pays for itself within three months.", noticingTips: ["\"run by you\" = آخذ رأيك — تعبير عملي شائع", "\"pays for itself\" = يغطي تكلفته — مصطلح مالي مقنع", "أرقام محددة (20%, 3 months) = تقنع أكثر من كلام عام"], challenge: "اليوم: فكّر بفكرة تحسين في شغلك — صِغها بـ 3 جمل إنجليزية." },
  { title: "اجتماع فريق أسبوعي", icon: "👥", dialogue: [{ speaker: "أنت", text: "Let's start with a quick round of updates." }, { speaker: "الزميل", text: "I finished the design phase. Ready for review." }, { speaker: "أنت", text: "Great. Any blockers we should discuss?" }, { speaker: "الزميل", text: "I'm waiting on approval from the legal team." }, { speaker: "أنت", text: "I'll follow up with them today." }, { speaker: "الزميل", text: "That would help a lot." }, { speaker: "أنت", text: "Let's wrap up. I'll send the action items by email." }], keyPhrases: [{ en: "Let's start with updates.", ar: "نبدأ بالمستجدات." }, { en: "Any blockers?", ar: "في أي عوائق؟" }, { en: "I'll send the action items by email.", ar: "بأرسل المهام بالإيميل." }], producePrompt: "تدير اجتماع فريقك:", produceModel: "Let's go around for quick updates. Any blockers we need to address? I'll follow up on the pending items and send a summary by end of day.", noticingTips: ["\"blockers\" = عوائق — مصطلح شائع في الاجتماعات", "\"action items\" = المهام المطلوبة — أساسي", "\"wrap up\" = نختم — أنيق ومختصر"], challenge: "اليوم: لخّص يومك بـ 3 جمل إنجليزية." },
  { title: "طلب تمديد موعد", icon: "📅", dialogue: [{ speaker: "أنت", text: "I need to discuss the project deadline with you." }, { speaker: "المدير", text: "What's the situation?" }, { speaker: "أنت", text: "We've encountered some unexpected technical issues." }, { speaker: "المدير", text: "How much additional time do you need?" }, { speaker: "أنت", text: "I'd say about one extra week would be sufficient." }, { speaker: "المدير", text: "Can you guarantee delivery by then?" }, { speaker: "أنت", text: "Yes, I'm confident we can deliver with high quality." }], keyPhrases: [{ en: "We've encountered unexpected issues.", ar: "واجهنا مشاكل غير متوقعة." }, { en: "One extra week would be sufficient.", ar: "أسبوع إضافي يكفي." }, { en: "I'm confident we can deliver.", ar: "واثق إننا نقدر نسلّم." }], producePrompt: "تحتاج وقت إضافي للمشروع:", produceModel: "I need to discuss the timeline. We've encountered some unexpected issues. I'd like to request one additional week. I'm confident we'll deliver high quality.", noticingTips: ["\"encountered\" أفضل من \"had\" = أكثر احترافية", "\"sufficient\" أفضل من \"enough\" = رسمي أكثر", "ختام بثقة (I'm confident) = يطمئن المدير"], challenge: "اليوم: فكّر بموقف طلبت فيه وقت إضافي — كيف بالإنجليزي؟" },
  { title: "تفاوض على عقد", icon: "٢٨", dialogue: [{ speaker: "الطرف الآخر", text: "We'd like to propose a two-year contract." }, { speaker: "أنت", text: "I'm open to that. What are the key terms?" }, { speaker: "الطرف الآخر", text: "Fixed pricing with annual reviews." }, { speaker: "أنت", text: "Could we include a performance bonus clause?" }, { speaker: "الطرف الآخر", text: "We'd need to discuss the metrics." }, { speaker: "أنت", text: "I suggest we tie it to customer satisfaction scores." }, { speaker: "الطرف الآخر", text: "That's reasonable. Let's draft it up." }], keyPhrases: [{ en: "What are the key terms?", ar: "وش الشروط الرئيسية؟" }, { en: "Could we include a performance bonus?", ar: "ممكن نضيف مكافأة أداء؟" }, { en: "Let's draft it up.", ar: "نكتب المسودة." }], producePrompt: "تتفاوض على عقد:", produceModel: "I'm open to a two-year contract. Could we include a performance-based bonus clause? I suggest tying it to measurable outcomes.", noticingTips: ["\"I'm open to\" = مرونة مهنية", "\"Could we include\" = اقتراح مهذب في التفاوض", "\"Let's draft it up\" = ننتقل للتنفيذ"], challenge: "اليوم: اقرأ أي عقد أو اتفاقية بالإنجليزي." },
  { title: "تدريب موظف جديد", icon: "٤", dialogue: [{ speaker: "أنت", text: "Welcome to the team! I'll be showing you around today." }, { speaker: "الموظف", text: "Thank you! I'm excited to start." }, { speaker: "أنت", text: "First, let me walk you through our main systems." }, { speaker: "الموظف", text: "Should I take notes?" }, { speaker: "أنت", text: "Absolutely. I'll also send you a guide by email." }, { speaker: "الموظف", text: "That's very helpful." }, { speaker: "أنت", text: "Don't hesitate to ask questions. There's no such thing as a silly question." }], keyPhrases: [{ en: "I'll be showing you around.", ar: "بأعرّفك على المكان." }, { en: "Let me walk you through our systems.", ar: "خلني أشرحلك أنظمتنا." }, { en: "Don't hesitate to ask questions.", ar: "لا تتردد تسأل." }], producePrompt: "ترحّب بموظف جديد:", produceModel: "Welcome to the team! I'll walk you through everything today. Feel free to ask any questions — there are no silly questions here.", noticingTips: ["\"walk you through\" = أشرحلك خطوة بخطوة", "\"showing you around\" = أعرّفك على المكان", "\"Don't hesitate\" = لا تتردد — يُظهر دعم"], challenge: "اليوم: اشرح شيء بسيط لأي شخص بالإنجليزي." },
  { title: "تقديم تقرير شهري", icon: "٢٩", dialogue: [{ speaker: "أنت", text: "Here's the monthly report. Let me highlight the key points." }, { speaker: "المدير", text: "Go ahead." }, { speaker: "أنت", text: "Sales are up eight percent compared to last month." }, { speaker: "المدير", text: "What about expenses?" }, { speaker: "أنت", text: "We came in under budget by about five percent." }, { speaker: "المدير", text: "Excellent. Any concerns for next month?" }, { speaker: "أنت", text: "Hiring is our biggest challenge. We need two more engineers." }], keyPhrases: [{ en: "Let me highlight the key points.", ar: "خلني أبرز النقاط المهمة." }, { en: "Sales are up eight percent.", ar: "المبيعات زادت ٨٪." }, { en: "We came in under budget.", ar: "جينا أقل من الميزانية." }], producePrompt: "تقدّم تقريرك الشهري:", produceModel: "Let me walk you through the key highlights. Sales increased eight percent. We came in under budget. Our main challenge going forward is hiring.", noticingTips: ["\"highlight\" = أبرز — كلمة عروض أساسية", "\"came in under budget\" = أنفقنا أقل من المخطط", "ذكر التحديات بصراحة = مصداقية"], challenge: "اليوم: لخّص إنجازات أسبوعك بـ 3 جمل إنجليزية." },
  { title: "رد على إيميل صعب", icon: "📬", dialogue: [{ speaker: "الزميل", text: "I'm disappointed with the quality of the last deliverable." }, { speaker: "أنت", text: "Thank you for your feedback. I take this seriously." }, { speaker: "الزميل", text: "Several errors were found in the final document." }, { speaker: "أنت", text: "I apologize. Can you share the specific issues?" }, { speaker: "الزميل", text: "I'll send you a detailed list." }, { speaker: "أنت", text: "I'll address each point and send a corrected version within 48 hours." }, { speaker: "الزميل", text: "I appreciate your prompt response." }], keyPhrases: [{ en: "Thank you for your feedback.", ar: "شكراً على ملاحظاتك." }, { en: "I take this seriously.", ar: "آخذ الموضوع بجدية." }, { en: "I'll address each point.", ar: "بأعالج كل نقطة." }], producePrompt: "أحد ينتقد شغلك. رد باحترافية:", produceModel: "Thank you for bringing this to my attention. I take your feedback seriously. I'll review each point and send a corrected version within 48 hours.", noticingTips: ["\"Thank you for your feedback\" = يحوّل النقد لحوار بنّاء", "\"I take this seriously\" = يُظهر مسؤولية", "تحديد الموعد (48 hours) = التزام واضح"], challenge: "اليوم: اكتب رد على نقد بـ 3 جمل إنجليزية محترفة." },
  { title: "طلب ترقية", icon: "١٩", dialogue: [{ speaker: "أنت", text: "I'd like to discuss my career growth with you." }, { speaker: "المدير", text: "Of course. Where do you see yourself heading?" }, { speaker: "أنت", text: "I'm interested in moving into a senior role." }, { speaker: "المدير", text: "What makes you feel ready for that?" }, { speaker: "أنت", text: "I've consistently exceeded my targets and mentored three junior team members." }, { speaker: "المدير", text: "Those are strong qualifications." }, { speaker: "أنت", text: "I'd appreciate your guidance on what else I need to demonstrate." }], keyPhrases: [{ en: "I'd like to discuss my career growth.", ar: "أبي نتكلم عن تطوري المهني." }, { en: "I've consistently exceeded my targets.", ar: "تجاوزت أهدافي باستمرار." }, { en: "I'd appreciate your guidance.", ar: "أقدّر توجيهك." }], producePrompt: "تبي تطلب ترقية:", produceModel: "I'd like to discuss my career path. I've been exceeding my targets consistently and mentoring junior members. I believe I'm ready for a senior role and would appreciate your guidance.", noticingTips: ["\"career growth\" = تطور مهني — أفضل من \"promotion\"", "\"consistently exceeded\" = فعل + ظرف = يُظهر نمط مستمر", "\"I'd appreciate your guidance\" = طلب مهذب يُظهر تواضع"], challenge: "اليوم: اكتب 3 أسباب تستحق فيها ترقية بالإنجليزي." },

  // ========== BLOCK 5: TRAVEL & EتمكّنLORATION (Weeks 9-10) ==========
  { title: "حجز فندق أونلاين", icon: "🖥️", dialogue: [{ speaker: "الموظف", text: "How can I help with your booking?" }, { speaker: "أنت", text: "I'd like to book a room for three nights starting March fifth." }, { speaker: "الموظف", text: "We have standard and deluxe available." }, { speaker: "أنت", text: "What's the difference in price?" }, { speaker: "الموظف", text: "Standard is one-twenty, deluxe is one-eighty per night." }, { speaker: "أنت", text: "Deluxe, please. Is there a cancellation policy?" }, { speaker: "الموظف", text: "Free cancellation up to 48 hours before check-in." }], keyPhrases: [{ en: "I'd like to book for three nights starting March fifth.", ar: "أبي أحجز ٣ ليالي من ٥ مارس." }, { en: "What's the difference in price?", ar: "وش فرق السعر؟" }, { en: "Is there a cancellation policy?", ar: "في سياسة إلغاء؟" }], producePrompt: "تبي تحجز فندق:", produceModel: "I'd like to book a deluxe room for three nights from March 5th to 8th. Is there a cancellation policy?", noticingTips: ["\"starting [date]\" = ابتداءً من", "\"cancellation policy\" = سياسة الإلغاء — مصطلح سفر أساسي"], challenge: "اليوم: ادخل أي موقع حجز واقرأ شروط الإلغاء." },
  { title: "في مكتب الجوازات", icon: "🛂", dialogue: [{ speaker: "الموظف", text: "Passport and boarding pass, please." }, { speaker: "أنت", text: "Here you go." }, { speaker: "الموظف", text: "What's the purpose of your visit?" }, { speaker: "أنت", text: "I'm here for a business conference." }, { speaker: "الموظف", text: "How long will you be staying?" }, { speaker: "أنت", text: "Five days. I'm returning next Wednesday." }, { speaker: "الموظف", text: "Welcome. Enjoy your stay." }], keyPhrases: [{ en: "What's the purpose of your visit?", ar: "وش سبب زيارتك؟" }, { en: "I'm here for a business conference.", ar: "جاي لمؤتمر عمل." }, { en: "I'm returning next Wednesday.", ar: "راجع يوم الأربعاء." }], producePrompt: "في الجوازات يسألونك:", produceModel: "I'm here for a five-day business trip. I'll be attending a conference and returning next Wednesday.", noticingTips: ["\"purpose of your visit\" = أشهر سؤال في المطار", "\"business/tourism/visiting family\" = الأجوبة الثلاث الشائعة"], challenge: "اليوم: حضّر ٣ جمل تحتاجها في المطار." },
  { title: "ضياع الشنطة في المطار", icon: "🧳", dialogue: [{ speaker: "أنت", text: "Excuse me, my luggage hasn't arrived on the carousel." }, { speaker: "الموظف", text: "I'm sorry. Can I see your baggage claim ticket?" }, { speaker: "أنت", text: "Here it is. I was on flight SA102 from Riyadh." }, { speaker: "الموظف", text: "Let me check the system. Can you describe your bag?" }, { speaker: "أنت", text: "It's a large black suitcase with a red tag." }, { speaker: "الموظف", text: "We'll locate it and deliver it to your hotel." }, { speaker: "أنت", text: "How long will that take? I need my medication." }], keyPhrases: [{ en: "My luggage hasn't arrived.", ar: "شنطتي ما وصلت." }, { en: "It's a large black suitcase with a red tag.", ar: "شنطة سوداء كبيرة عليها تاق أحمر." }, { en: "I need my medication.", ar: "أحتاج أدويتي." }], producePrompt: "شنطتك ضاعت في المطار:", produceModel: "My luggage didn't arrive on the carousel. Here's my claim ticket. It's a large black suitcase. I need it urgently because it has my medication.", noticingTips: ["\"baggage claim\" = استلام الأمتعة", "وصف الشنطة بالتفصيل = يسرّع إيجادها", "ذكر السبب (medication) = يُعطي أولوية"], challenge: "اليوم: تعلّم كيف توصف شنطتك بالإنجليزي." },
  { title: "سؤال عن الاتجاهات", icon: "٢٠", dialogue: [{ speaker: "أنت", text: "Excuse me, could you tell me how to get to the museum?" }, { speaker: "شخص", text: "Sure! Go straight for two blocks, then turn left." }, { speaker: "أنت", text: "Is it far from here? Can I walk?" }, { speaker: "شخص", text: "About ten minutes on foot." }, { speaker: "أنت", text: "Is there a landmark I should look for?" }, { speaker: "شخص", text: "You'll see a big fountain. The museum is right behind it." }, { speaker: "أنت", text: "Thank you so much! That's very helpful." }], keyPhrases: [{ en: "Could you tell me how to get to the museum?", ar: "ممكن تدلني كيف أوصل المتحف؟" }, { en: "Is it far? Can I walk?", ar: "بعيد؟ أقدر أمشي؟" }, { en: "Is there a landmark I should look for?", ar: "في علامة مميزة أدوّر عليها؟" }], producePrompt: "تبي توصل مكان وسألت شخص:", produceModel: "Excuse me, could you tell me how to get to the nearest metro station? Is it walking distance?", noticingTips: ["\"How to get to\" = كيف أوصل — أفضل من \"Where is\"", "\"landmark\" = علامة مميزة — كلمة مفيدة جداً في السفر"], challenge: "اليوم: وصف طريق بيتك لمكان بالإنجليزي." },
  { title: "تأجير شقة أثناء السفر", icon: "🏡", dialogue: [{ speaker: "المضيف", text: "Welcome! I hope you had a good trip." }, { speaker: "أنت", text: "Thank you! The place looks even better than the photos." }, { speaker: "المضيف", text: "Here are the keys. Let me show you around." }, { speaker: "أنت", text: "Is there Wi-Fi? What's the password?" }, { speaker: "المضيف", text: "Yes, the password is on the fridge." }, { speaker: "أنت", text: "Where's the nearest grocery store?" }, { speaker: "المضيف", text: "Just five minutes walk. Turn right at the corner." }], keyPhrases: [{ en: "The place looks better than the photos.", ar: "المكان أحلى من الصور." }, { en: "What's the Wi-Fi password?", ar: "وش باسورد الواي فاي؟" }, { en: "Where's the nearest grocery store?", ar: "وين أقرب بقالة؟" }], producePrompt: "وصلت شقتك المؤجرة:", produceModel: "Thank you! This looks great. Could you show me how the heating works? And what's the Wi-Fi password?", noticingTips: ["\"looks better than the photos\" = مجاملة للمضيف", "\"How does X work?\" = سؤال عملي عن الأجهزة"], challenge: "اليوم: اقرأ وصف أي شقة على Airbnb بالإنجليزي." },
  { title: "في متحف أو معلم سياحي", icon: "🏛️", dialogue: [{ speaker: "أنت", text: "Two adult tickets, please." }, { speaker: "الموظف", text: "That's thirty dollars. Would you like an audio guide?" }, { speaker: "أنت", text: "Yes, please. Is it available in Arabic?" }, { speaker: "الموظف", text: "We have English, French, and Spanish." }, { speaker: "أنت", text: "English is fine. How long is the full tour?" }, { speaker: "الموظف", text: "About ninety minutes." }, { speaker: "أنت", text: "Is photography allowed inside?" }], keyPhrases: [{ en: "Two adult tickets, please.", ar: "تذكرتين للكبار." }, { en: "Is it available in Arabic?", ar: "متوفر بالعربي؟" }, { en: "Is photography allowed?", ar: "التصوير مسموح؟" }], producePrompt: "تبي تدخل متحف:", produceModel: "Two tickets, please. Do you have an audio guide? How long is the tour, and is photography allowed?", noticingTips: ["\"audio guide\" = دليل صوتي — مصطلح سياحي", "\"Is photography allowed\" = سؤال مهم في المتاحف"], challenge: "اليوم: اقرأ عن أي معلم سياحي بالإنجليزي." },
  { title: "حالة طوارئ طبية في السفر", icon: "🚑", dialogue: [{ speaker: "أنت", text: "I need help! My friend is feeling very dizzy." }, { speaker: "شخص", text: "Should I call an ambulance?" }, { speaker: "أنت", text: "Yes, please. He has a heart condition." }, { speaker: "المسعف", text: "What medication is he on?" }, { speaker: "أنت", text: "He takes blood pressure medication daily." }, { speaker: "المسعف", text: "We'll take him to the nearest hospital." }, { speaker: "أنت", text: "Can I ride with him? I have his insurance card." }], keyPhrases: [{ en: "He has a heart condition.", ar: "عنده مشكلة في القلب." }, { en: "He takes blood pressure medication.", ar: "يأخذ دواء ضغط." }, { en: "I have his insurance card.", ar: "معي بطاقة تأمينه." }], producePrompt: "صديقك تعب في السفر:", produceModel: "I need help urgently. My friend is very dizzy and has a heart condition. He takes blood pressure medication. Please call an ambulance.", noticingTips: ["\"heart condition\" = حالة قلبية — مصطلح طبي ضروري", "\"insurance card\" = بطاقة التأمين — لازم تعرفها", "ذكر الأدوية = ينقذ حياة"], challenge: "اليوم: اكتب معلوماتك الطبية بالإنجليزي واحفظها في جوالك." },

  // ========== BLOCK 6: COMPLEX & ADVANCED (Weeks 11-12) ==========
  { title: "التفاوض على سعر سيارة", icon: "🚘", dialogue: [{ speaker: "البائع", text: "This model starts at forty-five thousand." }, { speaker: "أنت", text: "That's above my budget. Is there any room for negotiation?" }, { speaker: "البائع", text: "What were you hoping to spend?" }, { speaker: "أنت", text: "I'd like to stay around forty thousand." }, { speaker: "البائع", text: "I could do forty-two with the extended warranty included." }, { speaker: "أنت", text: "If you include free maintenance for the first year, we have a deal." }, { speaker: "البائع", text: "Done. Let me prepare the paperwork." }], keyPhrases: [{ en: "Is there room for negotiation?", ar: "في مجال للتفاوض؟" }, { en: "I'd like to stay around forty thousand.", ar: "أبي أبقى حدود ٤٠ ألف." }, { en: "If you include X, we have a deal.", ar: "لو تضيف X، اتفقنا." }], producePrompt: "تتفاوض على سعر سيارة:", produceModel: "That's a bit above my budget. I was hoping to stay around forty thousand. If you include the warranty and first-year maintenance, we have a deal.", noticingTips: ["\"room for negotiation\" = مجال للتفاوض — تعبير أساسي", "\"If you include X, we have a deal\" = أقوى جملة تفاوض", "\"I'd like to stay around\" = تحديد ميزانية بأدب"], challenge: "اليوم: تفاوض على أي شيء بسيط — فكّر بالإنجليزي." },
  { title: "شرح مشكلة تقنية لغير تقني", icon: "🖥️", dialogue: [{ speaker: "الشخص", text: "Why isn't the app working on my phone?" }, { speaker: "أنت", text: "It looks like it needs an update. Let me check." }, { speaker: "الشخص", text: "I don't understand all these technical things." }, { speaker: "أنت", text: "No worries. Think of it like this: the app is an old map, and the update gives you a new one." }, { speaker: "الشخص", text: "Oh, that makes sense! How do I update it?" }, { speaker: "أنت", text: "Go to the App Store, search for it, and tap Update." }, { speaker: "الشخص", text: "Thank you for explaining it so clearly." }], keyPhrases: [{ en: "Think of it like this.", ar: "فكّر فيها كذا." }, { en: "The app needs an update.", ar: "التطبيق يحتاج تحديث." }, { en: "Thank you for explaining so clearly.", ar: "شكراً على الشرح الواضح." }], producePrompt: "اشرح مشكلة تقنية لشخص عادي:", produceModel: "The app needs an update. Think of it like this: your current version is like an old map — the update gives you a better one with new features.", noticingTips: ["\"Think of it like this\" = بداية ممتازة لتبسيط أي شيء", "التشبيه (like an old map) = أقوى أداة شرح", "\"No worries\" = يهدّئ الشخص المتوتر"], challenge: "اليوم: اشرح شيء تقني لأي شخص ببساطة." },
  { title: "قيادة نقاش جماعي", icon: "P", dialogue: [{ speaker: "أنت", text: "I'd like to hear everyone's thoughts on this." }, { speaker: "شخص ١", text: "I think we should go with option A." }, { speaker: "شخص ٢", text: "I prefer option B. It's less risky." }, { speaker: "أنت", text: "Both have valid points. Let me summarize the pros and cons." }, { speaker: "أنت", text: "Option A is faster but riskier. Option B is safer but slower." }, { speaker: "شخص ١", text: "When you put it that way, maybe we need a middle ground." }, { speaker: "أنت", text: "Exactly. What if we start with B and transition to A in phase two?" }], keyPhrases: [{ en: "I'd like to hear everyone's thoughts.", ar: "أبي أسمع رأي الكل." }, { en: "Let me summarize the pros and cons.", ar: "خلني ألخّص المزايا والعيوب." }, { en: "What if we start with B and transition to A?", ar: "وش رأيكم نبدأ بـ B وننتقل لـ A؟" }], producePrompt: "أنت تقود نقاش بين فريقين:", produceModel: "I'd like to hear from both sides. Let me summarize: option A is faster but riskier, option B is safer but slower. What if we combine the best of both?", noticingTips: ["\"I'd like to hear everyone's thoughts\" = يُشرك الكل باحترام", "\"pros and cons\" = مزايا وعيوب — مصطلح أساسي", "\"What if we\" = اقتراح حل وسط — دبلوماسي"], challenge: "اليوم: لو في نقاش عائلي — فكّر كيف تديره بالإنجليزي." },
  { title: "شرح ثقافتك لأجنبي", icon: "🕌", dialogue: [{ speaker: "الأجنبي", text: "I noticed people stop everything for prayer. Can you explain?" }, { speaker: "أنت", text: "Of course! Muslims pray five times a day. It's a core part of our faith." }, { speaker: "الأجنبي", text: "That's interesting. Does everything close?" }, { speaker: "أنت", text: "Most shops close briefly, but they reopen after about twenty minutes." }, { speaker: "الأجنبي", text: "I'd love to learn more about your culture." }, { speaker: "أنت", text: "I'd be happy to share. Would you like to try Arabic coffee?" }, { speaker: "الأجنبي", text: "I'd love that! Thank you for being so welcoming." }], keyPhrases: [{ en: "Muslims pray five times a day.", ar: "المسلمين يصلون ٥ مرات باليوم." }, { en: "It's a core part of our faith.", ar: "جزء أساسي من ديننا." }, { en: "I'd be happy to share more.", ar: "يسعدني أشاركك أكثر." }], producePrompt: "أجنبي يسأل عن ثقافتك:", produceModel: "Muslims pray five times a day — it's a core part of our faith and daily routine. Most shops close briefly for prayer but reopen quickly. Would you like to try Arabic coffee? It's part of our hospitality tradition.", noticingTips: ["\"a core part of\" = جزء أساسي من — شرح محترم", "\"I'd be happy to share\" = انفتاح وكرم", "ربط الشرح بتجربة (Arabic coffee) = يجعله حي"], challenge: "اليوم: اشرح عادة سعودية بالإنجليزي لنفسك." },
  { title: "إقناع شخص بفكرتك", icon: "", dialogue: [{ speaker: "أنت", text: "I have a proposal that I think could benefit both of us." }, { speaker: "الشخص", text: "I'm listening. Go ahead." }, { speaker: "أنت", text: "What if we combined our resources to launch a joint project?" }, { speaker: "الشخص", text: "Interesting, but what's in it for me?" }, { speaker: "أنت", text: "You'd get access to our market, and we'd benefit from your technology." }, { speaker: "الشخص", text: "That does sound like a win-win." }, { speaker: "أنت", text: "Exactly. Shall I put together a formal proposal?" }], keyPhrases: [{ en: "I have a proposal that could benefit both of us.", ar: "عندي اقتراح يفيدنا الاثنين." }, { en: "What's in it for me?", ar: "وش الفايدة لي؟" }, { en: "It's a win-win.", ar: "الطرفين يستفيدون." }], producePrompt: "تبي تقنع شخص بشراكة:", produceModel: "I have a proposal that could benefit both of us. You'd get access to our market, and we'd leverage your technology. It's a true win-win.", noticingTips: ["\"benefit both of us\" = يفيد الطرفين — أساسي في الإقناع", "\"What's in it for me?\" = سؤال تفاوضي لازم تتوقعه", "\"win-win\" = كسب مشترك — أقوى كلمة في الشراكات"], challenge: "اليوم: فكّر بفكرة تبي تقنع فيها أحد — جهّزها بالإنجليزي." },
  { title: "حل سوء تفاهم ثقافي", icon: "٣١", dialogue: [{ speaker: "الزميل", text: "I felt a bit uncomfortable when you didn't shake my hand yesterday." }, { speaker: "أنت", text: "I'm sorry if that came across as rude. It wasn't intentional." }, { speaker: "الزميل", text: "I was just confused." }, { speaker: "أنت", text: "In my culture, some people prefer not to shake hands with the opposite gender. It's a sign of respect, not disrespect." }, { speaker: "الزميل", text: "I had no idea! Thank you for explaining." }, { speaker: "أنت", text: "I appreciate your openness. Please feel free to ask about anything." }, { speaker: "الزميل", text: "I really respect that. Thanks for being so open." }], keyPhrases: [{ en: "It wasn't intentional.", ar: "ما كان مقصود." }, { en: "It's a sign of respect, not disrespect.", ar: "هذا احترام مو العكس." }, { en: "I appreciate your openness.", ar: "أقدّر انفتاحك." }], producePrompt: "سوء تفاهم ثقافي. وضّح:", produceModel: "I'm sorry if that was confusing. In my culture, it's actually a sign of respect. I appreciate you asking — please feel free to ask about anything.", noticingTips: ["\"It wasn't intentional\" = ما كان مقصود — يوضّح النية", "\"a sign of respect\" = يحوّل السلبي لإيجابي", "\"I appreciate your openness\" = يبني جسر ثقافي"], challenge: "اليوم: فكّر بموقف ثقافي — كيف تشرحه بالإنجليزي؟" },
  { title: "خطاب في مناسبة عائلية", icon: "١٧", dialogue: [{ speaker: "أنت", text: "Good evening everyone. Thank you all for being here tonight." }, { speaker: "أنت", text: "We're gathered to celebrate a very special occasion." }, { speaker: "أنت", text: "I want to say a few words about the person we're honoring." }, { speaker: "أنت", text: "He's not just my father. He's my role model and my best friend." }, { speaker: "أنت", text: "Everything I've achieved, I owe to his guidance and support." }, { speaker: "أنت", text: "Please join me in raising a glass to the best father in the world." }, { speaker: "الجمهور", text: "Cheers!" }], keyPhrases: [{ en: "Thank you all for being here tonight.", ar: "شكراً لحضوركم الليلة." }, { en: "He's my role model and best friend.", ar: "هو قدوتي وصديقي." }, { en: "Everything I've achieved, I owe to him.", ar: "كل شيء حققته بفضله." }], producePrompt: "تلقي كلمة في مناسبة:", produceModel: "Good evening everyone. Thank you for being here. I want to say a few words about someone very special. He taught me everything I know, and I owe him more than words can express.", noticingTips: ["\"We're gathered to celebrate\" = فتح خطاب رسمي", "\"I owe to his guidance\" = أدين لتوجيهه — تعبير تقدير عميق", "\"raise a glass\" = نرفع الكأس — ختام تقليدي"], challenge: "اليوم: حضّر كلمة شكر من 5 جمل وقلها بصوت عالٍ." },

];


// FIX 8: Cross-context phrase patterns — same phrase structure reused across scenarios
// When user encounters "I'd like..." in restaurant, remind them they also used it in hotel, airport, etc.
// This builds GENERALIZED neural pathways instead of context-specific ones.
const PHRASE_PATTERNS = {
  "I'd like": { pattern: "I'd like...", usage: "طلب مهذب — يعمل في أي مكان: مطعم، فندق، مطار، بنك", scenarios: ["المطعم", "الفندق", "المطار", "البنك", "الصيدلية"] },
  "Could you": { pattern: "Could you...?", usage: "طلب مهذب بصيغة سؤال — يعمل مع أي شخص", scenarios: ["المطعم", "الفندق", "خدمة العملاء", "الاتجاهات", "التاكسي"] },
  "Is there": { pattern: "Is there...?", usage: "سؤال عن التوفر — فنادق، مطاعم، محلات", scenarios: ["الفندق", "النادي", "السوبرماركت"] },
  "How long": { pattern: "How long...?", usage: "سؤال عن المدة — يعمل في كل مكان", scenarios: ["الطبيب", "البريد", "التحويلات", "استئجار سيارة"] },
  "Thank you for": { pattern: "Thank you for...", usage: "شكر محدد — أقوى بكثير من thank you لوحدها", scenarios: ["الطبيب", "الفندق", "المدرسة", "العمل"] },
};
function findCrossPatterns(phrase) {
  const results = [];
  for (const [key, val] of Object.entries(PHRASE_PATTERNS)) {
    if (phrase.toLowerCase().includes(key.toLowerCase())) results.push(val);
  }
  return results;
}

const DK = "eng-v10";
const gtd = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const gdn = () => { const d = new Date(); return d.getDate() + d.getMonth() * 31 + d.getFullYear(); };
const gdow = () => new Date().getDay();
const getWk = (s) => { const x = Math.floor((new Date(gtd()) - new Date(s)) / 864e5); return x < 0 ? 0 : Math.min(Math.floor(x / 7) + 1, 12); };
const getPh = (w) => w <= 4 ? { n: 1, nm: "بناء الأساس", c: "#1d4ed8", gap: "var(--sp-2)" } : w <= 8 ? { n: 2, nm: "التسريع", c: "#1d4ed8", gap: "var(--sp-1)" } : { n: 3, nm: "الإطلاق", c: "#1d4ed8", gap: "var(--sp-1)" };
function shuffle(arr, seed) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (seed * (i + 1) * 9301 + 49297) % 233280; const k = Math.floor((j / 233280) * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; }
function shuffleOpts(opts, correctIndex, seed) {
  const correct = opts[correctIndex];
  const indices = opts.map((_, i) => i);
  const shuffled = shuffle(indices, seed);
  return { opts: shuffled.map(i => opts[i]), correctIndex: shuffled.indexOf(correctIndex) };
}

function Prompter({ lines, gap, color, label, withAudio }) {
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(0);
  const [phase, setPhase] = useState("listen"); // "listen" or "repeat"
  const ref = useRef(null);
  const iRef = useRef(0);

  function stop() { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); iRef.current = 0; setPhase("listen"); stopSpeech(); }
  function start() {
    stop(); setOn(true); iRef.current = 0;
    // Play audio first, then start countdown for repeating
    if (withAudio && window.speechSynthesis) {
      setPhase("listen");
      const u = speak(lines[0], 0.8);
      if (u) {
        u.onend = () => { setPhase("repeat"); setSec(gap); startCountdown(); };
      } else { setPhase("repeat"); setSec(gap); startCountdown(); }
    } else { setPhase("repeat"); setSec(gap); startCountdown(); }
  }
  function startCountdown() {
    let c = gap;
    ref.current = setInterval(() => {
      c--;
      if (c <= 0) {
        iRef.current++;
        if (iRef.current >= lines.length) { clearInterval(ref.current); setOn(false); setIdx(0); setSec(0); setPhase("listen"); return; }
        setIdx(iRef.current);
        // Play next line audio
        if (withAudio && window.speechSynthesis) {
          setPhase("listen");
          clearInterval(ref.current);
          const u2 = speak(lines[iRef.current], 0.8);
          if (u2) { u2.onend = () => { setPhase("repeat"); c = gap; setSec(gap); startCountdown(); }; }
          else { setPhase("repeat"); c = gap; setSec(gap); startCountdown(); }
          return;
        }
        c = gap;
      }
      setSec(c);
    }, 1000);
  }
  useEffect(() => () => { clearInterval(ref.current); stopSpeech(); }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", alignItems: "center" }}>
        {!on ? (
          <button onClick={start} style={{ padding: "8px 20px", borderRadius: "var(--r-md)", border: "none", background: "linear-gradient(135deg," + color + ",#1e40af)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>{"▶ ابدأ " + label}</button>
        ) : (
          <button onClick={stop} className="btn btn--secondary btn--sm">إيقاف</button>
        )}
        {on && phase === "listen" && <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent)", fontWeight: 600 }}>استمع...</div>}
        {on && phase === "repeat" && sec > 0 && <div style={{ fontFamily: "inherit", fontSize: "var(--fs-xl)", fontWeight: 700, color: color }}>{sec}</div>}
        {on && phase === "repeat" && sec > 0 && <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>ردّد بصوت عالٍ!</div>}
      </div>
      {lines.map((line, i) => {
        const cur = on && i === idx;
        const past = on && i < idx;
        return (
          <div key={i} className={"shadow-line" + (cur ? " shadow-line--current" : past ? " shadow-line--past" : "")}>
            <div style={{ flex: 1 }}>{line}</div>
            <SpeakBtn text={line} size={cur ? 18 : 14} color={cur ? color : "#71717a"} />
            {cur && phase === "repeat" && <span style={{ fontSize: "var(--fs-xs)", color: color, flexShrink: 0 }}>← ردّد!</span>}
            {cur && phase === "listen" && <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", flexShrink: 0 }}>← استمع</span>}
          </div>
        );
      })}
    </div>
  );
}

function MeetingSim() {
  const [mi, setMi] = useState(0);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const m = CONVERSATIONS[mi];
  const raw = m.steps[step];
  const { opts: sOpts, correctIndex: sAns } = shuffleOpts(raw.opts, raw.ans, mi * 1000 + step * 7 + 31);
  const s = { ...raw, opts: sOpts, ans: sAns };
  function pick(oi) { setPicked(oi); if (oi === s.ans) setScore(score + 1); }
  function next() { if (step + 1 >= m.steps.length) { setDone(true); return; } setStep(step + 1); setPicked(null); }
  function restart() { setMi((mi + 1) % CONVERSATIONS.length); setStep(0); setPicked(null); setScore(0); setDone(false); }
  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-success)" }}>إنجاز</div>
      <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>{score}/{m.steps.length}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score === m.steps.length ? "إنجاز مميز! أدرت المحادثة باحترافية كاملة" : score >= 3 ? "جيد! تقدم واضح" : "تحتاج تمرين أكثر على الجمل — راجعها في تبويب الجمل"}</div>
      <button onClick={restart} className="btn btn--primary btn--sm">محادثة جديدة</button>
    </div>
  );
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-accent)" }}>{m.title}</div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"خطوة " + (step + 1) + "/" + m.steps.length}</div>
      </div>
      <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", marginBottom: "var(--sp-1)" }}>{": " + s.speaker + ":"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}><div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "var(--c-text)", flex: 1 }}>{s.text}</div><SpeakBtn text={s.text} size={18} /></div>
      </div>
      <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>{" " + s.prompt + " — اختر الرد الأنسب واقرأه بصوت عالٍ:"}</div>
      {s.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === s.ans;
        const isPicked = picked === oi;
        let bg = "rgba(0,0,0,0.02)", brd = "rgba(0,0,0,0.03)";
        if (show && isCorrect) { bg = "rgba(5,150,105,0.1)"; brd = "rgba(5,150,105,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(217,119,6,0.1)"; brd = "rgba(217,119,6,0.3)"; }
        return (
          <div key={oi} onClick={() => picked === null && pick(oi)} style={{ padding: "var(--sp-3)", borderRadius: "var(--r-md)", marginBottom: "var(--sp-2)", cursor: picked === null ? "pointer" : "default", fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", lineHeight: 1.6, background: bg, border: "1px solid " + brd, transition: ".3s", opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
            {o}
            {show && isCorrect && <span style={{ marginRight: 8, fontSize: "var(--fs-xs)", color: "var(--c-success)" }}> ✓ صحيح — اقرأها بصوت عالٍ!</span>}
            {show && isPicked && !isCorrect && <span style={{ marginRight: 8, fontSize: "var(--fs-xs)", color: "var(--c-error)" }}> ✗</span>}
          </div>
        );
      })}
      {picked !== null && <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}><button onClick={next} className="btn btn--primary btn--sm">{step + 1 >= m.steps.length ? "🏁 النتيجة" : "التالي ←"}</button></div>}
    </div>
  );
}

function QuickResp() {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const tRef = useRef(null);
  const qs = useRef(shuffle(QUICK_RESP, gdn()).slice(0, 8));
  function startTimer() { setTimer(10); clearInterval(tRef.current); tRef.current = setInterval(() => setTimer(p => { if (p <= 1) { clearInterval(tRef.current); return 0; } return p - 1; }), 1000); }
  function pick(oi) { clearInterval(tRef.current); setPicked(oi); const { correctIndex } = shuffleOpts(qs.current[qi].opts, qs.current[qi].ans, qi * 13 + 47); if (oi === correctIndex) setScore(score + 1); setTotal(total + 1); }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setPicked(null); startTimer(); }
  function restart() { qs.current = shuffle(QUICK_RESP, Date.now()); setQi(0); setPicked(null); setScore(0); setTotal(0); setDone(false); startTimer(); }
  useEffect(() => { startTimer(); return () => clearInterval(tRef.current); }, []);
  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-3)" }}></div>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>{score}/{total}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score >= 7 ? "سريع وحاسم! " : score >= 5 ? "جيد! السرعة تتحسن" : "تحتاج تحفظ الجمل أكثر"}</div>
      <button onClick={restart} className="btn btn--primary btn--sm">محاولة جديدة</button>
    </div>
  );
  const rawQ = qs.current[qi];
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(rawQ.opts, rawQ.ans, qi * 13 + 47);
  const q = { ...rawQ, opts: qOpts, ans: qAns };
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-md)", fontWeight: 700, color: timer <= 3 ? "#dc2626" : "#1d4ed8" }}>{timer > 0 && picked === null ? timer + "s" : ""}</div>
      </div>
      <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)", lineHeight: 1.8 }}>{" " + q.sit}</div>
      </div>
      {q.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === q.ans;
        const isPicked = picked === oi;
        let bg = "rgba(0,0,0,0.02)", brd = "rgba(0,0,0,0.03)";
        if (show && isCorrect) { bg = "rgba(5,150,105,0.1)"; brd = "rgba(5,150,105,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(217,119,6,0.1)"; brd = "rgba(217,119,6,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} className={"option-item" + (show && isCorrect ? " option-item--correct" : show && isPicked ? " option-item--wrong" : "") + (show && !isCorrect && !isPicked ? " option-item--dim" : "") + (isPicked ? " option-item--picked" : "")} style={{ cursor: show ? "default" : "pointer" }}>
          {o}{show && isCorrect && <span style={{ color: "var(--c-success)", fontSize: "var(--fs-xs)" }}> ✓ اقرأها!</span>}
        </div>;
      })}
      {(picked !== null || timer === 0) && <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}>
        {timer === 0 && picked === null && <div style={{ color: "var(--c-error)", fontSize: "var(--fs-sm)", marginBottom: "var(--sp-2)" }}>⏰ انتهى الوقت!</div>}
        <button onClick={() => { if (timer === 0 && picked === null) { setTotal(total + 1); } next(); }} className="btn btn--primary btn--sm">التالي ←</button>
      </div>}
    </div>
  );
}

function WeeklyQuiz({ onSave, checkpoint }) {
  const cp = checkpoint || {};
  const [qi, setQi] = useState(cp.qi || 0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(cp.score || 0);
  const [done, setDone] = useState(false);
  const [prevPct, setPrevPct] = useState(null);
  const qs = useRef(cp.questions || shuffle(QUIZ_BANK, gdn()).slice(0, 10));
  const saved = useRef(false);
  function pick(oi) { setPicked(oi); const { correctIndex } = shuffleOpts(qs.current[qi].opts, qs.current[qi].ans, qi * 17 + 59); if (oi === correctIndex) setScore(score + 1); }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setPicked(null); }
  // Checkpoint: save quiz progress on each question change
  useEffect(() => {
    if (done) return;
    const cpData = { type: "quiz", qi, score, questions: qs.current, date: gtd() };
    (async () => { try { await userStorage.set("checkpoint-quiz", JSON.stringify(cpData)); } catch(e) {} })();
  }, [qi, score, done]);
  function restart() { qs.current = shuffle(QUIZ_BANK, Date.now()); setQi(0); setPicked(null); setScore(0); setDone(false); saved.current = false; setPrevPct(null); (async () => { try { await userStorage.delete("checkpoint-quiz"); } catch(e) {} })(); }
  useEffect(() => {
    if (done && !saved.current) {
      saved.current = true;
      const pct = Math.round((score / qs.current.length) * 100);
      (async () => {
        try {
          const r = await userStorage.get("quiz-results");
          const results = r && r.value ? JSON.parse(r.value) : [];
          if (results.length > 0) setPrevPct(results[results.length - 1].pct);
          results.push({ date: gtd(), pct, score, total: qs.current.length });
          await userStorage.set("quiz-results", JSON.stringify(results));
          await userStorage.delete("checkpoint-quiz"); // clear checkpoint on completion
          if (onSave) onSave();
        } catch (e) {}
      })();
    }
  }, [done, score, onSave]);
  if (done) {
    const pct = Math.round((score / qs.current.length) * 100);
    const diff = prevPct !== null ? pct - prevPct : null;
    return (
      <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
        <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>التقييم</div>
        <div style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: pct >= 80 ? "#059669" : pct >= 50 ? "#1d4ed8" : "#dc2626", marginBottom: "var(--sp-1)" }}>{pct + "%"}</div>
        <div style={{ fontSize: "var(--fs-md)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-1)" }}>{score + "/" + qs.current.length}</div>
        {diff !== null && <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: diff >= 0 ? "#059669" : "#dc2626", marginBottom: "var(--sp-1)" }}>{diff >= 0 ? "+" + diff + "% عن الاختبار السابق" : "" + diff + "% عن الاختبار السابق"}</div>}
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{pct >= 80 ? "إنجاز مميز! الجمل صارت جزء منك " : pct >= 50 ? "جيد! استمر في مراجعة الجمل يومياً" : "ركّز أكثر على بنك الجمل — راجعها يومياً"}</div>
        <button onClick={restart} className="btn btn--primary btn--sm">اختبار جديد</button>
      </div>
    );
  }
  const rawQz = qs.current[qi];
  const { opts: qzOpts, correctIndex: qzAns } = shuffleOpts(rawQz.opts, rawQz.ans, qi * 17 + 59);
  const q = { ...rawQz, opts: qzOpts, ans: qzAns };
  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (qi + 1) + "/10"}</div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)", lineHeight: 1.8 }}>{q.q}</div>
      </div>
      {q.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === q.ans;
        const isPicked = picked === oi;
        let bg = "rgba(0,0,0,0.02)", brd = "rgba(0,0,0,0.03)";
        if (show && isCorrect) { bg = "rgba(5,150,105,0.1)"; brd = "rgba(5,150,105,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(217,119,6,0.1)"; brd = "rgba(217,119,6,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} className={"option-item" + (show && isCorrect ? " option-item--correct" : show && isPicked ? " option-item--wrong" : "") + (show && !isCorrect && !isPicked ? " option-item--dim" : "") + (isPicked ? " option-item--picked" : "")} style={{ cursor: show ? "default" : "pointer" }}>
          {o}{show && isCorrect && <span style={{ color: "var(--c-success)", fontSize: "var(--fs-xs)" }}> </span>}
        </div>;
      })}
      {picked !== null && <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}><button onClick={next} className="btn btn--primary btn--sm">{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button></div>}
    </div>
  );
}

const FILL_BLANKS = [
  { full: "Excuse me, could you tell me how to get there?", blanks: ["Excuse", "tell"] },
  { full: "I'd like to make an appointment, please.", blanks: ["appointment", "please"] },
  { full: "Could you speak a bit more slowly?", blanks: ["speak", "slowly"] },
  { full: "Nice to meet you. Where are you from?", blanks: ["Nice", "from"] },
  { full: "Sorry, I didn't catch that. Could you repeat?", blanks: ["catch", "repeat"] },
  { full: "I really appreciate your help with this.", blanks: ["appreciate", "help"] },
  { full: "Is it possible to reschedule to next week?", blanks: ["possible", "reschedule"] },
  { full: "What do you recommend from the menu?", blanks: ["recommend", "menu"] },
  { full: "I've been having this problem for three days.", blanks: ["having", "problem"] },
  { full: "That sounds great. I'll take it.", blanks: ["sounds", "take"] },
  { full: "How often should I take this medication?", blanks: ["often", "medication"] },
  { full: "Thank you for your patience with this.", blanks: ["patience", "this"] },
  { full: "I see it differently. From my perspective...", blanks: ["differently", "perspective"] },
  { full: "Would it be possible to get a refund?", blanks: ["possible", "refund"] },
  { full: "I'll review the details and get back to you.", blanks: ["review", "details"] },
];

function FillBlank() {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = useRef(shuffle(FILL_BLANKS, gdn()).slice(0, 8));

  function getSentenceWithBlanks(item) {
    let sentence = item.full;
    const parts = [];
    let remaining = sentence;
    item.blanks.forEach((blank, bi) => {
      const idx = remaining.toLowerCase().indexOf(blank.toLowerCase());
      if (idx >= 0) {
        parts.push({ type: "text", value: remaining.slice(0, idx) });
        parts.push({ type: "blank", index: bi, word: blank });
        remaining = remaining.slice(idx + blank.length);
      }
    });
    if (remaining) parts.push({ type: "text", value: remaining });
    return parts;
  }

  function check() {
    setChecked(true);
    const item = qs.current[qi];
    let correct = 0;
    item.blanks.forEach((blank, bi) => {
      if ((answers[bi] || "").trim().toLowerCase() === blank.toLowerCase()) correct++;
    });
    if (correct === item.blanks.length) setScore(score + 1);
  }

  function next() {
    if (qi + 1 >= qs.current.length) { setDone(true); return; }
    setQi(qi + 1); setAnswers({}); setChecked(false);
  }

  function restart() { qs.current = shuffle(FILL_BLANKS, Date.now()); setQi(0); setAnswers({}); setChecked(false); setScore(0); setDone(false); }

  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>أكمل الفراغ</div>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: score >= 6 ? "#059669" : score >= 4 ? "#1d4ed8" : "#dc2626", marginBottom: "var(--sp-2)" }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score >= 6 ? "إنجاز مميز! ذاكرتك قوية " : score >= 4 ? "جيد! استمر في المراجعة" : "راجع الجمل أكثر"}</div>
      <button onClick={restart} className="btn btn--primary btn--sm">محاولة جديدة</button>
    </div>
  );

  const item = qs.current[qi];
  const parts = getSentenceWithBlanks(item);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent-hover)", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 2.2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--sp-1)" }}>
          {parts.map((p, pi) => p.type === "text" ? (
            <span key={pi} style={{ color: "var(--c-text)" }}>{p.value}</span>
          ) : (
            <span key={pi} style={{ display: "inline-block" }}>
              <input
                type="text"
                value={answers[p.index] || ""}
                onChange={(e) => !checked && setAnswers({ ...answers, [p.index]: e.target.value })}
                style={{
                  width: Math.max(p.word.length * 11, 60),
                  padding: "4px 8px", borderRadius: "var(--r-sm)", fontSize: "var(--fs-sm)",
                  fontFamily: "inherit", textAlign: "center",
                  background: checked ? ((answers[p.index] || "").trim().toLowerCase() === p.word.toLowerCase() ? "rgba(5,150,105,0.15)" : "rgba(220,38,38,0.15)") : "rgba(0,0,0,0.05)",
                  border: "1px solid " + (checked ? ((answers[p.index] || "").trim().toLowerCase() === p.word.toLowerCase() ? "rgba(5,150,105,0.4)" : "rgba(220,38,38,0.4)") : "rgba(29,78,216,0.3)"),
                  color: "#fff", outline: "none"
                }}
                placeholder="..."
                disabled={checked}
              />
              {checked && (answers[p.index] || "").trim().toLowerCase() !== p.word.toLowerCase() && (
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", textAlign: "center" }}>{p.word}</div>
              )}
            </span>
          ))}
        </div>
      </div>
      {!checked ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={check} className="btn btn--primary btn--sm">تأكّد</button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <button onClick={next} className="btn btn--primary btn--sm">{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        </div>
      )}
    </div>
  );
}

const SENTENCE_BUILD = [
  "Nice to meet you. Where are you from?",
  "Could you speak more slowly please?",
  "I would like a table for two.",
  "How do I get to the nearest station?",
  "I have a reservation under my name.",
  "Is it possible to get a refund?",
  "Thank you for your help with this.",
  "I really appreciate your patience.",
  "What time does the store close today?",
  "I need to reschedule my appointment.",
  "The food was excellent. Thank you.",
  "Could you recommend something from the menu?",
  "I see it differently from my perspective.",
  "I have been living here for five years.",
  "Let me think about it and get back.",
];

function SentenceBuild() {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = useRef(shuffle(SENTENCE_BUILD, gdn()).slice(0, 8));

  function getWords(sentence) {
    return sentence.replace(/[.,!?]/g, "").split(" ").filter(Boolean);
  }

  const words = getWords(qs.current[qi]);
  const shuffledWords = useRef(shuffle(words, qi * 31 + 11));

  useEffect(() => {
    shuffledWords.current = shuffle(getWords(qs.current[qi]), qi * 31 + 11);
  }, [qi]);

  function toggleWord(wi) {
    if (checked) return;
    if (selected.includes(wi)) {
      setSelected(selected.filter(i => i !== wi));
    } else {
      setSelected([...selected, wi]);
    }
  }

  function check() {
    setChecked(true);
    const builtSentence = selected.map(i => shuffledWords.current[i]).join(" ").toLowerCase();
    const correctSentence = words.join(" ").toLowerCase();
    if (builtSentence === correctSentence) setScore(score + 1);
  }

  function next() {
    if (qi + 1 >= qs.current.length) { setDone(true); return; }
    setQi(qi + 1); setSelected([]); setChecked(false);
  }

  function restart() {
    qs.current = shuffle(SENTENCE_BUILD, Date.now());
    setQi(0); setSelected([]); setChecked(false); setScore(0); setDone(false);
  }

  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>بناء جمل</div>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: score >= 6 ? "#059669" : score >= 4 ? "#1d4ed8" : "#dc2626", marginBottom: "var(--sp-2)" }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score >= 6 ? "إنجاز مميز! تركيب الجمل صار سهل " : score >= 4 ? "جيد! تحسن واضح" : "تمرّن أكثر على ترتيب الكلمات"}</div>
      <button onClick={restart} className="btn btn--success btn--sm">محاولة جديدة</button>
    </div>
  );

  const builtSentence = selected.map(i => shuffledWords.current[i]).join(" ").toLowerCase();
  const correctSentence = words.join(" ").toLowerCase();
  const isCorrect = checked && builtSentence === correctSentence;

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>
      <div style={{ background: "rgba(77,181,165,0.06)", border: "1px solid rgba(77,181,165,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)", minHeight: 50 }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>الجملة المُركّبة:</div>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: checked ? (isCorrect ? "#059669" : "#dc2626") : "#18181b", minHeight: 24 }}>
          {selected.length > 0 ? selected.map(i => shuffledWords.current[i]).join(" ") : <span style={{ color: "var(--c-text-tertiary)" }}>اضغط على الكلمات بالترتيب الصحيح...</span>}
        </div>
        {checked && !isCorrect && <div style={{ fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "var(--c-success)", marginTop: "var(--sp-2)" }}>{"✓ " + qs.current[qi]}</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
        {shuffledWords.current.map((w, wi) => {
          const isSelected = selected.includes(wi);
          return (
            <button key={wi} onClick={() => toggleWord(wi)} style={{
              padding: "8px 14px", borderRadius: "var(--r-sm)",
              fontFamily: "inherit", fontSize: "var(--fs-sm)",
              border: "1px solid " + (isSelected ? "rgba(77,181,165,0.4)" : "rgba(0,0,0,0.06)"),
              background: isSelected ? "rgba(77,181,165,0.15)" : "rgba(0,0,0,0.02)",
              color: isSelected ? "#059669" : "#18181b",
              cursor: checked ? "default" : "pointer",
              opacity: isSelected ? 0.5 : 1,
              transition: ".2s"
            }}>{w}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "var(--sp-2)", justifyContent: "center" }}>
        {!checked && selected.length > 0 && <button onClick={() => setSelected([])} className="btn btn--ghost btn--sm">مسح</button>}
        {!checked ? (
          <button onClick={check} disabled={selected.length === 0} style={{ padding: "8px 20px", borderRadius: "var(--r-md)", border: "none", background: selected.length > 0 ? "#059669" : "#e4e4e7", color: selected.length > 0 ? "#fafaf9" : "#a1a1aa", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "default" }}>تأكّد</button>
        ) : (
          <button onClick={next} className="btn btn--success btn--sm">{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        )}
      </div>
    </div>
  );
}

// ===== FREE RECALL PRODUCTION EXERCISE =====
const RECALL_SCENARIOS = [
  { sit: "وصلت فندق وتبي تسوي check-in", hint: "أكّد حجزك وسأل عن الخدمات", model: "I have a reservation under the name Al-Rashid. Is breakfast included?", keywords: ["reservation", "name", "breakfast"] },
  { sit: "في المطعم والنادل يسألك عن طلبك", hint: "اطلب بوضوح وسأل عن التوصيات", model: "I'll have the grilled chicken, please. What do you recommend for dessert?", keywords: ["have", "please", "recommend"] },
  { sit: "تحس بصداع من ٣ أيام وأنت عند الدكتور", hint: "اشرح أعراضك بالتفصيل", model: "I've been having a persistent headache for three days, along with some fatigue.", keywords: ["headache", "days", "fatigue"] },
  { sit: "شخص يتكلم بسرعة وما فهمت عليه", hint: "اطلب منه يبطّئ بأدب", model: "Sorry, could you speak a bit more slowly? I want to make sure I understand.", keywords: ["speak", "slowly", "understand"] },
  { sit: "اشتريت منتج وطلع معيب وتبي تشتكي", hint: "اشرح المشكلة واطلب حل", model: "I purchased this last week and it's not working properly. Is it possible to get a replacement?", keywords: ["purchased", "working", "replacement"] },
  { sit: "معلم ولدك يسألك تساعده في القراءة بالبيت", hint: "وافق واسأل عن التفاصيل", model: "That makes sense. What if we start with fifteen minutes of reading together every evening?", keywords: ["start", "minutes", "reading"] },
  { sit: "جارك الجديد يسلّم عليك وتبي تتعرف عليه", hint: "عرّف نفسك ورحّب فيه", model: "Nice to meet you! I'm Omar. Welcome to the neighborhood. Let me know if you need anything.", keywords: ["nice", "meet", "welcome"] },
  { sit: "تبي تعبّر عن رأيك المختلف بأدب في نقاش", hint: "اعترض بدبلوماسية", model: "I see it differently. From my perspective, I think there's another way to look at it.", keywords: ["differently", "perspective", "another"] },
];

function FreeRecall() {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [matchedWords, setMatchedWords] = useState([]);
  const qs = useRef(shuffle(RECALL_SCENARIOS, gdn()).slice(0, 6));

  function submit() {
    setSubmitted(true);
    const words = input.toLowerCase().split(/\s+/);
    const scenario = qs.current[qi];
    const matched = scenario.keywords.filter(kw => words.some(w => w.includes(kw.toLowerCase())));
    setMatchedWords(matched);
    // Score: any reasonable English response with key words
    if (input.trim().split(/\s+/).length >= 4 && matched.length >= 1) {
      setScore(score + 1);
    }
  }

  function next() {
    if (qi + 1 >= qs.current.length) { setDone(true); return; }
    setQi(qi + 1); setInput(""); setSubmitted(false); setMatchedWords([]);
  }

  function restart() {
    qs.current = shuffle(RECALL_SCENARIOS, Date.now()); setQi(0); setInput(""); setSubmitted(false); setScore(0); setDone(false); setMatchedWords([]);
  }

  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>إنتاج حر</div>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: score >= 4 ? "#059669" : score >= 2 ? "#1d4ed8" : "#dc2626", marginBottom: "var(--sp-2)" }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score >= 4 ? "إنجاز مميز! تقدر تنتج جمل من ذاكرتك" : score >= 2 ? "جيد! استمر بمراجعة الجمل الجاهزة" : "راجع بنك الجمل — حاول تكتبها من الذاكرة"}</div>
      <button onClick={restart} className="btn btn--danger btn--sm">محاولة جديدة</button>
    </div>
  );

  const scenario = qs.current[qi];

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>{"موقف " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-error)", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-base)", color: "var(--c-text)", lineHeight: 2, marginBottom: "var(--sp-2)" }}>{scenario.sit}</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-error)", fontWeight: 600 }}>{scenario.hint}</div>
      </div>

      <div style={{ marginBottom: "var(--sp-3)" }}>
        <textarea
          value={input}
          onChange={(e) => !submitted && setInput(e.target.value)}
          placeholder="اكتب ردك بالإنجليزي هنا..."
          disabled={submitted}
          style={{
            width: "100%", minHeight: 80, padding: "var(--sp-4)", borderRadius: "var(--r-lg)",
            fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left",
            lineHeight: 1.8, background: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(220,38,38,0.2)", color: "var(--c-text)",
            outline: "none", resize: "vertical"
          }}
        />
      </div>

      {!submitted ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={submit} disabled={input.trim().length < 3} style={{ padding: "10px 24px", borderRadius: "var(--r-md)", border: "none", background: input.trim().length >= 3 ? "#dc2626" : "#e4e4e7", color: input.trim().length >= 3 ? "#fafaf9" : "#a1a1aa", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: input.trim().length >= 3 ? "pointer" : "default" }}>أرسل</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>الجواب المثالي:</div>
            <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "var(--c-text)" }}>{scenario.model}</div>
          </div>
          {matchedWords.length > 0 && (
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-success)", marginBottom: "var(--sp-2)" }}>{"كلمات مفتاحية استخدمتها: " + matchedWords.join(", ")}</div>
          )}
          {matchedWords.length === 0 && (
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>حاول تستخدم كلمات من بنك الجمل في المرة الجاية</div>
          )}
          <div style={{ textAlign: "center" }}>
            <button onClick={next} className="btn btn--danger btn--sm">{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== DAILY DEEP PROCESSING SESSION =====
function DailySession({ scenario, onComplete, dayNum, checkpoint }) {
  const cp = checkpoint || {};
  const [step, setStep] = useState(cp.step || 0);
  const [listenIdx, setListenIdx] = useState(-1);
  const [listenDone, setListenDone] = useState(cp.listenDone || false);
  const [listenAnswer, setListenAnswer] = useState(cp.listenAnswer || null);
  const [shadowReps, setShadowReps] = useState(cp.shadowReps || {});
  const [shadowSpoken, setShadowSpoken] = useState(cp.shadowSpoken || {});
  const [recallState, setRecallState] = useState(cp.recallState || {});
  const [recallScore, setRecallScore] = useState(cp.recallScore || {});
  const [prodInput, setProdInput] = useState(cp.prodInput || "");
  const [prodSubmitted, setProdSubmitted] = useState(cp.prodSubmitted || false);
  const [challengeAccepted, setChallengeAccepted] = useState(cp.challengeAccepted || false);
  const [challengeDone, setChallengeDone] = useState(cp.challengeDone || false);
  const [challengeNote, setChallengeNote] = useState(cp.challengeNote || "");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [stepCelebration, setStepCelebration] = useState(null);
  const [listenChunk, setListenChunk] = useState(cp.listenChunk || 0);

  const sc = scenario;
  const steps = [
    { num: "١", title: "استمع", desc: "استمع جملة جملة — بدون نص" },
    { num: "٢", title: "استمع واقرأ", desc: "استمع مع النص — لاحظ اللي فاتك" },
    { num: "٣", title: "ردّد", desc: "ردّد الجمل المفتاحية ٣ مرات" },
    { num: "٤", title: "تذكّر", desc: "شوف الترجمة — قل الجملة من ذاكرتك" },
    { num: "٥", title: "أنتج", desc: "اكتب ردك بنفسك" },
    { num: "٦", title: "طبّق", desc: "تحدّي حقيقي اليوم" },
  ];

  // Checkpoint: save session state on every meaningful change
  useEffect(() => {
    if (challengeAccepted) return; // session completed, no need to checkpoint
    const cpData = { type: "session", scenario: sc.title, step, listenDone, listenAnswer, shadowReps, shadowSpoken, recallState, recallScore, prodInput, prodSubmitted, challengeAccepted, challengeDone, challengeNote, listenChunk, date: gtd() };
    (async () => { try { await userStorage.set("checkpoint-session", JSON.stringify(cpData)); } catch(e) {} })();
  }, [step, listenDone, listenAnswer, shadowReps, shadowSpoken, recallState, recallScore, prodInput, prodSubmitted, challengeAccepted, challengeDone, challengeNote, listenChunk]);

  // FIX 5: Working Memory — play only first 3 lines initially, then expand
  // Baddeley's Model: WM capacity = 4±1 items. 7 lines at once = overload.
  function playDialogueSequence() {
    const chunkSize = 3;
    const startIdx = listenChunk * chunkSize;
    const endIdx = Math.min(startIdx + chunkSize, sc.dialogue.length);
    setListenIdx(startIdx);
    let i = startIdx;
    function playNext() {
      if (i >= endIdx) {
        if (endIdx >= sc.dialogue.length) { setListenDone(true); }
        else { setListenChunk(prev => prev + 1); } // auto-advance to next chunk
        setListenIdx(-1);
        return;
      }
      setListenIdx(i);
      const u = speak(sc.dialogue[i].text, 0.8);
      if (u) { u.onend = () => { i++; setTimeout(playNext, 1200); }; }
      else { i++; setTimeout(playNext, 1800); }
    }
    playNext();
  }

  const stepPct = Math.round(((step + 1) / 6) * 100);

  // Micro-celebration on step change
  function advanceStep(nextStep) {
    const msgs = ["إنجاز مميز! ", "إنجاز رائع.. أنت تقترب من التمكّن ", "يلّا كمّل! ", "رائع! ", "نص الطريق! ", ""];
    setStepCelebration(msgs[step] || "👏");
    setTimeout(() => { setStepCelebration(null); setStep(nextStep); }, 800);
  }

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
        <div style={{ fontSize: "var(--fs-2xl)" }}>{sc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-accent)" }}>{"جلسة اليوم: " + sc.title}</div>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"الخطوة " + (step + 1) + "/6 — " + steps[step].title}</div>
        </div>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "var(--c-accent)", fontFamily: "inherit" }}>{stepPct + "%"}</div>
      </div>

      {/* Micro-celebration popup */}
      {stepCelebration && <div style={{ textAlign: "center", padding: "var(--sp-4)", animation: "stepDone .6s" }}>
        <div style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--c-success)" }}>{stepCelebration}</div>
      </div>}

      {/* Progress — step indicator */}
      {!stepCelebration && <div style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-1)" }}>
              <div className={"step-badge" + (i < step ? " step-badge--done" : i === step ? " step-badge--active" : "")}>{i < step ? "✓" : s.num}</div>
              <div style={{ fontSize: "var(--fs-xs)", color: i === step ? "var(--c-accent)" : i < step ? "var(--c-success)" : "var(--c-text-tertiary)", fontWeight: i === step ? 600 : 400, whiteSpace: "nowrap" }}>{s.title}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "var(--c-success)" : i === step ? "var(--c-accent)" : "var(--c-surface-sunken)", transition: "background 0.3s" }} />)}
        </div>
      </div>}

      {/* Breathing + Mental imagery + Step 1 */}
      {step === 0 && (
        <div>
          {/* FIX 2: Breathing focus — 5 seconds before session */}
          {listenIdx === -1 && !listenDone && listenChunk === 0 && <div style={{ background: "linear-gradient(135deg, rgba(5,150,105,0.08), rgba(29,78,216,0.08))", border: "1px solid rgba(5,150,105,0.12)", borderRadius: "var(--r-xl)", padding: "var(--sp-6)", marginBottom: "var(--sp-4)", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-3)" }}>·</div>
            <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-success)", marginBottom: "var(--sp-2)" }}>خذ نفس عميق...</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2.2, marginBottom: "var(--sp-3)" }}>شهيق... ٣... ٢... ١... زفير...<br/>الآن عقلك جاهز يستقبل اللغة</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>التنفس العميق يرفع الانتباه 40% ويفتح مراكز التعلّم</div>
          </div>}
          {/* Mental imagery prompt */}
          {listenIdx === -1 && !listenDone && <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.1)", borderRadius: "var(--r-lg)", padding: "var(--sp-5)", marginBottom: "var(--sp-4)", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-2)" }}>{sc.icon}</div>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>أغمض عينك لحظة...</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2.2 }}>تخيّل نفسك فعلاً {sc.title === "في المطعم" ? "جالس في مطعم... النادل يجي ويسألك عن طلبك" : sc.title === "عند الدكتور" ? "في عيادة الدكتور... يسألك عن صحتك" : sc.title === "في الفندق" ? "واقف أمام موظف الاستقبال... تسوي check-in" : "في هالموقف... وتحتاج تتكلم إنجليزي"}</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginTop: "var(--sp-2)" }}>التخيّل يُنشئ ارتباط في ذاكرتك = تتذكر الجمل أسرع 5x</div>
          </div>}
          <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-6)", textAlign: "center", marginBottom: "var(--sp-4)" }}>
            <div style={{ fontSize: "var(--fs-base)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)", lineHeight: 2 }}>استمع للمحادثة جملة جملة — حاول تفهم بدون ما تشوف النص</div>
            {listenIdx === -1 && !listenDone && (
              <div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>{"مقطع " + (listenChunk + 1) + "/" + Math.ceil(sc.dialogue.length / 3) + " — ٣ جمل في كل مقطع (لتركيز أفضل)"}</div>
                <button onClick={playDialogueSequence} style={{ padding: "14px 32px", borderRadius: "var(--r-lg)", border: "none", background: "var(--c-accent-hover)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-md)", fontWeight: 700, cursor: "pointer" }}>{"♪ " + (listenChunk === 0 ? "ابدأ الاستماع" : "استمع المقطع التالي")}</button>
              </div>
            )}
            {/* After chunk finishes but more remain */}
            {listenIdx === -1 && !listenDone && listenChunk > 0 && (
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", marginTop: "var(--sp-2)" }}>{"✓ سمعت " + (listenChunk * 3) + " جمل — كمّل؟"}</div>
            )}
            {listenIdx >= 0 && (
              <div>
                <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-2)" }}>استمع</div>
                <div style={{ display: "flex", gap: "var(--sp-1)", justifyContent: "center", marginBottom: "var(--sp-2)" }}>
                  {sc.dialogue.map((_, di) => (
                    <div key={di} style={{ width: 12, height: 12, borderRadius: "50%", background: di < listenIdx ? "#059669" : di === listenIdx ? "#1e40af" : "#e4e4e7", transition: ".3s", border: di === listenIdx ? "2px solid #1d4ed8" : "none" }} />
                  ))}
                </div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent)" }}>{"جملة " + (listenIdx + 1) + "/" + sc.dialogue.length + " — " + sc.dialogue[listenIdx].speaker}</div>
              </div>
            )}
          </div>
          {listenDone && (
            <div style={{ animation: "fadeUp .3s" }}>
              {/* Comprehension check */}
              {sc.listenQ && listenAnswer === null && (
                <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent)", fontWeight: 700, marginBottom: "var(--sp-3)" }}>🤔 سؤال سريع — {sc.listenQ.q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                    {sc.listenQ.opts.map((o, oi) => (
                      <div key={oi} onClick={() => setListenAnswer(oi)} style={{ padding: "var(--sp-3)", borderRadius: "var(--r-md)", cursor: "pointer", fontSize: "var(--fs-sm)", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", transition: ".2s" }}>{o}</div>
                    ))}
                  </div>
                </div>
              )}
              {listenAnswer !== null && (
                <div style={{ textAlign: "center", marginBottom: "var(--sp-3)" }}>
                  <div style={{ fontSize: "var(--fs-sm)", color: listenAnswer === (sc.listenQ ? sc.listenQ.ans : 0) ? "#059669" : "#1d4ed8", fontWeight: 700, marginBottom: "var(--sp-1)" }}>
                    {listenAnswer === (sc.listenQ ? sc.listenQ.ans : 0) ? "✓ صح! فهمت المحادثة" : "تقريباً — في الخطوة الجاية بتشوف النص وتلاحظ اللي فاتك"}
                  </div>
                </div>
              )}
              {(listenAnswer !== null || !sc.listenQ) && (
                <div style={{ display: "flex", gap: "var(--sp-2)", justifyContent: "center" }}>
                  <button onClick={() => { setListenDone(false); setListenAnswer(null); playDialogueSequence(); }} className="btn btn--secondary btn--sm">استمع مرة ثانية</button>
                  <button onClick={() => advanceStep(1)} className="btn btn--primary">التالي →</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Listen + Read */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-3)", lineHeight: 2 }}>اضغط ♪ على كل جملة واقرأها. لاحظ الكلمات اللي ما فهمتها أول مرة.</div>
          {sc.dialogue.map((d, i) => {
            const isMe = d.speaker === "أنت";
            return (
            <div key={i} className={"chat-row" + (isMe ? " chat-row--sent" : "")}>
              <div className={"chat-avatar" + (isMe ? " chat-avatar--sent" : "")}>{isMe ? "أنا" : d.speaker.charAt(0)}</div>
              <div className={"bubble" + (isMe ? " bubble--sent" : " bubble--received")}>
                {!isMe && <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-tertiary)", marginBottom: 2 }}>{d.speaker}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}><span style={{ flex: 1 }}>{d.text}</span><SpeakBtn text={d.text} size={14} color={isMe ? "#fff" : undefined} /></div>
              </div>
            </div>
          );})}
          <div style={{ textAlign: "center", marginTop: "var(--sp-4)" }}>
            <button onClick={() => advanceStep(2)} className="btn btn--primary">التالي: ردّد الجمل →</button>
          </div>
        </div>
      )}

      {/* Step 3: Shadow key phrases 3x */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-3)", lineHeight: 2 }}>اسمع الجملة ← ردّدها بصوت عالٍ ← اضغط  للتأكّد من نطقك. الهدف: ٣ مرات.</div>
          {sc.keyPhrases.map((p, i) => {
            const r = shadowReps[i] || 0;
            const spokenResult = shadowSpoken[i];
            const setSpokenResult = (v) => setShadowSpoken(prev => ({ ...prev, [i]: v }));
            return (
              <div key={i} style={{ padding: "var(--sp-3)", borderRadius: "var(--r-md)", background: r >= 5 ? "rgba(5,150,105,0.06)" : "rgba(0,0,0,0.02)", border: "1px solid " + (r >= 5 ? "rgba(5,150,105,0.15)" : "rgba(0,0,0,0.03)"), marginBottom: "var(--sp-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: r >= 5 ? "#059669" : r > 0 ? "#1d4ed8" : "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xs)", fontWeight: 700, color: r > 0 ? "#fafaf9" : "#a1a1aa", flexShrink: 0 }}>{r >= 5 ? "✓" : r + "/5"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{p.en}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginTop: "var(--sp-1)" }}>{p.ar}</div>
                  </div>
                  <SpeakBtn text={p.en} size={18} />
                </div>
                {r < 3 && (
                  <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
                    <button onClick={() => {
                      speak(p.en, 0.8);
                      // Start speech recognition after audio finishes
                      setTimeout(() => {
                        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (SR) {
                          const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false;
                          rec.onresult = (e) => {
                            const heard = e.results[0][0].transcript.toLowerCase();
                            const target = p.en.toLowerCase().replace(/[.,!?']/g, "").split(/\s+/);
                            const heardW = heard.replace(/[.,!?']/g, "").split(/\s+/);
                            let m = 0; target.forEach(w => { if (heardW.includes(w)) m++; });
                            const pct = Math.round((m / target.length) * 100);
                            setSpokenResult(pct);
                            if (pct >= 50) setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }));
                          };
                          rec.onerror = () => { setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 })); };
                          rec.start();
                        } else {
                          setShadowReps(prev => ({ ...prev, [i]: (prev[i] || 0) + 1 }));
                        }
                      }, 2500);
                    }} style={{ flex: 1, padding: "10px 16px", borderRadius: "var(--r-md)", border: "none", background: "var(--c-accent-hover)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>استمع ثم  ردّد</button>
                  </div>
                )}
                {spokenResult !== undefined && spokenResult !== null && (
                  <div style={{ fontSize: "var(--fs-xs)", color: spokenResult >= 80 ? "#059669" : spokenResult >= 50 ? "#1d4ed8" : "#dc2626", fontWeight: 600, marginTop: "var(--sp-1)" }}>
                    {spokenResult >= 80 ? "نطق إنجاز مميز! " + spokenResult + "%" : spokenResult >= 50 ? "جيد! " + spokenResult + "% — جرّب مرة ثانية" : "حاول مرة ثانية — ركّز على الكلمات المفتاحية"}
                  </div>
                )}
              </div>
            );
          })}
          {Object.values(shadowReps).filter(r => r >= 5).length >= sc.keyPhrases.length && (
            <div style={{ textAlign: "center", marginTop: "var(--sp-4)" }}>
              <button onClick={() => advanceStep(3)} className="btn btn--primary">التالي: تذكّر →</button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Recall — show Arabic, hide English, reveal to check */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-3)", lineHeight: 2 }}>شوف الترجمة العربية فقط — حاول تقول الجملة الإنجليزية من ذاكرتك — ثم اضغط "أظهر" وقارن.</div>
          {sc.keyPhrases.map((p, i) => {
            const state = recallState[i] || "hidden";
            const selfScore = recallScore[i]; // undefined, "good", "partial", "forgot"
            return (
              <div key={i} style={{ background: "rgba(29,78,216,0.06)", border: "1px solid " + (selfScore === "good" ? "rgba(5,150,105,0.2)" : selfScore === "forgot" ? "rgba(220,38,38,0.15)" : "rgba(29,78,216,0.1)"), borderRadius: "var(--r-md)", padding: "var(--sp-4)", marginBottom: "var(--sp-2)" }}>
                {/* Always show Arabic */}
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>{p.ar}</div>

                {state === "hidden" && (
                  <button onClick={() => setRecallState(prev => ({ ...prev, [i]: "thinking" }))} className="btn btn--primary btn--sm">قلها بصوت عالٍ ثم اضغط هنا</button>
                )}

                {state === "thinking" && (
                  <div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>قلت الجملة؟ اضغط "أظهر" وقارن:</div>
                    <button onClick={() => setRecallState(prev => ({ ...prev, [i]: "revealed" }))} className="btn btn--primary btn--sm">أظهر الجملة</button>
                  </div>
                )}

                {state === "revealed" && (
                  <div>
                    <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.7, color: "var(--c-text)", marginBottom: "var(--sp-2)", display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                      <span style={{ flex: 1 }}>{p.en}</span>
                      <SpeakBtn text={p.en} size={16} />
                    </div>
                    {/* FIX 8: Cross-context patterns */}
                    {(() => { const patterns = findCrossPatterns(p.en); return patterns.length > 0 ? (
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", marginBottom: "var(--sp-2)", lineHeight: 1.8 }}>
                        {"" + patterns[0].pattern + " — " + patterns[0].usage}
                      </div>
                    ) : null; })()}
                    {!selfScore && (
                      <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "good" }))} className="toggle-btn toggle-btn--active" style={{ background: "var(--c-success-light)", color: "var(--c-success)" }}>تذكّرتها </button>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "partial" }))} className="toggle-btn toggle-btn--active">تقريباً</button>
                        <button onClick={() => setRecallScore(prev => ({ ...prev, [i]: "forgot" }))} className="toggle-btn" style={{ background: "var(--c-warn-light)", color: "var(--c-warn)" }}>لسه</button>
                      </div>
                    )}
                    {selfScore && <div style={{ fontSize: "var(--fs-xs)", color: selfScore === "good" ? "#059669" : selfScore === "partial" ? "#1d4ed8" : "#dc2626", fontWeight: 600, marginTop: "var(--sp-1)" }}>{selfScore === "good" ? "✓ إنجاز مميز!" : selfScore === "partial" ? " قريب — ردّدها مرة" : "🔄 عادي تماماً! المخ يحتاج ٥-٧ تكرارات — بنراجعها سوا"}</div>}
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(recallScore).length >= sc.keyPhrases.length && (() => {
            const forgotten = sc.keyPhrases.map((_, i) => i).filter(i => recallScore[i] === "forgot" || recallScore[i] === "partial");
            const allGood = forgotten.length === 0;
            return (
              <div style={{ marginTop: "var(--sp-4)" }}>
                {!allGood && (
                  <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(217,119,6,0.1)", borderRadius: "var(--r-md)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)", textAlign: "center" }}>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-error)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>{"🔄 " + forgotten.length + " جملة تحتاج مراجعة — ردّدها ثم أعد التقييم"}</div>
                    {forgotten.map(fi => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-3)", borderRadius: "var(--r-sm)", background: "rgba(0,0,0,0.02)", marginBottom: "var(--sp-1)" }}>
                        <SpeakBtn text={sc.keyPhrases[fi].en} size={18} color="#1d4ed8" />
                        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", flex: 1, color: "var(--c-text)" }}>{sc.keyPhrases[fi].en}</div>
                      </div>
                    ))}
                    <button onClick={() => { const newState = { ...recallState }; const newScore = { ...recallScore }; forgotten.forEach(fi => { newState[fi] = "hidden"; delete newScore[fi]; }); setRecallState(newState); setRecallScore(newScore); }} style={{ marginTop: "var(--sp-2)", padding: "8px 20px", borderRadius: "var(--r-sm)", border: "none", background: "var(--c-accent)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>أعد اختبار الجمل المنسيّة</button>
                  </div>
                )}
                {allGood && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-success)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>إنجاز مميز! تذكّرت كل الجمل</div>
                    <button onClick={() => advanceStep(4)} className="btn btn--primary">التالي: أنتج بنفسك →</button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Step 5: Produce + feedback */}
      {step === 4 && (
        <div>
          <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: "var(--fs-base)", color: "var(--c-text)", lineHeight: 2, marginBottom: "var(--sp-1)" }}>{sc.producePrompt}</div>
          </div>
          <textarea value={prodInput} onChange={(e) => !prodSubmitted && setProdInput(e.target.value)} placeholder="اكتب ردك بالإنجليزي..." disabled={prodSubmitted} style={{ width: "100%", minHeight: 80, padding: "var(--sp-4)", borderRadius: "var(--r-lg)", fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--c-text)", outline: "none", resize: "vertical", marginBottom: "var(--sp-3)" }} />
          {!prodSubmitted ? (
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setProdSubmitted(true)} disabled={prodInput.trim().length < 5} style={{ padding: "10px 24px", borderRadius: "var(--r-md)", border: "none", background: prodInput.trim().length >= 5 ? "#dc2626" : "#e4e4e7", color: prodInput.trim().length >= 5 ? "#fafaf9" : "#a1a1aa", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: prodInput.trim().length >= 5 ? "pointer" : "default" }}>أرسل</button>
            </div>
          ) : (
            <div>
              <div style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-2)" }}>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>النموذج المثالي:</div>
                <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "var(--c-text)", display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                  <span style={{ flex: 1 }}>{sc.produceModel}</span>
                  <SpeakBtn text={sc.produceModel} size={16} />
                </div>
              </div>
              {/* FIX 7: AI feedback on writing */}
              {getOpenAIKey() && !aiFeedback && !aiLoading && (
                <div style={{ textAlign: "center", marginBottom: "var(--sp-2)" }}>
                  <button onClick={async () => {
                    setAiLoading(true);
                    try {
                      const res = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST", headers: { "Authorization": "Bearer " + getOpenAIKey(), "Content-Type": "application/json" },
                        body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 200, messages: [
                          { role: "system", content: "You are an English language coach for Arabic speakers. Compare the student's response with the model answer. Give 2-3 SHORT tips in Arabic about grammar, vocabulary, or naturalness. Be encouraging. Max 3 lines." },
                          { role: "user", content: "Situation: " + sc.producePrompt + "\nStudent wrote: " + prodInput + "\nModel answer: " + sc.produceModel + "\nGive feedback in Arabic:" }
                        ] })
                      });
                      const data = await res.json();
                      setAiFeedback(data.choices[0].message.content);
                    } catch { setAiFeedback("لم أتمكن من الاتصال. تأكّد من مفتاح API."); }
                    setAiLoading(false);
                  }} className="btn btn--secondary btn--sm">تحليل ذكي لكتابتك</button>
                </div>
              )}
              {aiLoading && <div style={{ textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-accent-hover)", marginBottom: "var(--sp-2)" }}>جاري التحليل...</div>}
              {aiFeedback && (
                <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-2)" }}>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent-hover)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>تحليل ذكي:</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2, whiteSpace: "pre-wrap" }}>{aiFeedback}</div>
                </div>
              )}
              {/* Noticing feedback — explain WHY */}
              <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>— لاحظ الفرق:</div>
                {sc.noticingTips ? sc.noticingTips.map((tip, ti) => (
                  <div key={ti} style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2, marginBottom: 2 }}>{"• " + tip}</div>
                )) : (
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2 }}>قارن ردّك بالنموذج — لاحظ: هل استخدمت "please"؟ هل حددت طلبك بوضوح؟ هل سألت سؤال إضافي يُظهر ثقة؟</div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => advanceStep(5)} className="btn btn--primary">التالي: تحدّي اليوم →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Real-world challenge */}
      {step === 5 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>تحدّي اليوم</div>
          <div style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--c-accent)", marginBottom: "var(--sp-3)" }}>تحدّي اليوم</div>
          <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-5)", marginBottom: "var(--sp-4)" }}>
            <div style={{ fontSize: "var(--fs-md)", color: "var(--c-text)", lineHeight: 2 }}>{sc.challenge}</div>
          </div>
          {!challengeAccepted ? (
            <button onClick={() => {
              setChallengeAccepted(true);
              const sessionData = { scenario: sc.title, date: gtd(), recallScore: { ...recallScore }, phrasesCount: sc.keyPhrases.length };
              (async () => { try {
                const r = await userStorage.get("session-history");
                const hist = r && r.value ? JSON.parse(r.value) : [];
                hist.push(sessionData);
                await userStorage.set("session-history", JSON.stringify(hist));
                await userStorage.delete("checkpoint-session"); // clear checkpoint on completion
              } catch(e) {} })();
              if (onComplete) onComplete();
            }} style={{ padding: "12px 28px", borderRadius: "var(--r-lg)", border: "none", background: "linear-gradient(135deg,#059669,#1d4ed8)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-base)", fontWeight: 700, cursor: "pointer" }}>أقبل التحدي </button>
          ) : !challengeDone ? (
            <div style={{ animation: "fadeUp .4s" }}>
              {/* FIX 4: Challenge follow-up */}
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent)", fontWeight: 700, marginBottom: "var(--sp-3)" }}>سوّيت التحدي؟</div>
              <div style={{ display: "flex", gap: "var(--sp-2)", justifyContent: "center", marginBottom: "var(--sp-3)" }}>
                <button onClick={() => setChallengeDone(true)} className="btn btn--success btn--sm">نعم سويته </button>
                <button onClick={() => setChallengeDone(true)} style={{ padding: "8px 20px", borderRadius: "var(--r-md)", border: "1px solid rgba(0,0,0,0.06)", background: "transparent", color: "var(--c-text-secondary)", fontFamily: "inherit", fontSize: "var(--fs-sm)", cursor: "pointer" }}>بسويه لاحقاً</button>
              </div>
              <input value={challengeNote} onChange={(e) => setChallengeNote(e.target.value)} placeholder="كيف كانت التجربة؟ (اختياري)" style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r-md)", fontFamily: "inherit", fontSize: "var(--fs-sm)", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", color: "var(--c-text)", outline: "none", textAlign: "center" }} />
            </div>
          ) : (
            <div style={{ animation: "fadeUp .4s" }}>
              <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-2)", color: "var(--c-success)" }}>مبروك</div>
              {/* FIX 5: Self-efficacy message based on history */}
              {(() => {
                const totalSessions = (sessionHistory || []).length;
                const recalled = Object.values(recallScore).filter(v => v === "good").length;
                const total = sc.keyPhrases.length;
                if (totalSessions === 0) return <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-success)", marginBottom: "var(--sp-2)" }}>أول جلسة لك! بداية ممتازة.</div>;
                if (recalled === total) return <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-success)", marginBottom: "var(--sp-2)", lineHeight: 2 }}>تذكّرت كل الجمل من ذاكرتك!<br/>هذا دليل إن عقلك يبني مسارات جديدة.</div>;
                if (totalSessions >= 7) return <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-success)", marginBottom: "var(--sp-2)", lineHeight: 2 }}>أسبوع كامل! {totalSessions} جلسة أنجزتها.<br/>قبل أسبوع ما كنت تعرف هالجمل. اليوم تقولها.</div>;
                return <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-success)", marginBottom: "var(--sp-2)", lineHeight: 2 }}>جلسة #{totalSessions + 1} مكتملة!<br/>كل جلسة تقرّبك خطوة من الطلاقة الحقيقية.</div>;
              })()}
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2 }}>تمرّنت على "{sc.title}" من ٦ زوايا. الجمل الآن أقرب لذاكرتك طويلة المدى.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== FIX 6: PRONUNCIATION CHECK (Web Speech Recognition) =====
function PronounceBtn({ targetText, size }) {
  const [state, setState] = useState("idle"); // idle, listening, result
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setState("nosupport"); return; }
    setState("listening");
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript.toLowerCase().trim();
      setResult(heard);
      // Compare with target
      const targetWords = targetText.toLowerCase().replace(/[.,!?']/g, "").split(/\s+/);
      const heardWords = heard.replace(/[.,!?']/g, "").split(/\s+/);
      let match = 0;
      targetWords.forEach(w => { if (heardWords.includes(w)) match++; });
      const pct = Math.round((match / targetWords.length) * 100);
      setScore(pct);
      setState("result");
    };
    recognition.onerror = () => { setState("idle"); };
    recognition.onend = () => { if (state === "listening") setState("idle"); };
    recognition.start();
  }

  if (state === "nosupport") return null;
  if (state === "idle") return (
    <button onClick={startListening} style={{ background: "none", border: "1px solid rgba(29,78,216,0.2)", borderRadius: "var(--r-sm)", cursor: "pointer", fontSize: size || 12, padding: "3px 8px", color: "var(--c-accent)", flexShrink: 0 }} title="جرّب نطقك"></button>
  );
  if (state === "listening") return (
    <span style={{ fontSize: size || 12, color: "var(--c-error)", animation: "none" }}>جاري التسجيل...</span>
  );
  return (
    <span style={{ fontSize: size || 11, color: score >= 80 ? "#059669" : score >= 50 ? "#1d4ed8" : "#dc2626", fontWeight: 600 }}>{score >= 80 ? "✓ " + score + "%" : score + "%"}</span>
  );
}

// ===== 4-3-2 FLUENCY TECHNIQUE =====
// Nation (1989): Speak about the SAME topic for 4 minutes, then 3, then 2.
// Each round forces faster retrieval = builds automaticity = real fluency.
const FLUENCY_TOPICS = [
  { topic: "Describe your typical day from morning to night", ar: "اوصف يومك العادي من الصبح لليل", starters: ["I usually wake up at...", "The first thing I do is...", "For lunch, I...", "In the evening, I..."] },
  { topic: "Talk about your favorite trip or vacation", ar: "تكلم عن أحلى رحلة سويتها", starters: ["One of my best trips was to...", "I went there because...", "The best part was...", "I would go back because..."] },
  { topic: "Describe your home and your neighborhood", ar: "وصف بيتك وحيّك", starters: ["I live in a... in...", "My home has...", "The neighborhood is...", "What I like most about it is..."] },
  { topic: "Talk about your family", ar: "تكلم عن عائلتك", starters: ["I have... in my family.", "My oldest... is...", "We usually spend time together by...", "The best thing about my family is..."] },
  { topic: "Describe a skill you are learning or want to learn", ar: "مهارة تتعلمها أو تبي تتعلمها", starters: ["I've been trying to learn...", "I started because...", "The hardest part is...", "I practice by..."] },
  { topic: "Talk about something that made you happy recently", ar: "شيء فرّحك مؤخراً", starters: ["Recently, something great happened...", "It made me happy because...", "I remember feeling...", "It reminded me that..."] },
  { topic: "Describe your dream job or project", ar: "وظيفة أو مشروع أحلامك", starters: ["If I could do anything, I would...", "The reason is...", "I think I would be good at it because...", "The first step would be..."] },
  { topic: "Talk about your favorite food and how to make it", ar: "أكلتك المفضلة وكيف تنسوي", starters: ["My favorite dish is...", "You need... to make it.", "First, you...", "The secret is..."] },
  { topic: "Describe a person you admire and why", ar: "شخص تحترمه وليش", starters: ["Someone I really admire is...", "I admire them because...", "One thing they taught me is...", "They inspire me to..."] },
  { topic: "Talk about how technology changed your life", ar: "كيف التقنية غيّرت حياتك", starters: ["Technology has changed my life by...", "I use my phone to...", "Before, I used to..., but now...", "The most useful app for me is..."] },
];

function Fluency432() {
  const [round, setRound] = useState(0); // 0=intro, 1=4min, 2=3min, 3=2min, 4=done
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [topicIdx, setTopicIdx] = useState(gdn() % FLUENCY_TOPICS.length);
  const timerRef = useRef(null);

  const roundTimes = [0, 240, 180, 120]; // seconds for rounds 1-3
  const roundLabels = ["", "٤ دقائق — تكلم بحرية", "٣ دقائق — نفس الموضوع أسرع", "٢ دقائق — نفس الموضوع بأقصى سرعة"];
  const topic = FLUENCY_TOPICS[topicIdx];

  function startRound(r) {
    setRound(r);
    setSec(roundTimes[r]);
    setRunning(true);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSec(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function restart() {
    clearInterval(timerRef.current);
    setTopicIdx((topicIdx + 1) % FLUENCY_TOPICS.length);
    setRound(0); setSec(0); setRunning(false);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (round === 0) return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
        <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-2)", color: "var(--c-accent)" }}>الطلاقة</div>
        <div style={{ fontSize: "var(--fs-md)", fontWeight: 800, color: "var(--c-error)", marginBottom: "var(--sp-2)" }}>تمرين الطلاقة 4-3-2</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2 }}>تكلم عن نفس الموضوع ٣ مرات — كل مرة وقت أقل<br />مخك يتعلم يسترجع الجمل أسرع = طلاقة حقيقية</div>
      </div>
      <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-5)", textAlign: "center", marginBottom: "var(--sp-4)" }}>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-md)", color: "var(--c-error)", direction: "ltr", lineHeight: 1.6, marginBottom: "var(--sp-2)" }}>{topic.topic}</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>{topic.ar}</div>
      </div>
      <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>— استخدم هالجمل كبداية:</div>
        {topic.starters.map((st, si) => <div key={si} style={{ fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "var(--c-text-secondary)", padding: "3px 0" }}>{st}</div>)}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => startRound(1)} className="btn btn--primary btn--lg">ابدأ الجولة الأولى (٤ دقائق) →</button>
      </div>
    </div>
  );

  if (round === 4) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-3)" }}></div>
      <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-success)", marginBottom: "var(--sp-2)" }}>إنجاز رائع.. أنت تقترب من التمكّن</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2, marginBottom: "var(--sp-4)" }}>تكلمت عن نفس الموضوع ٣ مرات — كل مرة بسرعة أكبر.<br />لاحظت كيف الجمل صارت تطلع أسرع في الجولة الثالثة؟<br />هذا بالضبط كيف تُبنى الطلاقة.</div>
      <button onClick={restart} className="btn btn--danger">موضوع جديد</button>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
        {[1, 2, 3].map(r => (
          <div key={r} style={{ flex: 1, height: 6, borderRadius: "var(--r-sm)", background: r < round ? "#059669" : r === round ? "#dc2626" : "#e4e4e7" }} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: "var(--sp-4)" }}>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-error)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>{"الجولة " + round + "/3 — " + roundLabels[round]}</div>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-2xl)", fontWeight: 800, color: sec <= 10 && sec > 0 ? "#dc2626" : running ? "#dc2626" : "#059669" }}>{String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0")}</div>
        {sec === 0 && !running && <div style={{ color: "var(--c-success)", fontWeight: 700, marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>✅ انتهى الوقت!</div>}
      </div>

      <div style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.08)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-4)", textAlign: "center" }}>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", color: "var(--c-text)", direction: "ltr", lineHeight: 1.6 }}>{topic.topic}</div>
      </div>

      {running && <div style={{ textAlign: "center", fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2 }}>
        {round === 1 && "خذ وقتك — تكلم بأي سرعة. الهدف: غطِّ أكبر قدر من النقاط"}
        {round === 2 && "نفس الأفكار — لكن أسرع. لاحظ إن الجمل تطلع أسهل"}
        {round === 3 && "آخر جولة — أقصى سرعة ممكنة. لاحظ الفرق عن أول مرة!"}
      </div>}

      {sec === 0 && !running && round < 3 && (
        <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}>
          <button onClick={() => startRound(round + 1)} className="btn btn--danger">{"الجولة " + (round + 1) + " (" + (round === 1 ? "٣" : "٢") + " دقائق) →"}</button>
        </div>
      )}
      {sec === 0 && !running && round === 3 && (
        <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}>
          <button onClick={() => setRound(4)} style={{ padding: "10px 24px", borderRadius: "var(--r-md)", border: "none", background: "linear-gradient(135deg,#059669,#1d4ed8)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>النتيجة</button>
        </div>
      )}
    </div>
  );
}

// ===== LISTENING COMPREHENSION =====
function ListenExercise() {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const qs = useRef(shuffle(LISTEN_ITEMS, gdn()).slice(0, 8));

  function playQ() { speak(qs.current[qi].text, 0.85); }
  function pick(oi) {
    setPicked(oi);
    const { correctIndex } = shuffleOpts(qs.current[qi].opts, qs.current[qi].ans, qi * 19 + 73);
    if (oi === correctIndex) setScore(score + 1);
  }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setPicked(null); setRevealed(false); }
  function restart() { qs.current = shuffle(LISTEN_ITEMS, Date.now()); setQi(0); setPicked(null); setScore(0); setDone(false); setRevealed(false); }

  // Auto-play on mount and question change
  useEffect(() => { if (!done) { const t = setTimeout(() => playQ(), 400); return () => clearTimeout(t); } }, [qi, done]);

  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>الاستماع</div>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: score >= 6 ? "#059669" : score >= 4 ? "#1d4ed8" : "#dc2626", marginBottom: "var(--sp-2)" }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score >= 6 ? "إنجاز مميز! أذنك صارت تلتقط بسرعة" : score >= 4 ? "جيد! استمر — الاستماع يتحسن بالتكرار" : "ركّز أكثر على الاستماع — أعد الجمل اللي ما فهمتها"}</div>
      <button onClick={restart} className="btn btn--primary btn--sm">محاولة جديدة</button>
    </div>
  );

  const raw = qs.current[qi];
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(raw.opts, raw.ans, qi * 19 + 73);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>{"سؤال " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-accent-hover)", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-5)", marginBottom: "var(--sp-3)", textAlign: "center" }}>
        <button onClick={playQ} style={{ padding: "12px 28px", borderRadius: "var(--r-lg)", border: "none", background: "var(--c-accent-hover)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-md)", fontWeight: 700, cursor: "pointer", marginBottom: "var(--sp-3)" }}>استمع للجملة</button>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>اضغط للاستماع — ثم أجب على السؤال</div>
        {revealed && <div style={{ fontFamily: "inherit", fontSize: "var(--fs-sm)", color: "var(--c-accent-hover)", marginTop: "var(--sp-3)", direction: "ltr" }}>{raw.text}</div>}
      </div>

      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)", marginBottom: "var(--sp-3)", fontWeight: 600 }}>{raw.q}</div>

      {qOpts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === qAns;
        const isPicked = picked === oi;
        let bg = "rgba(0,0,0,0.02)", brd = "rgba(0,0,0,0.03)";
        if (show && isCorrect) { bg = "rgba(5,150,105,0.1)"; brd = "rgba(5,150,105,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(217,119,6,0.1)"; brd = "rgba(217,119,6,0.3)"; }
        return <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: "var(--sp-3)", borderRadius: "var(--r-md)", marginBottom: 5, cursor: show ? "default" : "pointer", fontSize: "var(--fs-sm)", lineHeight: 1.7, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1 }}>
          {o}{show && isCorrect && <span style={{ color: "var(--c-success)", fontSize: "var(--fs-xs)" }}> </span>}
        </div>;
      })}
      {picked !== null && (
        <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}>
          {!revealed && <button onClick={() => setRevealed(true)} style={{ padding: "6px 14px", borderRadius: "var(--r-sm)", border: "1px solid rgba(29,78,216,0.2)", background: "transparent", color: "var(--c-accent-hover)", fontFamily: "inherit", fontSize: "var(--fs-xs)", cursor: "pointer", marginLeft: 8 }}>أظهر النص</button>}
          <button onClick={next} style={{ padding: "8px 20px", borderRadius: "var(--r-md)", border: "none", background: "var(--c-accent-hover)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer", marginRight: 8 }}>{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
        </div>
      )}
    </div>
  );
}

// ===== DICTATION =====
function DictationExercise() {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = useRef(shuffle(DICTATION_ITEMS, gdn()).slice(0, 8));

  function playQ() { speak(qs.current[qi], 0.75); }
  function check() {
    setChecked(true);
    const userWords = input.trim().toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
    const correctWords = qs.current[qi].toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
    let match = 0;
    correctWords.forEach(w => { if (userWords.includes(w)) match++; });
    if (match / correctWords.length >= 0.7) setScore(score + 1);
  }
  function next() { if (qi + 1 >= qs.current.length) { setDone(true); return; } setQi(qi + 1); setInput(""); setChecked(false); }
  function restart() { qs.current = shuffle(DICTATION_ITEMS, Date.now()); setQi(0); setInput(""); setChecked(false); setScore(0); setDone(false); }

  useEffect(() => { if (!done) { const t = setTimeout(() => playQ(), 400); return () => clearTimeout(t); } }, [qi, done]);

  if (done) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-3)", color: "var(--c-accent)" }}>إملاء صوتي</div>
      <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: score >= 6 ? "#059669" : score >= 4 ? "#1d4ed8" : "#dc2626", marginBottom: "var(--sp-2)" }}>{score + "/" + qs.current.length}</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-4)" }}>{score >= 6 ? "إنجاز مميز! أذنك تلتقط التفاصيل" : score >= 4 ? "جيد! استمر بالاستماع" : "أعد الاستماع لكل جملة عدة مرات"}</div>
      <button onClick={restart} className="btn btn--danger btn--sm">محاولة جديدة</button>
    </div>
  );

  const correct = qs.current[qi];
  const userWords = input.trim().toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
  const correctWords = correct.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-3)" }}>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>{"جملة " + (qi + 1) + "/" + qs.current.length}</div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-error)", fontWeight: 600 }}>{score + " صحيح"}</div>
      </div>

      <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-5)", marginBottom: "var(--sp-3)", textAlign: "center" }}>
        <button onClick={playQ} style={{ padding: "12px 28px", borderRadius: "var(--r-lg)", border: "none", background: "var(--c-error)", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-md)", fontWeight: 700, cursor: "pointer", marginBottom: "var(--sp-2)" }}>استمع</button>
        <div style={{ marginTop: "var(--sp-2)" }}>
          <button onClick={() => speak(qs.current[qi], 0.55)} style={{ padding: "4px 12px", borderRadius: "var(--r-sm)", border: "1px solid rgba(220,38,38,0.2)", background: "transparent", color: "var(--c-error)", fontFamily: "inherit", fontSize: "var(--fs-xs)", cursor: "pointer" }}>بطيء</button>
        </div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginTop: "var(--sp-2)" }}>استمع ثم اكتب ما سمعته بالإنجليزي</div>
      </div>

      <textarea value={input} onChange={(e) => !checked && setInput(e.target.value)} placeholder="اكتب ما سمعته هنا..." disabled={checked} style={{ width: "100%", minHeight: 70, padding: "var(--sp-4)", borderRadius: "var(--r-lg)", fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, background: "rgba(0,0,0,0.02)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--c-text)", outline: "none", resize: "vertical", marginBottom: "var(--sp-3)" }} />

      {!checked ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={check} disabled={input.trim().length < 3} style={{ padding: "10px 24px", borderRadius: "var(--r-md)", border: "none", background: input.trim().length >= 3 ? "#dc2626" : "#e4e4e7", color: input.trim().length >= 3 ? "#fff" : "#a1a1aa", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: input.trim().length >= 3 ? "pointer" : "default" }}>تأكّد</button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.12)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", fontWeight: 700, marginBottom: "var(--sp-2)" }}>الجملة الصحيحة:</div>
            <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "var(--c-text)" }}>{correct}</div>
          </div>
          <div style={{ fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", lineHeight: 2, marginBottom: "var(--sp-3)" }}>
            {correctWords.map((w, wi) => {
              const matched = userWords.includes(w);
              return <span key={wi} style={{ color: matched ? "#059669" : "#dc2626", fontWeight: matched ? 400 : 700 }}>{w + " "}</span>;
            })}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={next} className="btn btn--danger btn--sm">{qi + 1 >= qs.current.length ? "🏁 النتيجة" : "التالي ←"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LevelTest({ onComplete, checkpoint }) {
  const cp = checkpoint || {};
  const [phase, setPhase] = useState(cp.phase === "testing" ? "testing" : "intro");
  const [qi, setQi] = useState(cp.qi || 0);
  const [picked, setPicked] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(cp.currentLevel != null ? cp.currentLevel : 2);
  const [history, setHistory] = useState(cp.history || []);
  const [questions, setQuestions] = useState(cp.questions || []);
  const [startTime, setStartTime] = useState(cp.startTime || null);
  const [levelScores, setLevelScores] = useState(cp.levelScores || {0:0,1:0,2:0,3:0,4:0,5:0});
  const [levelAttempts, setLevelAttempts] = useState(cp.levelAttempts || {0:0,1:0,2:0,3:0,4:0,5:0});
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(cp.consecutiveCorrect || 0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(cp.consecutiveWrong || 0);
  const [finalLevel, setFinalLevel] = useState(null);
  const [skillBreakdown, setSkillBreakdown] = useState(null);

  const TOTAL_QUESTIONS = 25;

  // Checkpoint: save level test progress on each question
  useEffect(() => {
    if (phase !== "testing" || !questions.length) return;
    const cpData = { type: "level", phase, qi, currentLevel, history, questions, startTime, levelScores, levelAttempts, consecutiveCorrect, consecutiveWrong, date: gtd() };
    (async () => { try { await userStorage.set("checkpoint-level", JSON.stringify(cpData)); } catch(e) {} })();
  }, [qi, history, phase]);

  function startTest() {
    // Build adaptive question pool - pick from current level
    const seed = Date.now();
    const pool = [];
    for (let lvl = 0; lvl < 6; lvl++) {
      const lvlQs = LEVEL_TEST.filter(q => q.level === lvl);
      pool.push(shuffle(lvlQs, seed + lvl));
    }
    setQuestions(pool);
    setPhase("testing");
    setStartTime(Date.now());
  }

  function getNextQuestion() {
    if (!questions.length) return null;
    const lvlPool = questions[currentLevel];
    // Find next unanswered question at this level
    const answered = history.filter(h => h.level === currentLevel).length;
    if (answered < lvlPool.length) return { ...lvlPool[answered], _level: currentLevel };
    // If exhausted at this level, try adjacent
    for (let d = 1; d <= 5; d++) {
      for (const dir of [1, -1]) {
        const tryLvl = currentLevel + d * dir;
        if (tryLvl >= 0 && tryLvl <= 5) {
          const pool2 = questions[tryLvl];
          const ans2 = history.filter(h => h.level === tryLvl).length;
          if (ans2 < pool2.length) return { ...pool2[ans2], _level: tryLvl };
        }
      }
    }
    return null;
  }

  function pick(oi) {
    if (picked !== null) return;
    const currentQ = getNextQuestion();
    if (!currentQ) return;
    const { correctIndex } = shuffleOpts(currentQ.opts, currentQ.ans, qi * 31 + 97 + currentQ._level * 7);
    const isCorrect = oi === correctIndex;
    setPicked(oi);

    const newHistory = [...history, { level: currentQ._level, correct: isCorrect, type: currentQ.type }];
    setHistory(newHistory);

    const newScores = { ...levelScores };
    const newAttempts = { ...levelAttempts };
    if (isCorrect) newScores[currentQ._level]++;
    newAttempts[currentQ._level]++;
    setLevelScores(newScores);
    setLevelAttempts(newAttempts);

    // Adaptive logic
    let newConsCorrect = isCorrect ? consecutiveCorrect + 1 : 0;
    let newConsWrong = isCorrect ? 0 : consecutiveWrong + 1;
    setConsecutiveCorrect(newConsCorrect);
    setConsecutiveWrong(newConsWrong);

    let newLevel = currentLevel;
    if (newConsCorrect >= 2 && currentLevel < 5) {
      newLevel = currentLevel + 1;
      newConsCorrect = 0;
      setConsecutiveCorrect(0);
    } else if (newConsWrong >= 2 && currentLevel > 0) {
      newLevel = currentLevel - 1;
      newConsWrong = 0;
      setConsecutiveWrong(0);
    }
    setCurrentLevel(newLevel);
  }

  function next() {
    if (qi + 1 >= TOTAL_QUESTIONS) {
      finishTest();
      return;
    }
    setQi(qi + 1);
    setPicked(null);
  }

  function finishTest() {
    // Calculate final level using weighted scoring
    // Higher levels worth more, need to sustain performance
    let weightedScore = 0;
    let maxPossible = 0;
    const skills = { grammar: { correct: 0, total: 0 }, vocab: { correct: 0, total: 0 }, reading: { correct: 0, total: 0 }, pragmatics: { correct: 0, total: 0 } };

    history.forEach(h => {
      const weight = h.level + 1; // A1=1, C2=6
      if (h.correct) weightedScore += weight;
      maxPossible += weight;
      if (skills[h.type]) {
        skills[h.type].total++;
        if (h.correct) skills[h.type].correct++;
      }
    });

    // Determine level: find highest level where accuracy >= 60%
    let detectedLevel = 0;
    for (let lvl = 5; lvl >= 0; lvl--) {
      if (levelAttempts[lvl] >= 2) {
        const acc = levelScores[lvl] / levelAttempts[lvl];
        if (acc >= 0.6) {
          detectedLevel = lvl;
          break;
        }
      }
    }

    // Also consider weighted score as secondary signal
    const weightedPct = maxPossible > 0 ? weightedScore / maxPossible : 0;
    const weightedLevel = Math.min(5, Math.floor(weightedPct * 6));

    // Final level: average of both signals, biased toward sustained performance
    const computed = Math.round(detectedLevel * 0.7 + weightedLevel * 0.3);

    setFinalLevel(computed);
    setSkillBreakdown(skills);
    setPhase("result");

    // Save result
    const result = {
      date: gtd(),
      level: computed,
      levelCode: CEFR_LEVELS[computed].code,
      weightedPct: Math.round(weightedPct * 100),
      skills,
      duration: Math.round((Date.now() - startTime) / 1000),
      levelScores: { ...levelScores },
      levelAttempts: { ...levelAttempts },
    };
    (async () => {
      try {
        const r = await userStorage.get("level-test-results");
        const results = r && r.value ? JSON.parse(r.value) : [];
        results.push(result);
        await userStorage.set("level-test-results", JSON.stringify(results));
        await userStorage.delete("checkpoint-level"); // clear checkpoint on completion
        if (onComplete) onComplete(result);
      } catch (e) {}
    })();
  }

  // INTRO SCREEN
  if (phase === "intro") return (
    <div style={{ animation: "fadeUp .4s", textAlign: "center" }}>
      <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-4)" }}></div>
      <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, background: "linear-gradient(135deg,var(--c-accent),var(--c-success))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "var(--sp-3)" }}>قياس مستوى التمكّن</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2, marginBottom: "var(--sp-5)" }}>
        اختبار تكيّفي يقيس مستواك الحقيقي بدقة
        <br />يغطي: القواعد، المفردات، فهم القراءة، التواصل المهني
        <br />معتمد على معايير CEFR العالمية (A1 → C2)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-2)", marginBottom: "var(--sp-5)", textAlign: "right" }}>
        {[
          { label: "قواعد اللغة", desc: "تركيب الجمل والأزمنة", color: "#3b82f6" },
          { label: "المفردات", desc: "معاني الكلمات واستخدامها", color: "#8b5cf6" },
          { label: "فهم القراءة", desc: "فهم النصوص والسياق", color: "#f59e0b" },
          { label: "التواصل", desc: "الرد المناسب في مواقف الحياة", color: "#10b981" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ marginBottom: 0, padding: "var(--sp-4)", borderRight: "3px solid " + s.color }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-text)", marginBottom: "var(--sp-1)" }}>{s.label}</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", borderRadius: "var(--r-md)", padding: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)", fontWeight: 600 }}>— {TOTAL_QUESTIONS} سؤال — حوالي ١٠ دقائق</div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginTop: "var(--sp-1)" }}>الأسئلة تتكيّف مع مستواك — تزداد صعوبة إذا أجبت صح</div>
      </div>
      <button onClick={startTest} style={{ padding: "12px 36px", borderRadius: "var(--r-lg)", border: "none", background: "linear-gradient(135deg,var(--c-accent),var(--c-success))", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-base)", fontWeight: 700, cursor: "pointer" }}>ابدأ القياس </button>
    </div>
  );

  // RESULT SCREEN
  if (phase === "result" && finalLevel !== null) {
    const lvl = CEFR_LEVELS[finalLevel];
    const totalCorrect = history.filter(h => h.correct).length;
    return (
      <div style={{ animation: "fadeUp .4s" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--sp-5)" }}>
          <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-2)" }}></div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>مستواك في اللغة الإنجليزية</div>
          <div style={{ display: "inline-block", padding: "12px 32px", borderRadius: "var(--r-xl)", background: lvl.color + "18", border: "2px solid " + lvl.color + "40" }}>
            <div style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: lvl.color, fontFamily: "inherit" }}>{lvl.code}</div>
            <div style={{ fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--c-text)" }}>{lvl.name}</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{lvl.nameEn}</div>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)", lineHeight: 2 }}>{lvl.desc}</div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
          <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-3)" }}>نصيحة لك</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2 }}>{lvl.tip}</div>
        </div>

        {/* Skill breakdown */}
        <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
          <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-3)" }}>تحليل المهارات</div>
          {skillBreakdown && Object.keys(skillBreakdown).map(skill => {
            const s = skillBreakdown[skill];
            if (s.total === 0) return null;
            const pct = Math.round((s.correct / s.total) * 100);
            const barColor = pct >= 80 ? "#059669" : pct >= 50 ? "#1d4ed8" : "#dc2626";
            return (
              <div key={skill} style={{ marginBottom: "var(--sp-3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-1)" }}>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text)" }}>{TYPE_ICONS[skill]} {TYPE_LABELS[skill]}</div>
                  <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: barColor, fontFamily: "inherit" }}>{pct}%</div>
                </div>
                <div style={{ height: 6, borderRadius: "var(--r-sm)", background: "var(--c-border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", borderRadius: "var(--r-sm)", background: barColor, transition: "width .5s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Level breakdown */}
        <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
          <div style={{ className: "section-title" }}>الأداء حسب المستوى</div>
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-end" }}>
            {CEFR_LEVELS.map((l, i) => {
              const att = levelAttempts[i];
              const sc = levelScores[i];
              const pct = att > 0 ? Math.round((sc / att) * 100) : 0;
              const isFinal = i === finalLevel;
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: att > 0 ? (pct >= 60 ? "#059669" : "#dc2626") : "#a1a1aa", marginBottom: "var(--sp-1)" }}>{att > 0 ? pct + "%" : "—"}</div>
                  <div style={{ height: Math.max(att > 0 ? pct * 0.6 : 4, 4), borderRadius: "var(--r-sm)", background: att > 0 ? l.color : "#e4e4e7", border: isFinal ? "2px solid #1d4ed8" : "none", transition: "height .3s" }} />
                  <div style={{ fontSize: "var(--fs-xs)", fontWeight: isFinal ? 800 : 600, color: isFinal ? "#fff" : "#71717a", marginTop: "var(--sp-1)" }}>{l.code}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "var(--r-md)", padding: "var(--sp-3)", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-accent)", fontFamily: "inherit" }}>{totalCorrect}/{history.length}</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>إجابات صحيحة</div>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "var(--r-md)", padding: "var(--sp-3)", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-accent)", fontFamily: "inherit" }}>{Math.round((Date.now() - startTime) / 1000)}s</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>الوقت</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "var(--sp-4)" }}>
          <button onClick={() => { setPhase("intro"); setQi(0); setPicked(null); setCurrentLevel(2); setHistory([]); setQuestions([]); setLevelScores({0:0,1:0,2:0,3:0,4:0,5:0}); setLevelAttempts({0:0,1:0,2:0,3:0,4:0,5:0}); setConsecutiveCorrect(0); setConsecutiveWrong(0); setFinalLevel(null); setSkillBreakdown(null); }} style={{ padding: "10px 24px", borderRadius: "var(--r-md)", border: "none", background: "linear-gradient(135deg,var(--c-accent),var(--c-success))", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>أعد الاختبار</button>
        </div>
      </div>
    );
  }

  // TESTING SCREEN
  const currentQ = getNextQuestion();
  if (!currentQ) { finishTest(); return null; }
  const { opts: qOpts, correctIndex: qAns } = shuffleOpts(currentQ.opts, currentQ.ans, qi * 31 + 97 + currentQ._level * 7);
  const displayQ = { ...currentQ, opts: qOpts, ans: qAns };
  const levelInfo = CEFR_LEVELS[currentQ._level];
  const progress = Math.round(((qi + 1) / TOTAL_QUESTIONS) * 100);

  return (
    <div style={{ animation: "fadeUp .4s" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: "var(--sp-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-2)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (qi + 1) + "/" + TOTAL_QUESTIONS}</div>
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
            <div style={{ fontSize: "var(--fs-xs)", padding: "2px 8px", borderRadius: "var(--r-sm)", background: levelInfo.color + "18", color: levelInfo.color, fontWeight: 700 }}>{levelInfo.code}</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{TYPE_ICONS[currentQ.type]} {TYPE_LABELS[currentQ.type]}</div>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: "var(--r-sm)", background: "var(--c-border)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: progress + "%", borderRadius: "var(--r-sm)", background: "var(--c-accent)", transition: "width .3s" }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
        <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.9, color: "var(--c-text)" }}>{displayQ.q}</div>
        {currentQ.audio && <div style={{ textAlign: "center", marginTop: "var(--sp-2)" }}><button onClick={() => speak(currentQ.audio, 0.85)} className="btn btn--primary btn--sm">استمع مرة ثانية</button></div>}
      </div>

      {/* Options */}
      {displayQ.opts.map((o, oi) => {
        const show = picked !== null;
        const isCorrect = oi === displayQ.ans;
        const isPicked = picked === oi;
        let bg = "rgba(0,0,0,0.02)", brd = "rgba(0,0,0,0.03)";
        if (show && isCorrect) { bg = "rgba(5,150,105,0.12)"; brd = "rgba(5,150,105,0.3)"; }
        else if (show && isPicked && !isCorrect) { bg = "rgba(220,38,38,0.12)"; brd = "rgba(217,119,6,0.3)"; }
        return (
          <div key={oi} onClick={() => !show && pick(oi)} style={{ padding: "var(--sp-3)", borderRadius: "var(--r-md)", marginBottom: "var(--sp-2)", cursor: show ? "default" : "pointer", fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", lineHeight: 1.7, background: bg, border: "1px solid " + brd, opacity: show && !isCorrect && !isPicked ? 0.3 : 1, transition: ".2s" }}>
            {o}
            {show && isCorrect && <span style={{ color: "var(--c-success)", fontSize: "var(--fs-xs)" }}> </span>}
            {show && isPicked && !isCorrect && <span style={{ color: "var(--c-error)", fontSize: "var(--fs-xs)" }}> ✗</span>}
          </div>
        );
      })}

      {/* Explanation after answer */}
      {picked !== null && (
        <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: picked === displayQ.ans ? "#059669" : "#dc2626", marginBottom: "var(--sp-2)", fontWeight: 600 }}>
            {picked === displayQ.ans ? "✓ إنجاز رائع!" : "✗ محاولة ممتازة — لاحظ الفرق"}
          </div>
          <button onClick={next} style={{ padding: "8px 24px", borderRadius: "var(--r-md)", border: "none", background: "linear-gradient(135deg,var(--c-accent),var(--c-success))", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer" }}>
            {qi + 1 >= TOTAL_QUESTIONS ? "🏁 عرض النتيجة" : "التالي ←"}
          </button>
        </div>
      )}
    </div>
  );
}

function MainApp({ currentUser, onLogout }) {
  const [store, setStore] = useState({ start: null, days: {} });
  const [tab, setTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [openTask, setOpenTask] = useState(null);
  const [tmOn, setTmOn] = useState(false);
  const [tmSec, setTmSec] = useState(0);
  const [tmMax, setTmMax] = useState(0);
  const [conf, setConf] = useState(false);
  const [pCat, setPCat] = useState(0);
  const [reps, setReps] = useState({});
  const [trainMode, setTrainMode] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [levelResult, setLevelResult] = useState(null);
  const [srsData, setSrsData] = useState({});
  const [sessionHistory, setSessionHistory] = useState([]);
  const [chosenScenario, setChosenScenario] = useState(null);
  const [xp, setXp] = useState(0);
  const [showXpPop, setShowXpPop] = useState(null);
  const [onboardStep, setOnboardStep] = useState(0);
  const [userChallenge, setUserChallenge] = useState(null); // "+15 تمكّن" popup
  const [pendingCheckpoints, setPendingCheckpoints] = useState(null); // { session, quiz, level }
  const tmRef = useRef(null);

  useEffect(() => {
    (async () => {
      try { const r = await userStorage.get(DK); if (r && r.value) setStore(JSON.parse(r.value)); } catch (e) {}
      try { const r = await userStorage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); } catch (e) {}
      try { const r = await userStorage.get("level-test-results"); if (r && r.value) { const arr = JSON.parse(r.value); if (arr.length > 0) setLevelResult(arr[arr.length - 1]); } } catch (e) {}
      try { const r = await userStorage.get("srs-data"); if (r && r.value) setSrsData(JSON.parse(r.value)); } catch (e) {}
      try { const r = await userStorage.get("session-history"); if (r && r.value) setSessionHistory(JSON.parse(r.value)); } catch (e) {}
      try { const r = await userStorage.get("user-xp"); if (r && r.value) setXp(parseInt(r.value) || 0); } catch (e) {}
      try { const r = await userStorage.get("phrase-reps"); if (r && r.value) setReps(JSON.parse(r.value)); } catch (e) {}
      // Load any pending checkpoints for crash recovery
      const cps = {};
      try { const r = await userStorage.get("checkpoint-session"); if (r && r.value) { const d = JSON.parse(r.value); if (d.date === gtd()) cps.session = d; else await userStorage.delete("checkpoint-session"); } } catch (e) {}
      try { const r = await userStorage.get("checkpoint-quiz"); if (r && r.value) { const d = JSON.parse(r.value); if (d.date === gtd()) cps.quiz = d; else await userStorage.delete("checkpoint-quiz"); } } catch (e) {}
      try { const r = await userStorage.get("checkpoint-level"); if (r && r.value) { const d = JSON.parse(r.value); if (d.date === gtd()) cps.level = d; else await userStorage.delete("checkpoint-level"); } } catch (e) {}
      if (cps.session || cps.quiz || cps.level) setPendingCheckpoints(cps);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (quizResults === null && !loading) {
      (async () => { try { const r = await userStorage.get("quiz-results"); if (r && r.value) setQuizResults(JSON.parse(r.value)); else setQuizResults([]); } catch (e) { setQuizResults([]); } })();
    }
  }, [quizResults, loading]);

  // Persist phrase reps on change
  const repsInitRef = useRef(false);
  useEffect(() => {
    if (!repsInitRef.current) { repsInitRef.current = true; return; } // skip initial render
    if (Object.keys(reps).length === 0) return;
    (async () => { try { await userStorage.set("phrase-reps", JSON.stringify(reps)); } catch(e) {} })();
  }, [reps]);

  const save = useCallback(async (s) => { setStore(s); try { await userStorage.set(DK, JSON.stringify(s)); } catch (e) {} }, []);
  const today = gtd();
  const done = store.days[today] || [];
  const toggle = useCallback((id) => {
    const d = store.days[today] || [];
    const nd = d.includes(id) ? d.filter(x => x !== id) : [...d, id];
    save({ ...store, days: { ...store.days, [today]: nd } });
    if (!d.includes(id) && nd.length >= 5) { setConf(true); setTimeout(() => setConf(false), 3000); }
  }, [store, save, today]);
  const startTm = useCallback((m) => {
    if (tmRef.current) clearInterval(tmRef.current);
    setTmMax(m * 60); setTmSec(0); setTmOn(true);
    tmRef.current = setInterval(() => { setTmSec(p => { if (p + 1 >= m * 60) { clearInterval(tmRef.current); setTmOn(false); return m * 60; } return p + 1; }); }, 1000);
  }, []);

  if (loading) return <><style>{CSS}</style><SplashScreen /></>;

  // ===== ONBOARDING =====
  if (!store.start) return (
    <div dir="rtl" className="onboard-wrapper" style={{ fontFamily: "inherit" }}>
      <style>{CSS}</style>
      <div className="onboard-card">

        {/* Step indicator */}
        {onboardStep > 0 && <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-7)", justifyContent: "center" }}>
          {[1,2,3,4,5].map(s => (
            <div key={s} style={{ width: s <= onboardStep ? 24 : 8, height: 8, borderRadius: "var(--r-full)", background: s <= onboardStep ? "var(--c-accent)" : "var(--c-surface-sunken)", transition: "all 0.3s ease", boxShadow: s === onboardStep ? "0 0 8px rgba(29,78,216,0.3)" : "none" }} />
          ))}
        </div>}

        {/* Screen 1: Hook */}
        {onboardStep === 0 && <div style={{ textAlign: "center", animation: "fadeUp .4s" }}>
          <div style={{ marginBottom: "var(--sp-7)" }}><TaliqLogo size={48} /></div>
          <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-text)", lineHeight: 1.7, marginBottom: "var(--sp-4)" }}>تملك المعرفة...<br/>لكن الكلمات تتوقف عند لسانك؟</h1>
          <p style={{ fontSize: "var(--fs-base)", color: "var(--c-text-secondary)", lineHeight: 1.9, marginBottom: "var(--sp-7)" }}>تقرأ وتفهم الإنجليزي جيداً، لكن عندما يحين وقت التحدث — تتردد.<br/><b style={{ color: "var(--c-accent)" }}>ليست مشكلة قدرات. إنها مشكلة طريقة.</b></p>
          <button className="btn btn--primary btn--lg btn--full" onClick={() => setOnboardStep(1)}>هذا ما أعانيه بالضبط</button>
        </div>}

        {/* Screen 2: Method */}
        {onboardStep === 1 && <div style={{ animation: "fadeUp .4s" }}>
          <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-text)", lineHeight: 1.7, marginBottom: "var(--sp-5)", textAlign: "center" }}>طَلِق مبني على علم الاكتساب — ليس الحفظ</h1>
          <div className="card" style={{ marginBottom: "var(--sp-5)" }}>
            <div style={{ fontSize: "var(--fs-base)", lineHeight: 2.2 }}>
              <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "baseline", marginBottom: "var(--sp-3)", color: "var(--c-text-tertiary)" }}><span style={{ color: "var(--c-text-muted)", flexShrink: 0 }}>—</span> الكورسات التقليدية تعلّمك <b>قواعد تنساها</b></div>
              <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "baseline", marginBottom: "var(--sp-3)", color: "var(--c-text-tertiary)" }}><span style={{ color: "var(--c-text-muted)", flexShrink: 0 }}>—</span> التطبيقات الأخرى تعلّمك <b>ترجمة لا تحتاجها</b></div>
              <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "baseline", color: "var(--c-success)", fontWeight: 600 }}><span style={{ flexShrink: 0 }}>+</span> طَلِق يُدرّب لسانك على <b>مواقف حقيقية من حياتك</b></div>
            </div>
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)", textAlign: "center", marginBottom: "var(--sp-6)" }}>مبني على أبحاث جامعية في اكتساب اللغة الثانية للكبار</p>
          <button className="btn btn--primary btn--lg btn--full" onClick={() => setOnboardStep(2)}>كيف يعمل؟</button>
        </div>}

        {/* Screen 3: Daily Investment */}
        {onboardStep === 2 && <div style={{ animation: "fadeUp .4s" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--sp-6)" }}>
            <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-text)", lineHeight: 1.7, marginBottom: "var(--sp-2)" }}>١٥ دقيقة يومياً</h1>
            <p style={{ fontSize: "var(--fs-base)", color: "var(--c-text-secondary)" }}>جلسة واحدة — ست خطوات — نتائج حقيقية</p>
          </div>
          <div style={{ marginBottom: "var(--sp-6)" }}>
            {[
              { num: "١", text: "استمع", desc: "درّب أذنك بدون قراءة" },
              { num: "٢", text: "اقرأ", desc: "لاحظ ما فاتك في الاستماع" },
              { num: "٣", text: "ردّد", desc: "دع لسانك يتعوّد على الجمل" },
              { num: "٤", text: "تذكّر", desc: "استرجع من ذاكرتك بدون مساعدة" },
              { num: "٥", text: "أنتج", desc: "عبّر بأسلوبك الخاص" },
              { num: "٦", text: "طبّق", desc: "تحدٍّ حقيقي تُنجزه اليوم" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", padding: "var(--sp-3) 0", borderBottom: i < 5 ? "1px solid var(--c-border-light)" : "none", animation: "slideIn .3s " + (i * 0.06) + "s both" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--c-accent-light)", color: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-sm)", fontWeight: 700, flexShrink: 0 }}>{s.num}</div>
                <div><span style={{ fontSize: "var(--fs-base)", fontWeight: 600, color: "var(--c-text)" }}>{s.text}</span><span style={{ color: "var(--c-text-tertiary)", marginRight: "var(--sp-2)" }}> — {s.desc}</span></div>
              </div>
            ))}
          </div>
          <button className="btn btn--primary btn--lg btn--full" onClick={() => setOnboardStep(3)}>هذا ما أبحث عنه</button>
        </div>}

        {/* Screen 4: Goal Selection */}
        {onboardStep === 3 && <div style={{ animation: "fadeUp .4s" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--sp-6)" }}>
            <h1 style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-text)", lineHeight: 1.7, marginBottom: "var(--sp-2)" }}>ما هدفك من إتقان الإنجليزية؟</h1>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)" }}>سنُصمّم رحلتك بناءً على إجابتك</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {[
              { id: "lead", text: "قيادة الاجتماعات والعروض بثقة", sub: "التواصل المهني والقيادي" },
              { id: "global", text: "التواصل مع شركاء وعملاء دوليين", sub: "بناء علاقات عمل عالمية" },
              { id: "travel", text: "السفر والتعامل باستقلالية تامة", sub: "فنادق، مطارات، مطاعم، أسواق" },
              { id: "grow", text: "تطوير الذات والارتقاء المهني", sub: "كسر حاجز كان يعيقني سنوات" },
            ].map(c => (
              <button key={c.id} onClick={() => { setUserChallenge(c.id); setOnboardStep(4); }} className="card" style={{ cursor: "pointer", textAlign: "right", border: "1px solid var(--c-border)", padding: "var(--sp-5)", marginBottom: 0, transition: "border-color 0.2s, box-shadow 0.2s" }}>
                <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-text)", marginBottom: "var(--sp-1)" }}>{c.text}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)" }}>{c.sub}</div>
              </button>
            ))}
          </div>
        </div>}

        {/* Screen 5: Social Proof */}
        {onboardStep === 4 && <div style={{ animation: "fadeUp .4s" }}>
          <p style={{ fontSize: "var(--fs-base)", fontWeight: 600, color: "var(--c-text-secondary)", textAlign: "center", marginBottom: "var(--sp-6)" }}>تجارب أشخاص مثلك</p>
          {[
            { name: "خالد، مدير مشاريع", text: "كنت أتردد في كل اجتماع. بعد أسبوعين مع طَلِق، صرت أفتح الاجتماع وأقوده بثقة." },
            { name: "نورة، أم لثلاثة أطفال", text: "الآن أتواصل مع معلمات أطفالي بالإنجليزي. الحرج اختفى تماماً." },
            { name: "فهد، رجل أعمال", text: "في آخر رحلة عمل، تفاوضت وأنجزت كل شيء بالإنجليزي. شعور لا يُوصف." },
          ].map((s, i) => (
            <div key={i} className="card" style={{ animation: "slideIn .3s " + (i * 0.1) + "s both" }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>{s.name}</div>
              <div style={{ fontSize: "var(--fs-base)", color: "var(--c-text-secondary)", lineHeight: 1.9 }}>"{s.text}"</div>
            </div>
          ))}
          <button className="btn btn--primary btn--lg btn--full" style={{ marginTop: "var(--sp-4)" }} onClick={() => setOnboardStep(5)}>أنا جاهز</button>
        </div>}

        {/* Screen 6: Commitment */}
        {onboardStep === 5 && <div style={{ textAlign: "center", animation: "fadeUp .4s" }}>
          <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-text)", lineHeight: 1.7, marginBottom: "var(--sp-5)" }}>عهد مع نفسك</h1>
          <div className="card card--accent" style={{ padding: "var(--sp-6)", marginBottom: "var(--sp-6)", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-md)", color: "var(--c-text)", lineHeight: 2, marginBottom: "var(--sp-3)" }}>أُعاهد نفسي أن أستثمر <b style={{ color: "var(--c-accent)" }}>١٥ دقيقة يومياً</b><br/>لمدة أسبوع واحد فقط.<br/>لن أحكم على النتائج قبل ٧ أيام.</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)" }}>من يلتزم علناً يُكمل ٣ أضعاف من لا يفعل — أبحاث سلوكية</div>
          </div>
          <button className="btn btn--primary btn--lg btn--full" onClick={() => { save({ ...store, start: gtd(), challenge: userChallenge, committed: true }); }}>أنا ملتزم — ابدأ الآن</button>
          <button className="btn btn--ghost btn--full" style={{ marginTop: "var(--sp-3)" }} onClick={() => { save({ ...store, start: gtd(), challenge: userChallenge }); }}>أبدأ بدون التزام</button>
        </div>}

      </div>
    </div>
  );

  const wk = getWk(store.start), ph = getPh(wk), dn = gdn(), dw = gdow();
  // Adapt content difficulty based on level test result
  const adaptedPhase = (() => {
    if (!levelResult || levelResult.level === undefined) return ph;
    const lvl = levelResult.level; // 0=A1 ... 5=C2
    if (lvl <= 1) return { ...ph, n: 1, gap: "var(--sp-2)" }; // A1-A2: slow
    if (lvl <= 3) return { ...ph, n: 2, gap: "var(--sp-1)" }; // B1-B2: medium
    return { ...ph, n: 3, gap: "var(--sp-1)" }; // C1-C2: fast
  })();
  const pct = done.includes("session") ? 100 : 0;

  // ===== SMART SCENARIO ROTATION =====
  // Priority: forgotten scenarios → unseen scenarios → oldest reviewed
  const todayScenario = (() => {
    if (!sessionHistory.length) return DAILY_SCENARIOS[dn % DAILY_SCENARIOS.length];

    // Find scenarios that had forgotten phrases (need review)
    const needsReview = [];
    const seen = new Set();
    sessionHistory.forEach(s => {
      seen.add(s.scenario);
      const rs = s.recallScore || {};
      const forgotCount = Object.values(rs).filter(v => v === "forgot").length;
      const partialCount = Object.values(rs).filter(v => v === "partial").length;
      if (forgotCount > 0 || partialCount > 1) {
        needsReview.push({ title: s.scenario, score: forgotCount * 2 + partialCount, date: s.date });
      }
    });

    // Don't repeat today's completed scenario
    const todayCompleted = sessionHistory.filter(s => s.date === today).map(s => s.scenario);

    // 1. Priority: review forgotten scenarios (not done today)
    const reviewable = needsReview
      .filter(r => !todayCompleted.includes(r.title))
      .sort((a, b) => b.score - a.score);
    if (reviewable.length > 0) {
      const target = reviewable[0].title;
      const found = DAILY_SCENARIOS.find(s => s.title === target);
      if (found) return found;
    }

    // 2. Next: show unseen scenarios
    const unseen = DAILY_SCENARIOS.filter(s => !seen.has(s.title) && !todayCompleted.includes(s.title));
    if (unseen.length > 0) return unseen[dn % unseen.length];

    // 3. Fallback: cycle through all (oldest first)
    const available = DAILY_SCENARIOS.filter(s => !todayCompleted.includes(s.title));
    return available.length > 0 ? available[dn % available.length] : DAILY_SCENARIOS[dn % DAILY_SCENARIOS.length];
  })();
  const Card = ({ children, s, cls }) => <div className={"card" + (cls ? " " + cls : "")} style={s}>{children}</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", fontFamily: "inherit" }}>
      <style>{CSS}</style>
      {/* Completion toast */}
      {conf && <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "var(--sp-3) 0", background: "var(--c-success)", color: "#fff", textAlign: "center", fontWeight: 600, fontSize: "var(--fs-base)", animation: "fadeUp .3s" }}>جلسة اليوم مكتملة</div>}

      <div className="app-container">
        {/* Notification toast */}
        {showXpPop && <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "var(--sp-3) var(--sp-5)", borderRadius: "var(--r-md)", background: "var(--c-surface)", border: "1px solid var(--c-border)", boxShadow: "var(--sh-lg)", color: "var(--c-text)", fontWeight: 600, fontSize: "var(--fs-base)", animation: "fadeUp .3s" }}>{showXpPop}</div>}

        {/* Header */}
        <header className="header">
          <div>
            <TaliqLogo size={32} />
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-tertiary)", marginTop: "var(--sp-1)" }}>{"الأسبوع " + wk + " من 12" + (levelResult ? " · " + levelResult.levelCode : "")}</div>
          </div>
          <div className="header__badges">
            {(() => { let s = 0; const d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 1) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s > 0 ? <span className="badge badge--success">{s} يوم متواصل</span> : null; })()}
            <span className="badge">{xp} نقطة</span>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="tabs">
          {[["today", "اليوم"], ["train", "تدريب"], ["phrases", "الجمل"], ["progress", "التقدم"]].map(([id, l]) => (
            <button key={id} onClick={() => { setTab(id); setOpenTask(null); setTrainMode(null); }} className={"tab" + (tab === id ? " tab--active" : "")}>{l}</button>
          ))}
        </nav>

        {/* CRASH RECOVERY — Resume Banner */}
        {pendingCheckpoints && (
          <div style={{ background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.2)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-4)", animation: "fadeUp .4s" }}>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>عندك نشاط لم يكتمل</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              {pendingCheckpoints.session && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: "var(--r-sm)", padding: "8px 12px" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)" }}>{"جلسة: " + pendingCheckpoints.session.scenario}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"الخطوة " + (pendingCheckpoints.session.step + 1) + "/6"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <button onClick={() => {
                      const cp = pendingCheckpoints.session;
                      const sc = DAILY_SCENARIOS.find(s => s.title === cp.scenario);
                      if (sc) { setChosenScenario(sc); setTab("today"); }
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.session; return Object.keys(n).length ? n : null; });
                    }} className="btn btn--primary btn--sm">كمّل</button>
                    <button onClick={() => {
                      (async () => { try { await userStorage.delete("checkpoint-session"); } catch(e) {} })();
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.session; return Object.keys(n).length ? n : null; });
                    }} className="btn btn--ghost btn--sm">ابدأ من جديد</button>
                  </div>
                </div>
              )}
              {pendingCheckpoints.quiz && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: "var(--r-sm)", padding: "8px 12px" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)" }}>{"اختبار أسبوعي"}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (pendingCheckpoints.quiz.qi + 1) + "/10 — " + pendingCheckpoints.quiz.score + " صحيح"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <button onClick={() => {
                      setTab("train"); setTrainMode("quiz");
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.quiz; return Object.keys(n).length ? n : null; });
                    }} className="btn btn--primary btn--sm">كمّل</button>
                    <button onClick={() => {
                      (async () => { try { await userStorage.delete("checkpoint-quiz"); } catch(e) {} })();
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.quiz; return Object.keys(n).length ? n : null; });
                    }} className="btn btn--ghost btn--sm">ابدأ من جديد</button>
                  </div>
                </div>
              )}
              {pendingCheckpoints.level && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: "var(--r-sm)", padding: "8px 12px" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)" }}>{"اختبار المستوى"}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (pendingCheckpoints.level.qi + 1) + "/25"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <button onClick={() => {
                      setTab("train"); setTrainMode("level");
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.level; return Object.keys(n).length ? n : null; });
                    }} className="btn btn--primary btn--sm">كمّل</button>
                    <button onClick={() => {
                      (async () => { try { await userStorage.delete("checkpoint-level"); } catch(e) {} })();
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.level; return Object.keys(n).length ? n : null; });
                    }} className="btn btn--ghost btn--sm">ابدأ من جديد</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TODAY — Deep Processing Session */}
        {tab === "today" && (
          <div>
            {/* Hero — Today's Session */}
            <div className="hero-card">
              <p className="hero-quote">{MOTIV[dn % MOTIV.length]}</p>
              <h2>{"جلسة اليوم: " + todayScenario.title}</h2>
              <p>مقترح بناءً على تقدمك — اختر سيناريو آخر أدناه</p>
            </div>
            {/* Scenario picker */}
            <div className="pill-scroll" style={{ marginBottom: "var(--sp-5)" }}>
              {DAILY_SCENARIOS.slice(0, 14).map((s, i) => (
                <button key={i} onClick={() => { setChosenScenario(s); }} className={"pill" + ((chosenScenario || todayScenario).title === s.title ? " pill--active" : "")}>{s.title}</button>
              ))}
            </div>
            <Card>
              <DailySession
                scenario={chosenScenario || todayScenario}
                dayNum={dn}
                sessionHistory={sessionHistory}
                checkpoint={pendingCheckpoints && pendingCheckpoints.session && pendingCheckpoints.session.scenario === (chosenScenario || todayScenario).title ? pendingCheckpoints.session : undefined}
                onComplete={() => {
                  const d = store.days[today] || [];
                  if (!d.includes("session")) {
                    save({ ...store, days: { ...store.days, [today]: [...d, "session"] } });
                    setConf(true); setTimeout(() => setConf(false), 3000);
                    // Award تمكّن + variable surprise rewards
                    const sessCount = sessionHistory.length + 1;
                    const bonus = sessCount % 5 === 0 ? 50 : sessCount % 3 === 0 ? 15 : 0;
                    const earned = 25 + bonus;
                    const newXp = xp + earned;
                    setXp(newXp);
                    // Variable reward messages (surprise = dopamine spike)
                    const surprises = [
                      null, null, // normal
                      " إنجاز: أول ٣ جلسات متتالية!",
                      null,
                      "حفظت ١٥ جملة — أكثر من معظم متعلمي اللغة",
                      null, null,
                      "أسبوع كامل — عقلك بدأ يبني مسارات عصبية جديدة",
                      null, null,
                      "١٠ جلسات! صرت تعرف ٣٠ جملة تقدر تستخدمها في أي مكان",
                      null, null, null,
                      "أسبوعين — منطقة الكلام في دماغك صارت أنشط",
                    ];
                    const surprise = surprises[Math.min(sessCount - 1, surprises.length - 1)];
                    setShowXpPop(surprise || ("+" + earned + " تمكّن " + (bonus > 0 ? " — مكافأة" : "")));
                    setTimeout(() => setShowXpPop(null), surprise ? 4000 : 2000);
                    (async () => { try { await userStorage.set("user-xp", String(newXp)); } catch(e) {} })();
                  }
                  (async () => { try { const r = await userStorage.get("session-history"); if (r && r.value) setSessionHistory(JSON.parse(r.value)); } catch(e) {} })();
                }}
              />
            </Card>
            {done.includes("session") && <Card cls="card--success">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "var(--fs-base)", color: "var(--c-success)", fontWeight: 700, marginBottom: "var(--sp-1)" }}>إنجاز اليوم مكتمل</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)" }}>هل ترغب في تمارين إضافية؟ زر تبويب التدريب</div>
              </div>
            </Card>}
            {/* FIX 6: Surprise Quiz — random phrase from past sessions */}
            {sessionHistory.length >= 3 && dn % 3 === 0 && (() => {
              const pastSc = DAILY_SCENARIOS.find(s => s.title === sessionHistory[Math.floor(Math.random() * sessionHistory.length)]?.scenario);
              if (!pastSc) return null;
              const phrase = pastSc.keyPhrases[dn % pastSc.keyPhrases.length];
              return <Card cls="card--warn">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-warn)", marginBottom: "var(--sp-2)" }}>اختبار مراجعة</div>
                  <div style={{ fontSize: "var(--fs-base)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-3)" }}>تذكر هذه الجملة من جلسة سابقة؟</div>
                  <div style={{ fontSize: "var(--fs-md)", color: "var(--c-accent)", fontWeight: 600, marginBottom: "var(--sp-2)" }}>{phrase.ar}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)", marginBottom: "var(--sp-3)" }}>حاول قولها بالإنجليزي قبل الكشف</div>
                  <details>
                    <summary style={{ fontSize: "var(--fs-sm)", color: "var(--c-success)", cursor: "pointer", fontFamily: "inherit" }}>أظهر الجواب</summary>
                    <div className="text-mono" style={{ fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.8, color: "var(--c-text)", marginTop: "var(--sp-2)", display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                      <span style={{ flex: 1 }}>{phrase.en}</span>
                      <SpeakBtn text={phrase.en} size={16} />
                    </div>
                  </details>
                </div>
              </Card>;
            })()}
            {/* FIX 2: Evening Review — 3 min before sleep = 2x consolidation */}
            {done.includes("session") && <Card cls="card--accent">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-2)" }}>مراجعة ما قبل النوم</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 1.9, marginBottom: "var(--sp-4)" }}>استمع لجمل اليوم قبل النوم — ٣ دقائق فقط. عقلك يرسّخها أثناء النوم.</div>
                <button className="btn btn--primary" onClick={() => {
                  const sc2 = chosenScenario || todayScenario;
                  let idx = 0;
                  function playNext() {
                    if (idx >= sc2.keyPhrases.length) return;
                    speak(sc2.keyPhrases[idx].en, 0.75);
                    idx++;
                    setTimeout(playNext, 4000);
                  }
                  playNext();
                }}>شغّل جمل اليوم</button>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)", marginTop: "var(--sp-2)" }}>استرخِ واستمع فقط</div>
              </div>
            </Card>}
          </div>
        )}

        {/* TRAINING */}
        {tab === "train" && (
          <div>
            {!trainMode && (() => {
              const allExercises = [
                { id: "sim", title: "محادثات تفاعلية", desc: "سيناريوهات حقيقية — اختر الرد واقرأه", accent: "#3b82f6", tag: "محادثة" },
                { id: "quick", title: "استجابة سريعة", desc: "مواقف يومية — اختر الرد الأنسب", accent: "#3b82f6", tag: "محادثة" },
                { id: "quiz", title: "تقييم أسبوعي", desc: "١٠ أسئلة تقيس تقدمك", accent: "#8b5cf6", tag: "تقييم" },
                { id: "fill", title: "أكمل الفراغ", desc: "اكتب الكلمات الناقصة", accent: "#f59e0b", tag: "كتابة" },
                { id: "build", title: "بناء جمل", desc: "رتّب الكلمات المبعثرة", accent: "#f59e0b", tag: "كتابة" },
                { id: "fluency", title: "تمرين الطلاقة", desc: "تكلم ٣ مرات بوقت أقل", accent: "#ef4444", tag: "تحدث" },
                { id: "listen", title: "فهم الاستماع", desc: "استمع وأجب", accent: "#06b6d4", tag: "استماع" },
                { id: "dictation", title: "إملاء صوتي", desc: "استمع واكتب ما سمعته", accent: "#06b6d4", tag: "استماع" },
                { id: "recall", title: "إنتاج حر", desc: "اكتب ردك بدون خيارات", accent: "#10b981", tag: "إنتاج" },
                { id: "level", title: "قياس التمكّن", desc: "اختبار CEFR تكيّفي", accent: "#8b5cf6", tag: "تقييم" },
              ];
              const ExCard = ({ m }) => (
                <div className="card" onClick={() => setTrainMode(m.id)} style={{ cursor: "pointer", marginBottom: 0, padding: 0, overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 4, background: m.accent, borderRadius: "0 var(--r-xl) var(--r-xl) 0" }} />
                  <div style={{ padding: "var(--sp-5)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-2)" }}>
                      <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-text)" }}>{m.title}</div>
                      <span style={{ fontSize: "var(--fs-xs)", padding: "2px 8px", borderRadius: "var(--r-full)", background: m.accent + "15", color: m.accent, fontWeight: 600 }}>{m.tag}</span>
                    </div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)", lineHeight: 1.6 }}>{m.desc}</div>
                  </div>
                </div>
              );
              return (
                <div>
                  <div className="section-title">مقترح لك</div>
                  <div className="exercise-grid" style={{ marginBottom: "var(--sp-6)" }}>
                    {allExercises.slice(0, 3).map(m => <ExCard key={m.id} m={m} />)}
                  </div>
                  <div className="section-title">المزيد من التمارين</div>
                  <div className="exercise-grid">
                    {allExercises.slice(3).map(m => <ExCard key={m.id} m={m} />)}
                  </div>
                </div>
              );
            })()}
            {trainMode === "sim" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><MeetingSim /></Card>}
            {trainMode === "quick" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><QuickResp /></Card>}
            {trainMode === "quiz" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><WeeklyQuiz onSave={() => setQuizResults(null)} checkpoint={pendingCheckpoints && pendingCheckpoints.quiz ? pendingCheckpoints.quiz : undefined} /></Card>}
            {trainMode === "fill" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><FillBlank /></Card>}
            {trainMode === "build" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><SentenceBuild /></Card>}
            {trainMode === "fluency" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><Fluency432 /></Card>}
            {trainMode === "listen" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><ListenExercise /></Card>}
            {trainMode === "dictation" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><DictationExercise /></Card>}
            {trainMode === "recall" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><FreeRecall /></Card>}
            {trainMode === "level" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><button className="btn btn--ghost btn--sm" onClick={() => setTrainMode(null)}>رجوع</button></div><LevelTest onComplete={(result) => setLevelResult(result)} checkpoint={pendingCheckpoints && pendingCheckpoints.level ? pendingCheckpoints.level : undefined} /></Card>}
          </div>
        )}

        {/* PHRASES */}
        {tab === "phrases" && (
          <div>
            <div className="pill-scroll" style={{ marginBottom: "var(--sp-4)" }}>
              {PHRASES.map((c, i) => (
                <button key={i} onClick={() => setPCat(i)} className={"pill" + (pCat === i ? " pill--active" : "")}>{c.cat}</button>
              ))}
            </div>
            <Card>
              <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, marginBottom: "var(--sp-3)", color: "var(--c-text)" }}>{PHRASES[pCat].cat}</div>
              {PHRASES[pCat].items.map((p, i) => {
                const k = "p" + pCat + "-" + i;
                const r = reps[k] || 0;
                const srsKey = pCat + "-" + i;
                const srsInfo = srsData[srsKey];
                const isDue = srsInfo && srsInfo.lastDate ? Math.floor((new Date(gtd()) - new Date(srsInfo.lastDate)) / 864e5) >= (srsInfo.interval || 1) : false;
                return (
                  <div key={i} onClick={() => {
                    const newR = (reps[k] || 0) + 1;
                    setReps(prev => ({ ...prev, [k]: newR }));
                    if (newR === 5) {
                      const newSrs = { ...srsData };
                      const prev2 = newSrs[srsKey] || { interval: 1, reps: 0 };
                      newSrs[srsKey] = { lastDate: gtd(), reps: (prev2.reps || 0) + 1, interval: Math.min((prev2.interval || 1) * 2, 14) };
                      setSrsData(newSrs);
                      (async () => { try { await userStorage.set("srs-data", JSON.stringify(newSrs)); } catch(e) {} })();
                    }
                  }} className={"phrase-item" + (r >= 5 ? " phrase-item--done" : isDue ? " phrase-item--review" : "")}>
                    <div className={"phrase-circle" + (r >= 5 ? " phrase-circle--done" : r > 0 ? " phrase-circle--active" : "")}>{r >= 5 ? "✓" : r}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "inherit", fontSize: "var(--fs-base)", direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{p.en}</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginTop: "var(--sp-1)" }}>{p.ar}</div>
                    </div>
                    {isDue && <div style={{ fontSize: "var(--fs-xs)", padding: "2px 6px", borderRadius: "var(--r-sm)", background: "rgba(29,78,216,0.15)", color: "var(--c-accent)", fontWeight: 600 }}>مراجعة</div>}
                  </div>
                );
              })}
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", textAlign: "center", marginTop: "var(--sp-3)" }}>اضغط على الدائرة كل مرة ترددّ — الهدف ٥ لكل جملة</div>
            </Card>
            {/* SRS Review Section */}
            {(() => {
              const todayStr = gtd();
              const dueItems = [];
              PHRASES.forEach((cat, ci) => {
                cat.items.forEach((p, pi) => {
                  const srsKey = ci + "-" + pi;
                  const data = srsData[srsKey];
                  if (data && data.lastDate) {
                    const daysSince = Math.floor((new Date(todayStr) - new Date(data.lastDate)) / 864e5);
                    if (daysSince >= (data.interval || 1)) {
                      dueItems.push({ cat: cat.cat, icon: cat.icon, phrase: p, srsKey, ci, pi, daysSince });
                    }
                  }
                });
              });
              if (dueItems.length === 0) return null;
              return (
                <Card s={{ borderColor: "rgba(29,78,216,0.15)" }}>
                  <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-3)" }}>{"🔄 مراجعة مطلوبة (" + dueItems.length + " جملة)"}</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-3)" }}>هذه الجمل حان وقت مراجعتها حسب نظام التكرار المتباعد</div>
                  {dueItems.slice(0, 5).map((item, i) => {
                    const k = "srs-" + item.srsKey;
                    const r = reps[k] || 0;
                    return (
                      <div key={i} onClick={() => {
                        const newR = (reps[k] || 0) + 1;
                        setReps(prev => ({ ...prev, [k]: newR }));
                        if (newR >= 3) {
                          const newSrs = { ...srsData };
                          const prev = newSrs[item.srsKey] || { interval: 1 };
                          newSrs[item.srsKey] = { lastDate: todayStr, reps: (prev.reps || 0) + 1, interval: Math.min((prev.interval || 1) * 2, 14) };
                          setSrsData(newSrs);
                          (async () => { try { await userStorage.set("srs-data", JSON.stringify(newSrs)); } catch(e) {} })();
                        }
                      }} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "var(--sp-3)", borderRadius: "var(--r-md)", background: r >= 5 ? "rgba(5,150,105,0.06)" : "rgba(29,78,216,0.04)", border: "1px solid " + (r >= 5 ? "rgba(5,150,105,0.15)" : "rgba(29,78,216,0.1)"), marginBottom: "var(--sp-2)", cursor: "pointer" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: r >= 5 ? "#059669" : r > 0 ? "#1d4ed8" : "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xs)", fontWeight: 700, color: r > 0 ? "#fafaf9" : "#a1a1aa", flexShrink: 0 }}>{r >= 3 ? "✓" : r}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", lineHeight: 1.7 }}>{item.phrase.en}</div>
                          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{item.phrase.ar} — {item.icon} {item.cat}</div>
                        </div>
                        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-accent)" }}>{item.daysSince + "d"}</div>
                      </div>
                    );
                  })}
                </Card>
              );
            })()}
          </div>
        )}

        {/* PROGRESS */}
        {tab === "progress" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
              {[
                { l: "أيام التدريب", v: Object.values(store.days).filter(d => d.length >= 1).length },
                { l: "الأسبوع الحالي", v: wk + "/12" },
                { l: "أيام متواصلة", v: (() => { let s = 0, d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 1) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s; })() },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card__value">{s.v}</div>
                  <div className="stat-card__label">{s.l}</div>
                </div>
              ))}
            </div>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-1)", justifyContent: "center", flexWrap: "wrap" }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                  <div key={w} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-xs)", fontWeight: 700, border: "2px solid " + (w <= wk ? "#1d4ed8" : "#e4e4e7"), background: w < wk ? "#1d4ed8" : "transparent", color: w < wk ? "#fafaf9" : w === wk ? "#1d4ed8" : "#a1a1aa", animation: "none", opacity: w > wk ? 0.2 : 1 }}>{w < wk ? "✓" : w}</div>
                ))}
              </div>
            </Card>
            {/* FIX 3: Smart Weekly Summary */}
            {sessionHistory.length >= 3 && <Card s={{ borderColor: "rgba(29,78,216,0.1)" }}>
              <div style={{ className: "section-title" }}>ملخص الأسبوع</div>
              {(() => {
                const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
                const weekStr = weekAgo.toISOString().slice(0, 10);
                const thisWeek = sessionHistory.filter(s => s.date >= weekStr);
                const totalPh = thisWeek.reduce((s, x) => s + (x.phrasesCount || 0), 0);
                const recalled = thisWeek.reduce((s, x) => { const rs = x.recallScore || {}; return s + Object.values(rs).filter(v => v === "good").length; }, 0);
                const scenarios = [...new Set(thisWeek.map(s => s.scenario))];
                const weakScenarios = thisWeek.filter(s => { const rs = s.recallScore || {}; return Object.values(rs).filter(v => v === "forgot").length > 0; }).map(s => s.scenario);
                const uniqueWeak = [...new Set(weakScenarios)];
                return (
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2.2 }}>
                    <div>{"✅ " + thisWeek.length + " جلسة هالأسبوع — " + scenarios.length + " موقف مختلف"}</div>
                    <div>{": " + totalPh + " جملة تمرّنت عليها — تذكّرت " + recalled + " منها"}</div>
                    {uniqueWeak.length > 0 && <div style={{ color: "var(--c-accent)" }}>{"🔄 تحتاج مراجعة: " + uniqueWeak.slice(0, 3).join("، ")}</div>}
                    {uniqueWeak.length === 0 && thisWeek.length >= 5 && <div style={{ color: "var(--c-success)" }}>{" أسبوع إنجاز مميز! ما نسيت أي جملة"}</div>}
                    {thisWeek.length < 3 && <div style={{ color: "var(--c-text-secondary)" }}>{"حاول تسوي ٥ جلسات الأسبوع الجاي للحصول على أفضل نتيجة"}</div>}
                  </div>
                );
              })()}
            </Card>}
            {/* Smart Progress — Session History */}
            {sessionHistory.length > 0 && <Card>
              <div style={{ className: "section-title" }}>أداء الذاكرة</div>
              {(() => {
                const recent = sessionHistory.slice(-10);
                const totalPhrases = recent.reduce((sum, s) => sum + (s.phrasesCount || 0), 0);
                const recalled = recent.reduce((sum, s) => { const rs = s.recallScore || {}; return sum + Object.values(rs).filter(v => v === "good").length; }, 0);
                const partial = recent.reduce((sum, s) => { const rs = s.recallScore || {}; return sum + Object.values(rs).filter(v => v === "partial").length; }, 0);
                const forgot = recent.reduce((sum, s) => { const rs = s.recallScore || {}; return sum + Object.values(rs).filter(v => v === "forgot").length; }, 0);
                const recallPct = totalPhrases > 0 ? Math.round((recalled / totalPhrases) * 100) : 0;
                return (
                  <div>
                    <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
                      <div style={{ flex: 1, textAlign: "center", background: "rgba(5,150,105,0.06)", borderRadius: "var(--r-md)", padding: "var(--sp-3)" }}>
                        <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-success)", fontFamily: "inherit" }}>{recalled}</div>
                        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>تذكّرتها</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", background: "rgba(29,78,216,0.06)", borderRadius: "var(--r-md)", padding: "var(--sp-3)" }}>
                        <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-accent)", fontFamily: "inherit" }}>{partial}</div>
                        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>تقريباً</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", background: "rgba(220,38,38,0.06)", borderRadius: "var(--r-md)", padding: "var(--sp-3)" }}>
                        <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-error)", fontFamily: "inherit" }}>{forgot}</div>
                        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>نسيتها</div>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: "var(--r-sm)", background: "var(--c-border)", overflow: "hidden", marginBottom: "var(--sp-2)" }}>
                      <div style={{ height: "100%", width: recallPct + "%", borderRadius: "var(--r-sm)", background: recallPct >= 70 ? "#059669" : recallPct >= 40 ? "#1d4ed8" : "#dc2626", transition: "width .5s" }} />
                    </div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", textAlign: "center" }}>{recallPct >= 70 ? "ذاكرتك قوية! الجمل ترسخ" : recallPct >= 40 ? "تتحسن — استمر بالمراجعة اليومية" : "ركّز على خطوة التذكّر — ردّد الجمل المنسية أكثر"}</div>
                    <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--c-text-secondary)", marginTop: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>آخر الجلسات:</div>
                    {recent.slice(-5).reverse().map((s, i) => {
                      const rs = s.recallScore || {};
                      const g = Object.values(rs).filter(v => v === "good").length;
                      const t = s.phrasesCount || 3;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "var(--sp-2)", borderRadius: "var(--r-sm)", background: "rgba(0,0,0,0.02)", marginBottom: "var(--sp-1)" }}>
                          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", minWidth: 55 }}>{s.date ? s.date.slice(5) : ""}</div>
                          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)", flex: 1 }}>{s.scenario}</div>
                          <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: g === t ? "#059669" : g > 0 ? "#1d4ed8" : "#dc2626", fontFamily: "inherit" }}>{g + "/" + t}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>}
            {levelResult && <Card>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-3)" }}> مستوى اللغة (CEFR)</div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
                <div style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", background: CEFR_LEVELS[levelResult.level].color + "18", border: "2px solid " + CEFR_LEVELS[levelResult.level].color + "40", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: CEFR_LEVELS[levelResult.level].color, fontFamily: "inherit" }}>{levelResult.levelCode}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-text)" }}>{CEFR_LEVELS[levelResult.level].name}</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{CEFR_LEVELS[levelResult.level].nameEn} — {levelResult.date}</div>
                  {levelResult.skills && <div style={{ display: "flex", gap: "var(--sp-2)", marginTop: "var(--sp-2)", flexWrap: "wrap" }}>
                    {Object.keys(levelResult.skills).map(sk => {
                      const s = levelResult.skills[sk];
                      if (!s || s.total === 0) return null;
                      const pct = Math.round((s.correct / s.total) * 100);
                      return <div key={sk} style={{ fontSize: "var(--fs-xs)", padding: "2px 6px", borderRadius: "var(--r-sm)", background: (pct >= 60 ? "rgba(5,150,105,0.1)" : "rgba(217,119,6,0.1)"), color: pct >= 60 ? "#059669" : "#dc2626" }}>{TYPE_ICONS[sk]} {pct}%</div>;
                    })}
                  </div>}
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}>
                <button onClick={() => { setTab("train"); setTrainMode("level"); }} style={{ padding: "6px 14px", borderRadius: "var(--r-sm)", border: "1px solid rgba(29,78,216,0.15)", background: "transparent", color: "var(--c-accent)", fontFamily: "inherit", fontSize: "var(--fs-xs)", cursor: "pointer" }}>أعد الاختبار</button>
              </div>
            </Card>}
            {quizResults && quizResults.length > 0 && <Card>
              <div className="section-title">نتائج الاختبارات</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--sp-2)", height: 100, padding: "0 4px" }}>
                {quizResults.slice(-10).map((r, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-1)" }}>
                    <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: r.pct >= 80 ? "#059669" : r.pct >= 50 ? "#1d4ed8" : "#dc2626" }}>{r.pct + "%"}</div>
                    <div style={{ width: "100%", height: Math.max(r.pct * 0.8, 4), borderRadius: "var(--r-sm)", background: r.pct >= 80 ? "#059669" : r.pct >= 50 ? "#1d4ed8" : "#dc2626", transition: "height .3s" }} />
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-tertiary)" }}>{r.date ? r.date.slice(5) : ""}</div>
                  </div>
                ))}
              </div>
              {quizResults.length >= 2 && (() => {
                const last = quizResults[quizResults.length - 1].pct;
                const prev = quizResults[quizResults.length - 2].pct;
                const diff = last - prev;
                return <div style={{ textAlign: "center", marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)", fontWeight: 700, color: diff >= 0 ? "#059669" : "#dc2626" }}>{diff >= 0 ? "+" + diff + "%" : "" + diff + "%"} مقارنة بالاختبار السابق</div>;
              })()}
            </Card>}
            {/* Voice Settings */}
            <Card>
              <div className="section-title">الصوت والنطق</div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>الحالة:</div>
                <VoiceBadge />
              </div>

              {/* Test current voice */}
              <div style={{ marginBottom: "var(--sp-4)" }}>
                <button className="btn btn--secondary btn--sm" onClick={() => speak("Hello! Nice to meet you. How are you today?", 0.9)}>جرّب الصوت الحالي</button>
              </div>
              {/* FIX 8: Accent selection */}
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>اللهجة:</div>
              <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
                {[{ code: "en-US", label: "أمريكي" }, { code: "en-GB", label: "بريطاني" }, { code: "en-AU", label: "أسترالي" }].map(a => (
                  <button key={a.code} onClick={() => { setAccent(a.code); speak("Hello! How are you today?", 0.9); }} className={"toggle-btn" + (getAccent() === a.code ? " toggle-btn--active" : "")}>{a.label}</button>
                ))}
              </div>

              {/* Tier explanation */}
              <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "var(--r-md)", padding: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text)", lineHeight: 2.2 }}>
                  <div style={{ marginBottom: "var(--sp-1)" }}><span style={{ color: "var(--c-accent)" }}>المستوى المجاني:</span> التطبيق يختار تلقائياً أفضل صوت متاح في متصفحك</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>Edge = أصوات Neural ممتازة | Chrome = Google voices جيدة | Safari = أصوات Apple</div>
                  <div style={{ marginTop: "var(--sp-2)", marginBottom: "var(--sp-1)" }}><span style={{ color: "var(--c-success)" }}>المستوى المدفوع (اختياري):</span> صوت بشري حقيقي عبر OpenAI</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>أفضل جودة — connected speech + نبرة طبيعية (~$0.10/شهر)</div>
                </div>
              </div>

              {/* OpenAI API key (optional) */}
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>مفتاح OpenAI (اختياري):</div>
              <div style={{ marginBottom: "var(--sp-3)" }}>
                <input
                  type="password"
                  placeholder="sk-... اتركه فاضي للمجاني"
                  defaultValue={getOpenAIKey() || ""}
                  onBlur={async (e) => {
                    const key = e.target.value.trim();
                    setOpenAIKey(key || null);
                    try { await userStorage.set("openai-tts-key", key); } catch(ex) {}
                  }}
                  style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r-md)", fontFamily: "inherit", fontSize: "var(--fs-sm)", direction: "ltr", textAlign: "left", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(29,78,216,0.15)", color: "var(--c-text)", outline: "none" }}
                />
              </div>
              {getOpenAIKey() && <div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>الصوت:</div>
                <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap", marginBottom: "var(--sp-2)" }}>
                  {["nova", "alloy", "echo", "fable", "onyx", "shimmer"].map(v => (
                    <button key={v} onClick={async () => { setTTSVoice(v); try { await userStorage.set("openai-tts-voice", v); } catch(ex) {} speak("Hello, nice to meet you.", 0.9); }} className={"toggle-btn" + (getTTSVoice() === v ? " toggle-btn--active" : "")}>{v}</button>
                  ))}
                </div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-tertiary)" }}>nova = أنثى طبيعية | onyx = ذكر واثق | shimmer = أنثى دافئة | echo = ذكر هادئ</div>
              </div>}
              {!getOpenAIKey() && <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-success)", background: "rgba(5,150,105,0.06)", borderRadius: "var(--r-sm)", padding: "var(--sp-3)" }}>نصيحة: افتح التطبيق في متصفح Edge للحصول على أفضل صوت مجاني (Microsoft Neural voices)</div>}
            </Card>
            {/* Profile & Logout */}
            {currentUser && <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--c-accent),var(--c-success))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-lg)", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{currentUser.displayName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-text)" }}>{currentUser.displayName}</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>@{currentUser.username}</div>
                </div>
              </div>
              <button onClick={() => { if (confirm("تسجيل خروج؟")) onLogout(); }} style={{ width: "100%", padding: "var(--sp-3)", borderRadius: "var(--r-md)", border: "1px solid rgba(29,78,216,0.15)", background: "transparent", color: "var(--c-accent)", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 600, cursor: "pointer" }}>تسجيل خروج ←</button>
            </Card>}
            <div style={{ textAlign: "center", marginTop: "var(--sp-4)" }}>
              <button onClick={() => { if (confirm("حذف كل البيانات؟")) { save({ start: null, days: {} }); setTab("today"); } }} style={{ padding: "7px 16px", borderRadius: "var(--r-md)", border: "1px solid rgba(217,119,6,0.1)", background: "transparent", color: "var(--c-error)", fontFamily: "inherit", fontSize: "var(--fs-xs)", cursor: "pointer" }}>إعادة ضبط</button>
            </div>
          </div>
        )}

        <div style={{ height: 36 }} />
      </div>
    </div>
  );
}

// ===== AUTH GATE — Wraps MainApp with authentication =====
export default function App() {
  const [authState, setAuthState] = useState("loading"); // loading, auth, app
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await getActiveSession();
      if (session && session.uid) {
        // Verify account still exists
        const accs = await getAccounts();
        const acc = accs.find(a => a.uid === session.uid);
        if (acc) {
          userStorage.setUser(acc.uid);
          setCurrentUser(acc);
          setAuthState("app");
          return;
        }
        await setActiveSession(null);
      }
      setAuthState("auth");
    })();
  }, []);

  function handleLogin(account) {
    userStorage.setUser(account.uid);
    setCurrentUser(account);
    setAuthState("app");
  }

  function handleLogout() {
    userStorage.setUser(null);
    setCurrentUser(null);
    setAuthState("auth");
    (async () => { await setActiveSession(null); })();
  }

  if (authState === "loading") return <><style>{CSS}</style><SplashScreen /></>;
  if (authState === "auth") return <AuthScreen onLogin={handleLogin} />;
  return <MainApp currentUser={currentUser} onLogout={handleLogout} />;
}
