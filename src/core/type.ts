const PIECE_TYPE = {
  Chess: 'chess',
  Shogi: 'shogi'
} as const

export type PieceType = typeof PIECE_TYPE[keyof typeof PIECE_TYPE]

export type Player = {
  readonly piece_type: PieceType,
  readonly turn: boolean // true -> 先手 false -> 後手
  readonly name: string,
  readonly id: number,
}

export type PieceInfo = {
  type: PieceType,
  key: string,
  name: string,
  movement: (board: Board, pos: Position) => MoveBoard
}

export type Piece = PieceInfo & { player: Player }

export type Grid = {
  piece?: Piece,
}

export type Board = Grid[][]

export type MGrid = {
  piece?: Piece,
  move: boolean
}

export type MoveBoard = MGrid[][];

export type Position = {
  x: number,
  y: number
}
