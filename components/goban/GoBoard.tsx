"use client";

import { useState } from "react";

type Stone = "black" | "white" | null;

const BOARD_SIZE = 9;

function createEmptyBoard(): Stone[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

export default function GoBoard() {
  const [board, setBoard] = useState<Stone[][]>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<"black" | "white">("black");
  const [moveCount, setMoveCount] = useState(0);

  function handlePlaceStone(row: number, col: number) {
    if (board[row][col] !== null) return;

    const nextBoard = board.map((line) => [...line]);
    nextBoard[row][col] = currentPlayer;

    setBoard(nextBoard);
    setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
    setMoveCount((prev) => prev + 1);
  }

  function handleReset() {
    setBoard(createEmptyBoard());
    setCurrentPlayer("black");
    setMoveCount(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Bàn cờ 9x9</h2>
          <p className="text-neutral-400">
            Lượt hiện tại:{" "}
            <span className="font-semibold text-amber-300">
              {currentPlayer === "black" ? "Đen" : "Trắng"}
            </span>
          </p>
          <p className="text-neutral-500 text-sm">Số nước đã đi: {moveCount}</p>
        </div>

        <button
          onClick={handleReset}
          className="rounded-full border border-white/20 px-5 py-2 text-white hover:bg-white/10 transition"
        >
          Reset
        </button>
      </div>

      <div className="w-full overflow-auto">
        <div
          className="relative mx-auto aspect-square w-[min(90vw,560px)] rounded-2xl bg-[#d8a850] shadow-2xl"
        >
          <div className="absolute inset-[8%]">
            {Array.from({ length: BOARD_SIZE }).map((_, index) => (
              <div
                key={`h-${index}`}
                className="absolute left-0 right-0 h-px bg-black/70"
                style={{
                  top: `${(index / (BOARD_SIZE - 1)) * 100}%`,
                }}
              />
            ))}

            {Array.from({ length: BOARD_SIZE }).map((_, index) => (
              <div
                key={`v-${index}`}
                className="absolute top-0 bottom-0 w-px bg-black/70"
                style={{
                  left: `${(index / (BOARD_SIZE - 1)) * 100}%`,
                }}
              />
            ))}

            {board.map((row, rowIndex) =>
              row.map((stone, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handlePlaceStone(rowIndex, colIndex)}
                  className="absolute flex items-center justify-center rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(colIndex / (BOARD_SIZE - 1)) * 100}%`,
                    top: `${(rowIndex / (BOARD_SIZE - 1)) * 100}%`,
                    width: "9%",
                    height: "9%",
                  }}
                  aria-label={`Place stone at ${rowIndex + 1}, ${colIndex + 1}`}
                >
                  {stone && (
                    <span
                      className={`block h-full w-full rounded-full shadow-lg ${
                        stone === "black"
                          ? "bg-neutral-950"
                          : "bg-white border border-neutral-300"
                      }`}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}