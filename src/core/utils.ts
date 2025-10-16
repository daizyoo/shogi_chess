import { stdin } from "process";
import { BOARD_HEIGHT, BOARD_WIDTH, sizeChekcer } from "./consts"
import { createGrid, type Board, type Player } from "./type"

// 配列のIndex外ではないか
// false: 範囲内
// true: 範囲外
export const boardout_check = (n: number, add: number): boolean => {
  let p = n + add
  return p > BOARD_HEIGHT - 1 || p > BOARD_WIDTH - 1 || 0 > p
}

export const createBoard = (list: string[][], players: [Player, Player]): Board => {
  sizeChekcer(list)

  return list.map(row => row.map(key => createGrid(key, players)))
}

// 指定した範囲の数列を返す
export const range = (start: number, end: number): number[] => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export const draw_setup = () => {
  stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding("utf8")
}

export const write_green = (str: string) => {
  process.stdout.write('\x1b[42m' + str)
  reset_color()
}

export const reset_color = () => {
  process.stdout.write('\x1b[47m')
}

export function unwrap<T>(value: T | undefined): T {
  if (!value) throw new Error('value is undefined')
  return value
}
