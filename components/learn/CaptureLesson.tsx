"use client";

import { useState } from "react";
import Link from "next/link";

import {
    BOARD_SIZE,
    createEmptyBoard,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, Player, Point } from "@/lib/go/types";
import LessonFeedbackPopup from "@/components/ui/LessonFeedbackPopup";

type Feedback = {
    type: "success" | "error";
    title: string;
    description: string;
};

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function createCaptureLessonBoard(): Board {
    const board = createEmptyBoard();

    // Bài học: quân trắng ở giữa chỉ còn 1 khí bên phải.
    // Đen cần đi hàng 5, cột 6 để bắt quân trắng.
    board[4][4] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[5][4] = "black";

    return board;
}

export default function CaptureLesson() {
    const [board, setBoard] = useState<Board>(() => createCaptureLessonBoard());
    const [currentPlayer] = useState<Player>("black");
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const selectedAnalysis = selectedPoint
        ? getStoneGroupAnalysis(board, selectedPoint.row, selectedPoint.col)
        : null;

    const highlightedGroupKeys = new Set(
        selectedAnalysis?.group.map(getPointKey) ?? []
    );

    const highlightedLibertyKeys = new Set(
        selectedAnalysis?.liberties.map(getPointKey) ?? []
    );

    function resetLesson() {
        setBoard(createCaptureLessonBoard());
        setSelectedPoint(null);
        setFeedback(null);
    }

    function handleClick(row: number, col: number) {
        if (board[row][col] !== null) {
            setSelectedPoint({ row, col });
            return;
        }

        const result = placeStone(board, row, col, currentPlayer);

        if (!result.ok) {
            setFeedback({
                type: "error",
                title: "Nước đi chưa hợp lệ",
                description: result.error,
            });
            return;
        }

        setBoard(result.board);
        setSelectedPoint(null);

        const isCorrectMove = row === 4 && col === 5;
        const capturedWhiteStone = result.captured.some(
            (point) => point.row === 4 && point.col === 4
        );

        if (isCorrectMove && capturedWhiteStone) {
            setFeedback({
                type: "success",
                title: "Đúng rồi, bạn đã bắt quân trắng",
                description:
                    "Quân trắng ở giữa chỉ còn 1 khí bên phải. Khi Đen đi vào khí cuối cùng đó, quân trắng hết khí và bị bắt khỏi bàn.",
            });
        } else {
            setFeedback({
                type: "error",
                title: "Chưa đúng nước bắt quân",
                description:
                    "Hãy quan sát các khí của quân trắng. Mục tiêu là chặn khí cuối cùng của quân trắng ở bên phải.",
            });
        }
    }

    return (
        <>
            <LessonFeedbackPopup
                isOpen={feedback !== null}
                type={feedback?.type ?? "error"}
                title={feedback?.title ?? ""}
                description={feedback?.description ?? ""}
                onRetry={resetLesson}
                onClose={() => setFeedback(null)}
            />

            <div className="space-y-8">
                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                                Bài học 01
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-white">
                                Bắt quân trong 1 nước
                            </h1>

                            <p className="mt-3 max-w-2xl text-neutral-400">
                                Quân trắng ở giữa chỉ còn một khí. Hãy tìm nước đi
                                giúp Đen chặn khí cuối cùng và bắt quân trắng.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={resetLesson}
                                className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Làm lại
                            </button>

                            <Link
                                href="/learn"
                                className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Thoát
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
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
                                                    onClick={() => handleClick(rowIndex, colIndex)}
                                                    className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                                                    style={{
                                                        left: `${(colIndex / (BOARD_SIZE - 1)) * 100
                                                            }%`,
                                                        top: `${(rowIndex / (BOARD_SIZE - 1)) * 100
                                                            }%`,
                                                        width: "9%",
                                                        height: "9%",
                                                    }}
                                                    aria-label={`Lesson point ${rowIndex + 1}, ${colIndex + 1
                                                        }`}
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

                        <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Mục tiêu
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-neutral-400">
                                    Click vào khí cuối cùng của quân trắng để bắt nó.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                    Gợi ý
                                </p>
                                <p className="mt-2 text-sm leading-6 text-neutral-300">
                                    Click vào quân trắng để xem các khí của nó. Chấm
                                    xanh là khí còn lại.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                    Phân tích
                                </p>

                                {selectedAnalysis ? (
                                    <div className="mt-2 space-y-1 text-sm text-neutral-300">
                                        <p>
                                            Màu:{" "}
                                            <span className="font-semibold text-amber-300">
                                                {selectedAnalysis.player === "black"
                                                    ? "Đen"
                                                    : "Trắng"}
                                            </span>
                                        </p>
                                        <p>Số quân: {selectedAnalysis.group.length}</p>
                                        <p>Số khí: {selectedAnalysis.liberties.length}</p>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                                        Click vào một quân để xem nhóm và khí.
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>
                </section>
            </div>
        </>
    );
}