import Phaser from 'phaser';
import { GAME_W, GAME_H, ratingFor, TEXT_RESOLUTION } from '../config.js';

const FONT = 'monospace';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data) {
    const gold = data?.gold ?? 0;
    const rating = ratingFor(gold);

    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x0e1a2b).setOrigin(0).setAlpha(0.92);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x9fd0ff).setOrigin(0).setAlpha(0.08);

    const cx = GAME_W / 2;

    this.add
      .text(cx, 70, 'THE FROST CAME', {
        fontFamily: FONT, fontSize: '24px', fontStyle: 'bold',
        color: '#eaf6ff', stroke: '#0a1420', strokeThickness: 5,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 150, `${gold}`, {
        fontFamily: FONT, fontSize: '54px', fontStyle: 'bold',
        color: '#ffe27a', stroke: '#3a2410', strokeThickness: 6,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 188, 'GOLD BANKED', {
        fontFamily: FONT, fontSize: '11px', color: '#cfe8ff',
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 234, rating.title, {
        fontFamily: FONT, fontSize: '18px', fontStyle: 'bold',
        color: '#9dff7a', stroke: '#12200c', strokeThickness: 4,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 260, rating.note, {
        fontFamily: FONT, fontSize: '10px', color: '#d8e6f2',
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, 320, 'press  R  to farm again', {
        fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: prompt, alpha: { from: 1, to: 0.35 },
      duration: 700, yoyo: true, repeat: -1
    });

    this.input.keyboard.once('keydown-R', () => {
      this.registry.set('gold', 0);
      this.registry.set('carry', 0);
      this.scene.start('Game');
    });
  }
}
