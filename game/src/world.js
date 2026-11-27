// The world: turkey physics, the chasing farmer, hazards, corn, friends,
// hiding spots and upgrades. One clear job: step the run forward and report
// what happened, with no drawing and no DOM.
import {
  FIELD, PLAYER, STEP, WIN_DISTANCE_M, START_LIVES,
  LEVELS, CORN_SNACKS, FRIENDS, HIDING_SPOTS, UPGRADES, HAZARDS, makeRng,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_HIT = 1;
export const EVENT_OVER = 2;
export const EVENT_WIN = 4;
export const EVENT_LEVEL = 8;

const GROUND = FIELD.groundY;
const METERS_PER_PX = 0.02;

function levelFor(distanceM) {
  return Math.min(LEVELS.length - 1, Math.floor(distanceM / 400));
}

export function createWorld(seed) {
  const rng = makeRng(seed || 1);
  const world = {
    state: null,
    rng,
    spawnTimer: 0,
    friendTimer: 0,
    friendIndex: 0,
    spotTimer: 0,
    spotIndex: 0,
    upgradeTimer: 0,
    toast: '',
    toastTimer: 0,
    shake: 0,
  };

  world.reset = function reset() {
    world.state = {
      distanceM: 0,
      score: 0,
      lives: START_LIVES,
      corn: 0,
      level: 0,
      speed: LEVELS[0].speed,
      farmerGap: 340, // px behind the turkey; 0 means caught
      player: {
        x: PLAYER.x, y: GROUND - PLAYER.height,
        width: PLAYER.width, height: PLAYER.height,
        vy: 0, grounded: true, hidden: false, hiddenSpot: null,
      },
      hazards: [], corns: [], friends: [], spots: [], upgrades: [],
      shield: false, magnet: 0, doubleTimer: 0, slowTimer: 0, highJumpTimer: 0,
      collectedUpgrades: [],
      time: 0, jumps: 0, hides: 0, caught: false, escaped: false,
      best: 0,
    };
    world.spawnTimer = 0.9;
    world.friendTimer = 6;
    world.friendIndex = 0;
    world.spotTimer = 9;
    world.spotIndex = 0;
    world.upgradeTimer = 14;
    world.toast = '';
    world.toastTimer = 0;
    world.shake = 0;
  };

  function spawnHazard(state) {
    const level = LEVELS[state.level];
    const kind = HAZARDS[Math.floor(world.rng() * HAZARDS.length)];
    const base = { kind, x: FIELD.width + 40, active: true, passed: false };
    if (kind === 'oven') Object.assign(base, { y: GROUND - 74, width: 74, height: 74 });
    else if (kind === 'knife') Object.assign(base, { y: GROUND - 30, width: 66, height: 30, swing: 0 });
    else if (kind === 'fence') Object.assign(base, { y: GROUND - 46, width: 30, height: 46 });
    else Object.assign(base, { y: GROUND - 44, width: 44, height: 44, roll: 0 });
    state.hazards.push(base);
    // Corn trails arc over low hazards so a good jump pays.
    if (world.rng() < 0.6) {
      for (let i = 0; i < 3; i += 1) {
        state.corns.push({
          x: base.x + 10 + i * 26, y: GROUND - 96 - Math.abs(i - 1) * 26,
          width: 26, height: 26, active: true,
          snack: CORN_SNACKS[Math.floor(world.rng() * CORN_SNACKS.length)],
        });
      }
    }
    world.spawnTimer = level.gap * (0.8 + world.rng() * 0.5);
  }

  function spawnFriend(state) {
    const friend = FRIENDS[world.friendIndex % FRIENDS.length];
    world.friendIndex += 1;
    state.friends.push({
      ...friend, x: FIELD.width + 30, y: GROUND - 58, width: 58, height: 58,
      active: true, greeted: false,
    });
    world.friendTimer = 11 + world.rng() * 6;
  }

  function spawnSpot(state) {
    const spot = HIDING_SPOTS[world.spotIndex % HIDING_SPOTS.length];
    world.spotIndex += 1;
    state.spots.push({
      ...spot, x: FIELD.width + 30, y: GROUND - 66, width: 84, height: 66, active: true,
    });
    world.spotTimer = 13 + world.rng() * 6;
  }

  function spawnUpgrade(state) {
    const up = UPGRADES[Math.floor(world.rng() * UPGRADES.length)];
    state.upgrades.push({
      ...up, x: FIELD.width + 30, y: GROUND - 150 - world.rng() * 90,
      width: 34, height: 34, active: true,
    });
    world.upgradeTimer = 12 + world.rng() * 8;
  }

  function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function applyUpgrade(state, up) {
    state.collectedUpgrades.push(up.id);
    const pts = up.id === 'luck' ? 40 : 25;
    switch (up.id) {
      case 'shield': state.shield = true; break;
      case 'magnet': state.magnet = 12; break;
      case 'double': state.doubleTimer = 12; break;
      case 'slowmo': state.slowTimer = 8; break;
      case 'heart': state.lives = Math.min(5, state.lives + 1); break;
      case 'highjump': state.highJumpTimer = 10; break;
      default: state.score += pts; break;
    }
    world.toast = `${up.name} — ${up.desc}!`;
    world.toastTimer = 2.2;
  }

  function hurtTurkey(state, cause) {
    if (state.player.hidden) return EVENT_NONE; // hiding saves the turkey
    if (state.shield) {
      state.shield = false;
      world.toast = 'Feather Shield blocked the hit!';
      world.toastTimer = 2;
      return EVENT_NONE;
    }
    state.lives -= 1;
    state.farmerGap = Math.max(60, state.farmerGap - 120);
    world.shake = 0.35;
    world.toast = cause === 'farmer' ? 'The farmer nearly grabbed you!' : 'Ouch! That hurt!';
    world.toastTimer = 1.6;
    if (state.lives <= 0) {
      state.caught = true;
      return EVENT_HIT | EVENT_OVER;
    }
    return EVENT_HIT;
  }

  /** Step the run by dt seconds. `move` is -1/0/1 (autopilot) — the turkey mostly runs. */
  world.step = function step(dt, input, autopilot) {
    const state = world.state;
    if (state.caught || state.escaped) return EVENT_NONE;
    let events = EVENT_NONE;
    state.time += dt;
    const level = LEVELS[levelFor(state.distanceM)];
    if (levelFor(state.distanceM) !== state.level) {
      state.level = levelFor(state.distanceM);
      events |= EVENT_LEVEL;
      world.toast = `Level ${state.level + 1}: ${LEVELS[state.level].name}!`;
      world.toastTimer = 2.4;
    }
    state.speed = level.speed;
    const pxPerSec = state.speed * (state.slowTimer > 0 ? 0.85 : 1);
    state.distanceM += pxPerSec * dt * METERS_PER_PX;
    state.score += pxPerSec * dt * 0.05 * (state.doubleTimer > 0 ? 2 : 1);
    state.doubleTimer = Math.max(0, state.doubleTimer - dt);
    state.slowTimer = Math.max(0, state.slowTimer - dt);
    state.magnet = Math.max(0, state.magnet - dt);
    state.highJumpTimer = Math.max(0, state.highJumpTimer - dt);
    world.toastTimer = Math.max(0, world.toastTimer - dt);
    world.shake = Math.max(0, world.shake - dt);

    // The farmer: closes in slowly, faster after a hit; corn and friends push him back.
    const farmerSpeed = state.slowTimer > 0 ? 6 : 14;
    state.farmerGap -= farmerSpeed * dt;
    if (state.farmerGap <= 0) {
      state.farmerGap = 0;
      return hurtTurkey(state, 'farmer') | (state.caught ? EVENT_OVER : 0);
    }

    // Jump / hide from the player (or the autopilot in screenshot mode).
    const jump = autopilot ? autopilot.jump : input.jumpQueued;
    const hide = autopilot ? autopilot.hide : input.hideHeld;
    const p = state.player;
    if (jump && p.grounded && !p.hidden) {
      p.vy = PLAYER.jumpVelocity * (state.highJumpTimer > 0 ? 1.25 : 1);
      p.grounded = false;
      state.jumps += 1;
    }
    if (!p.grounded) {
      p.vy = Math.min(PLAYER.maxFall, p.vy + PLAYER.gravity * dt);
      p.y += p.vy * dt;
      if (p.y >= GROUND - p.height) {
        p.y = GROUND - p.height;
        p.vy = 0;
        p.grounded = true;
      }
    }
    // Hiding: only inside a hiding spot, only on the ground.
    p.hidden = false;
    p.hiddenSpot = null;
    if (hide && p.grounded) {
      for (const spot of state.spots) {
        if (spot.active && overlaps({ ...p, width: p.width + 30, x: p.x - 15 }, spot)) {
          p.hidden = true;
          p.hiddenSpot = spot;
          state.hides += 1;
          break;
        }
      }
    }
    if (p.hidden) state.farmerGap = Math.min(420, state.farmerGap + 60 * dt);

    // Spawning.
    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) spawnHazard(state);
    world.friendTimer -= dt;
    if (world.friendTimer <= 0) spawnFriend(state);
    world.spotTimer -= dt;
    if (world.spotTimer <= 0) spawnSpot(state);
    world.upgradeTimer -= dt;
    if (world.upgradeTimer <= 0) spawnUpgrade(state);

    // Move everything left; cull what left the screen.
    const move = (list) => {
      for (const item of list) {
        item.x -= pxPerSec * dt;
        if (item.kind === 'knife') item.swing = (item.swing || 0) + dt * 3;
        if (item.kind === 'pumpkin') item.roll = (item.roll || 0) + dt * 6;
      }
      return list.filter((item) => item.active && item.x > -120);
    };
    state.hazards = move(state.hazards);
    state.corns = move(state.corns);
    state.friends = move(state.friends);
    state.spots = move(state.spots);
    state.upgrades = move(state.upgrades);

    // Corn magnet pulls nearby corn in.
    for (const corn of state.corns) {
      if (!corn.active) continue;
      if (state.magnet > 0) {
        const dx = p.x - corn.x;
        const dy = p.y - corn.y;
        if (Math.abs(dx) < 220 && Math.abs(dy) < 160) {
          corn.x += dx * dt * 6;
          corn.y += dy * dt * 6;
        }
      }
      if (overlaps(p, corn)) {
        corn.active = false;
        state.corn += 1;
        state.score += (state.doubleTimer > 0 ? 20 : 10);
        state.farmerGap = Math.min(420, state.farmerGap + 8);
        world.toast = corn.snack + '! +10';
        world.toastTimer = 1.1;
      }
    }

    // Friends greet and pay a bonus when the turkey runs past.
    for (const friend of state.friends) {
      if (!friend.active) continue;
      if (!friend.greeted && friend.x < p.x + p.width) {
        friend.greeted = true;
        state.score += friend.bonus * (state.doubleTimer > 0 ? 2 : 1);
        state.farmerGap = Math.min(420, state.farmerGap + 25);
        world.toast = `${friend.name}: “${friend.tip}” +${friend.bonus}`;
        world.toastTimer = 2.2;
      }
    }

    // Upgrades.
    for (const up of state.upgrades) {
      if (up.active && overlaps(p, up)) {
        up.active = false;
        applyUpgrade(state, up);
      }
    }

    // Hazards: jump them or get hurt. A passed hazard pays +5.
    for (const hazard of state.hazards) {
      if (!hazard.active) continue;
      if (!hazard.passed && hazard.x + hazard.width < p.x) {
        hazard.passed = true;
        state.score += 5;
      }
      if (overlaps(p, hazard)) {
        hazard.active = false;
        events |= hurtTurkey(state, hazard.kind);
        if (state.caught) return events | EVENT_OVER;
      }
    }

    // Win: the turkey reaches the end of level 18 — Thanksgiving dinner is escaped.
    if (state.distanceM >= WIN_DISTANCE_M) {
      state.escaped = true;
      state.score += 500;
      return events | EVENT_WIN;
    }
    state.best = Math.max(state.best, Math.floor(state.score));
    return events;
  };

  world.reset();
  return world;
}

/**
 * Screenshot autopilot: look ahead, jump the nearest hazard, hide when the
 * farmer is close and a spot is near. `skill` 1 plays well, 0 never jumps.
 */
export function autopilotFor(world, skill) {
  const state = world.state;
  const p = state.player;
  let jump = false;
  let hide = false;
  if (skill > 0) {
    for (const hazard of state.hazards) {
      if (!hazard.active) continue;
      const gap = hazard.x - (p.x + p.width);
      if (gap > 0 && gap < 150 + state.speed * 0.12) { jump = true; break; }
    }
    if (state.farmerGap < 130) {
      for (const spot of state.spots) {
        if (spot.active && Math.abs(spot.x - p.x) < 120) { hide = true; break; }
      }
    }
  }
  return { jump, hide };
}
