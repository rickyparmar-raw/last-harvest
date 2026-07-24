import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('grass', 'assets/grass.png');
    this.load.image('grass2', 'assets/grass2.png');
    this.load.image('tuft1', 'assets/tuft1.png');
    this.load.image('tuft2', 'assets/tuft2.png');
    this.load.image('flower_white', 'assets/flower_white.png');
    this.load.image('flower_yellow', 'assets/flower_yellow.png');
    this.load.image('soil_dry', 'assets/soil_dry.png');
    this.load.image('soil_wet', 'assets/soil_wet.png');
    this.load.image('dead', 'assets/dead.png');
    this.load.image('shop', 'assets/shop.png');
    this.load.image('tree_big', 'assets/tree_big.png');
    this.load.image('bush', 'assets/bush.png');
    this.load.image('fence', 'assets/fence.png');
    this.load.image('fence_post', 'assets/fence_post.png');
    this.load.image('decor1', 'assets/decor1.png');
    this.load.image('decor2', 'assets/decor2.png');
    this.load.image('pond', 'assets/pond.png');

    this.load.image('icon_hoe', 'assets/icon_hoe.png');
    this.load.image('icon_seed', 'assets/icon_seed.png');
    this.load.image('icon_water', 'assets/icon_water.png');

    this.load.spritesheet('crop', 'assets/crop_orange.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('crop_blue', 'assets/crop_blue.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('crop_pink', 'assets/crop_pink.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('chicken', 'assets/chicken.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow', 'assets/cow.png', { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    this.buildPlayerAnims();
    this.buildAnimalAnims();
    this.scene.start('Game');
  }

  buildPlayerAnims() {
    // No animations needed - using static sprite frame
  }

  buildAnimalAnims() {
    if (!this.anims.exists('chicken-idle')) {
      this.anims.create({
        key: 'chicken-idle',
        frames: this.anims.generateFrameNumbers('chicken', { frames: [0, 1] }),
        frameRate: 2.5,
        repeat: -1
      });
    }
    if (!this.anims.exists('cow-idle')) {
      this.anims.create({
        key: 'cow-idle',
        frames: this.anims.generateFrameNumbers('cow', { frames: [0, 1] }),
        frameRate: 1.8,
        repeat: -1
      });
    }
  }
}
