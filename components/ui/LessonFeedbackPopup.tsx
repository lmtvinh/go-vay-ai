"use client";

type LessonFeedbackPopupProps = {
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;

    onRetry: () => void;
    onClose: () => void;
    onBackToLearn: () => void;

    nextLessonTitle?: string;
    nextLessonStatus?: "available" | "coming-soon";
    onNextLesson?: () => void;
};

export default function LessonFeedbackPopup({
    isOpen,
    type,
    title,
    description,
    onRetry,
    onClose,
    onBackToLearn,
    nextLessonTitle,
    nextLessonStatus,
    onNextLesson,
}: LessonFeedbackPopupProps) {
    if (!isOpen) return null;

    const isSuccess = type === "success";
    const canGoNext = isSuccess && nextLessonStatus === "available" && onNextLesson;
    const hasComingSoonNext = isSuccess && nextLessonStatus === "coming-soon";

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
                    {isSuccess ? "🎯" : "💭"}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    {isSuccess ? "Lesson Complete" : "Try Again"}
                </p>

                <h2
                    className={`mt-3 text-2xl font-bold ${isSuccess ? "text-emerald-300" : "text-amber-300"
                        }`}
                >
                    {title}
                </h2>

                <p className="mt-4 text-sm leading-6 text-neutral-300">
                    {description}
                </p>

                {isSuccess && nextLessonTitle && (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
                        Bài tiếp theo:{" "}
                        <span className="font-semibold text-amber-300">
                            {nextLessonTitle}
                        </span>
                    </p>
                )}

                <div className="mt-6 grid gap-3">
                    {!isSuccess && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                onClick={onRetry}
                                className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                            >
                                Thử lại
                            </button>

                            <button
                                onClick={onClose}
                                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Xem gợi ý
                            </button>
                        </div>
                    )}

                    {canGoNext && (
                        <button
                            onClick={onNextLesson}
                            className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                        >
                            Bài tiếp theo →
                        </button>
                    )}

                    {hasComingSoonNext && (
                        <button
                            onClick={onBackToLearn}
                            className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                        >
                            Xem lộ trình học
                        </button>
                    )}

                    {isSuccess && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                onClick={onRetry}
                                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Học lại
                            </button>

                            <button
                                onClick={onBackToLearn}
                                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Lộ trình học
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}