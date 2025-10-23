import type { Game } from "../game.js"
import type { Player } from "../type.js"

const MESSAGE_TYPE = {
  create_room: "create_room",
  in_room: "in_room",
  start_game: "start_game",
  delete_room: "delete_room",
  list_rooms: "list_rooms",
  leave_room: "leave_room",

  game_update: "game_update",

  response: "response"
} as const

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE]

export type Data<T> = {
  type: MessageType
  data: T
}

export type Room = RoomInfo & {
  game: Game
}

export type RoomInfo = {
  id: number
  name: string
}

export type WaitRoom = RoomInfo & {
  player: Player
}

export type InRoom = {
  id: number
  player: Player
}

export type Rooms = Room[]
export type WaitRooms = WaitRoom[] // changed: wait rooms must include player entries

const CODE = {
  Ok: 'ok',
  Error: 'error',
} as const

export type Code = (typeof CODE)[keyof typeof CODE]

export type Response = {
  code: Code
  message: string
}

export function toString<T>(data: T): string {
  return JSON.stringify(data)
}
