import type { MapPattern, PieceMap, PieceType } from "./type"

const DEFAULT_MAP: PieceMap = [
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
  ['X', 'r', 'X', 'X', 'X', 'X', 'X', 'b', 'X'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'X']
]

const OU_2_KING_2: PieceMap = [
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
  ['X', 'r', 'X', 'X', 'k', 'X', 'X', 'b', 'X'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'K', 'B', 'N', 'R']
]

const OU_2_QUEEN_2: PieceMap = [
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
  ['X', 'r', 'X', 'X', 'k', 'X', 'X', 'b', 'X'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'Q', 'B', 'N', 'R']
]

const KING_2: PieceMap = [
  ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
  ['X', 'r', 'X', 'X', 'X', 'X', 'X', 'b', 'X'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'K', 'B', 'N', 'R']
]

const map = (pt: PieceType, m: PieceMap): PieceMap => {
  if (pt === 'chess') return m

  let map = m.reverse()
  map[7] = map[7].reverse()
  return map
}

export const getMap = (pt: PieceType, pattern: MapPattern): PieceMap => {
  switch (pattern) {
    case 'default': return map(pt, DEFAULT_MAP);
    case 'Ou_2_King_2': return map(pt, OU_2_KING_2);
    case 'Ou_2_Queen_2': return map(pt, OU_2_QUEEN_2);
    case 'King_2': return map(pt, KING_2);
    default: process.exit();
  }
}
