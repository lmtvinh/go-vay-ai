import LessonCard from "@/components/learn/LessonCard";
import { lessons } from "@/lib/learn/lessons";

export default function LearnPage() {
    const availableLessons = lessons.filter(
        (lesson) => lesson.status === "available"
    );

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

                <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-3">
                    <div>
                        <p className="text-sm text-neutral-500">Bài học hiện có</p>
                        <p className="mt-1 text-3xl font-bold text-white">
                            {availableLessons.length}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-neutral-500">Cấp độ hiện tại</p>
                        <p className="mt-1 text-3xl font-bold text-amber-300">
                            Beginner
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-neutral-500">Mục tiêu</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-300">
                            Nắm luật cơ bản
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">Bài học</h2>
                            <p className="mt-1 text-sm text-neutral-500">
                                Đi theo thứ tự để xây nền cờ vây từ luật cơ bản.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {lessons.map((lesson) => (
                            <LessonCard key={lesson.id} lesson={lesson} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}