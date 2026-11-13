/** A soft bubble pop for control hovers, synthesized with Web Audio so the skin ships no audio files. */

const MIN_GAP_SECONDS = 0.05;
const PEAK_GAIN = 0.03;

let context: AudioContext | null = null;
let lastPopAt = -Infinity;

/** Browsers keep the context suspended until a gesture, so the first one in the player resumes it. */
export function unlockPopSound() {
  if (typeof AudioContext === "undefined") return;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume().catch(() => {});
}

/** Plays one pop, or nothing before the first gesture or when pops arrive faster than they can be told apart. */
export function playPop() {
  if (!context || context.state !== "running") return;

  const start = context.currentTime;
  if (start - lastPopAt < MIN_GAP_SECONDS) return;
  lastPopAt = start;

  // A rising chirp with a fast decay reads as a bubble; a little pitch jitter keeps repeats from sounding mechanical.
  const jitter = 1 + (Math.random() - 0.5) * 0.12;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(240 * jitter, start);
  oscillator.frequency.exponentialRampToValueAtTime(560 * jitter, start + 0.06);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(PEAK_GAIN, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.1);
  oscillator.onended = () => gain.disconnect();
}
