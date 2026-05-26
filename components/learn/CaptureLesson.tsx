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

function createCaptureLessonBoard(): Board {
    const board = createEmptyBoard();

    board[4][4] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[5][4] = "black";

    return board;
}

export default function CaptureLesson() {
    const router = useRouter();

    const [board, setBoard] = useState<Board>(() => createCaptureLessonBoard());
    const [currentPlayer] = useState<Player>("black");
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const nextLesson = getNextLesson("capture");

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
                        <BoardGrid
                            board={board}
                            onPointClick={handleClick}
                            highlightedGroupKeys={highlightedGroupKeys}
                            highlightedLibertyKeys={highlightedLibertyKeys}
                            ariaLabelPrefix="Capture lesson point"
                        />

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

                                        {selectedAnalysis.liberties.length === 1 && (
                                            <p className="text-xs text-red-300">
                                                Nhóm này đang bị Atari, nghĩa là chỉ còn 1 khí.
                                            </p>
                                        )}
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