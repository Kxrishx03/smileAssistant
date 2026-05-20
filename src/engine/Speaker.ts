import Tts from 'react-native-tts';

// What is a Singleton?
// We only ever want ONE Speaker for the whole app —
// just like a real person only has one mouth.
// So we create the class, then export a single shared instance at the bottom.

class Speaker {
  // This flag tracks whether TTS has been initialized yet.
  // We don't want to speak before it's ready.
  private ready = false;

  // Call this ONCE when the app starts.
  // It configures the voice settings.
  async initialize(): Promise<void> {
    try {
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5);   // Speed — 0.0 is slowest, 1.0 is fastest
      await Tts.setDefaultPitch(1.1);  // Pitch — 1.0 is normal, higher = slightly brighter
      this.ready = true;
      console.log('[Speaker] ✅ Ready');
    } catch (error) {
      console.error('[Speaker] ❌ Failed to initialize:', error);
    }
  }

  // This is what the rest of the app calls to make Nova speak.
  speak(text: string): void {
    if (!this.ready) {
      console.warn('[Speaker] Not ready yet — call initialize() first');
      return;
    }
    // Stop anything currently being spoken before saying the new thing.
    // Without this, Nova would queue up all speech and talk forever.
    Tts.stop();
    Tts.speak(text);
    console.log('[Speaker] 🗣️ Saying:', text);
  }

  // Stop speaking immediately — useful when user gives a new command
  stop(): void {
    Tts.stop();
  }
}

// Export one shared instance.
// Every file that imports Speaker gets this SAME object.
export default new Speaker();