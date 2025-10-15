import type { MoveBoard } from "./piece"

const PIECE_TYPE = {
  Chess: 'chess',
  Shogi: 'shogi'
} as const

export type PieceType = typeof PIECE_TYPE[keyof typeof PIECE_TYPE]

export type Player = {
  readonly piece_type: PieceType,
  readonly name: string,
  readonly id: number,
}

export type PieceInfo = {
  type: PieceType,
  key: string,
  name: string,
  movement: (board: Board, pos: Position, player: Player) => MoveBoard
}

export type Piece = PieceInfo & { player: Player }

export type Grid = {
  piece?: Piece,
}

export type Board = Grid[][]

export type Position = {
  x: number,
  y: number
}
