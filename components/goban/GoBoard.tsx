"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    areBoardsEqual,
    createEmptyBoard,
    getOpponent,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type {
    Board,
    GameEndReason,
    GameMode,
    GameStatus,
    Move,
    Player,
    Point,
} from "@/lib/go/types";

import ErrorPopup from "@/components/ui/ErrorPopup";
import GameEndPopup from "@/components/ui/GameEndPopup";
import BoardGrid from "@/components/goban/BoardGrid";
import { saveLatestGameReview } from "@/lib/go/gameReviewStorage";
import { calculateBasicScore } from "@/lib/go/scoring";

const SUPPORTED_BOARD_SIZES = [9, 12, 13, 19] as const;

type BoardSize = (typeof SUPPORTED_BOARD_SIZES)[number];

function getPlayerLabel(player: Player) {
    return player === "black" ? "Đen" : "Trắng";
}

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

export default function GoBoard() {
    const router = useRouter();

    const [boardSize, setBoardSize] = useState<BoardSize>(9);
    const [board, setBoard] = useState<Board>(() => createEmptyBoard(9));
    const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [blackCaptured, setBlackCaptured] = useState(0);
    const [whiteCaptured, setWhiteCaptured] = useState(0);
    const [message, setMessage] = useState<string>("Đen đi trước.");
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [winner, setWinner] = useState<Player | null>(null);
    const [consecutivePasses, setConsecutivePasses] = useState(0);

    const [gameMode] = useState<GameMode>("pvp-local");
    const [viewerPlayer] = useState<Player>("black");
    const [endReason, setEndReason] = useState<GameEndReason | null>(null);
    const [showGameEndPopup, setShowGameEndPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [koPreviousBoard, setKoPreviousBoard] = useState<Board | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    const [lastMovePoint, setLastMovePoint] = useState<Point | null>(null);
    const [focusedHistoryPoint, setFocusedHistoryPoint] =
        useState<Point | null>(null);

    const selectedAnalysis = selectedPoint
        ? getStoneGroupAnalysis(board, selectedPoint.row, selectedPoint.col)
        : null;

    const highlightedGroupKeys = new Set(
        selectedAnalysis?.group.map(getPointKey) ?? []
    );

    const highlightedLibertyKeys = new Set(
        selectedAnalysis?.liberties.map(getPointKey) ?? []
    );

    function showError(error: string) {
        setErrorMessage(error);
        setMessage(error);
    }

    function saveReviewData({
        nextMoves,
        gameWinner,
        reason,
        score,
    }: {
        nextMoves: Move[];
        gameWinner: Player | null;
        reason: GameEndReason;
        score?: ReturnType<typeof calculateBasicScore>;
    }) {
        saveLatestGameReview({
            boardSize,
            board,
            moves: nextMoves,
            blackCaptured,
            whiteCaptured,
            winner: gameWinner,
            endReason: reason,
            createdAt: new Date().toISOString(),
            score,
        });
    }

    function resetGame(nextBoardSize: BoardSize = boardSize) {
        setBoard(createEmptyBoard(nextBoardSize));
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
        setErrorMessage(null);
        setSelectedPoint(null);
        setLastMovePoint(null);
        setFocusedHistoryPoint(null);
        setKoPreviousBoard(null);
    }

    function handleBoardSizeChange(nextBoardSize: BoardSize) {
        setBoardSize(nextBoardSize);
        resetGame(nextBoardSize);
    }

    function handlePlaceStone(row: number, col: number) {
        if (gameStatus === "finished") {
            showError("Ván cờ đã kết thúc. Hãy bấm Reset để chơi ván mới.");
            return;
        }

        if (board[row][col] !== null) {
            const analysis = getStoneGroupAnalysis(board, row, col);

            setSelectedPoint({ row, col });
            setFocusedHistoryPoint(null);
            setErrorMessage(null);

            if (analysis) {
                const libertyCount = analysis.liberties.length;
                const groupSize = analysis.group.length;

                if (libertyCount === 1) {
                    setMessage(
                        `Nhóm ${getPlayerLabel(
                            analysis.player
                        )} có ${groupSize} quân và chỉ còn 1 khí. Nhóm này đang bị Atari.`
                    );
                } else {
                    setMessage(
                        `Nhóm ${getPlayerLabel(
                            analysis.player
                        )} có ${groupSize} quân và còn ${libertyCount} khí.`
                    );
                }
            }

            return;
        }

        const result = placeStone(board, row, col, currentPlayer);

        if (!result.ok) {
            showError(result.error);
            return;
        }

        if (koPreviousBoard && areBoardsEqual(result.board, koPreviousBoard)) {
            showError("Không thể đi nước này vì vi phạm luật Ko.");
            return;
        }

        setErrorMessage(null);
        setSelectedPoint(null);
        setLastMovePoint({ row, col });
        setFocusedHistoryPoint(null);

        const capturedCount = result.captured.length;

        setKoPreviousBoard(board);
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

        setSelectedPoint(null);
        setLastMovePoint(null);
        setFocusedHistoryPoint(null);
        setKoPreviousBoard(null);

        const nextMove: Move = {
            type: "pass",
            player: currentPlayer,
            moveNumber: moveHistory.length + 1,
        };

        const nextMoves = [...moveHistory, nextMove];

        setMoveHistory(nextMoves);

        if (nextConsecutivePasses >= 2) {
            const score = calculateBasicScore(board, blackCaptured, whiteCaptured);

            setGameStatus("finished");
            setWinner(score.winner);
            setEndReason("score");
            setShowGameEndPopup(true);
            setConsecutivePasses(nextConsecutivePasses);

            saveReviewData({
                nextMoves,
                gameWinner: score.winner,
                reason: "score",
                score,
            });

            if (score.winner) {
                setMessage(
                    `Hai người chơi đã Pass liên tiếp. ${getPlayerLabel(
                        score.winner
                    )} thắng ${score.margin} điểm theo cách tính cơ bản.`
                );
            } else {
                setMessage(
                    "Hai người chơi đã Pass liên tiếp. Ván cờ hòa theo cách tính cơ bản."
                );
            }

            return;
        }

        const nextPlayer = getOpponent(currentPlayer);

        setConsecutivePasses(nextConsecutivePasses);
        setCurrentPlayer(nextPlayer);
        setMessage(
            `${getPlayerLabel(currentPlayer)} đã Pass. Đến lượt ${getPlayerLabel(
                nextPlayer
            )}.`
        );
    }

    function handleResign() {
        if (gameStatus === "finished") {
            showError(
                "Ván cờ đã kết thúc. Không thể đầu hàng sau khi ván đã kết thúc."
            );
            return;
        }

        const gameWinner = getOpponent(currentPlayer);

        const nextMove: Move = {
            type: "resign",
            player: currentPlayer,
            winner: gameWinner,
            moveNumber: moveHistory.length + 1,
        };

        const nextMoves = [...moveHistory, nextMove];

        setMoveHistory(nextMoves);
        setWinner(gameWinner);
        setGameStatus("finished");
        setEndReason("resign");
        setShowGameEndPopup(true);
        setLastMovePoint(null);
        setFocusedHistoryPoint(null);

        saveReviewData({
            nextMoves,
            gameWinner,
            reason: "resign",
        });

        setMessage(
            `${getPlayerLabel(currentPlayer)} đã đầu hàng. ${getPlayerLabel(
                gameWinner
            )} thắng.`
        );
    }

    function handleReset() {
        resetGame();
    }

    function handleExitGameMode() {
        router.push("/");
    }

    function handleReviewGame() {
        router.push("/review/latest");
    }

    function handleHistoryMoveClick(move: Move) {
        if (move.type !== "stone") return;

        setFocusedHistoryPoint({
            row: move.row,
            col: move.col,
        });

        setMessage(
            `Đang xem lại nước #${move.moveNumber}: ${getPlayerLabel(
                move.player
            )} đi tại hàng ${move.row + 1}, cột ${move.col + 1}.`
        );
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
                    onReview={handleReviewGame}
                />
            )}

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Bàn cờ {boardSize}x{boardSize}
                        </h2>

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

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            Kích thước bàn
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {SUPPORTED_BOARD_SIZES.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => handleBoardSizeChange(size)}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${boardSize === size
                                        ? "border-amber-300 bg-amber-400 text-black"
                                        : "border-white/20 text-white hover:bg-white/10"
                                        }`}
                                >
                                    {size}x{size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                        <div className="flex justify-between gap-8">
                            <span className="text-neutral-400">Đen đã bắt:</span>
                            <span className="font-semibold text-white">
                                {blackCaptured}
                            </span>
                        </div>

                        <div className="flex justify-between gap-8">
                            <span className="text-neutral-400">Trắng đã bắt:</span>
                            <span className="font-semibold text-white">
                                {whiteCaptured}
                            </span>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                Phân tích nhóm
                            </p>

                            {selectedAnalysis ? (
                                <div className="mt-2 space-y-1">
                                    <p className="text-neutral-300">
                                        Màu:{" "}
                                        <span className="font-semibold text-amber-300">
                                            {getPlayerLabel(selectedAnalysis.player)}
                                        </span>
                                    </p>

                                    <p className="text-neutral-300">
                                        Số quân:{" "}
                                        <span className="font-semibold text-white">
                                            {selectedAnalysis.group.length}
                                        </span>
                                    </p>

                                    <p className="text-neutral-300">
                                        Số khí:{" "}
                                        <span
                                            className={`font-semibold ${selectedAnalysis.liberties.length === 1
                                                ? "text-red-300"
                                                : "text-emerald-300"
                                                }`}
                                        >
                                            {selectedAnalysis.liberties.length}
                                        </span>
                                    </p>

                                    {selectedAnalysis.liberties.length === 1 && (
                                        <p className="text-xs text-red-300">
                                            Nhóm này đang bị Atari, nghĩa là chỉ còn 1 khí.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-xs leading-5 text-neutral-500">
                                    Click vào một quân cờ để xem nhóm quân và các khí của nó.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={handlePass}
                                className={`rounded-full border border-white/20 px-5 py-2 text-white transition hover:bg-white/10 ${gameStatus === "finished"
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                                    }`}
                            >
                                Pass
                            </button>

                            <button
                                type="button"
                                onClick={handleResign}
                                className={`rounded-full border border-red-400/40 px-5 py-2 text-red-200 transition hover:bg-red-500/10 ${gameStatus === "finished"
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                                    }`}
                            >
                                Resign
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full rounded-full border border-white/20 px-5 py-2 text-white transition hover:bg-white/10"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <BoardGrid
                    board={board}
                    onPointClick={handlePlaceStone}
                    highlightedGroupKeys={highlightedGroupKeys}
                    highlightedLibertyKeys={highlightedLibertyKeys}
                    isDisabled={gameStatus === "finished"}
                    ariaLabelPrefix="Place stone at"
                    previewPlayer={currentPlayer}
                    lastMovePoint={lastMovePoint}
                    focusedPoint={focusedHistoryPoint}
                />

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-3 font-semibold text-white">
                        Lịch sử nước đi
                    </h3>

                    {moveHistory.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                            Chưa có nước đi nào.
                        </p>
                    ) : (
                        <div className="max-h-48 space-y-2 overflow-auto text-sm">
                            {moveHistory.map((move) => (
                                <button
                                    key={move.moveNumber}
                                    type="button"
                                    onClick={() => handleHistoryMoveClick(move)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${move.type === "stone"
                                        ? "cursor-pointer bg-black/20 hover:bg-white/10"
                                        : "cursor-default bg-black/20"
                                        }`}
                                >
                                    {move.type === "stone" && (
                                        <>
                                            <span>
                                                #{move.moveNumber}{" "}
                                                {getPlayerLabel(move.player)} đi tại hàng{" "}
                                                {move.row + 1}, cột {move.col + 1}
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
                                            #{move.moveNumber}{" "}
                                            {getPlayerLabel(move.player)} Pass
                                        </span>
                                    )}

                                    {move.type === "resign" && (
                                        <span>
                                            #{move.moveNumber}{" "}
                                            {getPlayerLabel(move.player)} đầu hàng.{" "}
                                            {getPlayerLabel(move.winner)} thắng.
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}