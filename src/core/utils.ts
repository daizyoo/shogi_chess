import { stdin } from "process";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./consts";
import type { Board, MGrid, MoveBoard, Piece, Player } from "./type";
import { PIECE_LSIT } from "./piece";
import type { Grid } from "matter";

export const createBoard = (list: string[][], players: [Player, Player]): Board => {
  sizeChekcer(list)

  return list.map(row => row.map(key => createGrid(key, players)))
}


export const toMoveBoard = (board: Board): MoveBoard => {
  return board.map(row => row.map((g): MGrid => {
    if (!g.piece) return { move: false };
    else return { piece: g.piece, move: false };
  }));
};

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

// 配列のサイズが`BOARD_HEIGHT`x`BOARD_WIDTH`ではないならエラー
export const sizeChekcer = (array: string[][]) => {
  if (array.length !== BOARD_HEIGHT || array.some(row => row.length !== BOARD_WIDTH))
    throw new Error('Invalid board dimensions')
}

// 配列の Index が範囲外ではないか
// false: 範囲内、 true: 範囲外 (既存の呼び出しシグネチャを維持)
export const boardout_check = (n: number, add: number): boolean => {
  const p = n + add
  // BOARD は正方で 9x9 なので幅・高さのうち大きい方で判定（将来的に縦横別に判定したければ拡張）
  const limit = Math.max(BOARD_HEIGHT, BOARD_WIDTH)
  return p < 0 || p >= limit
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
  process.stdout.write('\\x1b[42m' + str)
  reset_color()
}

export const reset_color = () => {
  process.stdout.write('\\x1b[47m')
}

export function unwrap<T>(value: T | undefined): T {
  if (!value) throw new Error('value is undefined')
  return value
}
