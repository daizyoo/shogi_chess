import { stdin, exit, stdout } from 'process'

import { empityGrid, type Board, type Piece, type PieceInfo, type Player, type Position } from "./type"
import { boardout_check, createBoard, draw_setup, unwrap } from "./utils"
import { type MoveBoard } from './piece'

const map = [
  ['R', 'X', 'B', 'X', 'K', 'X', 'B', 'X', 'R'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['R', 'X', 'B', 'X', 'K', 'X', 'B', 'X', 'R'],
]

const movement = (board: Board, now: Position, at: Position): Board => {
  let n_x = now.x
  let n_y = now.y
  let x = at.x
  let y = at.y

  let grid = board[n_y][n_x]

  if (!grid.piece) return board;

  board[n_y][n_x] = empityGrid()
  board[y][x] = grid

  console.log(grid)

  return board
}

class Game {
  board: Board
  // turn
  // true , false
  players: [Player, Player]
  available_pieces: [number, PieceInfo[]][]

  turn = true
  status = true

  constructor(players: [Player, Player], map: string[][]) {
    let board = createBoard(map, players)

    this.available_pieces = []
    this.players = players
    this.board = board
  }

  draw(c: Position) {
    this.board.forEach((r, y) => {
      r.forEach((g, x) => {
        if (c.x == x && c.y == y) stdout.write('\x1b[42m');

        if (g.piece) {
          stdout.write(g.piece.key + ' ', 'utf8')
        } else {
          stdout.write('・')
        }

        stdout.write('\x1b[49m')
      })
      console.log()
    })
  }

  get_turn_player(): Player {
    return this.turn ? this.players[0] : this.players[1]
  }

  // stdout.write('\x1b[42m') green
  // stdout.write('\x1b[41m') red

  move(c: Position) {
  }
}

const move_cursor = (c: Position, key: string): Position => {
  switch (key) {
    case 'a': !boardout_check(c.x, -1) ? c.x -= 1 : {}; break;
    case 'd': !boardout_check(c.x, 1) ? c.x += 1 : {}; break;
    case 'w': !boardout_check(c.y, -1) ? c.y -= 1 : {}; break;
    case 's': !boardout_check(c.y, 1) ? c.y += 1 : {}; break;
  }
  return c
}

let game = new Game(
  [
    { piece_type: 'chess', name: 'player1', id: 0 },
    { piece_type: 'shogi', name: 'player2', id: 1 }
  ],
  map
)

draw_setup()

type Select = {
  status: boolean
  piece?: Piece
  pos?: Position
}

let select: Select = {
  status: false
}
let c: Position = { x: 0, y: 0 }
let move_board: MoveBoard

game.draw(c)

// stdout.write('\x1b[49m') default
// stdout.write('\x1b[42m') green
// stdout.write('\x1b[41m') red

const draw_move_board = () => {
  console.clear()

  move_board.forEach((row, y) => {
    row.forEach((g, x) => {
      if (g.move) stdout.write('\x1b[41m')
      if (c.x == x && c.y == y) stdout.write('\x1b[42m')

      if (g.piece) {
        stdout.write(g.piece.key + ' ', 'utf8')
      } else {
        stdout.write('・')
      }
      stdout.write('\x1b[49m')
    })
    console.log()
  })
}

stdin.on("data", k => {
  let key = k.toString('utf8')
  if (key === "\u0003" || !game.status) exit()

  console.clear()

  if (select.status && select.pos) {
    if (key == ' ' && move_board[c.y][c.x].move) {
      select.status = false

      game.board[c.y][c.x] = { piece: select.piece }
      game.board[select.pos.y][select.pos.x] = {}

      select = {
        status: false
      }
    }
    c = move_cursor(c, key)

    draw_move_board()

    return
  }

  console.log('main')

  console.log(c)

  c = move_cursor(c, key)
  if (key == ' ' && game.board[c.y][c.x].piece) {
    console.clear()
    select.status = true
    select.piece = game.board[c.y][c.x].piece
    select.pos = c
    move_board = unwrap(game.board[c.y][c.x].piece?.movement(game.board, c, game.get_turn_player()))
    draw_move_board()
  }

  game.draw(c)
});
