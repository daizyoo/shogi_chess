import { sizeChekcer } from "./consts";
import { PIECE_LSIT } from "./piece";
import type { Board, Grid } from "./type"

const createGrid = (key: string): Grid => {
  return { 'piece': PIECE_LSIT.get(key) }
}

const createBoard = (list: string[][]): Board => {
  sizeChekcer(list)

  return list.map(row => row.map(key => createGrid(key)))
}

const map = [
  ['X', 'X', 'X', 'X', 'K', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ['X', 'X', 'X', 'X', 'K', 'X', 'X', 'X', 'X'],
]

class Game {
  board: Board

  constructor(map: string[][]) {
    let board = createBoard(map);

    this.board = board
  }

  draw() {
    this.board.forEach(r => {
      let line = ''
      r.forEach(g => {
        line += g.piece ? g.piece.key + ' ' : '・'
      })
      console.log(line)
    })
  }
}

const game = new Game(map)

game.draw()