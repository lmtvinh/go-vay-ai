"use client";

import LessonCard from "@/components/learn/LessonCard";
import { lessons } from "@/lib/learn/lessons";
import { useLessonProgress } from "@/lib/learn/useLessonProgress";

export default function LessonRoadmap() {
    const { completedLessonIds, isLessonCompleted, resetProgress } =
        useLessonProgress();

    const availableLessons = lessons.filter(
        (lesson) => lesson.status === "available"
    );

    const completedCount = availableLessons.filter((lesson) =>
        isLessonCompleted(lesson.id)
    ).length;

    const progressPercent =
        availableLessons.length === 0
            ? 0
            : Math.round((completedCount / availableLessons.length) * 100);

    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                        Learn Go
                    </p>

                    <h1 className="text-4xl font-bold">Lộ trình học cờ vây</h1>

                    <p className="max-w-2xl text-neutral-400">
                        Học cờ vây bằng bài học tương tác: nhìn thế cờ, chọn nước
                        đi, nhận phản hồi và hiểu vì sao đúng hoặc sai.
                    </p>
                </header>

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-neutral-500">
                                Bài học hiện có
                            </p>
                            <p className="mt-1 text-3xl font-bold text-white">
                                {availableLessons.length}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-neutral-500">
                                Đã hoàn thành
                            </p>
                            <p className="mt-1 text-3xl font-bold text-emerald-300">
                                {completedCount}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-neutral-500">Tiến độ</p>
                            <p className="mt-1 text-3xl font-bold text-amber-300">
                                {progressPercent}%
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{
                                    width: `${progressPercent}%`,
                                }}
                            />
                        </div>
                    </div>

                    {completedLessonIds.length > 0 && (
                        <button
                            onClick={resetProgress}
                            className="mt-5 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Reset tiến độ
                        </button>
                    )}
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold">Bài học</h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Đi theo thứ tự để xây nền cờ vây từ luật cơ bản.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {lessons.map((lesson) => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                isCompleted={isLessonCompleted(lesson.id)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}