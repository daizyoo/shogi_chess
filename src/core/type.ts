const PIECE_TYPE = {
  Chess: 'chess',
  Shogi: 'shogi'
} as const

export type PieceType = typeof PIECE_TYPE[keyof typeof PIECE_TYPE]

export type Piece = {
  type: PieceType,
  key: string,
  name: string,
  movement: (board: Board) => void
}

export type Grid = {
  piece?: Piece,
}

export type Board = Grid[][]
