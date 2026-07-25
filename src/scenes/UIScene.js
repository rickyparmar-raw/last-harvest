import Phaser from 'phaser';
import { GAME_W, TOOLS, TOOL_ICON, TOOL_LABEL, FROST_WARN, TEXT_RESOLUTION } from '../config.js';

const FONT = 'monospace';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    this.goldText = this.add
      .text(8, 6, 'GOLD 0', {
        fontFamily: FONT, fontSize: '13px', fontStyle: 'bold',
        color: '#ffe27a', stroke: '#3a2410', strokeThickness: 4,
        resolution: TEXT_RESOLUTION
      })
      .setScrollFactor(0);

    this.carryIcon = this.add.image(14, 30, 'crop', 2).setScale(0.9).setScrollFactor(0);
    this.carryText = this.add
      .text(24, 24, '0/0', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold',
        color: '#eafff0', stroke: '#25301f', strokeThickness: 3,
        resolution: TEXT_RESOLUTION
      })
      .setScrollFactor(0);

    this.frostLabel = this.add
      .text(GAME_W / 2, 6, 'FROST INCOMING', {
        fontFamily: FONT, fontSize: '9px', fontStyle: 'bold', color: '#cfe8ff',
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    const barW = 200;
    this.barX = GAME_W / 2 - barW / 2;
    this.barW = barW;
    this.add
      .rectangle(GAME_W / 2, 24, barW + 4, 12, 0x0d1420, 0.85)
      .setScrollFactor(0);
    this.barFill = this.add
      .rectangle(this.barX, 24, barW, 8, 0x8fd3ff)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.timeText = this.add
      .text(GAME_W / 2, 24, '0:00', {
        fontFamily: FONT, fontSize: '10px', fontStyle: 'bold',
        color: '#ffffff', stroke: '#0d1420', strokeThickness: 3,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.toolBoxes = [];
    const bw = 34;
    const gap = 6;
    const totalW = TOOLS.length * bw + (TOOLS.length - 1) * gap;
    const startX = GAME_W / 2 - totalW / 2;
    const yy = this.scale.height - 26;
    TOOLS.forEach((tool, i) => {
      const x = startX + i * (bw + gap) + bw / 2;
      const box = this.add.rectangle(x, yy, bw, bw, 0x1c1408, 0.8).setScrollFactor(0);
      box.setStrokeStyle(2, 0x5c4326);
      const iconScale = tool === 'seed' ? 1.9 : 0.95;
      this.add.image(x - 6, yy - 3, TOOL_ICON[tool]).setScale(iconScale).setScrollFactor(0);
      this.add
        .text(x + 9, yy - 12, `${i + 1}`, {
          fontFamily: FONT, fontSize: '9px', fontStyle: 'bold', color: '#ffe27a',
          resolution: TEXT_RESOLUTION
        })
        .setScrollFactor(0);
      this.add
        .text(x, yy + 10, TOOL_LABEL[tool], {
          fontFamily: FONT, fontSize: '7px', color: '#d8c9a8',
          resolution: TEXT_RESOLUTION
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0);
      this.toolBoxes.push(box);
    });

    this.add
      .text(8, this.scale.height - 12, 'WASD move  ·  SPACE act  ·  1/2/3 tool', {
        fontFamily: FONT, fontSize: '8px', color: '#b8c4d0',
        resolution: TEXT_RESOLUTION
      })
      .setScrollFactor(0);
  }

  update() {
    const reg = this.registry;
    const gold = reg.get('gold') ?? 0;
    const carry = reg.get('carry') ?? 0;
    const carryMax = reg.get('carryMax') ?? 0;
    const time = reg.get('time') ?? 0;
    const runTime = reg.get('runTime') ?? 1;
    const tool = reg.get('tool') ?? TOOLS[0];

    this.goldText.setText(`GOLD ${gold}`);
    this.carryText
      .setText(`${carry}/${carryMax}`)
      .setColor(carry >= carryMax ? '#ff7a6a' : '#eafff0');

    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    this.timeText.setText(`${m}:${s.toString().padStart(2, '0')}`);
    const ratio = Phaser.Math.Clamp(time / runTime, 0, 1);
    this.barFill.setScale(ratio, 1);

    let col = 0x8fd3ff;
    if (time <= FROST_WARN) {
      col = Math.sin(this.time.now / 120) > 0 ? 0xff5a4a : 0x8fd3ff;
      this.frostLabel.setColor('#ff9a8a').setText('FROST IS HERE!');
    }
    this.barFill.setFillStyle(col);

    TOOLS.forEach((t, i) => {
      const active = t === tool;
      this.toolBoxes[i].setStrokeStyle(2, active ? 0xffe27a : 0x5c4326);
      this.toolBoxes[i].setFillStyle(active ? 0x3a2c12 : 0x1c1408, active ? 0.95 : 0.8);
    });
  }
}
