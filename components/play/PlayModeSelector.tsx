"use client";

import { useState } from "react";
import Link from "next/link";

const BOARD_SIZES = [9, 12, 13, 19] as const;

const BOT_LEVELS = [
    {
        level: "easy",
        title: "Dễ",
        description: "Bot đi đơn giản, phù hợp để làm quen.",
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

type BoardSize = (typeof BOARD_SIZES)[number];
type BotLevel = (typeof BOT_LEVELS)[number]["level"];

export default function PlayModeSelector() {
    const [selectedBoardSize, setSelectedBoardSize] = useState<BoardSize>(9);
    const [selectedBotLevel, setSelectedBotLevel] =
        useState<BotLevel>("normal");

    const selectedBotLevelInfo = BOT_LEVELS.find(
        (level) => level.level === selectedBotLevel
    );

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
                    Chọn kích thước bàn trước, sau đó chọn chế độ chơi. Nếu không
                    chọn, bàn mặc định là 9x9.
                </p>
            </header>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Chọn kích thước bàn
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                            Người mới nên bắt đầu với 9x9. Khi quen luật hơn, bạn có
                            thể thử 13x13 hoặc 19x19.
                        </p>
                    </div>

                    <div className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-black">
                        Đang chọn {selectedBoardSize}x{selectedBoardSize}
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    {BOARD_SIZES.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedBoardSize(size)}
                            className={`rounded-2xl border px-5 py-4 text-center font-semibold transition ${selectedBoardSize === size
                                ? "border-amber-300 bg-amber-400 text-black"
                                : "border-white/10 bg-black/20 text-white hover:bg-white/10"
                                }`}
                        >
                            {size}x{size}
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
                <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex h-full flex-col justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                                Local
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Người vs Người
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-neutral-400">
                                Hai người chơi trên cùng một máy. Phù hợp để luyện
                                luật, thử thế cờ và học cách bắt quân.
                            </p>
                        </div>

                        <Link
                            href={`/play/pvp?size=${selectedBoardSize}`}
                            className="mt-6 inline-flex w-full justify-center rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
                        >
                            Chơi PvP với bàn {selectedBoardSize}x
                            {selectedBoardSize}
                        </Link>
                    </div>
                </article>

                <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                            Practice
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Người vs Bot
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-neutral-400">
                            Chơi với bot cơ bản. Bot sẽ ưu tiên bắt quân, tránh nước
                            quá nguy hiểm và chọn nước có nhiều khí hơn.
                        </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-semibold text-white">
                            Độ khó bot
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            {BOT_LEVELS.map((level) => (
                                <button
                                    key={level.level}
                                    type="button"
                                    onClick={() => setSelectedBotLevel(level.level)}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedBotLevel === level.level
                                        ? "border-emerald-300 bg-emerald-400 text-black"
                                        : "border-white/20 text-white hover:bg-white/10"
                                        }`}
                                >
                                    {level.title}
                                </button>
                            ))}
                        </div>

                        <p className="mt-3 text-xs leading-5 text-neutral-500">
                            {selectedBotLevelInfo?.description}
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Link
                            href={`/play/bot?side=black&level=${selectedBotLevel}&size=${selectedBoardSize}`}
                            className="rounded-full bg-emerald-400 px-6 py-3 text-center font-semibold text-black transition hover:bg-emerald-300"
                        >
                            Tôi cầm Đen
                        </Link>

                        <Link
                            href={`/play/bot?side=white&level=${selectedBotLevel}&size=${selectedBoardSize}`}
                            className="rounded-full border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                        >
                            Tôi cầm Trắng
                        </Link>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-neutral-500">
                        Bàn đang chọn: {selectedBoardSize}x{selectedBoardSize}. Nếu
                        bạn cầm Trắng, bot cầm Đen và sẽ đi trước.
                    </p>
                </article>
            </section>
        </div>
    );
}