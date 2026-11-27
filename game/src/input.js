// Keyboard + mouse input for Turkey's Great Escape. One clear job: turn raw
// key and pointer events into the tiny input object the world steps with.

export function createInput(canvas) {
  const keys = new Set();
  const input = {
    jumpQueued: false, // edge: consumed by the world on the next step
    hideHeld: false,
    pauseQueued: false,
    restartQueued: false,
    startQueued: false,
    anyQueued: false,
  };

  function onKeyDown(event) {
    const code = event.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'KeyH', 'KeyP', 'KeyR', 'Enter'].includes(code)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(code);
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') input.jumpQueued = true;
    if (code === 'Enter' || code === 'Space') input.startQueued = true;
    if (code === 'KeyP') input.pauseQueued = true;
    if (code === 'KeyR') input.restartQueued = true;
    input.anyQueued = true;
  }
  function onKeyUp(event) {
    keys.delete(event.code);
  }
  function onPointerDown(event) {
    event.preventDefault();
    input.jumpQueued = true;
    input.startQueued = true;
    input.anyQueued = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  // Read the held keys each step: Down / H / S hides the turkey.
  input.pollHeld = function pollHeld() {
    input.hideHeld = keys.has('ArrowDown') || keys.has('KeyH') || keys.has('KeyS');
    return input;
  };
  // Clear the one-shot queues after the world consumed them.
  input.consume = function consume() {
    input.jumpQueued = false;
    input.pauseQueued = false;
    input.restartQueued = false;
    input.startQueued = false;
    input.anyQueued = false;
  };
  return input;
}
