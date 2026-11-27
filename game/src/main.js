// Boot + loop for Turkey's Great Escape. One clear job: own the screens
// (title, play, pause, caught, escaped), run the fixed-step loop, play tiny
// WebAudio blips, and stage the deterministic ?shot=start|play|end scenes
// the screenshots are taken from.
import { STEP } from './config.js';
import { createInput } from './input.js';
import { createWorld, autopilotFor, EVENT_OVER, EVENT_WIN, EVENT_HIT, EVENT_LEVEL } from './world.js';
import {
  drawWorld, drawTitle, drawEnd,
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER, SCREEN_WIN, SCREEN_PAUSE,
} from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 1) || 1;
const shot = params.get('shot');

const world = createWorld(seed);
const input = createInput(canvas);

let screen = SCREEN_TITLE;
let accumulator = 0;
let lastTime = 0;

// --- Tiny WebAudio blips (no audio files, nothing fetched). ---
let audioCtx = null;
function blip(freq, ms, type) {
  try {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + ms / 1000);
  } catch { /* sound is decoration; a silent game still plays */ }
}
function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch { /* no audio, no problem */ }
}
window.addEventListener('keydown', unlockAudio, { once: true });
canvas.addEventListener('pointerdown', unlockAudio, { once: true });

function startRun() {
  world.reset();
  screen = SCREEN_PLAY;
  accumulator = 0;
  lastTime = performance.now();
}

function stepOnce() {
  input.pollHeld();
  const events = world.step(STEP, input, null);
  if (events & EVENT_HIT) blip(140, 180, 'sawtooth');
  if (events & EVENT_LEVEL) blip(660, 120, 'triangle');
  if (events & EVENT_WIN) {
    screen = SCREEN_WIN;
    blip(880, 400, 'triangle');
  } else if (events & EVENT_OVER) {
    screen = SCREEN_OVER;
    blip(110, 500, 'sawtooth');
  }
  if (input.jumpQueued && world.state.player.grounded) blip(420, 90, 'square');
  input.consume();
}

function frame(now) {
  if (screen !== SCREEN_PLAY && screen !== SCREEN_PAUSE) return;
  const delta = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (screen === SCREEN_PLAY) {
    accumulator += delta;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      stepOnce();
      if (screen !== SCREEN_PLAY) break;
    }
  }
  if (screen === SCREEN_PLAY) drawWorld(ctx, world, SCREEN_PLAY);
  else if (screen === SCREEN_PAUSE) drawWorld(ctx, world, SCREEN_PAUSE);
  else if (screen === SCREEN_WIN) drawEnd(ctx, world, true);
  else if (screen === SCREEN_OVER) drawEnd(ctx, world, false);
  requestAnimationFrame(frame);
}

function onKey() {
  if (input.pauseQueued && screen === SCREEN_PLAY) {
    screen = SCREEN_PAUSE;
    input.consume();
    return;
  }
  if (input.pauseQueued && screen === SCREEN_PAUSE) {
    screen = SCREEN_PLAY;
    lastTime = performance.now();
    input.consume();
    requestAnimationFrame(frame);
    return;
  }
  if (screen === SCREEN_TITLE && input.startQueued) {
    startRun();
    input.consume();
    requestAnimationFrame(frame);
    return;
  }
  if ((screen === SCREEN_OVER || screen === SCREEN_WIN) && (input.restartQueued || input.startQueued)) {
    startRun();
    input.consume();
    requestAnimationFrame(frame);
    return;
  }
  input.consume();
}
window.addEventListener('keydown', onKey);
canvas.addEventListener('pointerdown', () => {
  if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) onKey();
});

// --- Deterministic screenshot scenes: simulate the real rules forward, then
// draw one frame and stop. The same ?seed= always gives the same frame. ---
function stageShot(name) {
  world.reset();
  if (name === 'start') {
    for (let i = 0; i < 5 / STEP; i += 1) {
      world.step(STEP, null, autopilotFor(world, 1));
    }
    drawTitle(ctx, world);
    return;
  }
  if (name === 'play') {
    for (const seconds of [14, 10, 6]) {
      world.reset();
      let alive = true;
      for (let i = 0; i < seconds / STEP; i += 1) {
        const events = world.step(STEP, null, autopilotFor(world, 1));
        if (events & EVENT_OVER) { alive = false; break; }
      }
      if (alive && world.state.lives > 0) break;
    }
    drawWorld(ctx, world, SCREEN_PLAY);
    return;
  }
  // end: a hurried turkey that never jumps gets caught, as a hurried player is.
  for (let i = 0; i < 600 / STEP; i += 1) {
    const events = world.step(STEP, null, autopilotFor(world, 0));
    if (events & EVENT_OVER) break;
  }
  drawEnd(ctx, world, world.state.escaped);
}

if (shot) {
  stageShot(shot);
} else {
  drawTitle(ctx, world);
}
