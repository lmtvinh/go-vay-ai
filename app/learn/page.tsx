import Link from "next/link";

export default function LearnPage() {
    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-5xl space-y-8">
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

                <section className="grid gap-4 md:grid-cols-2">
                    <Link
                        href="/learn/capture"
                        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
                    >
                        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                            Bài học 01
                        </p>

                        <h2 className="mt-3 text-2xl font-bold">
                            Bắt quân trong 1 nước
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-neutral-400">
                            Học cách nhìn khí cuối cùng của quân đối thủ và bắt quân.
                        </p>
                    </Link>
                </section>
            </div>
        </main>
    );
}