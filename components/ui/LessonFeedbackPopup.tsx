"use client";

type LessonFeedbackPopupProps = {
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
    onRetry: () => void;
    onClose: () => void;
};

export default function LessonFeedbackPopup({
    isOpen,
    type,
    title,
    description,
    onRetry,
    onClose,
}: LessonFeedbackPopupProps) {
    if (!isOpen) return null;

    const isSuccess = type === "success";

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
                    {isSuccess ? "🎯" : "💭"}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    {isSuccess ? "Correct Move" : "Try Again"}
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

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        onClick={onRetry}
                        className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                    >
                        Làm lại
                    </button>

                    <button
                        onClick={onClose}
                        className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Tiếp tục xem
                    </button>
                </div>
            </div>
        </div>
    );
}