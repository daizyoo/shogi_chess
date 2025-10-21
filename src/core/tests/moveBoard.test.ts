import { describe, it, expect } from "bun:test";

import { createBoard, toMoveBoard } from "../utils";

describe("move board", () => {
  const shogi_map = [
    // 0: チェスのバックランク（上側にチェスを置く）
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'X'],
    // 1: チェスのポーン列
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'X'],
    // 2-5: 空
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    // 6: 将棋の歩列（下側に将棋を置く）
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    // 7: 将棋の2列目（飛・角）
    ['X', 'r', 'X', 'X', 'X', 'X', 'X', 'b', 'X'],
    // 8: 将棋の初期行（香→桂→銀→金→王→金→銀→桂→香）
    ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l']
  ]

  let board = createBoard(shogi_map, [{ piece_type: 'chess', turn: true, name: '0', id: 0 }, { piece_type: 'shogi', turn: false, name: '1', id: 1 }])

  let mBoard = toMoveBoard(board)
  it("no move pos", () => {
    expect(mBoard?.every(y => y.every(g => !g.move))).toBe(true)
  })
})

