import type { Board, Piece, PieceInfo, Player, Position } from "./type";
import { boardout_check, range, unwrap } from "./utils";

export type MGrid = {
  piece?: Piece,
  move: boolean
}

export type MoveBoard = MGrid[][]

const toMoveBoard = (board: Board): MoveBoard => {
  return board.map(row => row.map((g): MGrid => {
    if (!g.piece) return { move: false }
    else return { piece: g.piece, move: false }
  }))
}

// posにある駒の動ける場所を返す
const move = (_board: Board, pos: Position /*今の座標*/, list: readonly [number, number][] /*動ける座標*/): MoveBoard => {
  let board = toMoveBoard(_board)
  const { x: pos_x, y: pos_y } = pos

  for (const [y, x] of list) {
    // 配列外ではないか
    if (!boardout_check(pos_y, y) && !boardout_check(pos_x, x)) {
      let n_y = pos_y + y
      let n_x = pos_x + x
      // 今の座標のGridを取得
      let grid = board[n_y][n_x]

      // Gridに駒がなかったら動ける
      if (!grid.piece) {
        board[n_y][n_x].move = true
      } else {
        if (grid.piece.player.id != unwrap(board[pos_y][pos_x].piece).player.id) board[n_y][n_x].move = true
      }
    }
  }

  return board
}

const drawMovementPosition = (mboard: MoveBoard) => {
  mboard.forEach(row => {
    let line = ''
    row.forEach(g => {
      line += g.move ? 'O' : 'X'
    })
    console.log(line)
  })
}

const jump_check = (b: MoveBoard, pos: Position, player: Player): MoveBoard => {
  let y = b[pos.y];
  let min = y.slice(0, pos.x).reverse()
  let max = y.slice(pos.x)

  let first_piece: boolean = false

  min = min.map(g => {
    // 駒がまだ見つかっていない
    if (!first_piece) {
      // 駒があったら
      if (g.piece) first_piece = true
    } else { // すでに駒が見つかっていたら
      g.move = false
    }

    return g
  }).reverse()

  first_piece = false

  max = max.map(g => {
    // 駒がまだ見つかっていない
    if (!first_piece) {
      // 駒があったら
      if (g.piece) first_piece = true
    } else { // すでに駒が見つかっていたら
      g.move = false
    }

    return g
  })

  y = min.concat(max)

  let find_piece = false

  for (let [y, line] of b.entries()) {
    for (let [x, g] of line.entries()) {
      if (y === x) {
        if (g.piece && find_piece) {
          find_piece = true
          if (g.piece.player == player) b[y][x].move = false // 駒が自分のものなら動けない 
          else b[y][x].move = true //相手のものなら動ける
        }
      }
    }
  }

  return b
}

export const PIECE_LSIT: Map<string, PieceInfo> = new Map();

// initial `PIECE_LIST`
(() => {
  const PIECES: PieceInfo[] = [
    {
      type: 'chess',
      key: 'K',
      name: 'King',
      movement: (board: Board, pos: Position, player: Player): MoveBoard => move(board, pos, [
        [-1, 0],
        [-1, 1],
        [-1, -1],

        [1, 0],
        [1, 1],
        [1, -1],

        [0, 1],
        [0, -1],
      ])
    },
    {
      type: 'chess',
      key: 'R',
      name: 'Rook',
      movement: (board: Board, pos: Position, player: Player): MoveBoard => {
        let list: [number, number][] = []

        range(-9, 9).forEach(n => list.push([n, 0]))
        range(-9, 9).forEach(n => list.push([0, n]))
        // range(-9, 9).forEach(n => list.push([n, n]))
        // range(-9, 9).forEach(n => list.push([-n, n]))

        let mb = move(board, pos, list);

        drawMovementPosition(mb)

        return mb
      }
    },
    {
      type: 'chess',
      key: 'B',
      name: 'Bishop',
      movement: (board: Board, pos: Position, player: Player): MoveBoard => {
        let b = toMoveBoard(board)
        return b
      }
    }
  ]
  for (const p of PIECES) {
    PIECE_LSIT.set(p.key, p)
  }
})()
