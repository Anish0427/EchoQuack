
export class AudioEngine {
  private static audioCtx: AudioContext | null = null;
  private static buffer: AudioBuffer | null = null;

  static async init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!this.buffer) {
      // For a real app, this would be a local asset. 
      // Using a synthesized sound or a tiny data URI for demonstration.
      this.buffer = await this.createQuackBuffer();
    }
  }

  private static async createQuackBuffer(): Promise<AudioBuffer> {
    const duration = 0.5;
    const sampleRate = this.audioCtx!.sampleRate;
    const buffer = this.audioCtx!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Synthesized quack sound: saw + envelope
      const freq = 400 + Math.sin(t * 15) * 50;
      data[i] = (Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 8));
    }
    return buffer;
  }

  static async playQuack(pitchVariation: number = 1.0) {
    if (!this.audioCtx || !this.buffer) await this.init();

    const source = this.audioCtx!.createBufferSource();
    source.buffer = this.buffer;
    
    // AI Sonic Variator Logic: subtly alter playback rate
    // Normal is 1.0. Random variance between 0.85 and 1.15
    const finalPitch = pitchVariation * (0.9 + Math.random() * 0.2);
    source.playbackRate.value = finalPitch;

    const gainNode = this.audioCtx!.createGain();
    gainNode.gain.setValueAtTime(0.5, this.audioCtx!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx!.currentTime + 0.4);

    source.connect(gainNode);
    gainNode.connect(this.audioCtx!.destination);

    source.start();
  }
}
