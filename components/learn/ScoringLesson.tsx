"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createEmptyBoard } from "@/lib/go/board";
import type { Board } from "@/lib/go/types";

import BoardGrid from "@/components/goban/BoardGrid";
import LessonFeedbackPopup from "@/components/ui/LessonFeedbackPopup";
import { getNextLesson } from "@/lib/learn/lessons";
import { useLessonProgress } from "@/lib/learn/useLessonProgress";

type Feedback = {
    type: "success" | "error";
    title: string;
    description: string;
};

function createScoringLessonBoard(): Board {
    const board = createEmptyBoard();

    // Khu đất đen bên trái: Đen bao quanh 4 điểm trống.
    board[2][1] = "black";
    board[2][2] = "black";
    board[2][3] = "black";
    board[3][1] = "black";
    board[3][4] = "black";
    board[4][1] = "black";
    board[4][4] = "black";
    board[5][2] = "black";
    board[5][3] = "black";

    // Khu đất trắng bên phải: Trắng bao quanh 2 điểm trống.
    board[2][6] = "white";
    board[2][7] = "white";
    board[3][5] = "white";
    board[3][8] = "white";
    board[4][5] = "white";
    board[4][8] = "white";
    board[5][6] = "white";
    board[5][7] = "white";

    return board;
}

export default function ScoringLesson() {
    const router = useRouter();
    const { markLessonCompleted } = useLessonProgress();

    const [board] = useState<Board>(() => createScoringLessonBoard());
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const nextLesson = getNextLesson("scoring");

    function handleAnswer(answer: "black" | "white" | "equal") {
        if (answer === "black") {
            markLessonCompleted("scoring");

            setFeedback({
                type: "success",
                title: "Đúng rồi, Đen đang dẫn điểm",
                description:
                    "Trong thế cờ này, khu đất của Đen bên trái lớn hơn khu đất của Trắng bên phải. Khi mới học, bạn chưa cần đếm chính xác tuyệt đối, chỉ cần tập nhìn vùng đất được bao quanh.",
            });

            return;
        }

        setFeedback({
            type: "error",
            title: "Chưa đúng",
            description:
                "Hãy nhìn các vùng trống được quân hai bên bao quanh. Vùng của Đen bên trái rộng hơn vùng của Trắng bên phải.",
        });
    }

    return (
        <>
            <LessonFeedbackPopup
                isOpen={feedback !== null}
                type={feedback?.type ?? "error"}
                title={feedback?.title ?? ""}
                description={feedback?.description ?? ""}
                onRetry={() => setFeedback(null)}
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
                                Bài học 05
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-white">
                                Đếm điểm cơ bản
                            </h1>

                            <p className="mt-3 max-w-2xl text-neutral-400">
                                Trong cờ vây, người chơi không chỉ bắt quân, mà còn
                                cố gắng bao quanh các vùng đất. Hãy quan sát bàn cờ
                                và chọn bên đang có nhiều đất hơn.
                            </p>
                        </div>

                        <Link
                            href="/learn"
                            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Thoát
                        </Link>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <BoardGrid
                            board={board}
                            onPointClick={() => { }}
                            ariaLabelPrefix="Scoring lesson point"
                        />

                        <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Câu hỏi
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-neutral-400">
                                    Bên nào đang có nhiều đất hơn trong thế cờ này?
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleAnswer("black")}
                                    className="w-full rounded-2xl bg-neutral-950 px-5 py-4 text-left font-semibold text-white transition hover:bg-white/10"
                                >
                                    Đen đang dẫn
                                </button>

                                <button
                                    onClick={() => handleAnswer("white")}
                                    className="w-full rounded-2xl bg-neutral-950 px-5 py-4 text-left font-semibold text-white transition hover:bg-white/10"
                                >
                                    Trắng đang dẫn
                                </button>

                                <button
                                    onClick={() => handleAnswer("equal")}
                                    className="w-full rounded-2xl bg-neutral-950 px-5 py-4 text-left font-semibold text-white transition hover:bg-white/10"
                                >
                                    Hai bên bằng nhau
                                </button>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                    Gợi ý
                                </p>

                                <p className="mt-2 text-sm leading-6 text-neutral-300">
                                    Hãy nhìn các ô trống nằm bên trong vùng quân đen
                                    hoặc quân trắng bao quanh. Vùng nào rộng hơn thì
                                    bên đó thường đang dẫn.
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>
            </div>
        </>
    );
}