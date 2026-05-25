import type { Board, Player, Point } from "./types";

export const BOARD_SIZE = 9;

export function createEmptyBoard(size = BOARD_SIZE): Board {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
}

export function getOpponent(player: Player): Player {
  return player === "black" ? "white" : "black";
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function pointKey(row: number, col: number): string {
  return `${row},${col}`;
}

function isOnBoard(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board.length;
}

function getNeighbors(board: Board, row: number, col: number): Point[] {
  const candidates = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];

  return candidates.filter((point) => isOnBoard(board, point.row, point.col));
}

function getGroupAndLiberties(board: Board, row: number, col: number) {
  const color = board[row][col];

  if (!color) {
    return {
      group: [],
      liberties: new Set<string>(),
    };
  }

  const visited = new Set<string>();
  const liberties = new Set<string>();
  const group: Point[] = [];
  const stack: Point[] = [{ row, col }];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current) continue;

    const key = pointKey(current.row, current.col);

    if (visited.has(key)) continue;

    visited.add(key);
    group.push(current);

    const neighbors = getNeighbors(board, current.row, current.col);

    for (const neighbor of neighbors) {
      const neighborStone = board[neighbor.row][neighbor.col];

      if (neighborStone === null) {
        liberties.add(pointKey(neighbor.row, neighbor.col));
      }

      if (neighborStone === color) {
        const neighborKey = pointKey(neighbor.row, neighbor.col);

        if (!visited.has(neighborKey)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return {
    group,
    liberties,
  };
}

function removeGroup(board: Board, group: Point[]) {
  for (const point of group) {
    board[point.row][point.col] = null;
  }
}

export function placeStone(
  board: Board,
  row: number,
  col: number,
  player: Player
):
  | {
      ok: true;
      board: Board;
      captured: Point[];
    }
  | {
      ok: false;
      board: Board;
      captured: Point[];
      error: string;
    } {
  if (board[row][col] !== null) {
    return {
      ok: false,
      board,
      captured: [],
      error: "Vị trí này đã có quân.",
    };
  }

  const nextBoard = cloneBoard(board);
  nextBoard[row][col] = player;

  const opponent = getOpponent(player);
  const captured: Point[] = [];

  const neighbors = getNeighbors(nextBoard, row, col);

  for (const neighbor of neighbors) {
    if (nextBoard[neighbor.row][neighbor.col] !== opponent) continue;

    const opponentGroup = getGroupAndLiberties(
      nextBoard,
      neighbor.row,
      neighbor.col
    );

    if (opponentGroup.liberties.size === 0) {
      removeGroup(nextBoard, opponentGroup.group);
      captured.push(...opponentGroup.group);
    }
  }

  const ownGroup = getGroupAndLiberties(nextBoard, row, col);

  if (ownGroup.liberties.size === 0) {
    return {
      ok: false,
      board,
      captured: [],
      error: "Không thể đi nước tự sát.",
    };
  }

  return {
    ok: true,
    board: nextBoard,
    captured,
  };
}

export function areBoardsEqual(boardA: Board, boardB: Board): boolean {
    if (boardA.length !== boardB.length) return false;

    for (let row = 0; row < boardA.length; row++) {
        if (boardA[row].length !== boardB[row].length) return false;

        for (let col = 0; col < boardA[row].length; col++) {
            if (boardA[row][col] !== boardB[row][col]) {
                return false;
            }
        }
    }

    return true;
}