import { ESC } from "./consts"
import type { MoveBoard } from "./type"
import type { Board, Piece, Player, Position } from "./type"
import { boardout_check, createBoard } from "./utils"

const chess_map = [
  // 0: 将棋の初期行（香→桂→銀→金→王→金→銀→桂→香）
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
  // 1: 将棋の2列目（右から歩の射線に配置される飛／角）
  ['X', 'r', 'X', 'X', 'X', 'X', 'X', 'b', 'X'],
  // 2: 将棋の歩列
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  // 3-5: 空
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  // 6: 空行（将棋 ⇆ チェス の間の余白）
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  // 7: チェスのポーン列（8列分を左詰めして最後列を空に）
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'X'],
  // 8: チェスのバックランク（左からルーク, ナイト, ビショップ, クイーン, キング, ...）
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'X']
]

const shogi_map = [
  // 0: チェスのバックランク（上側にチェスを置く）
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'X'],
  // 1: チェスのポーン列
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'X'],
  // 2-5: 空
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  // 6: 将棋の歩列（下側に将棋を置く）
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  // 7: 将棋の2列目（飛・角）
  ['X', 'r', 'X', 'X', 'X', 'X', 'X', 'b', 'X'],
  // 8: 将棋の初期行（香→桂→銀→金→王→金→銀→桂→香）
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l']
]

export class Game {
  board: Board
  // .0 -> 先手 .1 -> 後手
  players: [Player, Player]

  turn = true
  status = true

  // new stateful properties
  cursor: Position = { x: 0, y: 0 }
  selection: { status: boolean; piece?: Piece; pos?: Position } = { status: false }
  moveBoard?: MoveBoard

  public constructor(players: [Player, Player]) {
    this.players = players
    let map
    switch (players[0].piece_type) {
      case 'chess': map = chess_map; break;
      case 'shogi': map = shogi_map; break;
    }
    this.board = createBoard(map, players)
  }

  get_turn_player(): Player {
    return this.turn ? this.players[0] : this.players[1]
  }

  private moveCursor(key: string) {
    switch (key) {
      case 'a': if (!boardout_check(this.cursor.x, -1)) this.cursor.x -= 1; break;
      case 'd': if (!boardout_check(this.cursor.x, 1)) this.cursor.x += 1; break;
      case 'w': if (!boardout_check(this.cursor.y, -1)) this.cursor.y -= 1; break;
      case 's': if (!boardout_check(this.cursor.y, 1)) this.cursor.y += 1; break;
    }
  }

  private reset_selection() {
    this.moveBoard = undefined
    this.selection = { status: false }
  }

  // handle a single key input; encapsulates selection/movement logic
  handleInput(key: string) {
    if (ESC === key) this.reset_selection()

    if (this.selection.status && this.selection.pos) {
      if (key === ' ' && this.moveBoard && this.moveBoard[this.cursor.y][this.cursor.x].move) {
        // perform move
        this.board[this.cursor.y][this.cursor.x] = { piece: this.selection.piece }
        this.board[this.selection.pos.y][this.selection.pos.x] = {}

        this.turn = !this.turn
        this.selection = { status: false }
        this.moveBoard = undefined

        return
      } else {
        // navigation while selecting
        this.moveCursor(key)
        return
      }
    }

    // normal mode: navigate / select
    this.moveCursor(key)

    if (key === ' ' && this.board[this.cursor.y][this.cursor.x].piece) {
      const piece = this.board[this.cursor.y][this.cursor.x].piece
      const turnPlayer = this.get_turn_player()
      // only allow selecting own piece
      if (piece?.player.id === turnPlayer.id) {
        this.selection.status = true
        this.selection.piece = piece
        this.selection.pos = { x: this.cursor.x, y: this.cursor.y }
        // compute moves using piece movement signature (board, pos)
        this.moveBoard = piece.movement(this.board, this.selection.pos)
        if (this.moveBoard?.every(y => y.every(g => !g.move))) this.reset_selection()
        return
      }
    }

    return
  }
}
