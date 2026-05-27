import {
    createEmptyBoard,
    getOpponent,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, Move, Player, Point } from "@/lib/go/types";

export type SuggestedMove = {
    row: number;
    col: number;
    label: string;
    score: number;
    capturedCount: number;
    liberties: number;
    reason: string;
};

export type MoveSuggestion = {
    moveNumber: number;
    player: Player;
    actualMove: {
        row: number;
        col: number;
        label: string;
        score: number;
    };
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    suggestedMoves: SuggestedMove[];
};

function cloneBoard(board: Board): Board {
    return board.map((row) => [...row]);
}

function getPointLabel(row: number, col: number) {
    return `hàng ${row + 1}, cột ${col + 1}`;
}

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function getAllGroups(board: Board, player: Player) {
    const visited = new Set<string>();
    const groups: Array<{
        group: Point[];
        liberties: Point[];
    }> = [];

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] !== player) continue;

            const key = `${row},${col}`;
            if (visited.has(key)) continue;

            const analysis = getStoneGroupAnalysis(board, row, col);
            if (!analysis) continue;

            for (const point of analysis.group) {
                visited.add(getPointKey(point));
            }

            groups.push({
                group: analysis.group,
                liberties: analysis.liberties,
            });
        }
    }

    return groups;
}

function countGroupsInAtari(board: Board, player: Player) {
    return getAllGroups(board, player).filter(
        (group) => group.liberties.length === 1
    ).length;
}

function scoreMove(
    board: Board,
    row: number,
    col: number,
    player: Player
): SuggestedMove | null {
    const result = placeStone(board, row, col, player);

    if (!result.ok) return null;

    const analysis = getStoneGroupAnalysis(result.board, row, col);

    if (!analysis) return null;

    const opponent = getOpponent(player);

    const capturedCount = result.captured.length;
    const liberties = analysis.liberties.length;
    const groupSize = analysis.group.length;

    const opponentAtariGroups = countGroupsInAtari(result.board, opponent);
    const selfAtariGroups = countGroupsInAtari(result.board, player);

    let score = 0;

    score += capturedCount * 120;
    score += liberties * 12;
    score += groupSize * 3;
    score += opponentAtariGroups * 25;
    score -= selfAtariGroups * 35;

    if (liberties === 1) {
        score -= 45;
    }

    let reason = "Nước này giúp nhóm quân có thêm khí và giữ thế ổn định hơn.";

    if (capturedCount > 0) {
        reason = `Nước này bắt được ${capturedCount} quân đối thủ.`;
    } else if (liberties >= 3) {
        reason = `Nước này tạo nhóm có ${liberties} khí, an toàn hơn.`;
    } else if (liberties === 1) {
        reason = "Nước này khá nguy hiểm vì nhóm vừa đặt chỉ còn 1 khí.";
    }

    return {
        row,
        col,
        label: getPointLabel(row, col),
        score,
        capturedCount,
        liberties,
        reason,
    };
}

function getCandidateMoves(board: Board, player: Player) {
    const candidates: SuggestedMove[] = [];

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] !== null) continue;

            const candidate = scoreMove(board, row, col, player);

            if (candidate) {
                candidates.push(candidate);
            }
        }
    }

    return candidates.sort((a, b) => b.score - a.score);
}

function getSuggestionText({
    bestMove,
    actualMove,
}: {
    bestMove: SuggestedMove;
    actualMove: SuggestedMove;
}) {
    const scoreGap = bestMove.score - actualMove.score;

    const severity: MoveSuggestion["severity"] =
        scoreGap >= 120 ? "high" : scoreGap >= 70 ? "medium" : "low";

    if (bestMove.capturedCount > actualMove.capturedCount) {
        return {
            severity,
            title: "Có cơ hội bắt quân tốt hơn",
            description: `Ở nước này, bạn có thể cân nhắc đi ${bestMove.label}. ${bestMove.reason}`,
        };
    }

    if (actualMove.liberties <= 1 && bestMove.liberties > actualMove.liberties) {
        return {
            severity,
            title: "Có nước đi an toàn hơn",
            description: `Nước đã đi khiến nhóm quân khá nguy hiểm. ${bestMove.label} có thể giúp nhóm có nhiều khí hơn.`,
        };
    }

    return {
        severity,
        title: "Có nước đi ổn định hơn",
        description: `Bạn có thể cân nhắc ${bestMove.label}. ${bestMove.reason}`,
    };
}

export function getBasicMoveSuggestions(moves: Move[]) {
    let board = createEmptyBoard();
    const suggestions: MoveSuggestion[] = [];

    for (const move of moves) {
        if (move.type !== "stone") {
            continue;
        }

        const boardBeforeMove = cloneBoard(board);

        const actualMoveScore = scoreMove(
            boardBeforeMove,
            move.row,
            move.col,
            move.player
        );

        const candidates = getCandidateMoves(boardBeforeMove, move.player);

        const bestCandidates = candidates.slice(0, 3);
        const bestMove = bestCandidates[0];

        if (actualMoveScore && bestMove) {
            const isSameMove = bestMove.row === move.row && bestMove.col === move.col;
            const scoreGap = bestMove.score - actualMoveScore.score;

            if (!isSameMove && scoreGap >= 45) {
                const suggestionText = getSuggestionText({
                    bestMove,
                    actualMove: actualMoveScore,
                });

                suggestions.push({
                    moveNumber: move.moveNumber,
                    player: move.player,
                    actualMove: {
                        row: move.row,
                        col: move.col,
                        label: getPointLabel(move.row, move.col),
                        score: actualMoveScore.score,
                    },
                    title: suggestionText.title,
                    description: suggestionText.description,
                    severity: suggestionText.severity,
                    suggestedMoves: bestCandidates,
                });
            }
        }

        const result = placeStone(board, move.row, move.col, move.player);

        if (result.ok) {
            board = result.board;
        }
    }

    return suggestions.slice(0, 8);
}