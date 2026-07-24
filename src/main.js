import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#6a9b4f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, GameScene, UIScene, GameOverScene]
};

const game = new Phaser.Game(config);
window.__game = game;
