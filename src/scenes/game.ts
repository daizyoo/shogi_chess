import Phaser from 'phaser'

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  preload() {
    // this.load.setBaseURL('https://cdn.face.com/v385');
    // this.load.image('face', 'assets/pics/bw-face.png');
    // this.load.setBaseURL('https://labs.phaser.io')
    this.load.image('image', 'assets/image.png')
  }

  create() {
    this.add.image(400, 300, 'image')
  }
}

export default Game