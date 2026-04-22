/**
 * Text-to-Speech service.
 *
 * Priority: OpenAI TTS → Capacitor Native → Browser SpeechSynthesis.
 * Each layer falls back to the next on failure.
 */

import type { Accent, OpenAIVoice, SpeechHandle, VoiceInfo } from './types';
import { pickBestVoice, isNeuralVoice } from './voice-picker';

// -- State --

let accent: Accent = 'en-US';
let openaiKey: string | null = null;
let openaiVoice: OpenAIVoice = 'nova';
let cachedBrowserVoice: SpeechSynthesisVoice | null = null;
const audioCache = new Map<string, string>();

// -- Config setters/getters --

export function setAccent(a: Accent): void {
  accent = a;
  cachedBrowserVoice = pickBestVoice(a);
}
export function getAccent(): Accent {
  return accent;
}

export function setOpenAIKey(key: string | null): void {
  openaiKey = key;
}
export function getOpenAIKey(): string | null {
  return openaiKey;
}

export function setTTSVoice(voice: OpenAIVoice): void {
  openaiVoice = voice;
}
export function getTTSVoice(): OpenAIVoice {
  return openaiVoice;
}

// -- Platform detection --

function isCapacitorNative(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Capacitor' in window &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Capacitor?.isNativePlatform?.() === true
  );
}

function getCapacitorPlatform(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Capacitor?.getPlatform?.() ?? 'web';
}

// -- OpenAI TTS --

async function speakOpenAI(text: string, speed: number): Promise<HTMLAudioElement | null> {
  if (!openaiKey) return null;

  const cacheKey = `${text}|${openaiVoice}|${speed}`;
  const cached = audioCache.get(cacheKey);
  if (cached) {
    const audio = new Audio(cached);
    audio.play();
    return audio;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'tts-1', input: text, voice: openaiVoice, speed }),
    });
    if (!res.ok) return null;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audioCache.set(cacheKey, url);

    const audio = new Audio(url);
    audio.play();
    return audio;
  } catch {
    return null;
  }
}

// -- Capacitor Native TTS --

async function speakNative(text: string, rate: number): Promise<boolean> {
  if (!isCapacitorNative()) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tts = (window as any).Capacitor?.Plugins?.TextToSpeech;
    if (!tts) return false;
    await tts.speak({ text, lang: accent, rate, pitch: 1.0, volume: 1.0 });
    return true;
  } catch {
    return false;
  }
}

// -- Browser SpeechSynthesis --

function speakBrowser(text: string, rate: number): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = accent;
  u.rate = rate;
  u.pitch = 1;
  if (cachedBrowserVoice) u.voice = cachedBrowserVoice;
  window.speechSynthesis.speak(u);
  return u;
}

// -- Unified speak --

export function speak(text: string, rate = 0.85): SpeechHandle {
  const handle: SpeechHandle = { onend: null };

  if (openaiKey) {
    const speed = rate < 0.7 ? 0.8 : rate < 0.9 ? 0.95 : 1.0;
    speakOpenAI(text, speed).then((audio) => {
      if (audio) {
        audio.onended = () => handle.onend?.();
      } else {
        const fallback = speakBrowser(text, rate);
        if (fallback) fallback.onend = () => handle.onend?.();
        else handle.onend?.();
      }
    });
    return handle;
  }

  if (isCapacitorNative()) {
    speakNative(text, rate).then((ok) => {
      if (ok) {
        handle.onend?.();
      } else {
        const fallback = speakBrowser(text, rate);
        if (fallback) fallback.onend = () => handle.onend?.();
        else handle.onend?.();
      }
    });
    return handle;
  }

  const u = speakBrowser(text, rate);
  if (u) u.onend = () => handle.onend?.();
  else setTimeout(() => handle.onend?.(), 0);
  return handle;
}

// -- Stop --

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (isCapacitorNative()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Capacitor?.Plugins?.TextToSpeech?.stop();
    } catch {
      // ignore
    }
  }
}

// -- Voice info --

export function getVoiceInfo(): VoiceInfo {
  if (openaiKey) {
    return { tier: 'openai', name: `OpenAI ${openaiVoice}`, label: 'OpenAI — صوت بشري' };
  }

  if (isCapacitorNative()) {
    const p = getCapacitorPlatform();
    if (p === 'android')
      return { tier: 'native', name: 'Android Neural', label: 'صوت أصلي — Neural' };
    if (p === 'ios') return { tier: 'native', name: 'iOS Siri Neural', label: 'صوت أصلي — Siri' };
  }

  const voiceName = cachedBrowserVoice?.name ?? 'Default';
  const neural = isNeuralVoice(voiceName);
  return {
    tier: neural ? 'neural' : 'basic',
    name: voiceName,
    label: neural ? `مجاني — ${voiceName.split(' ').slice(0, 3).join(' ')}` : 'صوت أساسي',
  };
}

// -- Init --

export function initVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  cachedBrowserVoice = pickBestVoice(accent);
  window.speechSynthesis.onvoiceschanged = () => {
    cachedBrowserVoice = pickBestVoice(accent);
  };
}
