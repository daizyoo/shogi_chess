import { CTRl_C } from "../consts"
import { Game } from "../game"
import type { Player } from "../type"
import { draw_setup, unwrap } from "../utils"
import type { Data, WaitRoom, InRoom, MessageType, RoomInfo } from "./types"
import { stdout, stdin, exit } from 'process'

const ws = new WebSocket("ws://localhost:8080")

// Example player shape — adapt fields to your Player type in ../type
const player: Player = {
  id: 123,
  name: "player1",
  turn: true,
  piece_type: 'chess'
}

const room: RoomInfo = {
  id: 0,
  name: "Room"
}

let c_room: Data<WaitRoom> = {
  type: "create_room",
  data: {
    player,
    ...room
  },
}

let join_msg: Data<InRoom> = {
  type: "in_room",
  data: {
    id: 0,
    player: {
      id: 456,
      name: "player2",
      turn: false,
      piece_type: 'shogi',
    },
  },
}

ws.onopen = () => {
  ws.send(JSON.stringify(c_room))
}

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

draw_setup()

let game: Game

const gameInput = (game: Game) => {
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

  // stdin.removeAllListeners('data');  // イベントを削除
  stdin.on("data", k => {
    const key = k.toString('utf8')
    if (key === CTRl_C || !game.status) exit()
    game.handleInput(key)

    // decide which render to call based on selection state
    if (game.selection.status && game.moveBoard) drawGameMoveBoard(game)
    else drawGame(game)


    console.log(`${game.players[0].name}`)
    for (const piece of unwrap(game.hand.get(game.players[0].id)?.keys())) {
      console.log(`${piece} `)
    }
    console.log(`${game.players[1].name}`)
    for (const piece of unwrap(game.hand.get(game.players[1].id)?.keys())) {
      console.log(`${piece} `)
    }

    debug_draw()
    document_draw()

    ws.send(JSON.stringify({
      type: 'game_update',
      data: {
        player_id: player.id,
        room_id: room.id,
        game
      }
    } as Data<UpdateGame>))

    stdin.pause()
  })
}

ws.onmessage = (e) => {
  let message_type: MessageType = e.data.type
  switch (message_type) {
    case 'response': console.log(e.data); break;
    case 'start_game': {
      game = e.data.data.game
      gameInput(game)
      break
    }
    case 'game_update': { game = e.data.data; stdin.resume() }
  }
}

export type UpdateGame = {
  player_id: number,
  room_id: number,
  game: Game
}
