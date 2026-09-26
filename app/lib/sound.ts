"use client";

import { useSyncExternalStore } from "react";
import { BEAT_MS, reel } from "./reel";

/**
 * The reel's sound: everything is synthesised with Web Audio at runtime, so
 * there are no audio files to download. Off until the visitor turns it on;
 * browsers only let audio start after a click, tap or key press anyway.
 *
 * - a click track on the same 128 BPM grid as the HUD squares (hats always,
 *   a kick on the downbeat while you scroll)
 * - one-shots for UI and scene events: hover ticks, clicks, camcorder beeps,
 *   tape cuts, the slate clap, the language wipe, odometer ticks, an alarm
 */

const KEY = "reel-sound";
const LOOKAHEAD_S = 0.12;

type Listener = () => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private scheduler = 0;
  private lastBeat = -1;
  private last: Record<string, number> = {};
  private listeners = new Set<Listener>();
  private armed = false;
  enabled = false;

  /** Read the saved choice once on the client. Audio itself waits for a gesture. */
  boot() {
    if (this.armed || typeof window === "undefined") return;
    this.armed = true;
    try {
      this.enabled = localStorage.getItem(KEY) === "1";
    } catch {
      this.enabled = false;
    }
    const wake = () => {
      if (this.enabled) this.start();
    };
    // any of these counts as the user gesture browsers require before audio
    ["pointerdown", "keydown", "touchstart"].forEach((type) => window.addEventListener(type, wake, { passive: true }));
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend();
      else if (this.enabled) this.ctx.resume();
    });
    this.emit();
  }

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  /** Called from the toggle's click handler, which is itself the gesture that unlocks audio. */
  setEnabled(on: boolean) {
    this.enabled = on;
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
    } catch {
      // not persisted; the choice still applies to this visit
    }
    if (on) {
      this.start();
      this.click();
    } else if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0, now, 0.08);
      window.setTimeout(() => !this.enabled && this.ctx?.suspend(), 500);
    }
    this.emit();
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  private start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    ctx.resume();
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.9, now, 0.25);
    if (!this.scheduler) this.scheduler = window.setInterval(() => this.tickClock(), 25);
  }

  private build() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 1;
    this.sfx.connect(this.master);

    // one second of white noise, reused by every percussive sound
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
  }

  private live() {
    return this.enabled && this.ctx?.state === "running" && this.sfx && this.noise;
  }

  /** at most one sound of a kind every `ms` */
  private throttle(kind: string, ms: number) {
    const now = performance.now();
    if (now - (this.last[kind] ?? 0) < ms) return false;
    this.last[kind] = now;
    return true;
  }

  /** The click track: schedules the next beats of the shared 128 BPM grid slightly ahead. */
  private tickClock() {
    if (!this.live()) return;
    const ctx = this.ctx!;
    const nowMs = performance.now();
    const horizon = nowMs + LOOKAHEAD_S * 1000;
    let beat = Math.max(this.lastBeat + 1, Math.ceil(nowMs / BEAT_MS));
    while (beat * BEAT_MS < horizon) {
      const when = ctx.currentTime + (beat * BEAT_MS - nowMs) / 1000;
      this.hat(when, beat % 2 === 0 ? 0.045 : 0.028);
      if (beat % 4 === 0 && Math.abs(reel.velocity) > 1.5) this.kick(when, 0.32);
      this.lastBeat = beat;
      beat++;
    }
  }

  private noiseBurst(when: number, dur: number, gain: number, filter: BiquadFilterType, freq: number, q = 1) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(f).connect(g).connect(this.sfx!);
    src.start(when, Math.random() * 0.5, dur + 0.02);
  }

  private tone(when: number, type: OscillatorType, from: number, to: number, dur: number, gain: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, when);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, when + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g).connect(this.sfx!);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  private hat(when: number, gain: number) {
    this.noiseBurst(when, 0.035, gain, "highpass", 7500, 0.7);
  }

  private kick(when: number, gain: number) {
    this.tone(when, "sine", 140, 42, 0.22, gain);
  }

  /** hovering something clickable */
  hover() {
    if (!this.live() || !this.throttle("hover", 45)) return;
    this.noiseBurst(this.ctx!.currentTime, 0.018, 0.09, "bandpass", 3400, 3);
  }

  /** pressing something */
  click() {
    if (!this.live()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, "square", 1200, 600, 0.05, 0.05);
    this.noiseBurst(t, 0.02, 0.12, "highpass", 2500);
  }

  /** a new scene reached: the camcorder's double beep */
  scene() {
    if (!this.live() || !this.throttle("scene", 300)) return;
    const t = this.ctx!.currentTime;
    this.tone(t, "sine", 1760, 1760, 0.05, 0.05);
    this.tone(t + 0.09, "sine", 1760, 1760, 0.05, 0.05);
  }

  /** a hard cut between shots (projects, timeline panels) */
  cut() {
    if (!this.live() || !this.throttle("cut", 120)) return;
    const t = this.ctx!.currentTime;
    this.tone(t, "square", 220, 110, 0.07, 0.04);
    this.noiseBurst(t, 0.05, 0.1, "lowpass", 900);
  }

  /** the kinetic-type word change */
  thump() {
    if (!this.live() || !this.throttle("thump", 150)) return;
    const t = this.ctx!.currentTime;
    this.kick(t, 0.5);
    this.noiseBurst(t, 0.06, 0.18, "bandpass", 1800, 1.2);
  }

  /** one odometer digit passing */
  tick() {
    if (!this.live() || !this.throttle("tick", 28)) return;
    this.noiseBurst(this.ctx!.currentTime, 0.008, 0.07, "highpass", 3000);
  }

  /** the slate's clapper closing */
  clap() {
    if (!this.live()) return;
    const t = this.ctx!.currentTime;
    [0, 0.011, 0.023].forEach((d, i) => this.noiseBurst(t + d, i === 2 ? 0.16 : 0.012, 0.45, "bandpass", 1400, 0.9));
    this.tone(t, "sine", 180, 70, 0.09, 0.25);
  }

  /** a filtered-noise sweep, for wipes */
  whoosh(duration = 0.9) {
    if (!this.live() || !this.throttle("whoosh", 200)) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(260, t);
    f.frequency.exponentialRampToValueAtTime(4200, t + duration * 0.45);
    f.frequency.exponentialRampToValueAtTime(320, t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + duration * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(f).connect(g).connect(this.sfx!);
    src.start(t);
    src.stop(t + duration + 0.05);
  }

  /** the context window overflowing */
  alarm() {
    if (!this.live() || !this.throttle("alarm", 1200)) return;
    const t = this.ctx!.currentTime;
    [0, 0.14, 0.28].forEach((d, i) => this.tone(t + d, "square", i % 2 ? 660 : 880, i % 2 ? 660 : 880, 0.1, 0.035));
  }
}

export const sound = new SoundEngine();

export function useSoundEnabled() {
  return useSyncExternalStore(
    sound.subscribe,
    () => sound.enabled,
    () => false,
  );
}
