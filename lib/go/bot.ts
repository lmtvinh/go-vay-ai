import {
    areBoardsEqual,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, Player, Point } from "@/lib/go/types";

type BotMoveCandidate = {
    point: Point;
    score: number;
};

export function chooseBasicBotMove({
    board,
    player,
    koPreviousBoard,
}: {
    board: Board;
    player: Player;
    koPreviousBoard: Board | null;
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

            const analysis = getStoneGroupAnalysis(result.board, row, col);

            if (!analysis) continue;

            const capturedCount = result.captured.length;
            const libertyCount = analysis.liberties.length;
            const groupSize = analysis.group.length;

            let score = 0;

            score += capturedCount * 100;
            score += libertyCount * 10;
            score += groupSize * 2;

            if (libertyCount === 1) {
                score -= 30;
            }

            candidates.push({
                point: { row, col },
                score,
            });
        }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score);

    return candidates[0].point;
}