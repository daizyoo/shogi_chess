import type { Piece } from "./type";

const PIECES: Piece[] = [
  {
    'type': 'chess',
    'key': 'K',
    'name': 'King',
    'movement': (b) => { }
  }
]

export const PIECE_LSIT: Map<string, Piece> = new Map();

for (const p of PIECES) {
  PIECE_LSIT.set(p.key, p)
}

const _: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0]
]
