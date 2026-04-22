/**
 * Speech Recognition wrapper.
 *
 * Listens to the user's microphone and compares what they said
 * to a target phrase, returning a match percentage.
 */

export type RecognitionResult = {
  transcript: string;
  matchPercent: number;
  matchedWords: string[];
  missedWords: string[];
};

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?'"]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

export function compareTranscript(heard: string, target: string): RecognitionResult {
  const heardWords = normalize(heard);
  const targetWords = normalize(target);

  const matched: string[] = [];
  const missed: string[] = [];

  for (const w of targetWords) {
    if (heardWords.includes(w)) {
      matched.push(w);
    } else {
      missed.push(w);
    }
  }

  const matchPercent = targetWords.length > 0 ? Math.round((matched.length / targetWords.length) * 100) : 0;

  return { transcript: heard, matchPercent, matchedWords: matched, missedWords: missed };
}

export function isRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function listenAndCompare(
  target: string,
  onResult: (result: RecognitionResult) => void,
  onError?: (err: string) => void,
): (() => void) | null {
  if (!isRecognitionSupported()) {
    onError?.('Speech Recognition not supported in this browser');
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SRConstructor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  const recognition = new SRConstructor();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
    const heard = event.results[0][0].transcript;
    onResult(compareTranscript(heard, target));
  };

  recognition.onerror = (event: { error: string }) => {
    onError?.(event.error);
  };

  recognition.start();

  return () => {
    try {
      recognition.stop();
    } catch {
      // already stopped
    }
  };
}
