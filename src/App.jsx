import { useState, useEffect, useCallback, useRef } from "react";
import { speak, stopSpeech, getVoiceInfo, setOpenAIKey, getOpenAIKey, setTTSVoice, getTTSVoice, setAccent, getAccent, storage } from "./platform.js";
import { TaliqLogo, TaliqIcon, SplashScreen, BRAND } from "./brand.jsx";
import "./styles/app.css";
import { SHADOW_LINES, STORIES, PROMPTS, PHRASES, MOTIV, CONVERSATIONS, QUICK_RESP, QUIZ_BANK, CEFR_LEVELS, LEVEL_TEST, LEVEL_IDX, TYPE_LABELS, TYPE_ICONS, LISTEN_ITEMS, DICTATION_ITEMS, DAILY_SCENARIOS, FILL_BLANKS, SENTENCE_BUILD, RECALL_SCENARIOS, FLUENCY_TOPICS, PHRASE_PATTERNS } from "./data.js";
import { IconVolume, IconRefresh, IconCheck, IconEye, IconMic, IconPlay, IconStop, IconArrowLeft, IconTarget, IconBook, IconPen, IconBrain, IconGlobe, IconChart, IconUser, IconSettings, IconLogout, IconHeadphones, IconMessageCircle, IconTrendingUp, IconAward, IconZap, IconClock, IconStar } from "./icons.jsx";
import { Button, Card as UICard, Badge, ProgressRing, ProgressBar, StatCard, SectionTitle, WeekProgress, EmptyState, Toast } from "./components/ui/index.jsx";

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
          <Button variant="secondary" size="sm" onClick={stop}><IconStop size={16}/>إيقاف</Button>
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
      <Button size="sm" onClick={restart}><IconRefresh size={16}/>محادثة جديدة</Button>
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
      {picked !== null && <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}><Button size="sm" onClick={next}>{step + 1 >= m.steps.length ? <><IconTarget size={16}/>النتيجة</> : "التالي ←"}</Button></div>}
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
      <Button size="sm" onClick={restart}><IconRefresh size={16}/>محاولة جديدة</Button>
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
        <Button size="sm" onClick={() => { if (timer === 0 && picked === null) { setTotal(total + 1); } next(); }}>التالي ←</Button>
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
        <Button size="sm" onClick={restart}><IconRefresh size={16}/>اختبار جديد</Button>
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
      {picked !== null && <div style={{ textAlign: "center", marginTop: "var(--sp-3)" }}><Button size="sm" onClick={next}>{qi + 1 >= qs.current.length ? <><IconTarget size={16}/>النتيجة</> : "التالي ←"}</Button></div>}
    </div>
  );
}

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
      <Button size="sm" onClick={restart}><IconRefresh size={16}/>محاولة جديدة</Button>
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
          <Button size="sm" onClick={check}><IconCheck size={16}/>تأكّد</Button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <Button size="sm" onClick={next}>{qi + 1 >= qs.current.length ? <><IconTarget size={16}/>النتيجة</> : "التالي ←"}</Button>
        </div>
      )}
    </div>
  );
}

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
      <Button variant="success" size="sm" onClick={restart}><IconRefresh size={16}/>محاولة جديدة</Button>
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
        {!checked && selected.length > 0 && <Button variant="ghost" size="sm" onClick={() => setSelected([])}>مسح</Button>}
        {!checked ? (
          <button onClick={check} disabled={selected.length === 0} style={{ padding: "8px 20px", borderRadius: "var(--r-md)", border: "none", background: selected.length > 0 ? "#059669" : "#e4e4e7", color: selected.length > 0 ? "#fafaf9" : "#a1a1aa", fontFamily: "inherit", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "default" }}>تأكّد</button>
        ) : (
          <Button variant="success" size="sm" onClick={next}>{qi + 1 >= qs.current.length ? <><IconTarget size={16}/>النتيجة</> : "التالي ←"}</Button>
        )}
      </div>
    </div>
  );
}

// ===== FREE RECALL PRODUCTION EXERCISE =====
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
      <Button variant="danger" size="sm" onClick={restart}><IconRefresh size={16}/>محاولة جديدة</Button>
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
            <Button variant="danger" size="sm" onClick={next}>{qi + 1 >= qs.current.length ? <><IconTarget size={16}/>النتيجة</> : "التالي ←"}</Button>
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
                  <Button variant="secondary" size="sm" onClick={() => { setListenDone(false); setListenAnswer(null); playDialogueSequence(); }}><IconVolume size={16}/>استمع مرة ثانية</Button>
                  <Button onClick={() => advanceStep(1)}>التالي →</Button>
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
            <Button onClick={() => advanceStep(2)}>التالي: ردّد الجمل →</Button>
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
              <Button onClick={() => advanceStep(3)}>التالي: تذكّر →</Button>
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
                  <Button size="sm" onClick={() => setRecallState(prev => ({ ...prev, [i]: "thinking" }))}><IconMic size={16}/>قلها بصوت عالٍ ثم اضغط هنا</Button>
                )}

                {state === "thinking" && (
                  <div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)" }}>قلت الجملة؟ اضغط "أظهر" وقارن:</div>
                    <Button size="sm" onClick={() => setRecallState(prev => ({ ...prev, [i]: "revealed" }))}><IconEye size={16}/>أظهر الجملة</Button>
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
                    <Button onClick={() => advanceStep(4)}>التالي: أنتج بنفسك →</Button>
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
                  <Button variant="secondary" size="sm" onClick={async () => {
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
                  }}><IconBrain size={16}/>تحليل ذكي لكتابتك</Button>
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
                <Button onClick={() => advanceStep(5)}>التالي: تحدّي اليوم →</Button>
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
                <Button variant="success" size="sm" onClick={() => setChallengeDone(true)}><IconCheck size={16}/>نعم سويته </Button>
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
        <Button size="lg" onClick={() => startRound(1)}><IconPlay size={16}/>ابدأ الجولة الأولى (٤ دقائق) →</Button>
      </div>
    </div>
  );

  if (round === 4) return (
    <div style={{ textAlign: "center", padding: "var(--sp-5)", animation: "fadeUp .4s" }}>
      <div style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-3)" }}></div>
      <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, color: "var(--c-success)", marginBottom: "var(--sp-2)" }}>إنجاز رائع.. أنت تقترب من التمكّن</div>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)", lineHeight: 2, marginBottom: "var(--sp-4)" }}>تكلمت عن نفس الموضوع ٣ مرات — كل مرة بسرعة أكبر.<br />لاحظت كيف الجمل صارت تطلع أسرع في الجولة الثالثة؟<br />هذا بالضبط كيف تُبنى الطلاقة.</div>
      <Button variant="danger" onClick={restart}><IconRefresh size={16}/>موضوع جديد</Button>
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
          <Button variant="danger" onClick={() => startRound(round + 1)}>{"الجولة " + (round + 1) + " (" + (round === 1 ? "٣" : "٢") + " دقائق) →"}</Button>
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
      <Button size="sm" onClick={restart}><IconRefresh size={16}/>محاولة جديدة</Button>
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
      <Button variant="danger" size="sm" onClick={restart}><IconRefresh size={16}/>محاولة جديدة</Button>
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
            <Button variant="danger" size="sm" onClick={next}>{qi + 1 >= qs.current.length ? <><IconTarget size={16}/>النتيجة</> : "التالي ←"}</Button>
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
          <SectionTitle>الأداء حسب المستوى</SectionTitle>
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
        {currentQ.audio && <div style={{ textAlign: "center", marginTop: "var(--sp-2)" }}><Button size="sm" onClick={() => speak(currentQ.audio, 0.85)}><IconVolume size={16}/>استمع مرة ثانية</Button></div>}
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

  if (loading) return <><SplashScreen /></>;

  // ===== ONBOARDING =====
  if (!store.start) return (
    <div dir="rtl" className="onboard-wrapper" style={{ fontFamily: "inherit" }}>
      
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
          <Button size="lg" full onClick={() => setOnboardStep(1)}>هذا ما أعانيه بالضبط</Button>
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
          <Button size="lg" full onClick={() => setOnboardStep(2)}>كيف يعمل؟</Button>
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
          <Button size="lg" full onClick={() => setOnboardStep(3)}>هذا ما أبحث عنه</Button>
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
          <Button size="lg" full style={{ marginTop: "var(--sp-4)" }} onClick={() => setOnboardStep(5)}>أنا جاهز</Button>
        </div>}

        {/* Screen 6: Commitment */}
        {onboardStep === 5 && <div style={{ textAlign: "center", animation: "fadeUp .4s" }}>
          <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, color: "var(--c-text)", lineHeight: 1.7, marginBottom: "var(--sp-5)" }}>عهد مع نفسك</h1>
          <div className="card card--accent" style={{ padding: "var(--sp-6)", marginBottom: "var(--sp-6)", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-md)", color: "var(--c-text)", lineHeight: 2, marginBottom: "var(--sp-3)" }}>أُعاهد نفسي أن أستثمر <b style={{ color: "var(--c-accent)" }}>١٥ دقيقة يومياً</b><br/>لمدة أسبوع واحد فقط.<br/>لن أحكم على النتائج قبل ٧ أيام.</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-tertiary)" }}>من يلتزم علناً يُكمل ٣ أضعاف من لا يفعل — أبحاث سلوكية</div>
          </div>
          <Button size="lg" full onClick={() => { save({ ...store, start: gtd(), challenge: userChallenge, committed: true }); }}>أنا ملتزم — ابدأ الآن</Button>
          <Button variant="ghost" full style={{ marginTop: "var(--sp-3)" }} onClick={() => { save({ ...store, start: gtd(), challenge: userChallenge }); }}>أبدأ بدون التزام</Button>
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
          <div className="card card--accent" style={{ animation: "fadeUp .4s" }}>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: 700, color: "var(--c-accent)", marginBottom: "var(--sp-3)" }}>عندك نشاط لم يكتمل</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              {pendingCheckpoints.session && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "var(--sp-3) var(--sp-4)", boxShadow: "var(--sh-sm)" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)" }}>{"جلسة: " + pendingCheckpoints.session.scenario}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"الخطوة " + (pendingCheckpoints.session.step + 1) + "/6"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <Button size="sm" onClick={() => {
                      const cp = pendingCheckpoints.session;
                      const sc = DAILY_SCENARIOS.find(s => s.title === cp.scenario);
                      if (sc) { setChosenScenario(sc); setTab("today"); }
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.session; return Object.keys(n).length ? n : null; });
                    }}>كمّل</Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      (async () => { try { await userStorage.delete("checkpoint-session"); } catch(e) {} })();
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.session; return Object.keys(n).length ? n : null; });
                    }}><IconRefresh size={16}/>ابدأ من جديد</Button>
                  </div>
                </div>
              )}
              {pendingCheckpoints.quiz && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "var(--sp-3) var(--sp-4)", boxShadow: "var(--sh-sm)" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)" }}>{"اختبار أسبوعي"}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (pendingCheckpoints.quiz.qi + 1) + "/10 — " + pendingCheckpoints.quiz.score + " صحيح"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <Button size="sm" onClick={() => {
                      setTab("train"); setTrainMode("quiz");
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.quiz; return Object.keys(n).length ? n : null; });
                    }}>كمّل</Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      (async () => { try { await userStorage.delete("checkpoint-quiz"); } catch(e) {} })();
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.quiz; return Object.keys(n).length ? n : null; });
                    }}><IconRefresh size={16}/>ابدأ من جديد</Button>
                  </div>
                </div>
              )}
              {pendingCheckpoints.level && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface)", borderRadius: "var(--r-md)", padding: "var(--sp-3) var(--sp-4)", boxShadow: "var(--sh-sm)" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text)" }}>{"اختبار المستوى"}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)" }}>{"سؤال " + (pendingCheckpoints.level.qi + 1) + "/25"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <Button size="sm" onClick={() => {
                      setTab("train"); setTrainMode("level");
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.level; return Object.keys(n).length ? n : null; });
                    }}>كمّل</Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      (async () => { try { await userStorage.delete("checkpoint-level"); } catch(e) {} })();
                      setPendingCheckpoints(prev => { const n = { ...prev }; delete n.level; return Object.keys(n).length ? n : null; });
                    }}><IconRefresh size={16}/>ابدأ من جديد</Button>
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
                <Button onClick={() => {
                  const sc2 = chosenScenario || todayScenario;
                  let idx = 0;
                  function playNext() {
                    if (idx >= sc2.keyPhrases.length) return;
                    speak(sc2.keyPhrases[idx].en, 0.75);
                    idx++;
                    setTimeout(playNext, 4000);
                  }
                  playNext();
                }}><IconVolume size={16}/>شغّل جمل اليوم</Button>
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
                  <SectionTitle>مقترح لك</SectionTitle>
                  <div className="exercise-grid" style={{ marginBottom: "var(--sp-6)" }}>
                    {allExercises.slice(0, 3).map(m => <ExCard key={m.id} m={m} />)}
                  </div>
                  <SectionTitle>المزيد من التمارين</SectionTitle>
                  <div className="exercise-grid">
                    {allExercises.slice(3).map(m => <ExCard key={m.id} m={m} />)}
                  </div>
                </div>
              );
            })()}
            {trainMode === "sim" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><MeetingSim /></Card>}
            {trainMode === "quick" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><QuickResp /></Card>}
            {trainMode === "quiz" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><WeeklyQuiz onSave={() => setQuizResults(null)} checkpoint={pendingCheckpoints && pendingCheckpoints.quiz ? pendingCheckpoints.quiz : undefined} /></Card>}
            {trainMode === "fill" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><FillBlank /></Card>}
            {trainMode === "build" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><SentenceBuild /></Card>}
            {trainMode === "fluency" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><Fluency432 /></Card>}
            {trainMode === "listen" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><ListenExercise /></Card>}
            {trainMode === "dictation" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><DictationExercise /></Card>}
            {trainMode === "recall" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><FreeRecall /></Card>}
            {trainMode === "level" && <Card><div style={{ marginBottom: "var(--sp-4)" }}><Button variant="ghost" size="sm" onClick={() => setTrainMode(null)}><IconArrowLeft size={16}/>رجوع</Button></div><LevelTest onComplete={(result) => setLevelResult(result)} checkpoint={pendingCheckpoints && pendingCheckpoints.level ? pendingCheckpoints.level : undefined} /></Card>}
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
                  <SectionTitle>{"مراجعة مطلوبة — " + dueItems.length + " جملة"}</SectionTitle>
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
            <div className="stats-grid" style={{ marginBottom: "var(--sp-5)" }}>
              {[
                { l: "أيام التدريب", v: Object.values(store.days).filter(d => d.length >= 1).length },
                { l: "الأسبوع الحالي", v: wk + "/12" },
                { l: "أيام متواصلة", v: (() => { let s = 0, d = new Date(); for (let i = 0; i < 100; i++) { const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); if (store.days[k] && store.days[k].length >= 1) { s++; d.setDate(d.getDate() - 1); } else if (i === 0) { d.setDate(d.getDate() - 1); } else break; } return s; })() },
              ].map((s, i) => (
                <StatCard key={i} value={s.v} label={s.l} />
              ))}
            </div>
            <Card>
              <SectionTitle>رحلة الـ 12 أسبوع</SectionTitle>
              <WeekProgress current={wk} total={12} />
            </Card>
            {/* FIX 3: Smart Weekly Summary */}
            {sessionHistory.length >= 3 && <Card s={{ borderColor: "rgba(29,78,216,0.1)" }}>
              <SectionTitle>ملخص الأسبوع</SectionTitle>
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
              <SectionTitle>أداء الذاكرة</SectionTitle>
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
              <SectionTitle>نتائج الاختبارات</SectionTitle>
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
              <SectionTitle><IconVolume size={14}/> الصوت والنطق</SectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>الحالة:</div>
                <VoiceBadge />
              </div>

              {/* Test current voice */}
              <div style={{ marginBottom: "var(--sp-4)" }}>
                <Button variant="secondary" size="sm" onClick={() => speak("Hello! Nice to meet you. How are you today?", 0.9)}><IconVolume size={16}/>جرّب الصوت الحالي</Button>
              </div>
              {/* FIX 8: Accent selection */}
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)", display: "flex", alignItems: "center", gap: 4 }}><IconGlobe size={14}/>اللهجة:</div>
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
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-secondary)", marginBottom: "var(--sp-2)", display: "flex", alignItems: "center", gap: 4 }}><IconHeadphones size={14}/>الصوت:</div>
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

  if (authState === "loading") return <><SplashScreen /></>;
  if (authState === "auth") return <AuthScreen onLogin={handleLogin} />;
  return <MainApp currentUser={currentUser} onLogout={handleLogout} />;
}
