import { ESC } from "./consts"
import { PIECE_LSIT } from "./piece"
import type { MoveBoard } from "./type"
import type { Board, Piece, Player, Position } from "./type"
import { boardout_check, createBoard, unwrap } from "./utils"

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
  // .0 -> 先手 .1 -> 後手
  players: [Player, Player]
  hand: Map<number, Map<string, number>> = new Map()

  turn = true
  status = true

  put_selection: { status: boolean; pos?: Position } = { status: false }
  selection: { status: boolean; piece?: Piece; pos?: Position } = { status: false }

  // new stateful properties
  cursor: Position = { x: 0, y: 0 }
  moveBoard?: MoveBoard
  board: Board

  public constructor(players: [Player, Player]) {
    this.players = players

    this.hand.set(players[0].id, new Map())
    this.hand.set(players[1].id, new Map())

    let map
    switch (players[0].piece_type) {
      case 'chess': map = chess_map; break;
      case 'shogi': map = shogi_map; break;
    }
    this.board = createBoard(map, players)
  }

  getTurnPlayer(): Player {
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

  private resetSelection() {
    this.moveBoard = undefined
    this.selection = { status: false }
  }
  private resetPutSelection() {
    this.put_selection = { status: false }
  }

  // handle a single key input; encapsulates selection/movement logic
  handleInput(key: string) {
    if (ESC === key) {
      this.resetSelection()
      this.resetPutSelection()
    }

    const turnPlayer = this.getTurnPlayer()
    let { x, y } = this.cursor

    // 駒を動かす処理
    if (this.selection.status && this.selection.pos) {
      if (key === ' ' && this.moveBoard && this.moveBoard[y][x].move) {
        // 動かす場所の駒が敵の駒なら
        const piece = this.board[y][x].piece;
        if (piece?.player.id != turnPlayer.id && piece) {
          let hands = this.hand.get(turnPlayer.id)
          let number = hands?.get(piece?.key)
          if (number && number) hands?.set(piece.key, number + 1)
          else hands?.set(piece.key, 1)
        }
        this.board[y][x] = { piece: this.selection.piece } // カーソルの場所に選択した駒を移動する
        this.board[this.selection.pos.y][this.selection.pos.x] = {} // 自分がいたところを空の`Grid`にする

        this.turn = !this.turn
        this.resetSelection()

        return
      } else {
        // navigation while selecting
        this.moveCursor(key)
        return
      }
    }

    // 駒を置く処理
    if (this.put_selection.status && this.put_selection.pos) {
      let hands = this.hand.get(turnPlayer.id) // 現プレイヤーの持ち駒を取得
      let number = hands?.get(key)
      // 打ち込まれたキーの駒が存在するか確認
      if (number && 0 < number) {
        const { x, y } = this.put_selection.pos
        this.board[y][x] = { piece: { ...unwrap(PIECE_LSIT.get(key)), player: turnPlayer } } // カーソルの位置に指定した駒を置く

        if (1 == number) hands?.delete(key)
        else hands?.set(key, number - 1)

        this.turn = !this.turn
        this.resetPutSelection()
      }
      return
    }

    // normal mode: navigate / select
    this.moveCursor(key)

    y = this.cursor.y
    x = this.cursor.x

    const piece = this.board[y][x].piece

    // iが押されて、駒が無い場合、持ち駒が0でないなら
    if (key === 'i' && !this.board[y][x].piece && this.hand.size != 0) {
      this.put_selection = { status: true, pos: { x: this.cursor.x, y: this.cursor.y } }
    }

    if (key === ' ' && this.board[y][x].piece) {
      // only allow selecting own piece
      if (piece?.player.id === turnPlayer.id) {
        this.selection.status = true
        this.selection.piece = piece
        this.selection.pos = { x: this.cursor.x, y: this.cursor.y }
        // compute moves using piece movement signature (board, pos)
        this.moveBoard = piece.movement(this.board, this.selection.pos)
        // 動かす場所が無いならselectionをキャンセル
        if (this.moveBoard?.every(y => y.every(g => !g.move))) this.resetSelection()
        return
      }
    }

    return
  }
}
