/**
 * Platform Abstraction Layer
 * Provides unified APIs for speech and storage across:
 * - Web (SpeechSynthesis + localStorage)
 * - Capacitor/Native (Native TTS + Capacitor Preferences)
 *
 * Detection is automatic — no config needed.
 */

// ===== STORAGE POLYFILL — must run before anything else =====
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) { try { const v = localStorage.getItem(key); return v ? { key, value: v } : null; } catch { return null; } },
    async set(key, value) { try { localStorage.setItem(key, value); return { key, value }; } catch { return null; } },
    async delete(key) { try { localStorage.removeItem(key); return { key, deleted: true }; } catch { return null; } },
  };
}

// ===== PLATFORM DETECTION =====
export const isCapacitor = () => typeof window !== "undefined" && !!window.Capacitor;
export const isNative = () => isCapacitor() && window.Capacitor.isNativePlatform();
export const getPlatform = () => {
  if (!isCapacitor()) return "web";
  return window.Capacitor.getPlatform(); // "android" | "ios" | "web"
};

// ===== STORAGE =====
// On web: uses window.storage (Claude artifacts) or localStorage polyfill
// On native: uses Capacitor Preferences (persists across app restarts)
export const storage = {
  async get(key) {
    if (isNative() && window.Capacitor.Plugins.Preferences) {
      try {
        const { value } = await window.Capacitor.Plugins.Preferences.get({ key });
        return value ? { key, value } : null;
      } catch { /* fall through */ }
    }
    // Fallback to window.storage (works on web)
    if (window.storage) {
      return window.storage.get(key);
    }
    return null;
  },

  async set(key, value) {
    if (isNative() && window.Capacitor.Plugins.Preferences) {
      try {
        await window.Capacitor.Plugins.Preferences.set({ key, value });
        return { key, value };
      } catch { /* fall through */ }
    }
    if (window.storage) {
      return window.storage.set(key, value);
    }
    return null;
  },

  async delete(key) {
    if (isNative() && window.Capacitor.Plugins.Preferences) {
      try {
        await window.Capacitor.Plugins.Preferences.remove({ key });
        return { key, deleted: true };
      } catch { /* fall through */ }
    }
    if (window.storage) {
      return window.storage.delete(key);
    }
    return null;
  }
};

// ===== TEXT-TO-SPEECH =====
// On web: SpeechSynthesis API (browser) or OpenAI TTS (optional)
// On native: Capacitor TextToSpeech plugin (uses Samsung Neural / Siri Neural)

// Smart voice picker for browser SpeechSynthesis
function getBestBrowserVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Try accent-specific voices first
  const accentVoice = voices.find(v => v.lang === _accent || v.lang.startsWith(_accent.slice(0,5)));
  const priority = [
    // Accent-matched Neural voices first
    v => v.lang.startsWith(_accent.slice(0,5)) && (v.name.includes("Online") || v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Enhanced")),
    v => v.lang.startsWith(_accent.slice(0,5)),
    // Then any good English voice
    v => v.name.includes("Online (Natural)") && v.lang.startsWith("en"),
    v => v.name.includes("Microsoft") && v.name.includes("Online") && v.lang.startsWith("en"),
    v => v.name.includes("Google US English"),
    v => v.name.includes("Google UK English"),
    v => v.name === "Samantha" && v.lang.startsWith("en"),
    v => v.name === "Karen" && v.lang.startsWith("en"),
    v => v.name === "Daniel" && v.lang.startsWith("en"),
    v => (v.name.includes("Enhanced") || v.name.includes("Premium")) && v.lang.startsWith("en"),
    v => v.lang.startsWith("en-US") && v.localService === false,
    v => v.lang.startsWith("en-US"),
    v => v.lang.startsWith("en-GB"),
    v => v.lang.startsWith("en"),
  ];
  for (const test of priority) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0];
}

let _bestBrowserVoice = null;
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { _bestBrowserVoice = getBestBrowserVoice(); };
  _bestBrowserVoice = getBestBrowserVoice();
}

// Audio cache
const _audioCache = {};

// OpenAI TTS state
let _openaiKey = null;
let _ttsVoice = "nova";

// FIX 8: Accent selection
let _accent = "en-US"; // en-US, en-GB, en-AU
export function setAccent(a) { _accent = a; _bestBrowserVoice = getBestBrowserVoice(); }
export function getAccent() { return _accent; }

export function setOpenAIKey(key) { _openaiKey = key; }
export function getOpenAIKey() { return _openaiKey; }
export function setTTSVoice(voice) { _ttsVoice = voice; }
export function getTTSVoice() { return _ttsVoice; }

// Load saved API key
(async () => {
  try {
    const r = await storage.get("openai-tts-key");
    if (r && r.value) _openaiKey = r.value;
    const v = await storage.get("openai-tts-voice");
    if (v && v.value) _ttsVoice = v.value;
  } catch {}
})();

// OpenAI TTS
async function speakOpenAI(text, speed = 1.0) {
  if (!_openaiKey) return null;
  const cacheKey = text + "|" + _ttsVoice + "|" + speed;
  if (_audioCache[cacheKey]) {
    const audio = new Audio(_audioCache[cacheKey]);
    audio.play();
    return audio;
  }
  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Authorization": "Bearer " + _openaiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "tts-1", input: text, voice: _ttsVoice, speed }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    _audioCache[cacheKey] = url;
    const audio = new Audio(url);
    audio.play();
    return audio;
  } catch { return null; }
}

// Native TTS (Capacitor plugin)
async function speakNative(text, rate = 0.85) {
  if (!isNative()) return null;
  const tts = window.Capacitor.Plugins.TextToSpeech;
  if (!tts) return null;
  try {
    await tts.speak({ text, lang: "en-US", rate, pitch: 1.0, volume: 1.0 });
    // Return a fake utterance-like object
    return { onend: null, _done: true };
  } catch { return null; }
}

// Browser SpeechSynthesis
function speakBrowser(text, rate = 0.85) {
  if (!window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = _accent;
  u.rate = rate;
  u.pitch = 1;
  if (_bestBrowserVoice) u.voice = _bestBrowserVoice;
  window.speechSynthesis.speak(u);
  return u;
}

/**
 * Unified speak function
 * Priority: OpenAI TTS → Native TTS (Capacitor) → Browser SpeechSynthesis
 */
export function speak(text, rate = 0.85) {
  // 1. Try OpenAI TTS if key is set
  if (_openaiKey) {
    const speed = rate < 0.7 ? 0.8 : rate < 0.9 ? 0.95 : 1.0;
    const fakeU = { onend: null };
    speakOpenAI(text, speed).then(audio => {
      if (audio) { audio.onended = () => { if (fakeU.onend) fakeU.onend(); }; }
      else {
        // Fallback
        const fallback = isNative() ? null : speakBrowser(text, rate);
        if (fallback) fallback.onend = () => { if (fakeU.onend) fakeU.onend(); };
        else if (fakeU.onend) fakeU.onend();
      }
    });
    return fakeU;
  }

  // 2. Try Native TTS on Capacitor
  if (isNative()) {
    const fakeU = { onend: null };
    speakNative(text, rate).then(result => {
      if (result && fakeU.onend) fakeU.onend();
      else {
        // Fallback to browser (WebView might support it)
        const u = speakBrowser(text, rate);
        if (u) u.onend = () => { if (fakeU.onend) fakeU.onend(); };
        else if (fakeU.onend) fakeU.onend();
      }
    });
    return fakeU;
  }

  // 3. Browser SpeechSynthesis
  return speakBrowser(text, rate);
}

/**
 * Get current voice engine info
 */
export function getVoiceInfo() {
  if (_openaiKey) return { tier: "openai", name: "OpenAI " + _ttsVoice, label: "OpenAI — صوت بشري" };
  if (isNative()) {
    const p = getPlatform();
    if (p === "android") return { tier: "native", name: "Android Neural", label: "صوت أصلي — Neural" };
    if (p === "ios") return { tier: "native", name: "iOS Siri Neural", label: "صوت أصلي — Siri" };
  }
  const vn = _bestBrowserVoice ? _bestBrowserVoice.name : "Default";
  const isNeural = vn.includes("Natural") || vn.includes("Online") || vn.includes("Enhanced") || vn.includes("Google");
  return { tier: isNeural ? "neural" : "basic", name: vn, label: isNeural ? "مجاني — " + vn.split(" ").slice(0, 3).join(" ") : "صوت أساسي" };
}

/**
 * Stop any playing speech
 */
export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (isNative() && window.Capacitor.Plugins.TextToSpeech) {
    try { window.Capacitor.Plugins.TextToSpeech.stop(); } catch {}
  }
}
