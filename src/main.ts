import Phaser from 'phaser'

import Game from './scenes/game.ts'
import Menu from './scenes/menu.ts'

// ゲームの基本設定を指定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // レンダリングタイプを指定(CANVAS, WEBGL, AUTOがある)
  width: "1000", // ゲームの幅を指定
  height: 1000, // ゲームの高さを指定
  physics: { // 物理エンジンの設定
    default: 'arcade', // 使用する物理エンジンを指定
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: false // デバッグモード
    }
  },
  input: {
    keyboard: true // ここでキーボード入力を有効にする
  },
  scene: [Menu, Game]
}

// Phaser起動させるプロセスを開始
new Phaser.Game(config)

