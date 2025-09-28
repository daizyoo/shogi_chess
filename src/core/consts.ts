export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 9

// 配列のサイズが`BOARD_HEIGHT`x`BOARD_WIDTH`ではないならエラー
export function sizeChekcer<T>(array: T[][]) {
  if (array.length !== BOARD_HEIGHT || array.some(row => row.length !== BOARD_WIDTH))
    throw new Error('Invalid board dimensions')
}
