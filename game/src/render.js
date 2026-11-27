// Rendering: everything the player sees, drawn on one canvas with plain
// 2D shapes in an autumn palette. One clear job: draw the world and the
// screens (title, play HUD, caught, escaped) — no game logic here.
import { FIELD, LEVELS, CORN_SNACKS, UPGRADES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';
export const SCREEN_PAUSE = 'pause';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTurkey(ctx, x, y, w, h, t, hidden) {
  if (hidden) return; // tucked away inside the hiding spot
  const bob = Math.sin(t * 10) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  // tail feathers
  ctx.fillStyle = '#8d5a2b';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(8, 26);
    ctx.rotate(i * 0.45);
    ctx.beginPath();
    ctx.ellipse(-16, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // body
  ctx.fillStyle = '#6d4c2f';
  ctx.beginPath();
  ctx.ellipse(30, 30, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // wing
  ctx.fillStyle = '#54371f';
  ctx.beginPath();
  ctx.ellipse(28, 32, 14, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // head + beak + wattle
  ctx.fillStyle = '#8d5a2b';
  ctx.beginPath();
  ctx.arc(52, 14, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.moveTo(60, 12); ctx.lineTo(72, 16); ctx.lineTo(60, 20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(56, 24, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(54, 11, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(55, 11, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 3;
  const step = Math.sin(t * 14) * 6;
  ctx.beginPath();
  ctx.moveTo(24, 50); ctx.lineTo(20 + step, 56);
  ctx.moveTo(36, 50); ctx.lineTo(40 - step, 56);
  ctx.stroke();
  ctx.restore();
}

function drawFarmer(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // overalls body
  ctx.fillStyle = '#2e5aa8';
  roundRect(ctx, 6, 18, 34, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#e8b06a';
  ctx.beginPath();
  ctx.arc(23, 12, 12, 0, Math.PI * 2);
  ctx.fill();
  // straw hat
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(23, 4, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(11, -4, 24, 8);
  // beard + angry eyes
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.arc(23, 20, 7, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.fillRect(16, 10, 4, 2);
  ctx.fillRect(26, 10, 4, 2);
  // pitchfork
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(44, 60); ctx.lineTo(50, 0);
  ctx.stroke();
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, 2); ctx.lineTo(50, -8);
  ctx.moveTo(50, 0); ctx.lineTo(56, -8);
  ctx.stroke();
  // legs mid-run
  ctx.strokeStyle = '#2e5aa8';
  ctx.lineWidth = 5;
  const step = Math.sin(t * 12) * 7;
  ctx.beginPath();
  ctx.moveTo(16, 62); ctx.lineTo(12 + step, 76);
  ctx.moveTo(30, 62); ctx.lineTo(34 - step, 76);
  ctx.stroke();
  ctx.restore();
}

function drawHazard(ctx, hazard, t) {
  const { kind, x, y, width, height } = hazard;
  ctx.save();
  if (kind === 'oven') {
    ctx.fillStyle = '#222';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height - 14, 22, 12 + Math.sin(t * 8) * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height - 12, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('OVEN', x + width / 2, y + 20);
  } else if (kind === 'knife') {
    const dip = Math.sin(hazard.swing || 0) * 10;
    ctx.translate(x + width / 2, y + 8 + dip);
    ctx.rotate(0.5);
    ctx.fillStyle = '#dfe6e9';
    ctx.beginPath();
    ctx.moveTo(-28, 0); ctx.lineTo(28, -8); ctx.lineTo(28, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6d4c2f';
    ctx.fillRect(-34, -5, 12, 10);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 11px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('KNIFE!', 0, -14);
  } else if (kind === 'fence') {
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(x, y, 6, height);
    ctx.fillRect(x + width - 6, y, 6, height);
    ctx.fillRect(x - 4, y + 10, width + 8, 7);
    ctx.fillRect(x - 4, y + 28, width + 8, 7);
  } else { // pumpkin, rolling
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(hazard.roll || 0);
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c85a00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-3, -26, 6, 10);
  }
  ctx.restore();
}

function drawFriend(ctx, friend) {
  ctx.save();
  ctx.translate(friend.x, friend.y);
  ctx.fillStyle = friend.color;
  ctx.beginPath();
  ctx.ellipse(29, 34, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(48, 18, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(51, 16, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.moveTo(58, 16); ctx.lineTo(66, 19); ctx.lineTo(58, 22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2b1608';
  ctx.font = 'bold 12px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(friend.name, 29, -8);
  ctx.restore();
}

function drawSpot(ctx, spot) {
  ctx.save();
  if (spot.kind === 'haystack') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(spot.x, spot.y + spot.height);
    ctx.quadraticCurveTo(spot.x + spot.width / 2, spot.y - 14, spot.x + spot.width, spot.y + spot.height);
    ctx.closePath(); ctx.fill();
  } else if (spot.kind === 'barrel') {
    ctx.fillStyle = '#8d5a2b';
    roundRect(ctx, spot.x + 14, spot.y + 4, spot.width - 28, spot.height - 4, 8);
    ctx.fill();
    ctx.strokeStyle = '#54371f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(spot.x + 14, spot.y + 22); ctx.lineTo(spot.x + spot.width - 14, spot.y + 22);
    ctx.moveTo(spot.x + 14, spot.y + 44); ctx.lineTo(spot.x + spot.width - 14, spot.y + 44);
    ctx.stroke();
  } else if (spot.kind === 'bush') {
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(spot.x + 22, spot.y + 40, 24, 0, Math.PI * 2);
    ctx.arc(spot.x + 52, spot.y + 30, 26, 0, Math.PI * 2);
    ctx.arc(spot.x + 68, spot.y + 44, 20, 0, Math.PI * 2);
    ctx.fill();
  } else if (spot.kind === 'coop') {
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(spot.x + 10, spot.y + 14, spot.width - 20, spot.height - 14);
    ctx.fillStyle = '#7a3b12';
    ctx.beginPath();
    ctx.moveTo(spot.x, spot.y + 16); ctx.lineTo(spot.x + spot.width / 2, spot.y - 6); ctx.lineTo(spot.x + spot.width, spot.y + 16);
    ctx.closePath(); ctx.fill();
  } else if (spot.kind === 'pumpkin') {
    ctx.fillStyle = '#e67e22';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(spot.x + 18 + i * 24, spot.y + 44, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else { // well
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(spot.x + 12, spot.y + 20, spot.width - 24, spot.height - 20);
    ctx.fillStyle = '#7a3b12';
    ctx.fillRect(spot.x + 6, spot.y, 8, 30);
    ctx.fillRect(spot.x + spot.width - 14, spot.y, 8, 30);
    ctx.fillRect(spot.x, spot.y - 4, spot.width, 10);
  }
  ctx.fillStyle = 'rgba(43,22,8,0.85)';
  ctx.font = 'bold 11px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`HIDE: ${spot.label}`, spot.x + spot.width / 2, spot.y + spot.height + 14);
  ctx.restore();
}

export function drawWorld(ctx, world, screen) {
  const state = world.state;
  const t = state.time;
  const shakeX = world.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  ctx.save();
  ctx.translate(shakeX, 0);
  // Sky, sun, clouds, hills, farmhouse.
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD.groundY);
  sky.addColorStop(0, '#ff9a3d');
  sky.addColorStop(0.6, '#ffc46b');
  sky.addColorStop(1, '#ffe0a3');
  ctx.fillStyle = sky;
  ctx.fillRect(-10, 0, FIELD.width + 20, FIELD.groundY);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(840, 80, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const [cx, cy] of [[150, 70], [420, 50], [650, 90]]) {
    ctx.beginPath();
    ctx.ellipse(cx + ((state.distanceM * 2) % 1200) * -0.02, cy, 46, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#9dbb6a';
  ctx.beginPath();
  ctx.moveTo(-10, FIELD.groundY);
  ctx.quadraticCurveTo(240, 400, 480, FIELD.groundY);
  ctx.quadraticCurveTo(720, 420, 970, FIELD.groundY);
  ctx.closePath();
  ctx.fill();
  // farmhouse + barn silhouettes
  ctx.fillStyle = '#b5542c';
  ctx.fillRect(700, 380, 130, 90);
  ctx.fillStyle = '#7a3b12';
  ctx.beginPath();
  ctx.moveTo(690, 382); ctx.lineTo(765, 340); ctx.lineTo(840, 382);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8d2f1d';
  ctx.fillRect(60, 400, 110, 70);
  ctx.fillStyle = '#5c1e10';
  ctx.beginPath();
  ctx.moveTo(52, 402); ctx.lineTo(115, 366); ctx.lineTo(178, 402);
  ctx.closePath(); ctx.fill();
  // Ground.
  ctx.fillStyle = '#a9713f';
  ctx.fillRect(-10, FIELD.groundY, FIELD.width + 20, FIELD.height - FIELD.groundY);
  ctx.fillStyle = '#8d5a2b';
  ctx.fillRect(-10, FIELD.groundY, FIELD.width + 20, 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  for (let x = 0; x < FIELD.width; x += 60) {
    const off = (state.distanceM * 50) % 60;
    ctx.beginPath();
    ctx.moveTo(x - off, FIELD.groundY + 30);
    ctx.lineTo(x - off + 30, FIELD.groundY + 66);
    ctx.stroke();
  }

  for (const spot of state.spots) if (spot.active) drawSpot(ctx, spot);
  for (const friend of state.friends) if (friend.active) drawFriend(ctx, friend);
  for (const corn of state.corns) {
    if (!corn.active) continue;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.ellipse(corn.x + 13, corn.y + 13, 11, 15, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(corn.x + 8, corn.y + 24, 10, 6);
  }
  for (const up of state.upgrades) {
    if (!up.active) continue;
    ctx.fillStyle = '#9b59b6';
    roundRect(ctx, up.x, up.y, up.width, up.height, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('★', up.x + up.width / 2, up.y + 25);
    ctx.font = 'bold 9px Georgia';
    ctx.fillText(up.name.split(' ')[0].toUpperCase(), up.x + up.width / 2, up.y + up.height + 11);
  }
  for (const hazard of state.hazards) if (hazard.active) drawHazard(ctx, hazard, t);

  // The farmer, chasing from the left by his gap behind the turkey.
  const farmerX = state.player.x - state.farmerGap;
  drawFarmer(ctx, farmerX, FIELD.groundY - 78, t);
  drawTurkey(ctx, state.player.x, state.player.y, state.player.width, state.player.height, t, state.player.hidden);
  if (state.player.hidden && state.player.hiddenSpot) {
    ctx.fillStyle = 'rgba(43,22,8,0.9)';
    ctx.font = 'bold 14px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(`HIDING in the ${state.player.hiddenSpot.label}… shhh!`, state.player.x + 30, state.player.y - 14);
  }
  ctx.restore();

  // HUD: score, distance, lives, level, corn, upgrades.
  ctx.fillStyle = 'rgba(43,22,8,0.88)';
  roundRect(ctx, 10, 10, FIELD.width - 20, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 17px Georgia';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 24, 38);
  ctx.fillText(`DIST ${Math.floor(state.distanceM)}m / ${7200}m`, 200, 38);
  ctx.fillText(`LEVEL ${state.level + 1}/18 ${LEVELS[state.level].name}`, 430, 38);
  ctx.fillStyle = '#ffd23f';
  ctx.fillText(`🌽 ${state.corn}`, 760, 38);
  ctx.fillStyle = '#ff6b6b';
  ctx.fillText('♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 5 - state.lives)), 850, 38);
  if (state.shield) {
    ctx.fillStyle = '#7ed6ff';
    ctx.font = 'bold 13px Georgia';
    ctx.fillText('🛡 SHIELD', 24, 72);
  }
  if (state.doubleTimer > 0) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 13px Georgia';
    ctx.fillText(`2× SCORE ${Math.ceil(state.doubleTimer)}s`, 140, 72);
  }
  if (world.toastTimer > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 15px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(world.toast, FIELD.width / 2, 96);
  }
  if (screen === SCREEN_PAUSE) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', FIELD.width / 2, 270);
    ctx.font = '17px Georgia';
    ctx.fillText('Press P to keep running — the farmer waits for no turkey.', FIELD.width / 2, 305);
  }
}

function panel(ctx) {
  ctx.fillStyle = 'rgba(43,22,8,0.82)';
  roundRect(ctx, 90, 70, FIELD.width - 180, FIELD.height - 140, 18);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function bigButton(ctx, label, y) {
  ctx.fillStyle = '#ff6b35';
  roundRect(ctx, FIELD.width / 2 - 170, y, 340, 52, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(label, FIELD.width / 2, y + 35);
}

export function drawTitle(ctx, world) {
  drawWorld(ctx, world, SCREEN_TITLE);
  ctx.fillStyle = 'rgba(43,22,8,0.45)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  panel(ctx);
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 44px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText("TURKEY'S GREAT ESCAPE", FIELD.width / 2, 140);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 19px Georgia';
  ctx.fillText('18 Levels  •  24 Corn Snacks  •  8 Farm Friends', FIELD.width / 2, 178);
  ctx.fillText('21 Upgrades  •  6 Hiding Spots', FIELD.width / 2, 205);
  ctx.font = '16px Georgia';
  ctx.fillText('Thanksgiving is coming — and YOU are the main course.', FIELD.width / 2, 245);
  ctx.fillText('Outrun the farmer, jump the ovens, fences and carving knives,', FIELD.width / 2, 270);
  ctx.fillText('meet all 8 farm friends, and escape 7,200 m to freedom!', FIELD.width / 2, 295);
  ctx.font = '15px Georgia';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('SPACE / ↑ / CLICK to jump  •  Hold ↓ to hide  •  P pause  •  R restart', FIELD.width / 2, 335);
  bigButton(ctx, '▶  START THE ESCAPE', 360);
  ctx.fillStyle = '#e8b06a';
  ctx.font = '13px Georgia';
  ctx.fillText('A complete turkey escape game — title, run, HUD, caught & escaped endings.', FIELD.width / 2, 448);
}

export function drawEnd(ctx, world, won) {
  drawWorld(ctx, world, won ? SCREEN_WIN : SCREEN_OVER);
  ctx.fillStyle = 'rgba(43,22,8,0.5)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  panel(ctx);
  const state = world.state;
  ctx.fillStyle = won ? '#7ed67e' : '#ff6b6b';
  ctx.font = 'bold 44px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(won ? '🦃 ESCAPED!' : '😱 CAUGHT!', FIELD.width / 2, 150);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = '19px Georgia';
  ctx.fillText(
    won
      ? 'You outran the farmer, the oven and the carving knife —'
      : 'The farmer got you… but every great escape deserves a retry.',
    FIELD.width / 2, 190,
  );
  ctx.fillText(
    won ? 'Thanksgiving dinner is cancelled. You are free!' : 'Thanksgiving dinner is still on the table. Run again!',
    FIELD.width / 2, 216,
  );
  ctx.font = 'bold 20px Georgia';
  ctx.fillText(`FINAL SCORE ${Math.floor(state.score)}   •   DISTANCE ${Math.floor(state.distanceM)} m`, FIELD.width / 2, 262);
  ctx.font = '17px Georgia';
  ctx.fillText(
    `Level ${state.level + 1}/18 “${LEVELS[state.level].name}”  •  🌽 ${state.corn} corn  •  ${state.jumps} jumps  •  ${state.hides} hides  •  ${state.collectedUpgrades.length}/21 upgrades`,
    FIELD.width / 2, 296,
  );
  ctx.fillStyle = '#ffd23f';
  ctx.font = '15px Georgia';
  ctx.fillText(
    `Corn snacks tasted: ${CORN_SNACKS.slice(0, Math.min(6, state.corn)).join(', ') || 'none yet — the corn misses you!'}`,
    FIELD.width / 2, 326,
  );
  bigButton(ctx, '↻  RUN AGAIN  (R)', 360);
  ctx.fillStyle = '#e8b06a';
  ctx.font = '13px Georgia';
  ctx.fillText('Turkey’s Great Escape — 18 levels, 24 corn snacks, 8 friends, 21 upgrades, 6 hiding spots.', FIELD.width / 2, 448);
}

export { UPGRADES };
