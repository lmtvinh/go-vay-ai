"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
    areBoardsEqual,
    createEmptyBoard,
    getOpponent,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import { chooseBasicBotMove } from "@/lib/go/bot";
import { calculateBasicScore } from "@/lib/go/scoring";
import type { BasicScoreResult } from "@/lib/go/scoring";

import type {
    Board,
    BotDifficulty,
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

const SUPPORTED_BOARD_SIZES = [9, 12, 13, 19] as const;

type BoardSize = (typeof SUPPORTED_BOARD_SIZES)[number];

type GoBoardProps = {
    initialGameMode?: GameMode;
    initialViewerPlayer?: Player;
    initialBotDifficulty?: BotDifficulty;
    initialBoardSize?: BoardSize;
};

function getPlayerLabel(player: Player) {
    return player === "black" ? "Đen" : "Trắng";
}

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function cloneBoard(board: Board): Board {
    return board.map((row) => [...row]);
}

function countStones(board: Board) {
    let black = 0;
    let white = 0;

    for (const row of board) {
        for (const stone of row) {
            if (stone === "black") black += 1;
            if (stone === "white") white += 1;
        }
    }

    return {
        black,
        white,
    };
}

function rebuildGameFromMoves({
    moves,
    boardSize,
}: {
    moves: Move[];
    boardSize: number;
}) {
    let rebuiltBoard = createEmptyBoard(boardSize);
    let blackCapturedCount = 0;
    let whiteCapturedCount = 0;
    let nextPlayer: Player = "black";
    let lastStonePoint: Point | null = null;
    let previousBoardForKo: Board | null = null;
    let consecutivePasses = 0;

    for (const move of moves) {
        if (move.type === "stone") {
            const boardBeforeMove = cloneBoard(rebuiltBoard);

            const result = placeStone(
                rebuiltBoard,
                move.row,
                move.col,
                move.player
            );

            if (result.ok) {
                rebuiltBoard = result.board;
                previousBoardForKo = boardBeforeMove;
                lastStonePoint = {
                    row: move.row,
                    col: move.col,
                };

                if (move.player === "black") {
                    blackCapturedCount += result.captured.length;
                } else {
                    whiteCapturedCount += result.captured.length;
                }

                nextPlayer = getOpponent(move.player);
                consecutivePasses = 0;
            }

            continue;
        }

        if (move.type === "pass") {
            nextPlayer = getOpponent(move.player);
            lastStonePoint = null;
            previousBoardForKo = null;
            consecutivePasses += 1;
            continue;
        }

        if (move.type === "resign") {
            nextPlayer = move.winner;
            lastStonePoint = null;
        }
    }

    return {
        board: rebuiltBoard,
        blackCaptured: blackCapturedCount,
        whiteCaptured: whiteCapturedCount,
        currentPlayer: nextPlayer,
        lastMovePoint: lastStonePoint,
        koPreviousBoard: previousBoardForKo,
        consecutivePasses,
    };
}

function getBotDifficultyLabel(difficulty: BotDifficulty) {
    if (difficulty === "easy") return "Dễ";
    if (difficulty === "hard") return "Khó";
    return "Thường";
}

export default function GoBoard({
    initialGameMode = "pvp-local",
    initialViewerPlayer = "black",
    initialBotDifficulty = "normal",
    initialBoardSize = 9,
}: GoBoardProps) {
    const router = useRouter();

    const botTurnIdRef = useRef(0);
    const initialBotStartedRef = useRef(false);

    const gameMode = initialGameMode;
    const viewerPlayer = initialViewerPlayer;
    const botDifficulty = initialBotDifficulty;

    const [boardSize] = useState<BoardSize>(initialBoardSize);
    const [board, setBoard] = useState<Board>(() =>
        createEmptyBoard(initialBoardSize)
    );
    const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [blackCaptured, setBlackCaptured] = useState(0);
    const [whiteCaptured, setWhiteCaptured] = useState(0);
    const [message, setMessage] = useState<string>(
        gameMode === "human-vs-bot" && viewerPlayer === "white"
            ? "Bạn cầm Trắng. Bot Đen sẽ đi trước."
            : "Đen đi trước."
    );
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [winner, setWinner] = useState<Player | null>(null);
    const [consecutivePasses, setConsecutivePasses] = useState(0);

    const [isBotThinking, setIsBotThinking] = useState(false);

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

    const previewPlayer =
        isBotThinking ||
            (gameMode === "human-vs-bot" && currentPlayer !== viewerPlayer)
            ? null
            : currentPlayer;

    function showError(error: string) {
        setErrorMessage(error);
        setMessage(error);
    }

    function saveReviewData({
        nextMoves,
        gameWinner,
        reason,
        score,
        finalBoard = board,
        finalBlackCaptured = blackCaptured,
        finalWhiteCaptured = whiteCaptured,
    }: {
        nextMoves: Move[];
        gameWinner: Player | null;
        reason: GameEndReason;
        score?: BasicScoreResult;
        finalBoard?: Board;
        finalBlackCaptured?: number;
        finalWhiteCaptured?: number;
    }) {
        saveLatestGameReview({
            boardSize,
            board: finalBoard,
            moves: nextMoves,
            blackCaptured: finalBlackCaptured,
            whiteCaptured: finalWhiteCaptured,
            winner: gameWinner,
            endReason: reason,
            createdAt: new Date().toISOString(),
            score,
        });
    }

    function saveCurrentGameBeforeReset() {
        if (moveHistory.length === 0) return;
        if (gameStatus === "finished") return;

        saveReviewData({
            nextMoves: moveHistory,
            gameWinner: null,
            reason: "abandoned",
            finalBoard: board,
            finalBlackCaptured: blackCaptured,
            finalWhiteCaptured: whiteCaptured,
        });
    }

    function finishGameByScore({
        finalBoard,
        nextMoves,
        finalBlackCaptured = blackCaptured,
        finalWhiteCaptured = whiteCaptured,
    }: {
        finalBoard: Board;
        nextMoves: Move[];
        finalBlackCaptured?: number;
        finalWhiteCaptured?: number;
    }) {
        const score = calculateBasicScore(
            finalBoard,
            finalBlackCaptured,
            finalWhiteCaptured
        );

        setBoard(finalBoard);
        setGameStatus("finished");
        setWinner(score.winner);
        setEndReason("score");
        setShowGameEndPopup(true);
        setIsBotThinking(false);
        setSelectedPoint(null);
        setFocusedHistoryPoint(null);
        setLastMovePoint(null);

        saveReviewData({
            nextMoves,
            gameWinner: score.winner,
            reason: "score",
            score,
            finalBoard,
            finalBlackCaptured,
            finalWhiteCaptured,
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
    }

    function finishGameByCaptureAll({
        finalBoard,
        nextMoves,
        gameWinner,
        finalBlackCaptured,
        finalWhiteCaptured,
    }: {
        finalBoard: Board;
        nextMoves: Move[];
        gameWinner: Player;
        finalBlackCaptured: number;
        finalWhiteCaptured: number;
    }) {
        botTurnIdRef.current += 1;

        setBoard(finalBoard);
        setWinner(gameWinner);
        setGameStatus("finished");
        setEndReason("capture-all");
        setShowGameEndPopup(true);
        setIsBotThinking(false);
        setCurrentPlayer(gameWinner);
        setSelectedPoint(null);
        setFocusedHistoryPoint(null);
        setConsecutivePasses(0);

        saveReviewData({
            nextMoves,
            gameWinner,
            reason: "capture-all",
            finalBoard,
            finalBlackCaptured,
            finalWhiteCaptured,
        });

        setMessage(
            `${getPlayerLabel(gameWinner)} thắng vì đã ăn sạch quân đối thủ.`
        );
    }

    function scheduleBotTurn({
        boardBeforeBotMove,
        historyBeforeBotMove,
        koPreviousBoardForBot,
        consecutivePassesBeforeBot,
        blackCapturedBeforeBot,
        whiteCapturedBeforeBot,
        botPlayer,
        humanPlayer,
    }: {
        boardBeforeBotMove: Board;
        historyBeforeBotMove: Move[];
        koPreviousBoardForBot: Board | null;
        consecutivePassesBeforeBot: number;
        blackCapturedBeforeBot: number;
        whiteCapturedBeforeBot: number;
        botPlayer: Player;
        humanPlayer: Player;
    }) {
        const nextBotTurnId = botTurnIdRef.current + 1;
        botTurnIdRef.current = nextBotTurnId;

        setIsBotThinking(true);

        window.setTimeout(() => {
            if (botTurnIdRef.current !== nextBotTurnId) return;

            playBotTurn({
                boardBeforeBotMove,
                historyBeforeBotMove,
                koPreviousBoardForBot,
                consecutivePassesBeforeBot,
                blackCapturedBeforeBot,
                whiteCapturedBeforeBot,
                botPlayer,
                humanPlayer,
            });
        }, 500);
    }

    function startFreshGame() {
        botTurnIdRef.current += 1;

        const freshBoard = createEmptyBoard(boardSize);

        setBoard(freshBoard);
        setCurrentPlayer("black");
        setMoveHistory([]);
        setBlackCaptured(0);
        setWhiteCaptured(0);
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
        setIsBotThinking(false);

        if (gameMode === "human-vs-bot" && viewerPlayer === "white") {
            setMessage("Bạn cầm Trắng. Bot Đen sẽ đi trước.");

            scheduleBotTurn({
                boardBeforeBotMove: freshBoard,
                historyBeforeBotMove: [],
                koPreviousBoardForBot: null,
                consecutivePassesBeforeBot: 0,
                blackCapturedBeforeBot: 0,
                whiteCapturedBeforeBot: 0,
                botPlayer: "black",
                humanPlayer: "white",
            });

            return;
        }

        setMessage("Đen đi trước.");
    }

    function playBotTurn({
        boardBeforeBotMove,
        historyBeforeBotMove,
        koPreviousBoardForBot,
        consecutivePassesBeforeBot,
        blackCapturedBeforeBot,
        whiteCapturedBeforeBot,
        botPlayer,
        humanPlayer,
    }: {
        boardBeforeBotMove: Board;
        historyBeforeBotMove: Move[];
        koPreviousBoardForBot: Board | null;
        consecutivePassesBeforeBot: number;
        blackCapturedBeforeBot: number;
        whiteCapturedBeforeBot: number;
        botPlayer: Player;
        humanPlayer: Player;
    }) {
        const botPoint = chooseBasicBotMove({
            board: boardBeforeBotMove,
            player: botPlayer,
            koPreviousBoard: koPreviousBoardForBot,
            difficulty: botDifficulty,
        });

        if (!botPoint) {
            const passMove: Move = {
                type: "pass",
                player: botPlayer,
                moveNumber: historyBeforeBotMove.length + 1,
            };

            const nextMoves = [...historyBeforeBotMove, passMove];
            const nextConsecutivePasses = consecutivePassesBeforeBot + 1;

            setMoveHistory(nextMoves);
            setSelectedPoint(null);
            setLastMovePoint(null);
            setFocusedHistoryPoint(null);
            setKoPreviousBoard(null);
            setConsecutivePasses(nextConsecutivePasses);
            setIsBotThinking(false);

            if (nextConsecutivePasses >= 2) {
                finishGameByScore({
                    finalBoard: boardBeforeBotMove,
                    nextMoves,
                    finalBlackCaptured: blackCapturedBeforeBot,
                    finalWhiteCaptured: whiteCapturedBeforeBot,
                });

                return;
            }

            setCurrentPlayer(humanPlayer);
            setMessage(
                `Bot ${getPlayerLabel(
                    botPlayer
                )} không tìm được nước hợp lệ nên đã Pass. Đến lượt bạn.`
            );
            return;
        }

        const result = placeStone(
            boardBeforeBotMove,
            botPoint.row,
            botPoint.col,
            botPlayer
        );

        if (!result.ok) {
            setCurrentPlayer(humanPlayer);
            setIsBotThinking(false);
            setMessage("Bot không thể đi nước hợp lệ. Đến lượt bạn.");
            return;
        }

        const botMove: Move = {
            type: "stone",
            row: botPoint.row,
            col: botPoint.col,
            player: botPlayer,
            captured: result.captured,
            moveNumber: historyBeforeBotMove.length + 1,
        };

        const nextMoves = [...historyBeforeBotMove, botMove];

        const nextBlackCaptured =
            botPlayer === "black"
                ? blackCapturedBeforeBot + result.captured.length
                : blackCapturedBeforeBot;

        const nextWhiteCaptured =
            botPlayer === "white"
                ? whiteCapturedBeforeBot + result.captured.length
                : whiteCapturedBeforeBot;

        const stonesBeforeBotMove = countStones(boardBeforeBotMove);
        const stonesAfterBotMove = countStones(result.board);

        const humanHadStonesBefore =
            humanPlayer === "black"
                ? stonesBeforeBotMove.black > 0
                : stonesBeforeBotMove.white > 0;

        const humanHasNoStonesAfter =
            humanPlayer === "black"
                ? stonesAfterBotMove.black === 0
                : stonesAfterBotMove.white === 0;

        setBlackCaptured(nextBlackCaptured);
        setWhiteCaptured(nextWhiteCaptured);
        setMoveHistory(nextMoves);
        setLastMovePoint(botPoint);

        if (humanHadStonesBefore && humanHasNoStonesAfter) {
            finishGameByCaptureAll({
                finalBoard: result.board,
                nextMoves,
                gameWinner: botPlayer,
                finalBlackCaptured: nextBlackCaptured,
                finalWhiteCaptured: nextWhiteCaptured,
            });

            return;
        }

        setKoPreviousBoard(boardBeforeBotMove);
        setBoard(result.board);
        setCurrentPlayer(humanPlayer);
        setConsecutivePasses(0);
        setSelectedPoint(null);
        setFocusedHistoryPoint(null);
        setIsBotThinking(false);

        if (result.captured.length > 0) {
            setMessage(
                `Bot ${getPlayerLabel(botPlayer)} vừa đi hàng ${botPoint.row + 1
                }, cột ${botPoint.col + 1} và bắt ${result.captured.length
                } quân. Đến lượt bạn.`
            );
        } else {
            setMessage(
                `Bot ${getPlayerLabel(botPlayer)} vừa đi hàng ${botPoint.row + 1
                }, cột ${botPoint.col + 1}. Đến lượt bạn.`
            );
        }
    }

    useEffect(() => {
        if (initialBotStartedRef.current) return;
        if (gameMode !== "human-vs-bot") return;
        if (viewerPlayer !== "white") return;
        if (moveHistory.length > 0) return;

        initialBotStartedRef.current = true;

        const freshBoard = createEmptyBoard(boardSize);

        setBoard(freshBoard);
        setCurrentPlayer("black");
        setMessage("Bạn cầm Trắng. Bot Đen sẽ đi trước.");

        scheduleBotTurn({
            boardBeforeBotMove: freshBoard,
            historyBeforeBotMove: [],
            koPreviousBoardForBot: null,
            consecutivePassesBeforeBot: 0,
            blackCapturedBeforeBot: 0,
            whiteCapturedBeforeBot: 0,
            botPlayer: "black",
            humanPlayer: "white",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handlePlaceStone(row: number, col: number) {
        if (gameStatus === "finished") {
            showError("Ván cờ đã kết thúc. Hãy bấm Reset để chơi ván mới.");
            return;
        }

        if (isBotThinking) {
            showError("Bot đang suy nghĩ. Hãy chờ một chút.");
            return;
        }

        if (gameMode === "human-vs-bot" && currentPlayer !== viewerPlayer) {
            showError("Đang là lượt của bot. Hãy chờ bot đi xong.");
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

        const nextBlackCaptured =
            currentPlayer === "black"
                ? blackCaptured + capturedCount
                : blackCaptured;

        const nextWhiteCaptured =
            currentPlayer === "white"
                ? whiteCaptured + capturedCount
                : whiteCaptured;

        const nextMove: Move = {
            type: "stone",
            row,
            col,
            player: currentPlayer,
            captured: result.captured,
            moveNumber: moveHistory.length + 1,
        };

        const nextMoves = [...moveHistory, nextMove];

        setKoPreviousBoard(board);
        setBoard(result.board);
        setMoveHistory(nextMoves);
        setBlackCaptured(nextBlackCaptured);
        setWhiteCaptured(nextWhiteCaptured);

        const stonesBeforeMove = countStones(board);
        const stonesAfterMove = countStones(result.board);
        const opponent = getOpponent(currentPlayer);

        const opponentHadStonesBefore =
            opponent === "black"
                ? stonesBeforeMove.black > 0
                : stonesBeforeMove.white > 0;

        const opponentHasNoStonesAfter =
            opponent === "black"
                ? stonesAfterMove.black === 0
                : stonesAfterMove.white === 0;

        if (opponentHadStonesBefore && opponentHasNoStonesAfter) {
            finishGameByCaptureAll({
                finalBoard: result.board,
                nextMoves,
                gameWinner: currentPlayer,
                finalBlackCaptured: nextBlackCaptured,
                finalWhiteCaptured: nextWhiteCaptured,
            });

            return;
        }

        setConsecutivePasses(0);

        const nextPlayer = getOpponent(currentPlayer);

        setCurrentPlayer(nextPlayer);

        if (gameMode === "human-vs-bot" && nextPlayer !== viewerPlayer) {
            if (capturedCount > 0) {
                setMessage(
                    `${getPlayerLabel(
                        currentPlayer
                    )} vừa bắt ${capturedCount} quân. Bot sẽ phản hồi ngay.`
                );
            } else {
                setMessage("Bạn đã đi. Bot sẽ phản hồi ngay.");
            }

            scheduleBotTurn({
                boardBeforeBotMove: result.board,
                historyBeforeBotMove: nextMoves,
                koPreviousBoardForBot: board,
                consecutivePassesBeforeBot: 0,
                blackCapturedBeforeBot: nextBlackCaptured,
                whiteCapturedBeforeBot: nextWhiteCaptured,
                botPlayer: nextPlayer,
                humanPlayer: viewerPlayer,
            });

            return;
        }

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

        if (isBotThinking) {
            showError("Bot đang suy nghĩ. Hãy chờ một chút.");
            return;
        }

        if (gameMode === "human-vs-bot" && currentPlayer !== viewerPlayer) {
            showError("Đang là lượt của bot. Hãy chờ bot đi xong.");
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
            setConsecutivePasses(nextConsecutivePasses);

            finishGameByScore({
                finalBoard: board,
                nextMoves,
                finalBlackCaptured: blackCaptured,
                finalWhiteCaptured: whiteCaptured,
            });

            return;
        }

        const nextPlayer = getOpponent(currentPlayer);

        setConsecutivePasses(nextConsecutivePasses);
        setCurrentPlayer(nextPlayer);

        if (gameMode === "human-vs-bot" && nextPlayer !== viewerPlayer) {
            setMessage(
                `${getPlayerLabel(currentPlayer)} đã Pass. Bot sẽ phản hồi ngay.`
            );

            scheduleBotTurn({
                boardBeforeBotMove: board,
                historyBeforeBotMove: nextMoves,
                koPreviousBoardForBot: null,
                consecutivePassesBeforeBot: nextConsecutivePasses,
                blackCapturedBeforeBot: blackCaptured,
                whiteCapturedBeforeBot: whiteCaptured,
                botPlayer: nextPlayer,
                humanPlayer: viewerPlayer,
            });

            return;
        }

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

        if (isBotThinking) {
            showError("Bot đang suy nghĩ. Hãy chờ một chút.");
            return;
        }

        if (gameMode === "human-vs-bot" && currentPlayer !== viewerPlayer) {
            showError("Đang là lượt của bot. Hãy chờ bot đi xong.");
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
        setIsBotThinking(false);

        saveReviewData({
            nextMoves,
            gameWinner,
            reason: "resign",
            finalBoard: board,
            finalBlackCaptured: blackCaptured,
            finalWhiteCaptured: whiteCaptured,
        });

        setMessage(
            `${getPlayerLabel(currentPlayer)} đã đầu hàng. ${getPlayerLabel(
                gameWinner
            )} thắng.`
        );
    }

    function handleUndo() {
        if (isBotThinking) {
            showError("Bot đang suy nghĩ. Hãy chờ bot đi xong rồi mới Undo.");
            return;
        }

        if (moveHistory.length === 0) {
            showError("Chưa có nước đi nào để Undo.");
            return;
        }

        if (gameStatus === "finished") {
            setGameStatus("playing");
            setWinner(null);
            setEndReason(null);
            setShowGameEndPopup(false);
        }

        let undoCount = 1;

        if (gameMode === "human-vs-bot") {
            undoCount = Math.min(2, moveHistory.length);
        }

        const nextMoves = moveHistory.slice(
            0,
            Math.max(0, moveHistory.length - undoCount)
        );

        const rebuilt = rebuildGameFromMoves({
            moves: nextMoves,
            boardSize,
        });

        botTurnIdRef.current += 1;

        setBoard(rebuilt.board);
        setMoveHistory(nextMoves);
        setBlackCaptured(rebuilt.blackCaptured);
        setWhiteCaptured(rebuilt.whiteCaptured);
        setCurrentPlayer(rebuilt.currentPlayer);
        setLastMovePoint(rebuilt.lastMovePoint);
        setKoPreviousBoard(rebuilt.koPreviousBoard);
        setSelectedPoint(null);
        setFocusedHistoryPoint(null);
        setConsecutivePasses(rebuilt.consecutivePasses);
        setErrorMessage(null);
        setIsBotThinking(false);

        if (nextMoves.length === 0) {
            if (gameMode === "human-vs-bot" && viewerPlayer === "white") {
                setCurrentPlayer("black");
                setMessage(
                    "Đã Undo về đầu ván. Bấm Reset để để bot Đen đi lại từ đầu."
                );
                return;
            }

            setMessage("Đã Undo về đầu ván.");
            return;
        }

        if (gameMode === "human-vs-bot") {
            setCurrentPlayer(viewerPlayer);
            setMessage("Đã Undo lượt gần nhất của bạn và bot. Đến lượt bạn.");
            return;
        }

        setMessage(`Đã Undo. Đến lượt ${getPlayerLabel(rebuilt.currentPlayer)}.`);
    }

    function handleReset() {
        saveCurrentGameBeforeReset();
        startFreshGame();
    }

    function handleExitGameMode() {
        saveCurrentGameBeforeReset();
        router.push("/play");
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
                            Chế độ:{" "}
                            <span className="font-semibold text-emerald-300">
                                {gameMode === "human-vs-bot"
                                    ? "Người vs Bot"
                                    : "Người vs Người"}
                            </span>
                        </p>

                        {gameMode === "human-vs-bot" && (
                            <>
                                <p className="text-neutral-400">
                                    Bạn cầm:{" "}
                                    <span className="font-semibold text-amber-300">
                                        {getPlayerLabel(viewerPlayer)}
                                    </span>
                                </p>

                                <p className="text-neutral-400">
                                    Độ khó bot:{" "}
                                    <span className="font-semibold text-emerald-300">
                                        {getBotDifficultyLabel(botDifficulty)}
                                    </span>
                                </p>
                            </>
                        )}

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

                        <div className="mt-2 min-h-10">
                            <p className="text-sm leading-5 text-emerald-300">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            Thiết lập
                        </p>

                        <div className="mt-3 space-y-2 text-sm text-neutral-300">
                            <p>
                                Bàn:{" "}
                                <span className="font-semibold text-amber-300">
                                    {boardSize}x{boardSize}
                                </span>
                            </p>

                            <p>
                                Chế độ:{" "}
                                <span className="font-semibold text-emerald-300">
                                    {gameMode === "human-vs-bot"
                                        ? "Người vs Bot"
                                        : "Người vs Người"}
                                </span>
                            </p>

                            {gameMode === "human-vs-bot" && (
                                <>
                                    <p>
                                        Bạn cầm:{" "}
                                        <span className="font-semibold text-amber-300">
                                            {getPlayerLabel(viewerPlayer)}
                                        </span>
                                    </p>

                                    <p>
                                        Bot:{" "}
                                        <span className="font-semibold text-emerald-300">
                                            {getBotDifficultyLabel(botDifficulty)}
                                        </span>
                                    </p>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                saveCurrentGameBeforeReset();
                                router.push("/play");
                            }}
                            className="mt-4 w-full rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Đổi thiết lập
                        </button>
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
                                className={`rounded-full border border-white/20 px-5 py-2 text-white transition hover:bg-white/10 ${gameStatus === "finished" || isBotThinking
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                                    }`}
                            >
                                Pass
                            </button>

                            <button
                                type="button"
                                onClick={handleResign}
                                className={`rounded-full border border-red-400/40 px-5 py-2 text-red-200 transition hover:bg-red-500/10 ${gameStatus === "finished" || isBotThinking
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                                    }`}
                            >
                                Resign
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={handleUndo}
                                className={`rounded-full border border-amber-300/40 px-5 py-2 text-amber-200 transition hover:bg-amber-400/10 ${moveHistory.length === 0 || isBotThinking
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                                    }`}
                            >
                                Undo
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:bg-white/10"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <BoardGrid
                        board={board}
                        onPointClick={handlePlaceStone}
                        highlightedGroupKeys={highlightedGroupKeys}
                        highlightedLibertyKeys={highlightedLibertyKeys}
                        isDisabled={gameStatus === "finished"}
                        ariaLabelPrefix="Place stone at"
                        previewPlayer={previewPlayer}
                        lastMovePoint={lastMovePoint}
                        focusedPoint={focusedHistoryPoint}
                    />

                    {isBotThinking && (
                        <div className="pointer-events-none absolute left-1/2 top-4 z-40 -translate-x-1/2 rounded-full border border-amber-300/30 bg-black/70 px-4 py-2 text-sm font-semibold text-amber-200 shadow-2xl backdrop-blur">
                            Bot đang suy nghĩ...
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-3 font-semibold text-white">
                        Lịch sử nước đi
                    </h3>

                    <div className="h-48 space-y-2 overflow-auto text-sm">
                        {moveHistory.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                Chưa có nước đi nào.
                            </p>
                        ) : (
                            moveHistory.map((move) => (
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
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}