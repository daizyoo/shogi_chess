import { PIECE_LSIT, type MoveBoard } from "./piece"

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

export const empityGrid = (): Grid => { return {} }

export const createGrid = (key: string, players: Player[]): Grid => {
  let piece_info = PIECE_LSIT.get(key);

  // 駒がない場合は空のGridを返す
  if (!piece_info) return {}

  // 受け取ったPlayerリストからチェスか将棋のプレイヤーか
  let player = players.find(p => p.piece_type == piece_info?.type);
  if (!player) throw new Error(`not found player: ${piece_info}`) // プレイヤーが見つからなかった場合(ありえないが念の為)

  let piece: Piece = {
    player: player,
    ...piece_info
  };

  return { piece }
}
