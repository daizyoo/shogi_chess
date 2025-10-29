import WebSocket, { WebSocketServer } from "ws"
import type { MessageType, Response, WaitRoom, Room, InRoom, Data, ReturnGame, UpdateGame } from "./types.js"
import { toString } from "./types.js"
import { Game } from "../game.js"
import type { Board, MoveBoard } from "../type.js"

type WSSInfo = {
  player_id: number,
  ws: WebSocket
}

const wss = new WebSocketServer({ port: 8080 })

// internal records associate ws with the waiting-room or active room participants
type WaitRoomRecord = { info: WaitRoom; ws: WebSocket }
type RoomRecord = { room: Room; wss: [WSSInfo, WSSInfo] }

const waitRecords: WaitRoomRecord[] = []
const roomRecords: RoomRecord[] = []

const send = (ws: WebSocket, obj: any) => {
  if (ws.readyState === WebSocket.OPEN) ws.send(toString(obj))
}

const broadcast = (obj: any) => {
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(toString(obj))
  })
}

function response(data: Response): Data<Response> {
  return { type: 'response', data: data }
}

const createRoom = (ws: WebSocket, wait_room_raw: any) => {
  // wait_room_raw might be RoomInfo or WaitRoom; ensure we have a player field
  const wait_room: WaitRoom = wait_room_raw.player ?
    wait_room_raw as WaitRoom :
    { ...wait_room_raw, player: (wait_room_raw.player ?? { id: `guest-${Date.now()}`, name: "guest" }) } as WaitRoom

  // check duplicates in active and waiting lists
  const existsActive = roomRecords.some(r => r.room.id === wait_room.id)
  const existsWaiting = waitRecords.some(r => r.info.id === wait_room.id)

  if (existsActive || existsWaiting) {
    send(ws, response({
      code: "error",
      message: `このidはすでに存在しています: ${wait_room.id}`,
    }))
    return
  }

  waitRecords.push({ info: wait_room, ws }) // waitRecordsに追加
  send(ws, response({ code: "ok", message: `部屋を作成しました: ${wait_room.id}` }))
  console.log(`🟢 待機部屋作成 id=${wait_room.id} by`, wait_room.player)
}

const joinRoom = (ws: WebSocket, data: InRoom) => {
  const target = waitRecords.find(r => r.info.id === data.id)
  if (!target) {
    send(ws, response({ code: "error", message: `待機中の部屋が見つかりません: ${data.id}` }))
    return
  }

  // prepare room object (cast player to any to satisfy types)
  const room: Room = {
    id: target.info.id,
    name: target.info.name,
    game: new Game([target.info.player, data.player], 'King_2') // 待っていたプレイヤーと入ってきたプレイヤーでGameクラスインスタンスを作成
  }

  // remove from wait list
  const idx = waitRecords.findIndex(r => r.info.id === data.id)
  if (idx !== -1) waitRecords.splice(idx, 1)

  // register active room and keep ws for both participants
  roomRecords.push({ room, wss: [{ player_id: target.info.player.id, ws: target.ws }, { player_id: data.player.id, ws }] })

  let game: ReturnGame = {
    hand: [...room.game.hand].map(([outerKey, innerMap]) => [outerKey, [...innerMap]]),
    players: room.game.players,
    turn: room.game.turn,
    status: room.game.status,
    put_selection: room.game.put_selection,
    selection: room.game.selection,
    cursor: room.game.turn ? room.game.cursor : (() => {
      let cursor = room.game.cursor
      cursor.x = 8 - cursor.x
      cursor.y = 8 - cursor.y
      return cursor
    })(),
    moveBoard: room.game.moveBoard,
    board: room.game.board,
  }

  // notify both participants to start game
  const payload = { type: "start_game", data: game }
  send(target.ws, payload)
  send(ws, payload)

  console.log(`▶️ ルーム開始 id=${room.id} players=`, game.players)
}

const deleteRoom = (roomId: number) => {
  const idx = roomRecords.findIndex(r => r.room.id === roomId)
  if (idx === -1) return false
  const rec = roomRecords.splice(idx, 1)[0]
  // notify both participants
  const payload = { type: "delete_room", data: { id: roomId, message: "部屋が削除されました" } }
  rec.wss.forEach((s) => send(s.ws, payload))
  console.log(`❌ ルーム削除 id=${roomId}`)
  return true
}

const getRooms = () => {
  return {
    waitRecords: waitRecords.map(r => r.info),
    roomRecords: roomRecords.map(r => r.room)
  }
}

const listRooms = (ws: WebSocket) => {
  send(ws, { type: 'list_rooms', data: getRooms() })
}

const leaveRoom = (ws: WebSocket, payload?: { id?: number }) => {
  // If payload.id provided, attempt to delete that active room (if participant)
  if (payload?.id != null) {
    const idx = roomRecords.findIndex(r => r.room.id === payload.id && (r.wss[0].ws === ws || r.wss[1].ws === ws))
    if (idx !== -1) {
      const rec = roomRecords.splice(idx, 1)[0]
      const other = rec.wss.find(s => s.ws !== ws)
      if (other) send(other.ws, { type: "delete_room", data: { id: rec.room.id, message: "相手が退室しました" } })
      send(ws, response({ code: "ok", message: "left room" }))
      console.log(`↩️ プレイヤーがルームを退室 id=${rec.room.id}`)
      return
    }
    send(ws, response({ code: "error", message: "参加中の指定ルームが見つかりません" }))
    return
  }

  // Otherwise, try to cancel a wait-room created by this socket
  const wIdx = waitRecords.findIndex(r => r.ws === ws)
  if (wIdx !== -1) {
    const removed = waitRecords.splice(wIdx, 1)[0]
    broadcast({ type: "delete_room", data: { id: removed.info.id, message: "作成者が待機をキャンセルしました" } })
    send(ws, response({ code: "ok", message: "waitroom cancelled" }))
    console.log(`🧾 待機キャンセル id=${removed.info.id}`)
    return
  }

  // If socket is in an active room, remove room and notify other
  const aIdx = roomRecords.findIndex(r => r.wss[0].ws === ws || r.wss[1].ws === ws)
  if (aIdx !== -1) {
    const removed = roomRecords.splice(aIdx, 1)[0]
    const otherWs = removed.wss.find(s => s.ws !== ws)
    if (otherWs) send(otherWs.ws, { type: "delete_room", data: { id: removed.room.id, message: "相手が退室しました" } })
    send(ws, response({ code: "ok", message: "left active room" }))
    console.log(`🧾 アクティブルーム退室 id=${removed.room.id}`)
    return
  }

  send(ws, response({ code: "error", message: "退室できるルームが見つかりません" }))
}

let cursor_change_status: boolean = false

const game_update = (ws: WebSocket, data: UpdateGame) => {
  let room = roomRecords.find(r => r.room.id == data.room_id)
  if (!room) {
    send(ws, response({ code: 'error', message: 'roomが存在しません' }))
    return
  }
  let game = room.room.game

  if (game.turn) cursor_change_status = false
  if (!game.turn && !cursor_change_status) {
    game.cursor.x = 8 - game.cursor.x
    game.cursor.y = 8 - game.cursor.y
    cursor_change_status = true
  }

  game.handleInput(data.key)

  let r_game: ReturnGame = {
    players: game.players,
    hand: [...game.hand].map(([outerKey, innerMap]) => [outerKey, [...innerMap]]),
    turn: game.turn,
    status: game.status,
    put_selection: game.put_selection,
    selection: game.selection,
    cursor: game.cursor,
    moveBoard: game.moveBoard,
    board: game.board,
  }

  room?.wss.forEach(wssi => {
    send(wssi.ws, { type: 'game_update', data: r_game } as Data<ReturnGame>)
  })
}

const boardDebug = (board: Board | MoveBoard) => {
}

wss.on("connection", (ws) => {
  console.log("✅ クライアントが接続しました")

  // 当該クライアントに現在の待機部屋一覧を送る
  send(ws, { type: 'list_rooms', data: getRooms() })

  // クライアントからメッセージを受信
  ws.on("message", (d) => {
    let data = JSON.parse(d.toString())
    let type: MessageType = data.type
    switch (type) {
      case "create_room": console.log('create room'); createRoom(ws, data.data); break;
      case 'in_room': console.log('join room'); joinRoom(ws, data.data); break;
      case 'delete_room': {
        console.log('delete room');
        const id = data.data?.id
        if (typeof id === 'number') {
          const ok = deleteRoom(id)
          send(ws, response({ code: ok ? "ok" : "error", message: ok ? "deleted" : "not found" }))
        } else {
          send(ws, response({ code: "error", message: "invalid id" }))
        }
        break
      }
      case 'list_rooms': console.log('list rooms'); listRooms(ws); break;
      case 'leave_room': console.log('leave room'); leaveRoom(ws, data.data); break;
      case 'game_update': console.log('game update'); game_update(ws, data.data); break;
      default: send(ws, response({ code: "error", message: `不明なタイプ: ${type}` }))
    }
  })

  // 接続が切れたとき
  ws.on("close", () => {
    console.log("❌ クライアントが切断されました")

    // If the socket had a waiting room, remove it and notify (no game started)
    const wIdx = waitRecords.findIndex(r => r.ws === ws)
    if (wIdx !== -1) {
      const removed = waitRecords.splice(wIdx, 1)[0]
      broadcast({ type: "delete_room", data: { id: removed.info.id, message: "作成者が切断したため待機部屋を削除しました" } })
      console.log(`🧾 待機部屋削除 id=${removed.info.id} (作成者切断)`)
    }

    // If the socket was in an active room, remove the room and notify the other participant
    const rIdx = roomRecords.findIndex(r => r.wss[0].ws === ws || r.wss[1].ws === ws)
    if (rIdx !== -1) {
      const removedRoom = roomRecords.splice(rIdx, 1)[0]
      const otherWs = removedRoom.wss.find(s => s.ws !== ws)
      if (otherWs) {
        send(otherWs.ws, { type: "delete_room", data: { id: removedRoom.room.id, message: "相手が切断したため部屋が閉じられました" } })
      }
      console.log(`🧾 アクティブルーム削除 id=${removedRoom.room.id} (参加者切断)`)
    }
  })
})

console.log("🚀 WebSocket サーバーが ws://localhost:8080 で起動しました")
