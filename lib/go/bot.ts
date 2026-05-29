import {
    areBoardsEqual,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, BotDifficulty, Player, Point } from "@/lib/go/types";

type BotMoveCandidate = {
    point: Point;
    score: number;
};

function getCenterScore(board: Board, row: number, col: number) {
    const center = (board.length - 1) / 2;
    const distanceFromCenter =
        Math.abs(row - center) + Math.abs(col - center);

    return Math.max(0, board.length - distanceFromCenter);
}

function scoreBotMove({
    board,
    row,
    col,
    player,
    difficulty,
}: {
    board: Board;
    row: number;
    col: number;
    player: Player;
    difficulty: BotDifficulty;
}) {
    const result = placeStone(board, row, col, player);

    if (!result.ok) return null;

    const analysis = getStoneGroupAnalysis(result.board, row, col);

    if (!analysis) return null;

    const capturedCount = result.captured.length;
    const libertyCount = analysis.liberties.length;
    const groupSize = analysis.group.length;
    const centerScore = getCenterScore(board, row, col);

    let score = 0;

    if (difficulty === "easy") {
        score += Math.random() * 100;
    }

    if (difficulty === "normal") {
        score += capturedCount * 100;
        score += libertyCount * 10;
        score += groupSize * 2;

        if (libertyCount === 1) {
            score -= 30;
        }
    }

    if (difficulty === "hard") {
        score += capturedCount * 150;
        score += libertyCount * 16;
        score += groupSize * 4;
        score += centerScore * 2;

        if (libertyCount === 1) {
            score -= 80;
        }

        if (libertyCount >= 3) {
            score += 20;
        }
    }

    return {
        point: { row, col },
        score,
    };
}

export function chooseBasicBotMove({
    board,
    player,
    koPreviousBoard,
    difficulty = "normal",
}: {
    board: Board;
    player: Player;
    koPreviousBoard: Board | null;
    difficulty?: BotDifficulty;
}): Point | null {
    const candidates: BotMoveCandidate[] = [];

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] !== null) continue;

            const result = placeStone(board, row, col, player);

            if (!result.ok) continue;

            if (koPreviousBoard && areBoardsEqual(result.board, koPreviousBoard)) {
                continue;
            }

            const candidate = scoreBotMove({
                board,
                row,
                col,
                player,
                difficulty,
            });

            if (candidate) {
                candidates.push(candidate);
            }
        }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score);

    return candidates[0].point;
}