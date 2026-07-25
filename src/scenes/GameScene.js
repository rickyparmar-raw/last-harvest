import Phaser from 'phaser';
import {
  TILE, MAP_W, MAP_H, GAME_W, GAME_H,
  RUN_TIME, FROST_WARN, CROP_VALUE, SEED_COST, CARRY_MAX,
  ACTION_CD, TOOLS, TEXT_RESOLUTION
} from '../config.js';
import Player from '../entities/Player.js';
import Plot from '../entities/Plot.js';
import Animal from '../entities/Animal.js';

const FARM_ZONE = { x0: 5, y0: 4, x1: 30, y1: 21 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.gold = 25;
    this.carry = 0;
    this.tool = 'hoe';
    this.timeLeft = RUN_TIME;
    this.running = false;
    this.ended = false;
    this.actCd = 0;
    this.plots = new Map();
    this.animals = [];
    this.blocked = new Set();

    this.physics.world.setBounds(0, 0, GAME_W, GAME_H);
    this.solids = this.physics.add.staticGroup();

    this.buildGround();
    this.buildDecor();
    this.buildPen();
    this.buildMarket();

    this.player = new Player(this, TILE * 10, TILE * 12);
    this.physics.add.collider(this.player, this.solids);

    this.spawnAnimals();
    this.setupInput();
    this.buildFrost();

    this.scene.launch('UI');
    this.pushState();
    this.startIntro();
  }

  inFarmZone(tx, ty) {
    return tx >= FARM_ZONE.x0 && tx < FARM_ZONE.x1 && ty >= FARM_ZONE.y0 && ty < FARM_ZONE.y1;
  }

  block(tx, ty) {
    this.blocked.add(`${tx},${ty}`);
  }

  buildGround() {
    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grass').setOrigin(0).setDepth(-1000);
    for (let ty = 0; ty < MAP_H; ty++) {
      for (let tx = 0; tx < MAP_W; tx++) {
        const r = Math.random();
        const x = tx * TILE + 8;
        const y = ty * TILE + 8;
        if (r < 0.06) {
          this.add.image(x, y, 'grass2').setDepth(-999).setAlpha(0.85);
        } else if (r < 0.16) {
          const key = Math.random() < 0.5 ? 'tuft1' : 'tuft2';
          this.add.image(x, y, key).setDepth(-999).setFlipX(Math.random() < 0.5);
        } else if (r < 0.19) {
          const key = Math.random() < 0.75 ? 'flower_white' : 'flower_yellow';
          this.add.image(x, y, key).setDepth(-999);
        }
      }
    }
    const pondTx = 2;
    const pondTy = MAP_H - 4;
    this.add
      .image(pondTx * TILE, pondTy * TILE, 'pond')
      .setOrigin(0)
      .setDepth(-998);
    for (let ty = pondTy; ty < pondTy + 3; ty++) {
      for (let tx = pondTx; tx < pondTx + 3; tx++) this.block(tx, ty);
    }
  }

  buildDecor() {
    const trees = [];
    const bushes = [];
    const wilds = [];
    const clutter = [];

    const tryPlace = (list, count, place) => {
      let tries = 0;
      let placed = 0;
      while (placed < count && tries < count * 12) {
        tries++;
        const tx = Phaser.Math.Between(1, MAP_W - 2);
        const ty = Phaser.Math.Between(1, MAP_H - 2);
        if (this.inFarmZone(tx, ty)) continue;
        if (this.blocked.has(`${tx},${ty}`)) continue;
        place(tx, ty);
        placed++;
      }
    };

    tryPlace(trees, 14, (tx, ty) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      this.add.image(x, y, 'tree_big').setOrigin(0.5, 0.82).setDepth(y);
      const trunk = this.solids.create(x, y + 4, null).setSize(10, 8).setVisible(false);
      trunk.setDepth(y).refreshBody();
      this.block(tx, ty);
    });

    tryPlace(bushes, 16, (tx, ty) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      this.add.image(x, y, 'bush').setOrigin(0.5, 0.8).setScale(0.85).setDepth(y);
      this.block(tx, ty);
    });

    tryPlace(wilds, 18, (tx, ty) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      const key = Math.random() < 0.5 ? 'crop_blue' : 'crop_pink';
      this.add.image(x, y + 2, key, 2).setOrigin(0.5, 0.85).setDepth(y);
      this.block(tx, ty);
    });

    tryPlace(clutter, 8, (tx, ty) => {
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      const key = Math.random() < 0.5 ? 'decor1' : 'decor2';
      this.add.image(x, y, key).setDepth(y);
      this.block(tx, ty);
    });
  }

  buildPen() {
    const cols = 7;
    const rows = 5;
    const originTx = MAP_W - cols - 1;
    const originTy = 1;
    this.penPx = originTx * TILE;
    this.penPy = originTy * TILE;
    this.penW = cols * TILE;
    this.penH = rows * TILE;

    for (let tx = originTx; tx < originTx + cols; tx++) {
      for (let ty = originTy; ty < originTy + rows; ty++) {
        this.block(tx, ty);
      }
    }

    const corners = [
      [originTx, originTy], [originTx + cols - 1, originTy],
      [originTx, originTy + rows - 1], [originTx + cols - 1, originTy + rows - 1]
    ];
    for (const [tx, ty] of corners) {
      const x = tx * TILE + 8;
      const y = ty * TILE + 8;
      this.add.image(x, y, 'fence_post').setDepth(y + 10);
      const post = this.solids.create(x, y, null).setSize(12, 12).setVisible(false);
      post.setDepth(y).refreshBody();
    }
    for (let tx = originTx + 1; tx < originTx + cols - 1; tx++) {
      const yTop = originTy * TILE + 8;
      const yBot = (originTy + rows - 1) * TILE + 8;
      this.add.image(tx * TILE + 8, yTop, 'fence').setDepth(yTop + 10);
      this.add.image(tx * TILE + 8, yBot, 'fence').setDepth(yBot + 10);
    }
    for (let ty = originTy + 1; ty < originTy + rows - 1; ty++) {
      const xL = originTx * TILE + 8;
      const xR = (originTx + cols - 1) * TILE + 8;
      this.add.image(xL, ty * TILE + 8, 'fence').setRotation(Math.PI / 2).setDepth(ty * TILE + 8 + 10);
      this.add.image(xR, ty * TILE + 8, 'fence').setRotation(Math.PI / 2).setDepth(ty * TILE + 8 + 10);
    }
    this.add
      .text(this.penPx + this.penW / 2, this.penPy - 8, 'PEN', {
        fontFamily: 'monospace', fontSize: '8px', color: '#fff2c8',
        fontStyle: 'bold', stroke: '#3a2410', strokeThickness: 3,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5, 0)
      .setDepth(this.penPy + 900);
  }

  buildMarket() {
    const mtx = 20;
    const mty = 20;
    const mx = mtx * TILE + 8;
    const my = mty * TILE + 8;
    this.block(mtx, mty);

    this.market = this.solids.create(mx, my, 'shop').setScale(1.4);
    this.market.setDepth(my).refreshBody();
    this.add
      .text(mx, my - 16, 'MARKET', {
        fontFamily: 'monospace', fontSize: '8px', color: '#ffe7a8',
        fontStyle: 'bold', stroke: '#3a2410', strokeThickness: 3,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5, 1)
      .setDepth(my + 800);
  }

  spawnAnimals() {
    const cx = this.penPx + this.penW / 2;
    const cy = this.penPy + this.penH / 2;
    this.animals.push(new Animal(this, cx - 22, cy - 8, 'chicken'));
    this.animals.push(new Animal(this, cx + 6, cy + 10, 'chicken'));
    this.animals.push(new Animal(this, cx + 20, cy - 4, 'cow'));
  }

  buildFrost() {
    this.frost = this.add
      .rectangle(0, 0, GAME_W, GAME_H, 0x9fd0ff)
      .setOrigin(0)
      .setDepth(9000)
      .setAlpha(0);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: 'W', a: 'A', s: 'S', d: 'D',
      space: 'SPACE', one: 'ONE', two: 'TWO', three: 'THREE'
    });
  }

  startIntro() {
    const cx = GAME_W / 2;
    const cy = GAME_H / 2 - 10;
    const beat = (txt, delay, size, color) =>
      this.time.delayedCall(delay, () => this.showBig(txt, cx, cy, size, color));

    beat('LAST HARVEST', 0, 26, '#fff2c8');
    beat('sell it all before the frost', 60, 11, '#cfe8ff');
    beat('3', 1100, 40, '#ffd27a');
    beat('2', 1650, 40, '#ffd27a');
    beat('1', 2200, 40, '#ff9a6a');
    beat('GROW!', 2750, 40, '#9dff7a');
    this.time.delayedCall(2900, () => { this.running = true; });
  }

  showBig(text, x, y, size, color) {
    const t = this.add
      .text(x, y, text, {
        fontFamily: 'monospace', fontSize: `${size}px`, fontStyle: 'bold',
        color, stroke: '#241305', strokeThickness: 5,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5)
      .setDepth(9500);
    this.tweens.add({
      targets: t,
      scale: { from: 0.6, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 620,
      ease: 'Quad.out',
      onComplete: () => t.destroy()
    });
  }

  update(time, delta) {
    const d = delta / 1000;

    if (this.ended) {
      this.pushState();
      return;
    }

    this.player.handleInput({
      left: this.cursors.left.isDown || this.keys.a.isDown,
      right: this.cursors.right.isDown || this.keys.d.isDown,
      up: this.cursors.up.isDown || this.keys.w.isDown,
      down: this.cursors.down.isDown || this.keys.s.isDown
    });

    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.tool = TOOLS[0];
    if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.tool = TOOLS[1];
    if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.tool = TOOLS[2];

    if (!this.running) {
      this.pushState();
      return;
    }

    this.actCd -= d;
    if (this.keys.space.isDown && this.actCd <= 0) {
      this.interact();
      this.actCd = ACTION_CD;
    }

    for (const plot of this.plots.values()) plot.update(d);
    for (const a of this.animals) a.update(d);

    this.timeLeft -= d;
    this.updateFrost();
    if (this.timeLeft <= 0) this.endRun();

    this.pushState();
  }

  updateFrost() {
    if (this.timeLeft > FROST_WARN) return;
    const t = 1 - Phaser.Math.Clamp(this.timeLeft / FROST_WARN, 0, 1);
    this.frost.setAlpha(t * 0.45);
  }

  interact() {
    const p = this.player;

    let best = null;
    let bestD = 26;
    for (const a of this.animals) {
      if (!a.ready) continue;
      const dd = a.distTo(p.x, p.y);
      if (dd < bestD) { bestD = dd; best = a; }
    }
    if (best) {
      const v = best.collect();
      if (v) {
        this.gold += v;
        this.float(best.sprite.x, best.sprite.y - 14, `+${v}g`, '#ffe07a');
      }
      return;
    }

    if (Phaser.Math.Distance.Between(p.x, p.y, this.market.x, this.market.y) < 26) {
      if (this.carry > 0) {
        const g = this.carry * CROP_VALUE;
        this.gold += g;
        this.float(this.market.x, this.market.y - 16, `+${g}g`, '#ffe07a');
        this.carry = 0;
      } else {
        this.hint('nothing to sell');
      }
      return;
    }

    const { tx, ty } = p.feetTile();
    const key = `${tx},${ty}`;
    const plot = this.plots.get(key);

    if (plot) {
      if (plot.state === 'ripe') {
        if (this.carry >= CARRY_MAX) { this.hint('hands full — sell!'); return; }
        if (plot.harvest()) {
          this.carry++;
          this.float(plot.x, plot.y - 12, '+1', '#c6f5a0');
        }
        return;
      }
      if (plot.state === 'dead') { plot.clearDead(); return; }
      if (this.tool === 'water') { plot.water(); return; }
      if (this.tool === 'seed') {
        if (plot.state !== 'tilled') { this.hint('already planted'); return; }
        if (this.gold < SEED_COST) { this.hint(`need ${SEED_COST}g`); return; }
        this.gold -= SEED_COST;
        plot.plant();
        return;
      }
      this.hint('already tilled');
      return;
    }

    if (!this.canTill(tx, ty)) return;
    if (this.tool === 'hoe') {
      this.plots.set(key, new Plot(this, tx, ty));
    } else {
      this.hint('till first (press 1)');
    }
  }

  canTill(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
    if (this.blocked.has(`${tx},${ty}`)) return false;
    return true;
  }

  float(x, y, text, color, small = false) {
    const t = this.add
      .text(x, y, text, {
        fontFamily: 'monospace', fontSize: small ? '8px' : '11px', fontStyle: 'bold',
        color, stroke: '#20140a', strokeThickness: 3,
        resolution: TEXT_RESOLUTION
      })
      .setOrigin(0.5, 1)
      .setDepth(y + 2000);
    this.tweens.add({
      targets: t, y: y - 18, alpha: 0, duration: 750, ease: 'Quad.out',
      onComplete: () => t.destroy()
    });
  }

  hint(msg) {
    this.float(this.player.x, this.player.y - 22, msg, '#ffffff', true);
  }

  pushState() {
    this.registry.set('gold', this.gold);
    this.registry.set('carry', this.carry);
    this.registry.set('carryMax', CARRY_MAX);
    this.registry.set('time', Math.max(0, this.timeLeft));
    this.registry.set('runTime', RUN_TIME);
    this.registry.set('tool', this.tool);
  }

  endRun() {
    if (this.ended) return;
    this.ended = true;
    this.running = false;
    this.player.setVelocity(0, 0);
    this.player.anims.play(`idle-${this.player.facing}`, true);

    this.tweens.add({ targets: this.frost, alpha: 0.8, duration: 900, ease: 'Quad.in' });
    this.cameras.main.flash(700, 200, 230, 255);
    this.showBig('THE FROST CAME', GAME_W / 2, GAME_H / 2, 22, '#eaf6ff');

    this.time.delayedCall(1400, () => {
      this.scene.stop('UI');
      this.scene.start('GameOver', { gold: this.gold });
    });
  }
}
