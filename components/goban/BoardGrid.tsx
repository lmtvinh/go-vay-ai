"use client";

import type { Board } from "@/lib/go/types";

type BoardGridProps = {
    board: Board;
    onPointClick: (row: number, col: number) => void;
    highlightedGroupKeys?: Set<string>;
    highlightedLibertyKeys?: Set<string>;
    isDisabled?: boolean;
    ariaLabelPrefix?: string;
    showCoordinates?: boolean;
};

const BOARD_INSET_PERCENT = 12;
const BOARD_SPAN_PERCENT = 100 - BOARD_INSET_PERCENT * 2;

export default function BoardGrid({
    board,
    onPointClick,
    highlightedGroupKeys = new Set(),
    highlightedLibertyKeys = new Set(),
    isDisabled = false,
    ariaLabelPrefix = "Board point",
    showCoordinates = true,
}: BoardGridProps) {
    const size = board.length;

    const indices = Array.from({ length: size }, (_, index) => index);

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
                {/* Top coordinates */}
                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`top-${index}`}
                            className="absolute text-sm font-bold text-black/70"
                            style={{
                                left: `${getBoardPositionPercent(index)}%`,
                                top: "5%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {/* Bottom coordinates */}
                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`bottom-${index}`}
                            className="absolute text-sm font-bold text-black/70"
                            style={{
                                left: `${getBoardPositionPercent(index)}%`,
                                bottom: "5%",
                                transform: "translate(-50%, 50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {/* Left coordinates */}
                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`left-${index}`}
                            className="absolute text-sm font-bold text-black/70"
                            style={{
                                left: "5%",
                                top: `${getBoardPositionPercent(index)}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {/* Right coordinates */}
                {showCoordinates &&
                    indices.map((index) => (
                        <span
                            key={`right-${index}`}
                            className="absolute text-sm font-bold text-black/70"
                            style={{
                                right: "5%",
                                top: `${getBoardPositionPercent(index)}%`,
                                transform: "translate(50%, -50%)",
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}

                {/* Board lines */}
                <div
                    className="absolute"
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
                                top: `${size <= 1 ? 0 : (index / (size - 1)) * 100
                                    }%`,
                            }}
                        />
                    ))}

                    {indices.map((index) => (
                        <div
                            key={`v-${index}`}
                            className="absolute bottom-0 top-0 w-px bg-black/70"
                            style={{
                                left: `${size <= 1 ? 0 : (index / (size - 1)) * 100
                                    }%`,
                            }}
                        />
                    ))}
                </div>

                {/* Stones / clickable points */}
                {board.map((row, rowIndex) =>
                    row.map((stone, colIndex) => {
                        const pointKey = `${rowIndex},${colIndex}`;
                        const isGroupHighlighted =
                            highlightedGroupKeys.has(pointKey);
                        const isLibertyHighlighted =
                            highlightedLibertyKeys.has(pointKey);

                        return (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => onPointClick(rowIndex, colIndex)}
                                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${isDisabled ? "cursor-not-allowed" : ""
                                    }`}
                                style={{
                                    left: `${getBoardPositionPercent(colIndex)}%`,
                                    top: `${getBoardPositionPercent(rowIndex)}%`,
                                    width: `${Math.max(
                                        4,
                                        72 / size
                                    )}%`,
                                    height: `${Math.max(
                                        4,
                                        72 / size
                                    )}%`,
                                }}
                                aria-label={`${ariaLabelPrefix} ${rowIndex + 1}, ${colIndex + 1
                                    }`}
                                disabled={isDisabled}
                            >
                                {isLibertyHighlighted && !stone && (
                                    <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                                )}

                                {stone && (
                                    <span
                                        className={`block h-full w-full rounded-full shadow-lg ring-offset-2 ring-offset-[#d8a850] ${stone === "black"
                                            ? "bg-neutral-950"
                                            : "border border-neutral-300 bg-white"
                                            } ${isGroupHighlighted
                                                ? "ring-4 ring-emerald-400"
                                                : ""
                                            }`}
                                    />
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}