import type { Data, WaitRoom, InRoom, MessageType, RoomInfo, ReturnGame, UpdateGame } from "./types.js"
import type { PieceType, Player } from "../type.js"

import { CTRl_C } from "../consts.js"
import { draw_setup } from "../utils.js"
import { stdout, stdin, exit } from 'process'
import { parse } from "ts-command-line-args"
import { PIECE_LSIT } from "../piece.js"

console.log("🟢 クライアント起動")

const randomRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

interface ClientArgs {
  player_name: string
  player_id: number
  turn: boolean
  piece_type: string
  room_id: number
  room_name: string
  action: string
}

const ACTION = {
  Create: 'create',
  Join: 'join'
} as const

type Action = typeof ACTION[keyof typeof ACTION]

const args = parse<ClientArgs>({
  player_name: { type: String, alias: 'n', defaultValue: 'guest', description: 'プレイヤー名' },
  player_id: { type: Number, alias: 'i', description: 'プレイヤーID' },
  turn: { type: Boolean, alias: 't', description: '先手ならtrue、後手ならfalse' },
  piece_type: { type: String, alias: 'p', description: '駒の種類 (shogi or chess)' },
  room_id: { type: Number, alias: 'r', description: 'ルームID' },
  room_name: { type: String, description: 'ルーム名' },
  action: { type: String, alias: 'a', description: 'create: 部屋作成, join: 部屋参加' },
}, {
  helpArg: 'help', 'partial': true
})

const player: Player = {
  id: args.player_id,
  name: args.player_name,
  turn: args.turn,
  piece_type: args.piece_type as PieceType
}

const room: RoomInfo = { id: args.room_id, name: args.room_name }

const ws = new WebSocket("wss://b0db280a9645.ngrok-free.app")

console.log('🟢 サーバーに接続中...')

ws.onopen = () => {
  console.log("🟢 サーバーに接続しました")
  const create: Data<WaitRoom> = { type: "create_room", data: { player, ...room } }
  const join: Data<InRoom> = { type: "in_room", data: { id: room.id, player: player } }

  const action = args.action as Action

  console.log(player)
  console.log(room)
  console.log(action)

  let data
  switch (action) {
    case 'create': data = create; break;
    case 'join': data = join; break;
  }

  ws.send(JSON.stringify(data))
}

// external rendering functions (keep rendering outside Game)
const drawGame = (game: ReturnGame) => {
  console.clear()
  let turn = game.players.find(p => p.turn == game.turn)
  console.log(turn?.name)

  let { x: cursor_x, y: cursor_y } = game.cursor
  // if (game.turn != player.turn) {
  //   cursor_x = 8 - cursor_x
  //   cursor_y = 8 - cursor_y
  // }
  let board = game.board
  if (!player.turn) { // プレイヤーが後手なら
    board = board.map(y => y.reverse()).reverse()
  }

  board.forEach((r, y) => {
    r.forEach((g, x) => {
      if (cursor_x === x && cursor_y === y) stdout.write('\x1b[42m');

      if (g.piece) stdout.write(g.piece.key + ' ', 'utf8')
      else stdout.write('・')

      stdout.write('\x1b[49m')
    })
    console.log()
  })
}

const drawGameMoveBoard = (game: ReturnGame) => {
  if (!game.moveBoard) return
  console.clear()
  let turn = game.players.find(p => p.turn == game.turn)
  console.log(turn?.name)

  // let { x: cursor_x, y: cursor_y } = game.cursor
  // if (game.turn != player.turn) {
  //   cursor_x = 8 - cursor_x
  //   cursor_y = 8 - cursor_y
  // }
  let moveBoard = game.moveBoard
  if (!player.turn) { // プレイヤーが後手なら
    moveBoard = moveBoard.map(y => y.reverse()).reverse()
  }

  moveBoard.forEach((row, y) => {
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

const drawDebug = () => {
  const { board, moveBoard, ...g } = game
  console.log(g)
}

const drawDocument = () => {
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

const drawHand = (hands: Map<number, Map<string, number>>) => {
  let hands1 = hands.get(game.players[0].id)?.keys()
  let hands2 = hands.get(game.players[1].id)?.keys()

  console.log(`${game.players[0].name}`)
  if (hands1) for (const piece of hands1) {
    console.log(`${PIECE_LSIT.get(piece)?.name} `)
  }

  console.log(`${game.players[1].name}`)
  if (hands2) for (const piece of hands2) {
    console.log(`${PIECE_LSIT.get(piece)?.name} `)
  }
}

draw_setup()

let game: ReturnGame

function gameInput() {
  // initial render
  drawGame(game)

  // デバッグ出力用
  drawDebug()
  drawDocument()

  stdin.on("data", k => {
    const key = k.toString('utf8')
    if (key === CTRl_C || !game.status) exit()

    if (game.selection.status && game.moveBoard) drawGameMoveBoard(game)
    else drawGame(game)

    ws.send(JSON.stringify({
      type: 'game_update',
      data: {
        player_id: player.id,
        room_id: room.id,
        key: key
      }
    } as Data<UpdateGame>))
  })
}

ws.onmessage = (e) => {
  let data = JSON.parse(e.data)
  let message_type: MessageType = data.type
  console.log(data)
  switch (message_type) {
    case 'delete_room': process.exit(0)
    case 'list_rooms': {
      data = data as Data<{ waitRecords: WaitRoom[], roomRecords: InRoom[] }>
      console.log(data.data.waitRecords)
      console.log(data.data.roomRecords)
      break
    }
    case 'response': console.log(data); break;
    case 'start_game': {
      game = data.data as ReturnGame

      if (game.turn != player.turn) stdin.pause()
      gameInput()
      break
    }
    case 'game_update': {
      data = data as Data<ReturnGame>
      game = data.data
      game.turn === player.turn ? stdin.resume() : stdin.pause()

      // decide which render to call based on selection state
      if (game.selection.status && game.moveBoard) drawGameMoveBoard(game)
      else drawGame(game)

      const hands = new Map<number, Map<string, number>>(
        game.hand.map(([outerKey, innerEntries]) => [
          outerKey,
          new Map<string, number>(innerEntries),
        ])
      );

      drawHand(hands)

      drawDebug()
      drawDocument()
      break
    }
  }
}
