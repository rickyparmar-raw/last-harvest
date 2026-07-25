import Phaser from 'phaser';
import { CHICKEN, COW } from '../config.js';

export default class Animal {
  constructor(scene, x, y, kind) {
    this.scene = scene;
    this.kind = kind;
    const def = kind === 'cow' ? COW : CHICKEN;
    this.readyTime = def.time;
    this.value = def.value;
    this.timer = 0;
    this.ready = false;
    this.homeX = x;
    this.homeY = y;

    this.sprite = scene.add.sprite(x, y, kind, 0).setDepth(y);
    this.sprite.play(`${kind}-idle`);

    this.sprite.setScale(kind === 'cow' ? 1.6 : 1.15);

    this.bubble = scene.add
      .text(x, y - (kind === 'cow' ? 16 : 11), '!', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fff4c2'
      })
      .setOrigin(0.5, 1)
      .setDepth(y + 700)
      .setVisible(false);
    this.bubbleBg = scene.add
      .circle(x, y - (kind === 'cow' ? 19 : 14), 5.5, 0x2a1c10, 0.85)
      .setDepth(y + 699)
      .setVisible(false);

    this.wander();
  }

  wander() {
    const dx = Phaser.Math.Between(-10, 10);
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.homeX + dx,
      duration: Phaser.Math.Between(1400, 2600),
      ease: 'Sine.inOut',
      yoyo: true,
      onUpdate: () => {
        this.bubble.x = this.sprite.x;
        this.bubbleBg.x = this.sprite.x;
      },
      onComplete: () => this.wander()
    });
  }

  update(dt) {
    this.sprite.setDepth(this.sprite.y);
    if (this.ready) {
      const b = 1 + Math.sin(this.scene.time.now / 180) * 0.12;
      this.bubbleBg.setScale(b);
      return;
    }
    this.timer += dt;
    if (this.timer >= this.readyTime) {
      this.ready = true;
      this.bubble.setVisible(true);
      this.bubbleBg.setVisible(true);
    }
  }

  distTo(px, py) {
    return Phaser.Math.Distance.Between(px, py, this.sprite.x, this.sprite.y);
  }

  collect() {
    if (!this.ready) return 0;
    this.ready = false;
    this.timer = 0;
    this.bubble.setVisible(false);
    this.bubbleBg.setVisible(false);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 4,
      duration: 110,
      yoyo: true,
      ease: 'Quad.out'
    });
    return this.value;
  }
}
