import type { PieceType } from "./type"

const MAP_PATTERN = {
  Default: 'default',
  Ou_2_Queen_2: 'Ou_2_Queen_2',
  Ou_2_King_2: 'Ou_2_King_2',
  King_2: 'King_2'
} as const

export type MapPattern = typeof MAP_PATTERN[keyof typeof MAP_PATTERN]

const DEFAULT_MAP = [
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

const OU_2_KING_2 = [
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

const OU_2_QUEEN_2 = [
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

const KING_2 = [
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


const map = (pt: PieceType, m: string[][]): string[][] => {
  if (pt === 'chess') return m

  let map = m.reverse()
  map[7] = map[7].reverse()
  return map
}

export const getMap = (pt: PieceType, pattern: MapPattern): string[][] => {
  switch (pattern) {
    case 'default': return map(pt, DEFAULT_MAP);
    case 'Ou_2_King_2': return map(pt, OU_2_KING_2);
    case 'Ou_2_Queen_2': return map(pt, OU_2_QUEEN_2);
    case 'King_2': return map(pt, KING_2);
    default: process.exit();
  }
}
