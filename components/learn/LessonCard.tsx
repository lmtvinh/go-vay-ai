import Link from "next/link";
import type { Lesson } from "@/lib/learn/lessons";

type LessonCardProps = {
    lesson: Lesson;
    isCompleted?: boolean;
};

export default function LessonCard({
    lesson,
    isCompleted = false,
}: LessonCardProps) {
    const isAvailable = lesson.status === "available";

    const badgeLabel = isCompleted
        ? "Completed"
        : isAvailable
            ? "Available"
            : "Coming soon";

    const badgeClassName = isCompleted
        ? "bg-emerald-400/10 text-emerald-300"
        : isAvailable
            ? "bg-amber-400/10 text-amber-300"
            : "bg-neutral-400/10 text-neutral-400";

    const content = (
        <div
            className={`group rounded-3xl border p-6 transition ${isAvailable
                ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                : "cursor-not-allowed border-white/5 bg-white/[0.015] opacity-60"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                        Bài học {String(lesson.order).padStart(2, "0")}
                    </p>

                    <h2 className="mt-3 text-2xl font-bold text-white">
                        {lesson.title}
                    </h2>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
                >
                    {badgeLabel}
                </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
                {lesson.description}
            </p>

            <div className="mt-5 text-sm font-semibold">
                {isCompleted ? (
                    <span className="text-emerald-300">Ôn lại bài học →</span>
                ) : isAvailable ? (
                    <span className="text-amber-300 group-hover:text-amber-200">
                        Bắt đầu học →
                    </span>
                ) : (
                    <span className="text-neutral-500">Sắp mở khóa</span>
                )}
            </div>
        </div>
    );

    if (!isAvailable) {
        return content;
    }

    return <Link href={lesson.href}>{content}</Link>;
}