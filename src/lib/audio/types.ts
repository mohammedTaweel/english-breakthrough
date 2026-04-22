export type Accent = 'en-US' | 'en-GB' | 'en-AU';

export type VoiceTier = 'openai' | 'native' | 'neural' | 'basic';

export type VoiceInfo = {
  tier: VoiceTier;
  name: string;
  label: string;
};

export type OpenAIVoice = 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';

export type SpeechHandle = {
  onend: (() => void) | null;
};
