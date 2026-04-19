/**
 * @description Procedural Web Audio API synthesizer for 0-byte sound & music.
 * @author Abyssal Forge
 * @version 1.0.0
 */

export class AudioSystem {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static ambientOscillators: OscillatorNode[] = [];
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public static resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Procedurally generates a dark ambient drone using detuned sine waves
   * and a slow LFO to modulate volume, creating a breathing atmosphere.
   */
  public static playAmbientTrack() {
    if (!this.ctx || !this.masterGain) return;
    this.stopAmbientTrack();

    const baseFreq = 55; // Deep A1
    const frequencies = [baseFreq, baseFreq * 1.01, baseFreq * 1.5, baseFreq * 2];
    
    // Create a reverb-like wash using a long delay with feedback
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.7;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.6;
    delay.connect(feedback);
    feedback.connect(delay);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Muffled dark sound
    
    filter.connect(delay);
    filter.connect(this.masterGain);
    delay.connect(this.masterGain);

    frequencies.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.value = freq;

      const oscGain = this.ctx!.createGain();
      oscGain.gain.value = 0; // Start silent

      // Slow breathing LFO
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + (i * 0.01); // Very slow
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 0.05; // Gentle modulation
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start();
      lfo.start();

      // Fade in
      oscGain.gain.setTargetAtTime(0.08 / frequencies.length, this.ctx!.currentTime, 5);
      
      this.ambientOscillators.push(osc);
      this.ambientOscillators.push(lfo);
    });
  }

  public static stopAmbientTrack() {
    this.ambientOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.ambientOscillators = [];
  }

  /**
   * Procedural sword swing: burst of filtered white noise
   */
  public static playSwing() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.2; // 200ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    // Sweep the filter down rapidly to simulate a whoosh
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  /**
   * Procedural hit/crunch: lower frequency noise burst
   */
  public static playHit() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.8;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  /**
   * Procedural UI click: quick percussive sine wave
   */
  public static playUIClick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}
