"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    areBoardsEqual,
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

function createPreviousKoBoard(): Board {
    const board = createEmptyBoard();

    // Trạng thái trước khi Đen bắt quân.
    // Trắng ở hàng 5, cột 5.
    // Đen chuẩn bị đi hàng 5, cột 6 để bắt quân trắng.
    board[4][4] = "white";

    board[3][4] = "black";
    board[5][4] = "black";
    board[4][3] = "black";

    board[3][5] = "white";
    board[5][5] = "white";
    board[4][6] = "white";

    return board;
}

function createCurrentKoBoard(): Board {
    const board = createEmptyBoard();

    // Trạng thái hiện tại: Đen vừa bắt quân trắng ở hàng 5, cột 5
    // bằng cách đặt quân ở hàng 5, cột 6.
    board[4][5] = "black";

    board[3][4] = "black";
    board[5][4] = "black";
    board[4][3] = "black";

    board[3][5] = "white";
    board[5][5] = "white";
    board[4][6] = "white";

    return board;
}

export default function KoLesson() {
    const router = useRouter();

    const [board, setBoard] = useState<Board>(() => createCurrentKoBoard());
    const [currentPlayer] = useState<Player>("white");
    const [previousBoard] = useState<Board>(() => createPreviousKoBoard());
    const [selectedPoint, setSelectedPoint] = useState<Point | null>({
        row: 4,
        col: 5,
    });
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const nextLesson = getNextLesson("ko");

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
        setBoard(createCurrentKoBoard());
        setSelectedPoint({ row: 4, col: 5 });
        setFeedback(null);
    }

    function handleClick(row: number, col: number) {
        if (board[row][col] !== null) {
            setSelectedPoint({ row, col });
            return;
        }

        const isImmediateRecapture = row === 4 && col === 4;

        if (!isImmediateRecapture) {
            setFeedback({
                type: "error",
                title: "Chưa đúng vị trí Ko",
                description:
                    "Hãy click vào khí duy nhất của quân đen vừa bắt. Đó là điểm mà Trắng muốn bắt lại ngay lập tức.",
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

        if (areBoardsEqual(result.board, previousBoard)) {
            setFeedback({
                type: "success",
                title: "Đúng rồi, đây là tình huống Ko",
                description:
                    "Nếu Trắng bắt lại ngay tại điểm này, bàn cờ sẽ quay về đúng trạng thái trước đó. Luật Ko không cho phép điều đó, để tránh hai bên bắt qua bắt lại vô hạn.",
            });
            return;
        }

        setBoard(result.board);
        setSelectedPoint(null);

        setFeedback({
            type: "error",
            title: "Chưa tạo đúng tình huống Ko",
            description:
                "Nước này không làm bàn cờ quay về trạng thái trước đó. Hãy thử lại tại khí duy nhất của quân đen.",
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
                                Bài học 04
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-white">
                                Luật Ko: không được bắt lại ngay
                            </h1>

                            <p className="mt-3 max-w-2xl text-neutral-400">
                                Đen vừa bắt một quân trắng. Trắng muốn bắt lại ngay,
                                nhưng nếu làm vậy bàn cờ sẽ quay về trạng thái trước
                                đó. Đây là tình huống Ko.
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
                            ariaLabelPrefix="Ko lesson point"
                        />

                        <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Mục tiêu
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-neutral-400">
                                    Tìm điểm mà Trắng muốn bắt lại ngay. Website sẽ
                                    giải thích vì sao nước đó vi phạm luật Ko.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                    Gợi ý
                                </p>

                                <p className="mt-2 text-sm leading-6 text-neutral-300">
                                    Click vào quân đen đang được chọn. Chấm xanh là khí
                                    duy nhất của quân đó. Nếu Trắng đi vào đó ngay,
                                    Trắng sẽ bắt lại quân đen.
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
                                                Nhóm này chỉ còn 1 khí.
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