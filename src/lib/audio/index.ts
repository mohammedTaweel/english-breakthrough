export {
  speak,
  stopSpeech,
  initVoices,
  getVoiceInfo,
  setAccent,
  getAccent,
  setOpenAIKey,
  getOpenAIKey,
  setTTSVoice,
  getTTSVoice,
} from './tts';

export {
  compareTranscript,
  isRecognitionSupported,
  listenAndCompare,
  type RecognitionResult,
} from './recognition';

export type { Accent, VoiceInfo, VoiceTier, OpenAIVoice, SpeechHandle } from './types';
