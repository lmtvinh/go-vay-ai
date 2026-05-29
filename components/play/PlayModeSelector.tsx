import Link from "next/link";

const BOARD_SIZES = [9, 12, 13, 19] as const;

const BOT_LEVELS = [
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
] as const;

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
                    Chọn chế độ, kích thước bàn và bên cầm quân trước khi vào ván.
                </p>
            </header>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-2xl font-bold text-white">Người vs Người</h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Hai người chơi trên cùng một máy. Phù hợp để luyện luật, thử thế cờ
                    và học cách bắt quân.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                    {BOARD_SIZES.map((size) => (
                        <Link
                            key={size}
                            href={`/play/pvp?size=${size}`}
                            className="rounded-full bg-amber-400 px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-amber-300"
                        >
                            Bàn {size}x{size}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-2xl font-bold text-white">Người vs Bot</h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Chơi với bot cơ bản. Bot sẽ ưu tiên bắt quân và chọn nước có nhiều khí hơn.
                </p>

                <div className="mt-6 space-y-5">
                    {BOT_LEVELS.map((option) => (
                        <div
                            key={option.level}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                            <h3 className="font-bold text-white">{option.title}</h3>

                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                                {option.description}
                            </p>

                            <div className="mt-4 space-y-4">
                                {BOARD_SIZES.map((size) => (
                                    <div
                                        key={`${option.level}-${size}`}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                                    >
                                        <p className="text-sm font-semibold text-neutral-300">
                                            Bàn {size}x{size}
                                        </p>

                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            <Link
                                                href={`/play/bot?side=black&level=${option.level}&size=${size}`}
                                                className="rounded-full bg-emerald-400 px-5 py-2 text-center text-sm font-semibold text-black transition hover:bg-emerald-300"
                                            >
                                                Tôi cầm Đen
                                            </Link>

                                            <Link
                                                href={`/play/bot?side=white&level=${option.level}&size=${size}`}
                                                className="rounded-full border border-white/20 px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                            >
                                                Tôi cầm Trắng
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}