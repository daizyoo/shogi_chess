import type { Board, MoveBoard, PieceInfo, Position } from "./type.js";
import { toMoveBoard, unwrap } from "./utils.js";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./consts.js";

const inBounds = (y: number, x: number): boolean => {
  return y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH;
};

// helper: get player id from original board without converting
const getPlayerId = (board: Board, pos: Position): number => {
  return unwrap(board[pos.y][pos.x].piece).player.id;
};

const getPlayerTurn = (board: Board, pos: Position): boolean => {
  return unwrap(board[pos.y][pos.x].piece).player.turn;
}

// Discrete offset moves (King, Knight (chess), Gold, Silver, shogi-Knight, Pawn (shogi single-step), etc.)
const moveOffsets = (_board: Board, pos: Position, offsets: readonly [number, number][]): MoveBoard => {
  const board = toMoveBoard(_board);
  const { x: pos_x, y: pos_y } = pos;
  const me = unwrap(board[pos_y][pos_x].piece).player.id;

  for (const [dy, dx] of offsets) {
    const n_y = pos_y + dy;
    const n_x = pos_x + dx;
    if (!inBounds(n_y, n_x)) continue;

    const g = board[n_y][n_x];
    if (!g.piece) {
      board[n_y][n_x].move = true;
    } else {
      if (g.piece.player.id !== me) board[n_y][n_x].move = true;
    }
  }

  return board;
};

// Sliding moves (rook, bishop, queen, lance)
const slide = (boardSrc: Board, pos: Position, directions: readonly [number, number][]): MoveBoard => {
  const board = toMoveBoard(boardSrc);
  const { x: pos_x, y: pos_y } = pos;
  const me = unwrap(board[pos_y][pos_x].piece).player.id;

  for (const [dy, dx] of directions) {
    let step = 1;
    while (true) {
      const n_y = pos_y + dy * step;
      const n_x = pos_x + dx * step;
      if (!inBounds(n_y, n_x)) break;

      const g = board[n_y][n_x];
      if (!g.piece) {
        board[n_y][n_x].move = true;
      } else {
        if (g.piece.player.id !== me) board[n_y][n_x].move = true;
        break;
      }
      step++;
      if (step > Math.max(BOARD_WIDTH, BOARD_HEIGHT) + 2) break; // safe guard
    }
  }

  return board;
};

// Chess pawn (single forward, diagonal capture). No double-step, no en-passant, no promotion.
const chessPawn = (boardSrc: Board, pos: Position): MoveBoard => {
  const { x: pos_x, y: pos_y } = pos;
  const playerId = getPlayerId(boardSrc, pos);
  // 方向は getPlayerTurn を使って決定（true -> 下方向(1), false -> 上方向(-1)）
  const dir = !getPlayerTurn(boardSrc, pos) ? 1 : -1;
  const forwardY = pos_y + dir;

  const board = toMoveBoard(boardSrc);

  // forward one if empty
  if (inBounds(forwardY, pos_x) && !board[forwardY][pos_x].piece) {
    board[forwardY][pos_x].move = true;
  }

  // captures: diag left/right
  for (const dx of [-1, 1]) {
    const n_x = pos_x + dx;
    if (!inBounds(forwardY, n_x)) continue;
    const g = board[forwardY][n_x];
    if (g.piece && g.piece.player.id !== playerId) board[forwardY][n_x].move = true;
  }

  return board;
};

// Shogi pawn (single forward, captures by moving forward)
const shogiPawn = (boardSrc: Board, pos: Position): MoveBoard => {
  const { x: pos_x, y: pos_y } = pos;
  const playerId = getPlayerId(boardSrc, pos);
  // 方向を getPlayerTurn で決定
  const dir = !getPlayerTurn(boardSrc, pos) ? 1 : -1;
  const forwardY = pos_y + dir;

  const board = toMoveBoard(boardSrc);
  if (!inBounds(forwardY, pos_x)) return board;

  const g = board[forwardY][pos_x];
  if (!g.piece) board[forwardY][pos_x].move = true;
  else if (g.piece.player.id !== playerId) board[forwardY][pos_x].move = true;

  return board;
};

// shogi lance: sliding forward only
const shogiLance = (boardSrc: Board, pos: Position): MoveBoard => {
  // 方向を getPlayerTurn で決定
  const dir = !getPlayerTurn(boardSrc, pos) ? 1 : -1;
  return slide(boardSrc, pos, [[dir, 0]]);
};

// chess knight offsets
const chessKnight = (board: Board, pos: Position): MoveBoard => {
  const offsets: [number, number][] = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1],
  ];
  return moveOffsets(board, pos, offsets);
};

// shogi knight (only two forward 'L' moves)
const shogiKnight = (board: Board, pos: Position): MoveBoard => {
  // 方向を getPlayerTurn で決定
  const dir = !getPlayerTurn(board, pos) ? 1 : -1;
  const offsets: [number, number][] = [
    [2 * dir, -1],
    [2 * dir, 1],
  ];
  return moveOffsets(board, pos, offsets);
};

// helper: all 8 directions
const ORTHO: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const DIAG: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ALL8: [number, number][] = [...ORTHO, ...DIAG];

export const PIECE_LSIT: Map<string, PieceInfo> = new Map();

// initialize PIECE_LSIT
(() => {
  const PIECES: PieceInfo[] = [
    // --- Chess pieces (uppercase) ---
    {
      type: 'chess',
      key: 'K',
      name: 'King',
      movement: (board, pos) => moveOffsets(board, pos, ALL8)
    },
    {
      type: 'chess',
      key: 'Q',
      name: 'Queen',
      movement: (board, pos) => slide(board, pos, ALL8)
    },
    {
      type: 'chess',
      key: 'R',
      name: 'Rook',
      movement: (board, pos) => slide(board, pos, ORTHO)
    },
    {
      type: 'chess',
      key: 'B',
      name: 'Bishop',
      movement: (board, pos) => slide(board, pos, DIAG)
    },
    {
      type: 'chess',
      key: 'N',
      name: 'Knight',
      movement: (board, pos) => chessKnight(board, pos)
    },
    {
      type: 'chess',
      key: 'P',
      name: 'Pawn',
      movement: (board, pos) => chessPawn(board, pos)
    },

    // --- Shogi pieces (lowercase keys) ---
    {
      type: 'shogi',
      key: 'k', // king
      name: 'King (shogi)',
      movement: (board, pos) => moveOffsets(board, pos, ALL8)
    },
    {
      type: 'shogi',
      key: 'r', // rook
      name: 'Rook (shogi)',
      movement: (board, pos) => slide(board, pos, ORTHO)
    },
    {
      type: 'shogi',
      key: 'b', // bishop
      name: 'Bishop (shogi)',
      movement: (board, pos) => slide(board, pos, DIAG)
    },
    {
      type: 'shogi',
      key: 'g', // gold general
      name: 'Gold General',
      movement: (board, pos) => {
        // 方向を getPlayerTurn で決定
        const dir = !getPlayerTurn(board, pos) ? 1 : -1;
        const offsets: [number, number][] = [
          [dir, 0],
          [dir, -1],
          [dir, 1],
          [0, -1],
          [0, 1],
          [-dir, 0],
        ];
        return moveOffsets(board, pos, offsets);
      }
    },
    {
      type: 'shogi',
      key: 's', // silver general
      name: 'Silver General',
      movement: (board, pos) => {
        // 方向を getPlayerTurn で決定
        const dir = !getPlayerTurn(board, pos) ? 1 : -1;
        const offsets: [number, number][] = [
          [dir, 0],
          [dir, -1],
          [dir, 1],
          [-dir, -1],
          [-dir, 1],
        ];
        return moveOffsets(board, pos, offsets);
      }
    },
    {
      type: 'shogi',
      key: 'n', // shogi knight
      name: 'Knight (shogi)',
      movement: (board, pos) => shogiKnight(board, pos)
    },
    {
      type: 'shogi',
      key: 'l', // lance
      name: 'Lance',
      movement: (board, pos) => shogiLance(board, pos)
    },
    {
      type: 'shogi',
      key: 'p', // pawn
      name: 'Pawn (shogi)',
      movement: (board, pos) => shogiPawn(board, pos)
    }
  ];

  for (const p of PIECES) {
    PIECE_LSIT.set(p.key, p);
  }
})();
