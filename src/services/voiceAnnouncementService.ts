/**
 * SPACE HEALTH MONITO — Flight Deck Voice Announcement Service
 * Integrates Web Speech API (SpeechSynthesis) for tactical flight surgeon and mission control announcements.
 * Provides rapid situational awareness during critical biomedical alerts and ECLSS anomalies without looking at the screen.
 */

class VoiceAnnouncementService {
  private isEnabled: boolean = true;
  private isSupported: boolean = false;
  private lastAnnouncedText: string = '';
  private lastAnnouncedTime: number = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      // Load saved user preference
      const savedPref = localStorage.getItem('sh_voice_announcements_enabled');
      this.isEnabled = savedPref !== null ? savedPref === 'true' : true;

      // Select optimal voice once voices are loaded
      this.initVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice(): void {
    if (!this.isSupported) return;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer a natural, clear English voice (e.g. Samantha, Google US English, Alex, or Microsoft Zira)
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Google US English') ||
            v.name.includes('Natural') ||
            v.name.includes('Zira') ||
            v.name.includes('Karen') ||
            v.name.includes('Alex'))
      );

      this.voice = preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0];
    } catch (e) {
      console.warn('Voice initialization notice:', e);
    }
  }

  public isVoiceSupported(): boolean {
    return this.isSupported;
  }

  public isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sh_voice_announcements_enabled', String(enabled));
    }
    if (!enabled && this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  public toggleVoice(): boolean {
    const newState = !this.isEnabled;
    this.setVoiceEnabled(newState);
    if (newState) {
      this.announce(
        'Voice communication annunciator online. Space Health Monito verbal alert system active.',
        'INFO',
        true
      );
    }
    return newState;
  }

  /**
   * Announce an alert or situational message with priority handling
   */
  public announce(
    message: string,
    priority: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO',
    force: boolean = false
  ): void {
    if (!this.isSupported || (!this.isEnabled && !force)) return;

    // Prevent duplicate spam within 8 seconds unless it's a critical forced message
    const now = Date.now();
    if (!force && message === this.lastAnnouncedText && now - this.lastAnnouncedTime < 8000) {
      return;
    }

    try {
      // If critical, cancel lower priority ongoing utterances immediately
      if (priority === 'CRITICAL' || force) {
        window.speechSynthesis.cancel();
      } else if (window.speechSynthesis.speaking) {
        // Don't interrupt if speaking a non-critical message
        return;
      }

      this.lastAnnouncedText = message;
      this.lastAnnouncedTime = now;

      const utterance = new SpeechSynthesisUtterance(message);
      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Configure tactical mission control tone
      utterance.lang = 'en-US';
      utterance.rate = priority === 'CRITICAL' ? 1.08 : 1.02; // Crisp cadence
      utterance.pitch = priority === 'CRITICAL' ? 1.1 : 1.0;
      utterance.volume = 1.0;

      utterance.onerror = (e) => {
        // Non-fatal speech synthesis error handler
        console.warn('SpeechSynthesis error:', e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Voice announcement failed safely:', err);
    }
  }

  /**
   * Test verbal synthesis for demonstration to hackathon judges
   */
  public testAnnunciation(): void {
    this.announce(
      'Mission Control communication link verified. Space Health Monito speech synthesis operational.',
      'INFO',
      true
    );
  }
}

export const voiceAnnouncementService = new VoiceAnnouncementService();
