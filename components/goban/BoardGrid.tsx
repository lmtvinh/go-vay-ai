"use client";

import { useMemo } from "react";
import type { Board, Player, Point } from "@/lib/go/types";

type TerritoryPoints = {
    black?: Point[];
    white?: Point[];
    neutral?: Point[];
};

type BoardGridProps = {
    board: Board;
    onPointClick: (row: number, col: number) => void;
    highlightedGroupKeys?: Set<string>;
    highlightedLibertyKeys?: Set<string>;
    isDisabled?: boolean;
    ariaLabelPrefix?: string;
    showCoordinates?: boolean;
    previewPlayer?: Player | null;
    lastMovePoint?: Point | null;
    focusedPoint?: Point | null;
    territoryPoints?: TerritoryPoints;
};

const BOARD_INSET_PERCENT = 12;
const BOARD_SPAN_PERCENT = 100 - BOARD_INSET_PERCENT * 2;

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

export default function BoardGrid({
    board,
    onPointClick,
    highlightedGroupKeys = new Set(),
    highlightedLibertyKeys = new Set(),
    isDisabled = false,
    ariaLabelPrefix = "Board point",
    showCoordinates = true,
    previewPlayer = null,
    lastMovePoint = null,
    focusedPoint = null,
    territoryPoints,
}: BoardGridProps) {
    const size = board.length;
    const indices = Array.from({ length: size }, (_, index) => index);

    const blackTerritoryKeys = useMemo(
        () => new Set((territoryPoints?.black ?? []).map(getPointKey)),
        [territoryPoints]
    );

    const whiteTerritoryKeys = useMemo(
        () => new Set((territoryPoints?.white ?? []).map(getPointKey)),
        [territoryPoints]
    );

    const neutralTerritoryKeys = useMemo(
        () => new Set((territoryPoints?.neutral ?? []).map(getPointKey)),
        [territoryPoints]
    );

    function getBoardPositionPercent(index: number) {
        if (size <= 1) return BOARD_INSET_PERCENT;

        return (
            BOARD_INSET_PERCENT +
            (index / (size - 1)) * BOARD_SPAN_PERCENT
        );
    }

    return (
        <div className="w-full overflow-auto">
            <div className="relative mx-auto aspect-square w-[min(92vw,640px)] rounded-2xl bg-[#d8a850] shadow-2xl">
                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`top-${index}`}
                            className="pointer-events-none absolute text-sm font-bold text-black/70"
                            style={{
                                left: `${getBoardPositionPercent(index)}%`,
                                top: "5%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`bottom-${index}`}
                            className="pointer-events-none absolute text-sm font-bold text-black/70"
                            style={{
                                left: `${getBoardPositionPercent(index)}%`,
                                bottom: "5%",
                                transform: "translate(-50%, 50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`left-${index}`}
                            className="pointer-events-none absolute text-sm font-bold text-black/70"
                            style={{
                                left: "5%",
                                top: `${getBoardPositionPercent(index)}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`right-${index}`}
                            className="pointer-events-none absolute text-sm font-bold text-black/70"
                            style={{
                                right: "5%",
                                top: `${getBoardPositionPercent(index)}%`,
                                transform: "translate(50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                <div
                    className="pointer-events-none absolute"
                    style={{
                        left: `${BOARD_INSET_PERCENT}%`,
                        top: `${BOARD_INSET_PERCENT}%`,
                        width: `${BOARD_SPAN_PERCENT}%`,
                        height: `${BOARD_SPAN_PERCENT}%`,
                    }}
                >
                    {indices.map((index) => (
                        <div
                            key={`h-${index}`}
                            className="absolute left-0 right-0 h-px bg-black/70"
                            style={{
                                top: `${size <= 1
                                    ? 0
                                    : (index / (size - 1)) * 100
                                    }%`,
                            }}
                        />
                    ))}

                    {indices.map((index) => (
                        <div
                            key={`v-${index}`}
                            className="absolute bottom-0 top-0 w-px bg-black/70"
                            style={{
                                left: `${size <= 1
                                    ? 0
                                    : (index / (size - 1)) * 100
                                    }%`,
                            }}
                        />
                    ))}
                </div>

                {board.map((row, rowIndex) =>
                    row.map((stone, colIndex) => {
                        const pointKey = `${rowIndex},${colIndex}`;

                        const isGroupHighlighted =
                            highlightedGroupKeys.has(pointKey);

                        const isLibertyHighlighted =
                            highlightedLibertyKeys.has(pointKey);

                        const isLastMove =
                            lastMovePoint?.row === rowIndex &&
                            lastMovePoint?.col === colIndex;

                        const isFocusedPoint =
                            focusedPoint?.row === rowIndex &&
                            focusedPoint?.col === colIndex;

                        const isBlackTerritory =
                            blackTerritoryKeys.has(pointKey);

                        const isWhiteTerritory =
                            whiteTerritoryKeys.has(pointKey);

                        const isNeutralTerritory =
                            neutralTerritoryKeys.has(pointKey);

                        return (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                type="button"
                                onClick={() => onPointClick(rowIndex, colIndex)}
                                className={`group absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${isDisabled ? "cursor-not-allowed" : ""
                                    }`}
                                style={{
                                    left: `${getBoardPositionPercent(colIndex)}%`,
                                    top: `${getBoardPositionPercent(rowIndex)}%`,
                                    width: `${Math.max(4, 72 / size)}%`,
                                    height: `${Math.max(4, 72 / size)}%`,
                                }}
                                aria-label={`${ariaLabelPrefix} ${rowIndex + 1
                                    }, ${colIndex + 1}`}
                            >
                                <div className="relative flex h-full w-full items-center justify-center">
                                    {!stone && isBlackTerritory && (
                                        <span className="pointer-events-none absolute z-[5] h-5 w-5 rounded-full bg-neutral-950/40" />
                                    )}

                                    {!stone && isWhiteTerritory && (
                                        <span className="pointer-events-none absolute z-[5] h-5 w-5 rounded-full border border-neutral-400 bg-white/60" />
                                    )}

                                    {!stone && isNeutralTerritory && (
                                        <span className="pointer-events-none absolute z-[5] h-4 w-4 rounded-full border border-neutral-600 bg-neutral-500/30" />
                                    )}

                                    {isFocusedPoint && (
                                        <span className="pointer-events-none absolute -inset-2 z-40 rounded-full border-2 border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
                                    )}

                                    {isLibertyHighlighted && !stone && (
                                        <span className="absolute z-10 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)] group-hover:hidden" />
                                    )}

                                    {previewPlayer && !stone && !isDisabled && (
                                        <span
                                            className={`pointer-events-none absolute inset-0 z-20 hidden rounded-full opacity-45 shadow-lg group-hover:block ${previewPlayer === "black"
                                                ? "bg-neutral-950"
                                                : "border border-neutral-300 bg-white"
                                                }`}
                                        />
                                    )}

                                    {stone && (
                                        <span
                                            className={`relative z-30 block h-full w-full rounded-full shadow-lg ring-offset-2 ring-offset-[#d8a850] ${stone === "black"
                                                ? "bg-neutral-950"
                                                : "border border-neutral-300 bg-white"
                                                } ${isGroupHighlighted
                                                    ? "ring-4 ring-emerald-400"
                                                    : ""
                                                }`}
                                        >
                                            {isLastMove && (
                                                <span
                                                    className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${stone === "black"
                                                        ? "bg-white"
                                                        : "bg-neutral-950"
                                                        }`}
                                                />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}