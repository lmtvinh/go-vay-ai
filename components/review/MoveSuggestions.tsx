"use client";

import { useMemo, useState } from "react";

import type { Move, Player, Point } from "@/lib/go/types";
import { getBasicMoveSuggestions } from "@/lib/go/reviewSuggestions";

type PlayerFilter = "all" | Player;

type MoveSuggestionsProps = {
    moves: Move[];
    onFocusPoint?: (point: Point) => void;
};

function getPlayerLabel(player: Player) {
    return player === "black" ? "Đen" : "Trắng";
}

function getFilterLabel(filter: PlayerFilter) {
    if (filter === "all") return "Tất cả";
    return getPlayerLabel(filter);
}

function getSeverityLabel(severity: "low" | "medium" | "high") {
    if (severity === "high") return "Quan trọng";
    if (severity === "medium") return "Nên xem lại";
    return "Gợi ý nhẹ";
}

function getSeverityClassName(severity: "low" | "medium" | "high") {
    if (severity === "high") return "bg-red-400/10 text-red-300";
    if (severity === "medium") return "bg-amber-400/10 text-amber-300";
    return "bg-emerald-400/10 text-emerald-300";
}

export default function MoveSuggestions({
    moves,
    onFocusPoint,
}: MoveSuggestionsProps) {
    const [playerFilter, setPlayerFilter] = useState<PlayerFilter>("all");

    const allSuggestions = useMemo(() => getBasicMoveSuggestions(moves), [moves]);

    const filteredSuggestions = useMemo(() => {
        if (playerFilter === "all") return allSuggestions;

        return allSuggestions.filter(
            (suggestion) => suggestion.player === playerFilter
        );
    }, [allSuggestions, playerFilter]);

    const blackSuggestionCount = allSuggestions.filter(
        (suggestion) => suggestion.player === "black"
    ).length;

    const whiteSuggestionCount = allSuggestions.filter(
        (suggestion) => suggestion.player === "white"
    ).length;

    const filterOptions: Array<{
        value: PlayerFilter;
        label: string;
        count: number;
    }> = [
        {
            value: "all",
            label: "Tất cả",
            count: allSuggestions.length,
        },
        {
            value: "black",
            label: "Đen",
            count: blackSuggestionCount,
        },
        {
            value: "white",
            label: "Trắng",
            count: whiteSuggestionCount,
        },
    ];

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Gợi ý nước đi tốt hơn
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                        Review này phân tích nước đi của cả Đen và Trắng. Bạn có thể
                        lọc theo từng người chơi để xem bên nào cần cải thiện nước nào.
                    </p>
                </div>

                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-300">
                    {filteredSuggestions.length} gợi ý
                </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setPlayerFilter(option.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            playerFilter === option.value
                                ? "border-amber-300 bg-amber-400 text-black"
                                : "border-white/20 text-white hover:bg-white/10"
                        }`}
                    >
                        {option.label} ({option.count})
                    </button>
                ))}
            </div>

            {filteredSuggestions.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-sm leading-6 text-neutral-300">
                        Chưa phát hiện gợi ý rõ ràng cho{" "}
                        <span className="font-semibold text-amber-300">
                            {getFilterLabel(playerFilter)}
                        </span>{" "}
                        trong bản phân tích cơ bản này.
                    </p>

                    <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Điều này không có nghĩa là người chơi đã đi hoàn hảo. Bản hiện tại
                        mới dùng heuristic cơ bản như bắt quân, số khí và độ an toàn của
                        nhóm. Sau này khi tích hợp KataGo, phần này sẽ chính xác hơn nhiều.
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {filteredSuggestions.map((suggestion) => (
                        <article
                            key={`${suggestion.moveNumber}-${suggestion.player}`}
                            className="rounded-2xl border border-white/10 bg-black/20 p-5"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm text-neutral-500">
                                        Nước #{suggestion.moveNumber} ·{" "}
                                        {getPlayerLabel(suggestion.player)}
                                    </p>

                                    <h3 className="mt-1 text-lg font-bold text-white">
                                        {suggestion.title}
                                    </h3>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityClassName(
                                        suggestion.severity
                                    )}`}
                                >
                                    {getSeverityLabel(suggestion.severity)}
                                </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-neutral-300">
                                Nước đã đi:{" "}
                                <span className="font-semibold text-white">
                                    {suggestion.actualMove.label}
                                </span>
                            </p>

                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                                {suggestion.description}
                            </p>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                {suggestion.suggestedMoves.map((move, index) => (
                                    <button
                                        key={`${suggestion.moveNumber}-${move.row}-${move.col}`}
                                        type="button"
                                        onClick={() =>
                                            onFocusPoint?.({
                                                row: move.row,
                                                col: move.col,
                                            })
                                        }
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-amber-300/40 hover:bg-white/[0.06]"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                            Gợi ý {index + 1}
                                        </p>

                                        <p className="mt-2 font-semibold text-amber-300">
                                            {move.label}
                                        </p>

                                        <p className="mt-2 text-xs leading-5 text-neutral-400">
                                            {move.reason}
                                        </p>

                                        <p className="mt-3 text-xs text-neutral-500">
                                            Click để highlight trên bàn replay.
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}