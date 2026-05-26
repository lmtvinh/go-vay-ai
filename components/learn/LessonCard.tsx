import Link from "next/link";
import type { Lesson } from "@/lib/learn/lessons";

type LessonCardProps = {
    lesson: Lesson;
};

export default function LessonCard({ lesson }: LessonCardProps) {
    const isAvailable = lesson.status === "available";

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
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-neutral-400/10 text-neutral-400"
                        }`}
                >
                    {isAvailable ? "Available" : "Coming soon"}
                </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
                {lesson.description}
            </p>

            <div className="mt-5 text-sm font-semibold">
                {isAvailable ? (
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