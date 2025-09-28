import Phaser from "phaser"

class Menu extends Phaser.Scene {
  constructor() {
    super({ key: 'Mneu' })
  }
  create() {
    const button = this.add.text(400, 300, 'Play Game', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#2d2d2d'
    }).setPadding(32)
      .setOrigin(0.5)
      .setInteractive() // 重要！

    button.on('pointerout', () => {
      button.setBackgroundColor('#8d8d8d')
    })

    button.on('pointerout', () => {
      button.setBackgroundColor('#2d2d2d')
    })
    button.on('pointerdown', () => {
      this.scene.start('Game')
    })
  }
}

export default Menu
