import { stdin, exit, stdout } from 'process'

import { draw_setup, unwrap } from "./utils.js"
import { Game } from './game.js'
import { CTRl_C } from './consts.js'

// external rendering functions (keep rendering outside Game)
const drawGame = (game: Game) => {
  console.clear()
  game.board.forEach((r, y) => {
    r.forEach((g, x) => {
      if (game.cursor.x === x && game.cursor.y === y) stdout.write('\x1b[42m');

      if (g.piece) stdout.write(g.piece.key + ' ', 'utf8')
      else stdout.write('・')

      stdout.write('\x1b[49m')
    })
    console.log()
  })
}

const drawGameMoveBoard = (game: Game) => {
  if (!game.moveBoard) return
  console.clear()
  game.moveBoard.forEach((row, y) => {
    row.forEach((g, x) => {
      if (g.move) stdout.write('\x1b[41m')
      if (game.cursor.x === x && game.cursor.y === y) stdout.write('\x1b[42m')

      if (g.piece) stdout.write(g.piece.key + ' ', 'utf8')
      else stdout.write('・')

      stdout.write('\x1b[49m')
    })
    console.log()
  })
}

let game = new Game(
  [
    { piece_type: 'chess', turn: false, name: 'player1', id: 0 },
    { piece_type: 'shogi', turn: true, name: 'player2', id: 1 }
  ],
  'Ou_2_Queen_2'
)

draw_setup()

// initial render
drawGame(game)

// デバッグ出力用
const debug_draw = () => {
  console.log(game.selection)
  console.log(game.put_selection)
  console.log(game.hand)
}

const document_draw = () => {
  let line = [
    "Cursor move: wasd",
    "Select: space",
    "Put: i",
    "Select cancel: ecs",
    "Exit: Ctrl + C",
  ];
  console.log()
  for (const l of line) console.log(l)
}

debug_draw()
document_draw()

stdin.on("data", k => {
  const key = k.toString('utf8')
  if (key === CTRl_C || !game.status) exit()
  game.handleInput(key)

  // decide which render to call based on selection state
  if (game.selection.status && game.moveBoard) drawGameMoveBoard(game)
  else drawGame(game)

  console.log(`${game.players[0].name}`)
  for (const piece of unwrap(game.hand.get(game.players[0].id)?.keys())) {
    console.log(piece)
  }
  console.log(`${game.players[1].name}`)
  for (const piece of unwrap(game.hand.get(game.players[1].id)?.keys())) {
    console.log(piece)
  }

  debug_draw()
  document_draw()
})
