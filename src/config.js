export const TEXT_RESOLUTION = 4;

export const TILE = 16;
export const MAP_W = 40;
export const MAP_H = 24;
export const GAME_W = MAP_W * TILE;
export const GAME_H = MAP_H * TILE;

export const RUN_TIME = 180;
export const FROST_WARN = 30;

export const GROW_TIME = 12;
export const WATER_TIME = 6;
export const RIPE_HOLD = 14;
export const CROP_VALUE = 12;
export const SEED_COST = 3;

export const CARRY_MAX = 12;

export const CHICKEN = { time: 9, value: 7 };
export const COW = { time: 16, value: 18 };

export const PLAYER_SPEED = 82;
export const ACTION_CD = 0.15;

export const TOOLS = ['hoe', 'seed', 'water'];
export const TOOL_ICON = { hoe: 'icon_hoe', seed: 'icon_seed', water: 'icon_water' };
export const TOOL_LABEL = { hoe: 'Hoe', seed: 'Seeds', water: 'Water' };

export const RATINGS = [
  { min: 320, title: 'MASTER HARVESTER', note: 'The valley will remember you.' },
  { min: 200, title: 'BOUNTIFUL SEASON', note: 'A fine last harvest.' },
  { min: 110, title: 'SURVIVED THE FROST', note: 'You scraped by.' },
  { min: 1,   title: 'LEAN WINTER', note: 'Barely a basketful.' },
  { min: 0,   title: 'THE FROST WON', note: 'Nothing made it to market.' }
];

export function ratingFor(gold) {
  return RATINGS.find(r => gold >= r.min) || RATINGS[RATINGS.length - 1];
}
