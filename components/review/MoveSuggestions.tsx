"use client";

import { useMemo } from "react";

import type { Move } from "@/lib/go/types";
import { getBasicMoveSuggestions } from "@/lib/go/reviewSuggestions";

type MoveSuggestionsProps = {
    moves: Move[];
};

function getPlayerLabel(player: "black" | "white") {
    return player === "black" ? "Đen" : "Trắng";
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

export default function MoveSuggestions({ moves }: MoveSuggestionsProps) {
    const suggestions = useMemo(() => getBasicMoveSuggestions(moves), [moves]);

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Gợi ý nước đi tốt hơn
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                        Đây là phân tích cơ bản dựa trên bắt quân, số khí và mức độ
                        an toàn của nhóm quân. Bản AI mạnh hơn sẽ được tích hợp sau.
                    </p>
                </div>

                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-300">
                    {suggestions.length} gợi ý
                </span>
            </div>

            {suggestions.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-sm leading-6 text-neutral-300">
                        Chưa phát hiện nước đi nào có thể cải thiện rõ ràng trong bản
                        phân tích cơ bản. Hãy chơi thêm nhiều ván để hệ thống có dữ liệu
                        tốt hơn.
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {suggestions.map((suggestion) => (
                        <article
                            key={suggestion.moveNumber}
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
                                    <div
                                        key={`${move.row}-${move.col}`}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
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
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}