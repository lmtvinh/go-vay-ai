import Link from "next/link";

export default function PlayModeSelector() {
    return (
        <div className="space-y-8">
            <header className="text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                    Play
                </p>

                <h1 className="mt-3 text-4xl font-bold text-white">
                    Chọn chế độ chơi
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
                    Chọn cách bạn muốn chơi trước khi vào bàn cờ. Bàn cờ sẽ chỉ
                    tập trung vào việc chơi, không còn panel chọn chế độ bên trong.
                </p>
            </header>

            <section className="grid gap-5 md:grid-cols-2">
                <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="text-2xl font-bold text-white">
                        Người vs Người
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-neutral-400">
                        Hai người chơi trên cùng một máy. Phù hợp để luyện luật,
                        thử thế cờ và học cách bắt quân.
                    </p>

                    <Link
                        href="/play/pvp"
                        className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
                    >
                        Chơi PvP
                    </Link>
                </article>

                <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="mt-6 space-y-4">
                        {[
                            {
                                level: "easy",
                                title: "Dễ",
                                description: "Bot chọn nước hợp lệ đơn giản, phù hợp để làm quen.",
                            },
                            {
                                level: "normal",
                                title: "Thường",
                                description: "Bot ưu tiên bắt quân và chọn nước có nhiều khí.",
                            },
                            {
                                level: "hard",
                                title: "Khó",
                                description: "Bot đánh an toàn hơn và ưu tiên vị trí tốt hơn.",
                            },
                        ].map((option) => (
                            <div
                                key={option.level}
                                className="rounded-2xl border border-white/10 bg-black/20 p-4"
                            >
                                <div>
                                    <h3 className="font-bold text-white">{option.title}</h3>
                                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                                        {option.description}
                                    </p>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <Link
                                        href={`/play/bot?side=black&level=${option.level}`}
                                        className="rounded-full bg-emerald-400 px-5 py-2 text-center text-sm font-semibold text-black transition hover:bg-emerald-300"
                                    >
                                        Tôi cầm Đen
                                    </Link>

                                    <Link
                                        href={`/play/bot?side=white&level=${option.level}`}
                                        className="rounded-full border border-white/20 px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Tôi cầm Trắng
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}