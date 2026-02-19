/**
 * Text-to-Speech utility using Web Speech API
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speak English text using Web Speech API
 */
export function speakEnglish(text: string): void {
  if (!isSpeechAvailable()) {
    console.warn("Speech synthesis not available");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9; // Slightly slower for learning
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => v.lang.startsWith("en") && v.name.includes("Enhanced")
  ) || voices.find(
    (v) => v.lang.startsWith("en-US")
  ) || voices.find(
    (v) => v.lang.startsWith("en")
  );

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if (isSpeechAvailable()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Check if speech is currently playing
 */
export function isSpeaking(): boolean {
  if (!isSpeechAvailable()) return false;
  return window.speechSynthesis.speaking;
}
