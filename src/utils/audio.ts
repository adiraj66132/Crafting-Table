/**
 * Minecraft-style Web Audio Synthesizer
 * Zero external audio files required, fast and responsive.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // ignore autoplay-policy rejections; next gesture retries
      });
    }
  }

  private blip(freq: number, end: number, dur: number, type: OscillatorType, vol: number) {
    this.initContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(end, t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(t + dur);
    } catch {
      // Audio fallback
    }
  }

  private arp(notes: number[], step: number, dur: number, type: OscillatorType, vol: number) {
    this.initContext();
    if (!this.ctx) return;
    try {
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const start = this.ctx.currentTime + idx * step;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // Audio error fallback
    }
  }

  // Wooden inventory slot click
  public playWoodClick() {
    this.blip(160, 40, 0.05, 'triangle', 0.18);
  }

  // Item select / pop sound
  public playPop() {
    this.blip(320, 680, 0.08, 'sine', 0.15);
  }

  // Crafting level-up / chime sound
  public playCraftSuccess() {
    this.arp([440, 554.37, 659.25, 880], 0.07, 0.25, 'sine', 0.12);
  }

  // Minecraft Level-Up / Advancement Fanfare
  public playLevelUp() {
    this.arp([523.25, 659.25, 783.99, 1046.5], 0.08, 0.35, 'triangle', 0.15);
  }
}

export const sound = new SoundEffects();
