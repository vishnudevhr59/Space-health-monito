/**
 * SPACE HEALTH MONITOR - Tactical Voice Alert Synthesizer
 * Grounded in Browser SpeechSynthesis API for rapid aerospace situational awareness.
 * Provides crisp, authoritative verbal callouts for critical health anomalies.
 */

type VoiceAlertListener = (enabled: boolean) => void;

class VoiceAlertService {
  private isEnabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private listeners: Set<VoiceAlertListener> = new Set();
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shm_voice_alerts_enabled');
      this.isEnabled = stored !== null ? stored === 'true' : true;

      if ('speechSynthesis' in window) {
        // Initialize voice list
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          // Prefer clear English aerospace/assistant voices
          this.selectedVoice =
            voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Natural'))) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0] ||
            null;
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    }
  }

  public isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  public toggleVoiceAlerts(): boolean {
    this.isEnabled = !this.isEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shm_voice_alerts_enabled', String(this.isEnabled));
      if (!this.isEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    this.notifyListeners();
    return this.isEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shm_voice_alerts_enabled', String(this.isEnabled));
      if (!this.isEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    this.notifyListeners();
  }

  public subscribe(listener: VoiceAlertListener): () => void {
    this.listeners.add(listener);
    listener(this.isEnabled);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.isEnabled));
  }

  /**
   * Speak high-priority critical medical anomaly callout
   */
  public speakCriticalAlert(title: string, detail?: string): void {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    const alertKey = `${title}:${detail || ''}`;

    // Suppress identical audio announcements within 12 seconds
    if (this.lastSpokenText === alertKey && now - this.lastSpokenTime < 12000) {
      return;
    }

    this.lastSpokenText = alertKey;
    this.lastSpokenTime = now;

    // Build tactical aerospace flight deck callout phrasing
    const spokenMessage = `Attention Flight Deck. Critical Health Alert. ${title}. ${detail ? detail + '.' : ''} Immediate flight surgeon intervention required.`;

    try {
      window.speechSynthesis.cancel(); // Preempt previous speech queue

      const utterance = new SpeechSynthesisUtterance(spokenMessage);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.pitch = 1.0;
      utterance.rate = 1.06; // Crisp, professional pace
      utterance.volume = 0.95;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VOICE ALERTS] SpeechSynthesis error:', err);
    }
  }

  /**
   * Speak warning or advisory callout
   */
  public speakWarningAlert(title: string, detail?: string): void {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    const alertKey = `WARN:${title}`;
    if (this.lastSpokenText === alertKey && now - this.lastSpokenTime < 15000) {
      return;
    }

    this.lastSpokenText = alertKey;
    this.lastSpokenTime = now;

    const spokenMessage = `Warning. ${title}. ${detail ? detail + '.' : ''}`;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenMessage);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VOICE ALERTS] SpeechSynthesis error:', err);
    }
  }

  /**
   * Test Voice Synthesizer functionality for hackathon judges
   */
  public testVoiceAnnouncement(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech Synthesis API is not supported in this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const testSpeech =
        'Space Health Monito tactical voice synthesizer operational. Deep space telemetry link active. Biomedical surveillance nominal.';
      const utterance = new SpeechSynthesisUtterance(testSpeech);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      utterance.volume = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VOICE ALERTS] Test announcement failed:', err);
    }
  }
}

export const voiceAlertService = new VoiceAlertService();
