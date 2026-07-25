import Phaser from 'phaser';
import { TILE, PLAYER_SPEED } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.75);
    this.body.setSize(10, 8);
    this.body.setOffset(3, 8);
    this.setCollideWorldBounds(true);

    this.facing = 'down';
  }

  feetTile() {
    return {
      tx: Math.floor(this.x / TILE),
      ty: Math.floor((this.y + 2) / TILE)
    };
  }

  handleInput(input) {
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      const len = Math.hypot(vx, vy) || 1;
      this.setVelocity((vx / len) * PLAYER_SPEED, (vy / len) * PLAYER_SPEED);
      if (vx !== 0 && Math.abs(vx) >= Math.abs(vy)) this.facing = vx > 0 ? 'right' : 'left';
      else if (vy !== 0) this.facing = vy > 0 ? 'down' : 'up';
    } else {
      this.setVelocity(0, 0);
    }

    this.updateAnim(moving);
    this.setDepth(this.y);
  }

  updateAnim(moving) {
    this.setFrame(0);
    this.setFlipX(this.facing === 'left');
  }
}
