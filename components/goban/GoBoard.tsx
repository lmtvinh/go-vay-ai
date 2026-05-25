"use client";

import { useState } from "react";
import ErrorPopup from "@/components/ui/ErrorPopup";
import {
    BOARD_SIZE,
    createEmptyBoard,
    getOpponent,
    placeStone,
} from "@/lib/go/board";
import type { Board, Move, Player } from "@/lib/go/types";

export default function GoBoard() {
    const [board, setBoard] = useState<Board>(createEmptyBoard);
    const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [blackCaptured, setBlackCaptured] = useState(0);
    const [whiteCaptured, setWhiteCaptured] = useState(0);
    const [message, setMessage] = useState<string>("Đen đi trước.");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function handlePlaceStone(row: number, col: number) {
        const result = placeStone(board, row, col, currentPlayer);

        if (!result.ok) {
            setErrorMessage(result.error);
            return;
        }

        setErrorMessage(null);

        const capturedCount = result.captured.length;

        setBoard(result.board);

        setMoveHistory((prev) => [
            ...prev,
            {
                row,
                col,
                player: currentPlayer,
                captured: result.captured,
                moveNumber: prev.length + 1,
            },
        ]);

        if (currentPlayer === "black") {
            setBlackCaptured((prev) => prev + capturedCount);
        } else {
            setWhiteCaptured((prev) => prev + capturedCount);
        }

        const nextPlayer = getOpponent(currentPlayer);
        setCurrentPlayer(nextPlayer);

        if (capturedCount > 0) {
            setMessage(
                `${currentPlayer === "black" ? "Đen" : "Trắng"
                } vừa bắt ${capturedCount} quân.`
            );
        } else {
            setMessage(`Đến lượt ${nextPlayer === "black" ? "Đen" : "Trắng"}.`);
        }
    }

    function handleReset() {
        setBoard(createEmptyBoard());
        setCurrentPlayer("black");
        setMoveHistory([]);
        setBlackCaptured(0);
        setWhiteCaptured(0);
        setMessage("Đen đi trước.");
    }

    return (

        <>
            <ErrorPopup
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Bàn cờ 9x9</h2>

                        <p className="text-neutral-400">
                            Lượt hiện tại:{" "}
                            <span className="font-semibold text-amber-300">
                                {currentPlayer === "black" ? "Đen" : "Trắng"}
                            </span>
                        </p>

                        <p className="text-sm text-neutral-500">
                            Số nước đã đi: {moveHistory.length}
                        </p>

                        <p className="mt-2 text-sm text-emerald-300">{message}</p>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                        <div className="flex justify-between gap-8">
                            <span className="text-neutral-400">Đen đã bắt:</span>
                            <span className="font-semibold text-white">{blackCaptured}</span>
                        </div>

                        <div className="flex justify-between gap-8">
                            <span className="text-neutral-400">Trắng đã bắt:</span>
                            <span className="font-semibold text-white">{whiteCaptured}</span>
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-full rounded-full border border-white/20 px-5 py-2 text-white transition hover:bg-white/10"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="w-full overflow-auto">
                    <div className="relative mx-auto aspect-square w-[min(90vw,560px)] rounded-2xl bg-[#d8a850] shadow-2xl">
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
                                    className="absolute bottom-0 top-0 w-px bg-black/70"
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
                                        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                                        style={{
                                            left: `${(colIndex / (BOARD_SIZE - 1)) * 100}%`,
                                            top: `${(rowIndex / (BOARD_SIZE - 1)) * 100}%`,
                                            width: "9%",
                                            height: "9%",
                                        }}
                                        aria-label={`Place stone at ${rowIndex + 1}, ${colIndex + 1
                                            }`}
                                    >
                                        {stone && (
                                            <span
                                                className={`block h-full w-full rounded-full shadow-lg ${stone === "black"
                                                    ? "bg-neutral-950"
                                                    : "border border-neutral-300 bg-white"
                                                    }`}
                                            />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-3 font-semibold text-white">Lịch sử nước đi</h3>

                    {moveHistory.length === 0 ? (
                        <p className="text-sm text-neutral-500">Chưa có nước đi nào.</p>
                    ) : (
                        <div className="max-h-48 space-y-2 overflow-auto text-sm">
                            {moveHistory.map((move) => (
                                <div
                                    key={move.moveNumber}
                                    className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
                                >
                                    <span>
                                        #{move.moveNumber}{" "}
                                        {move.player === "black" ? "Đen" : "Trắng"} đi tại hàng{" "}
                                        {move.row + 1}, cột {move.col + 1}
                                    </span>

                                    {move.captured.length > 0 && (
                                        <span className="text-amber-300">
                                            Bắt {move.captured.length} quân
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}