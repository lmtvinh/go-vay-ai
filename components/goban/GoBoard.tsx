"use client";

import { useState } from "react";
import {
    BOARD_SIZE,
    createEmptyBoard,
    getOpponent,
    placeStone,
} from "@/lib/go/board";
import { useRouter } from "next/navigation";
import type {
    Board,
    GameEndReason,
    GameMode,
    GameStatus,
    Move,
    Player,
} from "@/lib/go/types";
import ErrorPopup from "@/components/ui/ErrorPopup";
import GameEndPopup from "@/components/ui/GameEndPopup";

function getPlayerLabel(player: Player) {
    return player === "black" ? "Đen" : "Trắng";
}

export default function GoBoard() {
    const [board, setBoard] = useState<Board>(() => createEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [blackCaptured, setBlackCaptured] = useState(0);
    const [whiteCaptured, setWhiteCaptured] = useState(0);
    const [message, setMessage] = useState<string>("Đen đi trước.");
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [winner, setWinner] = useState<Player | null>(null);
    const [consecutivePasses, setConsecutivePasses] = useState(0);
    const router = useRouter();

    const [gameMode] = useState<GameMode>("pvp-local");
    const [viewerPlayer] = useState<Player>("black");
    const [endReason, setEndReason] = useState<GameEndReason | null>(null);
    const [showGameEndPopup, setShowGameEndPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    function handlePlaceStone(row: number, col: number) {
        if (gameStatus === "finished") {
            showError("Ván cờ đã kết thúc. Hãy bấm Reset để chơi ván mới.");
            return;
        }

        const result = placeStone(board, row, col, currentPlayer);

        if (!result.ok) {
            showError(result.error);
            return;
        }

        setErrorMessage(null);

        const capturedCount = result.captured.length;

        setBoard(result.board);

        setMoveHistory((prev) => [
            ...prev,
            {
                type: "stone",
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

        setConsecutivePasses(0);

        const nextPlayer = getOpponent(currentPlayer);
        setCurrentPlayer(nextPlayer);

        if (capturedCount > 0) {
            setMessage(
                `${getPlayerLabel(currentPlayer)} vừa bắt ${capturedCount} quân.`
            );
        } else {
            setMessage(`Đến lượt ${getPlayerLabel(nextPlayer)}.`);
        }
    }

    function handlePass() {
        if (gameStatus === "finished") {
            showError("Ván cờ đã kết thúc. Hãy bấm Reset để chơi ván mới.");
            return;
        }

        const nextConsecutivePasses = consecutivePasses + 1;

        setMoveHistory((prev) => [
            ...prev,
            {
                type: "pass",
                player: currentPlayer,
                moveNumber: prev.length + 1,
            },
        ]);

        if (nextConsecutivePasses >= 2) {
            setGameStatus("finished");
            setWinner(null);
            setEndReason("double-pass");
            setShowGameEndPopup(true);
            setConsecutivePasses(nextConsecutivePasses);
            setMessage(
                "Hai người chơi đã Pass liên tiếp. Ván cờ kết thúc. Chưa tính điểm ở phiên bản này."
            );
            return;
        }

        const nextPlayer = getOpponent(currentPlayer);

        setConsecutivePasses(nextConsecutivePasses);
        setCurrentPlayer(nextPlayer);
        setMessage(`${getPlayerLabel(currentPlayer)} đã Pass. Đến lượt ${getPlayerLabel(nextPlayer)}.`);
    }

    function handleResign() {
        if (gameStatus === "finished") {
            showError("Ván cờ đã kết thúc. Không thể đầu hàng sau khi ván đã kết thúc.");
            return;
        }

        const gameWinner = getOpponent(currentPlayer);

        setMoveHistory((prev) => [
            ...prev,
            {
                type: "resign",
                player: currentPlayer,
                winner: gameWinner,
                moveNumber: prev.length + 1,
            },
        ]);

        setWinner(gameWinner);
        setGameStatus("finished");
        setEndReason("resign");
        setShowGameEndPopup(true);

        setMessage(
            `${getPlayerLabel(currentPlayer)} đã đầu hàng. ${getPlayerLabel(
                gameWinner
            )} thắng.`
        );
    }

    function handleReset() {
        setBoard(createEmptyBoard());
        setCurrentPlayer("black");
        setMoveHistory([]);
        setBlackCaptured(0);
        setWhiteCaptured(0);
        setMessage("Đen đi trước.");
        setGameStatus("playing");
        setWinner(null);
        setConsecutivePasses(0);
        setEndReason(null);
        setShowGameEndPopup(false);
    }

    function handleExitGameMode() {
        router.push("/");
    }

    function showError(message: string) {
        setErrorMessage(message);
        setMessage(message);
    }

    return (
        <>
            <ErrorPopup
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
            />

            {endReason && (
                <GameEndPopup
                    isOpen={showGameEndPopup}
                    mode={gameMode}
                    winner={winner}
                    viewerPlayer={viewerPlayer}
                    reason={endReason}
                    onPlayAgain={handleReset}
                    onExit={handleExitGameMode}
                />
            )}
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Bàn cờ 9x9</h2>

                        <p className="text-neutral-400">
                            Trạng thái:{" "}
                            <span
                                className={
                                    gameStatus === "playing"
                                        ? "font-semibold text-emerald-300"
                                        : "font-semibold text-red-300"
                                }
                            >
                                {gameStatus === "playing" ? "Đang chơi" : "Đã kết thúc"}
                            </span>
                        </p>

                        <p className="text-neutral-400">
                            Lượt hiện tại:{" "}
                            <span className="font-semibold text-amber-300">
                                {getPlayerLabel(currentPlayer)}
                            </span>
                        </p>

                        {winner && (
                            <p className="text-neutral-400">
                                Người thắng:{" "}
                                <span className="font-semibold text-amber-300">
                                    {getPlayerLabel(winner)}
                                </span>
                            </p>
                        )}

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

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handlePass}
                                disabled={gameStatus === "finished"}
                                className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Pass
                            </button>

                            <button
                                onClick={handleResign}
                                disabled={gameStatus === "finished"}
                                className="rounded-full border border-red-400/40 px-5 py-2 text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Resign
                            </button>
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
                                        className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${gameStatus === "finished" ? "cursor-not-allowed" : ""
                                            }`}
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
                                    {move.type === "stone" && (
                                        <>
                                            <span>
                                                #{move.moveNumber} {getPlayerLabel(move.player)} đi tại
                                                hàng {move.row + 1}, cột {move.col + 1}
                                            </span>

                                            {move.captured.length > 0 && (
                                                <span className="text-amber-300">
                                                    Bắt {move.captured.length} quân
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {move.type === "pass" && (
                                        <span>
                                            #{move.moveNumber} {getPlayerLabel(move.player)} Pass
                                        </span>
                                    )}

                                    {move.type === "resign" && (
                                        <span>
                                            #{move.moveNumber} {getPlayerLabel(move.player)} đầu hàng.{" "}
                                            {getPlayerLabel(move.winner)} thắng.
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