import { useCallback, useRef, useState } from 'react';
import { speak, stopSpeech, type SpeechHandle } from '@lib/audio';

export function useSpeak() {
  const [playing, setPlaying] = useState(false);
  const handleRef = useRef<SpeechHandle | null>(null);

  const play = useCallback((text: string, rate = 0.85) => {
    stopSpeech();
    setPlaying(true);
    const handle = speak(text, rate);
    handleRef.current = handle;
    handle.onend = () => setPlaying(false);
    // Safety timeout — no speech should take > 30s
    setTimeout(() => setPlaying(false), 30_000);
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    setPlaying(false);
  }, []);

  return { playing, play, stop };
}
