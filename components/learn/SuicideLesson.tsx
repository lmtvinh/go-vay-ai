"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    createEmptyBoard,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, Player, Point } from "@/lib/go/types";
import BoardGrid from "@/components/goban/BoardGrid";
import LessonFeedbackPopup from "@/components/ui/LessonFeedbackPopup";
import { getNextLesson } from "@/lib/learn/lessons";

type Feedback = {
    type: "success" | "error";
    title: string;
    description: string;
};

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function createSuicideLessonBoard(): Board {
    const board = createEmptyBoard();

    // Ô hàng 5, cột 5 đang bị trắng bao quanh 4 hướng.
    // Nếu Đen đặt vào đó mà không bắt được quân nào, đó là nước tự sát.
    board[3][4] = "white";
    board[4][3] = "white";
    board[4][5] = "white";
    board[5][4] = "white";

    return board;
}

export default function SuicideLesson() {
    const router = useRouter();

    const [board, setBoard] = useState<Board>(() => createSuicideLessonBoard());
    const [currentPlayer] = useState<Player>("black");
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const nextLesson = getNextLesson("suicide");

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
        setBoard(createSuicideLessonBoard());
        setSelectedPoint(null);
        setFeedback(null);
    }

    function handleClick(row: number, col: number) {
        if (board[row][col] !== null) {
            setSelectedPoint({ row, col });
            return;
        }

        const isSuicidePoint = row === 4 && col === 4;

        if (!isSuicidePoint) {
            setFeedback({
                type: "error",
                title: "Chưa đúng vị trí tự sát",
                description:
                    "Hãy tìm ô trống bị quân trắng bao quanh cả 4 hướng. Đó là nơi Đen không thể đặt quân.",
            });
            return;
        }

        const result = placeStone(board, row, col, currentPlayer);

        if (!result.ok) {
            setFeedback({
                type: "success",
                title: "Đúng rồi, đây là nước tự sát",
                description:
                    "Đen không thể đặt vào ô này vì quân vừa đặt sẽ không có khí nào, đồng thời cũng không bắt được quân trắng. Vì vậy nước đi này không hợp lệ.",
            });
            return;
        }

        setBoard(result.board);

        setFeedback({
            type: "error",
            title: "Logic tự sát chưa hoạt động đúng",
            description:
                "Nước này đáng lẽ phải bị chặn vì là nước tự sát. Hãy kiểm tra lại hàm placeStone trong game core.",
        });
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
                onBackToLearn={() => router.push("/learn")}
                nextLessonTitle={nextLesson?.title}
                nextLessonStatus={nextLesson?.status}
                onNextLesson={() => {
                    if (nextLesson?.status === "available") {
                        router.push(nextLesson.href);
                    }
                }}
            />

            <div className="space-y-8">
                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                                Bài học 03
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-white">
                                Nước tự sát
                            </h1>

                            <p className="mt-3 max-w-2xl text-neutral-400">
                                Trong cờ vây, bạn không thể đặt quân vào một vị trí
                                khiến quân của mình không còn khí, trừ khi nước đó bắt
                                được quân đối thủ.
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
                        <BoardGrid
                            board={board}
                            onPointClick={handleClick}
                            highlightedGroupKeys={highlightedGroupKeys}
                            highlightedLibertyKeys={highlightedLibertyKeys}
                            ariaLabelPrefix="Suicide lesson point"
                        />

                        <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Mục tiêu
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-neutral-400">
                                    Tìm ô trống mà Đen không thể đặt quân vì đó là
                                    nước tự sát.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                    Gợi ý
                                </p>

                                <p className="mt-2 text-sm leading-6 text-neutral-300">
                                    Hãy nhìn ô trống ở giữa 4 quân trắng. Nếu Đen đặt
                                    vào đó, quân Đen có còn khí nào không?
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

                                        <p>
                                            Số khí:{" "}
                                            <span
                                                className={
                                                    selectedAnalysis.liberties.length === 1
                                                        ? "font-semibold text-red-300"
                                                        : "font-semibold text-emerald-300"
                                                }
                                            >
                                                {selectedAnalysis.liberties.length}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                                        Click vào quân trắng để xem nhóm và khí của nó.
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