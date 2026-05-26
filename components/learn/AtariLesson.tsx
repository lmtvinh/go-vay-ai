"use client";

import { useState } from "react";
import Link from "next/link";

import {
    createEmptyBoard,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, Player, Point } from "@/lib/go/types";
import BoardGrid from "@/components/goban/BoardGrid";
import LessonFeedbackPopup from "@/components/ui/LessonFeedbackPopup";
import { useRouter } from "next/navigation";
import { getNextLesson } from "@/lib/learn/lessons";
import { useLessonProgress } from "@/lib/learn/useLessonProgress";

type Feedback = {
    type: "success" | "error";
    title: string;
    description: string;
};

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function createAtariLessonBoard(): Board {
    const board = createEmptyBoard();

    // Bài học:
    // Quân đen ở giữa đang bị Atari vì chỉ còn 1 khí bên phải.
    // Đen cần đi hàng 5, cột 6 để nối/thoát Atari.
    board[4][4] = "black";

    board[3][4] = "white";
    board[4][3] = "white";
    board[5][4] = "white";

    return board;
}

export default function AtariLesson() {
    const [board, setBoard] = useState<Board>(() => createAtariLessonBoard());
    const [currentPlayer] = useState<Player>("black");
    const [selectedPoint, setSelectedPoint] = useState<Point | null>({
        row: 4,
        col: 4,
    });
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

    const router = useRouter();
    const nextLesson = getNextLesson("atari");
    const { markLessonCompleted } = useLessonProgress();

    function resetLesson() {
        setBoard(createAtariLessonBoard());
        setSelectedPoint({ row: 4, col: 4 });
        setFeedback(null);
    }

    function handleClick(row: number, col: number) {
        if (board[row][col] !== null) {
            setSelectedPoint({ row, col });
            return;
        }

        const isCorrectMove = row === 4 && col === 5;

        if (!isCorrectMove) {
            setFeedback({
                type: "error",
                title: "Chưa đúng nước thoát Atari",
                description:
                    "Hãy click vào quân đen để xem khí còn lại. Chấm xanh chính là khí cuối cùng của nhóm đen.",
            });
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
        setSelectedPoint({ row, col });

        markLessonCompleted("atari");
        setFeedback({
            type: "success",
            title: "Đúng rồi, bạn đã thoát Atari",
            description:
                "Nhóm đen ban đầu chỉ còn 1 khí nên đang bị Atari. Khi Đen đi vào khí cuối cùng đó, nhóm đen được nối dài ra và có thêm khí để sống tiếp.",
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
                                Bài học 02
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-white">
                                Atari: nhóm quân chỉ còn 1 khí
                            </h1>

                            <p className="mt-3 max-w-2xl text-neutral-400">
                                Quân đen đang bị Atari, nghĩa là chỉ còn một khí.
                                Hãy tìm nước đi giúp Đen thoát khỏi nguy hiểm.
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
                            ariaLabelPrefix="Atari lesson point"
                        />

                        <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Mục tiêu
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-neutral-400">
                                    Tìm khí cuối cùng của quân đen và đi vào đó để
                                    thoát Atari.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                    Gợi ý
                                </p>

                                <p className="mt-2 text-sm leading-6 text-neutral-300">
                                    Click vào quân đen. Nếu chỉ thấy một chấm xanh,
                                    nghĩa là nhóm đó chỉ còn 1 khí và đang bị Atari.
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
                                                Nhóm này đang bị Atari.
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