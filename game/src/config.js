// Turkey's Great Escape — tuning and content tables.
// One clear job: every number, name and list the game uses lives here.

export const FIELD = { width: 960, height: 540, groundY: 470 };
export const PLAYER = {
  x: 170, width: 62, height: 56, groundY: 470,
  jumpVelocity: -640, gravity: 1750, maxFall: 900,
};
export const STEP = 1 / 60;
export const WIN_DISTANCE_M = 7200; // finish line: end of level 18
export const START_LIVES = 3;

// 18 levels: farmyard to kitchen, each 400 m, faster and busier as the turkey runs.
export const LEVELS = [
  { name: 'Farmyard Dawn', speed: 230, gap: 1.15 },
  { name: 'Hay Bale Alley', speed: 245, gap: 1.10 },
  { name: 'Cornfield Rows', speed: 260, gap: 1.05 },
  { name: 'Duck Pond Dash', speed: 275, gap: 1.00 },
  { name: 'Pumpkin Patch', speed: 290, gap: 0.97 },
  { name: 'Old Barn Doors', speed: 305, gap: 0.94 },
  { name: 'Chicken Coop Run', speed: 320, gap: 0.91 },
  { name: 'Goat Hill Climb', speed: 335, gap: 0.88 },
  { name: 'Windmill Turn', speed: 350, gap: 0.85 },
  { name: 'Apple Orchard', speed: 365, gap: 0.83 },
  { name: 'Creek Crossing', speed: 380, gap: 0.81 },
  { name: 'Smokehouse Lane', speed: 395, gap: 0.79 },
  { name: 'Cellar Steps', speed: 410, gap: 0.77 },
  { name: 'Pantry Passage', speed: 425, gap: 0.75 },
  { name: 'Back Porch Sprint', speed: 440, gap: 0.73 },
  { name: 'Dining Room Door', speed: 455, gap: 0.71 },
  { name: 'Kitchen Tiles', speed: 470, gap: 0.69 },
  { name: 'Thanksgiving Table', speed: 490, gap: 0.67 },
];

// 24 corn snacks: every corn cob the turkey grabs is one of these, named on pickup.
export const CORN_SNACKS = [
  'Butter Corn', 'Caramel Corn', 'Honey Corn', 'Chilli Corn', 'Cheese Corn',
  'Smoky Corn', 'Maple Corn', 'Garlic Corn', 'Popcorn', 'Corn Fritters',
  'Cornbread Bite', 'Roasted Cob', 'Sweet Corn', 'Corn Chowder', 'Corn Salsa',
  'Grilled Corn', 'Corn Pudding', 'Corn Nuggets', 'Spiced Corn', 'Corn Muffin',
  'Corn Soup', 'Corn Chips', 'Golden Cob', 'Harvest Corn',
];

// 8 farm friends: each cheers the turkey on and hands over a bonus when passed.
export const FRIENDS = [
  { species: 'hen', name: 'Henny the Hen', tip: 'Peck fast, run faster!', bonus: 25, color: '#fff3e0' },
  { species: 'duck', name: 'Daffy the Duck', tip: 'Quack and dodge!', bonus: 25, color: '#ffe082' },
  { species: 'goat', name: 'Gus the Goat', tip: 'Headbutt the fence, not the knife!', bonus: 30, color: '#d7ccc8' },
  { species: 'sheep', name: 'Shauna the Sheep', tip: 'Stay woolly, stay hidden!', bonus: 30, color: '#f5f5f5' },
  { species: 'cow', name: 'Bessie the Cow', tip: 'Moo-ve those legs!', bonus: 35, color: '#eceff1' },
  { species: 'rabbit', name: 'Ruby the Rabbit', tip: 'Hop the oven, skip the knife!', bonus: 35, color: '#ef9a9a' },
  { species: 'dog', name: 'Buddy the Dog', tip: 'Bark twice, then sprint!', bonus: 40, color: '#a1887f' },
  { species: 'cat', name: 'Mittens the Cat', tip: 'Nine lives — you only need three!', bonus: 40, color: '#ffcc80' },
];

// 6 hiding spots: hold Down / H inside one and the farmer walks straight past.
export const HIDING_SPOTS = [
  { kind: 'haystack', label: 'Haystack' },
  { kind: 'barrel', label: 'Barrel' },
  { kind: 'bush', label: 'Bush' },
  { kind: 'coop', label: 'Chicken Coop' },
  { kind: 'pumpkin', label: 'Pumpkin Patch' },
  { kind: 'well', label: 'Old Well' },
];

// 21 upgrades: cards the turkey collects mid-run. The first six change the rules
// (shield, magnet, double score, slow farmer, extra heart, high jump); the rest are
// lucky trinkets worth bonus points and a cheer.
export const UPGRADES = [
  { id: 'shield', name: 'Feather Shield', desc: 'Blocks one hit' },
  { id: 'magnet', name: 'Corn Magnet', desc: 'Pulls corn to you' },
  { id: 'double', name: 'Double Corn', desc: 'Score x2 for 12s' },
  { id: 'slowmo', name: 'Slow Farmer', desc: 'Farmer lags 8s' },
  { id: 'heart', name: 'Extra Heart', desc: '+1 life, max 5' },
  { id: 'highjump', name: 'High Jump', desc: 'Jump 25% higher 10s' },
  { id: 'golden', name: 'Golden Beak', desc: '+50 lucky points' },
  { id: 'swift', name: 'Swift Feet', desc: '+30 lucky points' },
  { id: 'camo', name: 'Hay Camo', desc: '+30 lucky points' },
  { id: 'lucky', name: 'Lucky Foot', desc: '+30 lucky points' },
  { id: 'scarf', name: 'Warm Scarf', desc: '+25 lucky points' },
  { id: 'boots', name: 'Sturdy Boots', desc: '+25 lucky points' },
  { id: 'eyes', name: 'Keen Eyes', desc: '+25 lucky points' },
  { id: 'brave', name: 'Brave Heart', desc: '+25 lucky points' },
  { id: 'quiet', name: 'Quiet Steps', desc: '+25 lucky points' },
  { id: 'belly', name: 'Full Belly', desc: '+25 lucky points' },
  { id: 'spurs', name: 'Sharp Spurs', desc: '+25 lucky points' },
  { id: 'landing', name: 'Soft Landing', desc: '+25 lucky points' },
  { id: 'compass', name: 'Corn Compass', desc: '+25 lucky points' },
  { id: 'charm', name: 'Turkey Charm', desc: '+25 lucky points' },
  { id: 'luck', name: 'Thanksgiving Luck', desc: '+40 lucky points' },
];

export const HAZARDS = ['oven', 'knife', 'fence', 'pumpkin'];

/** Small seeded RNG (mulberry32) so ?seed= replays the same run. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
