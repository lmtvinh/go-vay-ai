"use client";

import { BOARD_SIZE } from "@/lib/go/board";
import type { Board } from "@/lib/go/types";

type BoardGridProps = {
    board: Board;
    onPointClick: (row: number, col: number) => void;
    highlightedGroupKeys?: Set<string>;
    highlightedLibertyKeys?: Set<string>;
    isDisabled?: boolean;
    ariaLabelPrefix?: string;
};

export default function BoardGrid({
    board,
    onPointClick,
    highlightedGroupKeys = new Set(),
    highlightedLibertyKeys = new Set(),
    isDisabled = false,
    ariaLabelPrefix = "Board point",
}: BoardGridProps) {
    return (
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
                                        left: `${(colIndex / (BOARD_SIZE - 1)) * 100
                                            }%`,
                                        top: `${(rowIndex / (BOARD_SIZE - 1)) * 100
                                            }%`,
                                        width: "9%",
                                        height: "9%",
                                    }}
                                    aria-label={`${ariaLabelPrefix} ${rowIndex + 1
                                        }, ${colIndex + 1}`}
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
        </div>
    );
}