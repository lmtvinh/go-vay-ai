"use client";

import { useMemo, useState } from "react";

import BoardGrid from "@/components/goban/BoardGrid";
import { createEmptyBoard, placeStone } from "@/lib/go/board";
import type { Board, Move, Point } from "@/lib/go/types";

type GameReplayProps = {
    moves: Move[];
    focusedPoint?: Point | null;
};

type ReplayStep = {
    moveNumber: number;
    label: string;
    board: Board;
};

function cloneBoard(board: Board): Board {
    return board.map((row) => [...row]);
}

function getPlayerLabel(player: "black" | "white") {
    return player === "black" ? "Đen" : "Trắng";
}

function buildReplaySteps(moves: Move[]): ReplayStep[] {
    let currentBoard = createEmptyBoard();

    const steps: ReplayStep[] = [
        {
            moveNumber: 0,
            label: "Bắt đầu ván cờ",
            board: cloneBoard(currentBoard),
        },
    ];

    for (const move of moves) {
        if (move.type === "stone") {
            const result = placeStone(
                currentBoard,
                move.row,
                move.col,
                move.player
            );

            if (result.ok) {
                currentBoard = result.board;
            }

            steps.push({
                moveNumber: move.moveNumber,
                label: `#${move.moveNumber} ${getPlayerLabel(
                    move.player
                )} đi tại hàng ${move.row + 1}, cột ${move.col + 1}${move.captured.length > 0
                    ? ` — bắt ${move.captured.length} quân`
                    : ""
                    }`,
                board: cloneBoard(currentBoard),
            });

            continue;
        }

        if (move.type === "pass") {
            steps.push({
                moveNumber: move.moveNumber,
                label: `#${move.moveNumber} ${getPlayerLabel(move.player)} Pass`,
                board: cloneBoard(currentBoard),
            });

            continue;
        }

        if (move.type === "resign") {
            steps.push({
                moveNumber: move.moveNumber,
                label: `#${move.moveNumber} ${getPlayerLabel(
                    move.player
                )} đầu hàng. ${getPlayerLabel(move.winner)} thắng.`,
                board: cloneBoard(currentBoard),
            });
        }
    }

    return steps;
}

export default function GameReplay({ moves, focusedPoint = null, }: GameReplayProps) {
    const replaySteps = useMemo(() => buildReplaySteps(moves), [moves]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = replaySteps[currentStepIndex];
    const canGoPrevious = currentStepIndex > 0;
    const canGoNext = currentStepIndex < replaySteps.length - 1;

    function goPrevious() {
        if (!canGoPrevious) return;
        setCurrentStepIndex((current) => current - 1);
    }

    function goNext() {
        if (!canGoNext) return;
        setCurrentStepIndex((current) => current + 1);
    }

    function goToStart() {
        setCurrentStepIndex(0);
    }

    function goToEnd() {
        setCurrentStepIndex(replaySteps.length - 1);
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Replay ván cờ
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                        Xem lại ván cờ từng bước để hiểu diễn biến của trận đấu.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300">
                    Nước {currentStepIndex} / {replaySteps.length - 1}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <BoardGrid
                    board={currentStep.board}
                    onPointClick={() => { }}
                    isDisabled
                    ariaLabelPrefix="Replay point"
                    focusedPoint={focusedPoint}
                />

                <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            Nước hiện tại
                        </p>

                        <p className="mt-2 text-sm leading-6 text-neutral-300">
                            {currentStep.label}
                        </p>
                    </div>

                    <input
                        type="range"
                        min={0}
                        max={replaySteps.length - 1}
                        value={currentStepIndex}
                        onChange={(event) =>
                            setCurrentStepIndex(Number(event.target.value))
                        }
                        className="w-full"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={goToStart}
                            disabled={!canGoPrevious}
                            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Đầu ván
                        </button>

                        <button
                            onClick={goToEnd}
                            disabled={!canGoNext}
                            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Cuối ván
                        </button>

                        <button
                            onClick={goPrevious}
                            disabled={!canGoPrevious}
                            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Trước
                        </button>

                        <button
                            onClick={goNext}
                            disabled={!canGoNext}
                            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Tiếp →
                        </button>
                    </div>
                </aside>
            </div>
        </section>
    );
}