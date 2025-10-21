const MAP_PATTERN = {
  Default: 'default',
  Ou_2_Queen_2: 'Ou_2_Queen_2',
  Ou_2_King_2: 'Ou_2_King_2',
  King_2: 'King_2'
} as const

export type MapPattern = typeof MAP_PATTERN[keyof typeof MAP_PATTERN]

export type PieceMap = PieceKind[][]

const PIECE_TYPE = {
  Chess: 'chess',
  Shogi: 'shogi'
} as const

const PIECE_KIND = {
  Chess_King: 'K',
  Chess_Queen: 'Q',
  Chess_Rook: 'R',
  Chess_Kinight: 'N',
  Ches_Bishop: 'B',
  Chess_Pawn: 'P',

  Shogi_King: 'k',
  Shogi_Rook: 'r',
  Shogi_Bishop: 'b',
  Shogi_Gold: 'g',
  Shogi_Silver: 's',
  Shogi_Kinight: 'n',
  Shogi_Lance: 'l',
  Shogi_Pawn: 'p',

  None: 'X'
} as const

export type PieceKind = typeof PIECE_KIND[keyof typeof PIECE_KIND]

export type PieceType = typeof PIECE_TYPE[keyof typeof PIECE_TYPE]

export type Player = {
  readonly piece_type: PieceType,
  readonly turn: boolean // true -> 先手 false -> 後手
  readonly name: string,
  readonly id: number,
}

export type PieceInfo = {
  type: PieceType,
  key: PieceKind,
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
