import Phaser from 'phaser';
import { TILE, GROW_TIME, WATER_TIME, RIPE_HOLD } from '../config.js';

const FRAME_SCALE = [0.55, 0.8, 1.05];

export default class Plot {
  constructor(scene, tx, ty) {
    this.scene = scene;
    this.tx = tx;
    this.ty = ty;
    this.x = tx * TILE + TILE / 2;
    this.y = ty * TILE + TILE / 2;

    this.state = 'tilled';
    this.watered = false;
    this.waterTimer = 0;
    this.growth = 0;
    this.ripeTimer = 0;
    this.frame = -1;
    this.bob = Phaser.Math.FloatBetween(0, 10);

    this.soil = scene.add.image(this.x, this.y, 'soil_dry').setDepth(-500);
    this.crop = scene.add
      .image(this.x, this.y + 2, 'crop', 0)
      .setOrigin(0.5, 0.85)
      .setDepth(this.y)
      .setVisible(false);

    const bd = this.y + 600;
    this.barBg = scene.add
      .rectangle(this.x, this.y - 13, 14, 4, 0x1a1020, 0.7)
      .setDepth(bd)
      .setVisible(false);
    this.barFill = scene.add
      .rectangle(this.x - 6, this.y - 13, 12, 2, 0x74dd5a)
      .setOrigin(0, 0.5)
      .setDepth(bd + 1)
      .setVisible(false);
    this.icon = scene.add
      .image(this.x, this.y - 20, 'icon_water')
      .setScale(0.55)
      .setDepth(bd + 2)
      .setVisible(false);
  }

  plant() {
    if (this.state !== 'tilled') return false;
    this.state = 'growing';
    this.growth = 0;
    this.frame = 0;
    this.crop.setTexture('crop', 0).setVisible(true).setScale(0.3);
    this.popCrop(FRAME_SCALE[0]);
    return true;
  }

  water() {
    if (this.state === 'dead') return false;
    this.watered = true;
    this.waterTimer = WATER_TIME;
    this.soil.setTexture('soil_wet');
    return true;
  }

  harvest() {
    if (this.state !== 'ripe') return false;
    this.popCrop(1.4);
    this.reset();
    return true;
  }

  clearDead() {
    if (this.state !== 'dead') return false;
    this.reset();
    return true;
  }

  reset() {
    this.state = 'tilled';
    this.growth = 0;
    this.ripeTimer = 0;
    this.crop.setVisible(false);
    this.hideBar();
  }

  popCrop(scale) {
    this.scene.tweens.killTweensOf(this.crop);
    this.scene.tweens.add({
      targets: this.crop,
      scale: { from: scale * 1.35, to: scale },
      duration: 180,
      ease: 'Back.out'
    });
  }

  hideBar() {
    this.barBg.setVisible(false);
    this.barFill.setVisible(false);
    this.icon.setVisible(false);
  }

  update(dt) {
    if (this.watered) {
      this.waterTimer -= dt;
      if (this.waterTimer <= 0) {
        this.watered = false;
        this.soil.setTexture('soil_dry');
      }
    }

    if (this.state === 'growing') {
      if (this.watered) this.growth += dt;
      const ratio = Phaser.Math.Clamp(this.growth / GROW_TIME, 0, 1);
      const frame = ratio < 0.4 ? 0 : ratio < 0.8 ? 1 : 2;
      if (frame !== this.frame) {
        this.frame = frame;
        this.crop.setTexture('crop', frame);
        this.popCrop(FRAME_SCALE[frame]);
      }
      if (this.growth >= GROW_TIME) {
        this.state = 'ripe';
        this.ripeTimer = 0;
      }
      this.drawGrowBar(ratio);
    } else if (this.state === 'ripe') {
      this.ripeTimer += dt;
      this.bob += dt * 5;
      this.crop.y = this.y + 2 + Math.sin(this.bob) * 1.4;
      if (this.ripeTimer >= RIPE_HOLD) {
        this.state = 'dead';
        this.crop.y = this.y + 2;
        this.crop.setTexture('dead').setScale(1);
        this.hideBar();
      } else {
        this.drawRipeBar(1 - this.ripeTimer / RIPE_HOLD);
      }
    }
  }

  drawGrowBar(ratio) {
    this.barBg.setVisible(true);
    this.barFill.setVisible(true).setScale(Phaser.Math.Clamp(ratio, 0.001, 1), 1);
    this.barFill.setFillStyle(0x74dd5a);
    if (!this.watered) {
      this.icon.setVisible(true).setTexture('icon_water');
      this.icon.setAlpha(0.5 + 0.5 * Math.sin(this.scene.time.now / 150));
    } else {
      this.icon.setVisible(false);
    }
  }

  drawRipeBar(ratio) {
    this.barBg.setVisible(true);
    this.barFill.setVisible(true).setScale(Phaser.Math.Clamp(ratio, 0.001, 1), 1);
    this.barFill.setFillStyle(ratio > 0.5 ? 0xf5c542 : 0xe8523a);
    this.icon.setVisible(false);
  }
}
