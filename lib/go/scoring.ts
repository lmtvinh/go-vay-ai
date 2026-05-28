import type { Board, Player, Point } from "@/lib/go/types";

type TerritoryOwner = Player | "neutral";

export type BasicScoreResult = {
    blackStones: number;
    whiteStones: number;

    blackTerritory: number;
    whiteTerritory: number;
    neutralTerritory: number;

    blackTerritoryPoints: Point[];
    whiteTerritoryPoints: Point[];
    neutralTerritoryPoints: Point[];

    blackCaptured: number;
    whiteCaptured: number;

    blackTotal: number;
    whiteTotal: number;

    winner: Player | null;
    margin: number;
};

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function getNeighbors(board: Board, row: number, col: number): Point[] {
    const size = board.length;

    return [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
    ].filter(
        (point) =>
            point.row >= 0 &&
            point.row < size &&
            point.col >= 0 &&
            point.col < size
    );
}

function getEmptyRegion(
    board: Board,
    startRow: number,
    startCol: number,
    visited: Set<string>
) {
    const queue: Point[] = [{ row: startRow, col: startCol }];
    const region: Point[] = [];
    const borderingPlayers = new Set<Player>();

    visited.add(getPointKey({ row: startRow, col: startCol }));

    while (queue.length > 0) {
        const point = queue.shift();

        if (!point) continue;

        region.push(point);

        const neighbors = getNeighbors(board, point.row, point.col);

        for (const neighbor of neighbors) {
            const value = board[neighbor.row][neighbor.col];

            if (value === "black" || value === "white") {
                borderingPlayers.add(value);
                continue;
            }

            const key = getPointKey(neighbor);

            if (!visited.has(key)) {
                visited.add(key);
                queue.push(neighbor);
            }
        }
    }

    let owner: TerritoryOwner = "neutral";

    if (borderingPlayers.size === 1) {
        owner = [...borderingPlayers][0];
    }

    return {
        owner,
        points: region,
    };
}

export function calculateBasicScore(
    board: Board,
    blackCaptured: number,
    whiteCaptured: number
): BasicScoreResult {
    let blackStones = 0;
    let whiteStones = 0;

    let blackTerritory = 0;
    let whiteTerritory = 0;
    let neutralTerritory = 0;

    const blackTerritoryPoints: Point[] = [];
    const whiteTerritoryPoints: Point[] = [];
    const neutralTerritoryPoints: Point[] = [];

    const visited = new Set<string>();

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const value = board[row][col];

            if (value === "black") {
                blackStones += 1;
                continue;
            }

            if (value === "white") {
                whiteStones += 1;
                continue;
            }

            const key = getPointKey({ row, col });

            if (visited.has(key)) continue;

            const region = getEmptyRegion(board, row, col, visited);

            if (region.owner === "black") {
                blackTerritory += region.points.length;
                blackTerritoryPoints.push(...region.points);
            } else if (region.owner === "white") {
                whiteTerritory += region.points.length;
                whiteTerritoryPoints.push(...region.points);
            } else {
                neutralTerritory += region.points.length;
                neutralTerritoryPoints.push(...region.points);
            }
        }
    }

    const blackTotal = blackStones + blackTerritory + blackCaptured;
    const whiteTotal = whiteStones + whiteTerritory + whiteCaptured;

    let winner: Player | null = null;

    if (blackTotal > whiteTotal) {
        winner = "black";
    } else if (whiteTotal > blackTotal) {
        winner = "white";
    }

    return {
        blackStones,
        whiteStones,

        blackTerritory,
        whiteTerritory,
        neutralTerritory,

        blackTerritoryPoints,
        whiteTerritoryPoints,
        neutralTerritoryPoints,

        blackCaptured,
        whiteCaptured,

        blackTotal,
        whiteTotal,

        winner,
        margin: Math.abs(blackTotal - whiteTotal),
    };
}