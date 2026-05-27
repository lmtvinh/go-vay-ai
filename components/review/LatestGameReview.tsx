"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { SavedGameReview } from "@/lib/go/gameReviewStorage";
import { readLatestGameReview } from "@/lib/go/gameReviewStorage";
import GameReplay from "@/components/review/GameReplay";

function getPlayerLabel(player: "black" | "white") {
    return player === "black" ? "Đen" : "Trắng";
}

function getEndReasonLabel(reason: SavedGameReview["endReason"]) {
    if (reason === "resign") return "Đầu hàng";
    if (reason === "double-pass") return "Hai lượt Pass liên tiếp";
    if (reason === "score") return "Tính điểm";
    return "Hoàn thành";
}

export default function LatestGameReview() {
    const [review, setReview] = useState<SavedGameReview | null>(null);

    useEffect(() => {
        setReview(readLatestGameReview());
    }, []);

    if (!review) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h1 className="text-2xl font-bold text-white">
                    Chưa có ván nào để phân tích
                </h1>

                <p className="mt-3 text-neutral-400">
                    Hãy chơi một ván và kết thúc bằng Pass hoặc Resign để xem review.
                </p>

                <Link
                    href="/play"
                    className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
                >
                    Chơi một ván
                </Link>
            </div>
        );
    }

    const stoneMoves = review.moves.filter((move) => move.type === "stone");
    const passMoves = review.moves.filter((move) => move.type === "pass");
    const captureMoves = review.moves.filter(
        (move) => move.type === "stone" && move.captured.length > 0
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                        Game Review
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-white">
                        Phân tích ván gần nhất
                    </h1>

                    <p className="mt-3 text-neutral-400">
                        Đây là bản review cơ bản dựa trên lịch sử nước đi.
                    </p>
                </div>

                <Link
                    href="/play"
                    className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                    Chơi ván mới
                </Link>
            </header>

            <section className="grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Kết thúc bởi</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                        {getEndReasonLabel(review.endReason)}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Người thắng</p>
                    <p className="mt-2 text-2xl font-bold text-amber-300">
                        {review.winner ? getPlayerLabel(review.winner) : "Chưa xác định"}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Tổng nước</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                        {review.moves.length}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Nước bắt quân</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-300">
                        {captureMoves.length}
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Đen đã bắt</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {review.blackCaptured}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Trắng đã bắt</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {review.whiteCaptured}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Pass</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {passMoves.length}
                    </p>
                </div>
            </section>

            <GameReplay moves={review.moves} />

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-2xl font-bold text-white">Nhận xét cơ bản</h2>

                <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                    {captureMoves.length === 0 ? (
                        <p>
                            Ván này chưa có nước bắt quân nào. Bạn có thể luyện thêm bài
                            “Bắt quân trong 1 nước” để nhận ra cơ hội bắt quân tốt hơn.
                        </p>
                    ) : (
                        <p>
                            Ván này có {captureMoves.length} nước bắt quân. Đây là tín
                            hiệu tốt vì người chơi đã bắt đầu nhìn thấy khí và cơ hội
                            tấn công.
                        </p>
                    )}

                    {review.endReason === "double-pass" && (
                        <p>
                            Ván kết thúc bằng hai lượt Pass liên tiếp. Bước tiếp theo là
                            học cách đếm điểm để xác định người thắng.
                        </p>
                    )}

                    {review.endReason === "resign" && review.winner && (
                        <p>
                            Ván kết thúc bằng đầu hàng. {getPlayerLabel(review.winner)} là
                            người thắng ván này.
                        </p>
                    )}
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-2xl font-bold text-white">Lịch sử nước đi</h2>

                <div className="mt-4 max-h-[420px] space-y-2 overflow-auto text-sm">
                    {review.moves.map((move) => (
                        <div
                            key={move.moveNumber}
                            className="rounded-2xl bg-black/20 px-4 py-3 text-neutral-300"
                        >
                            {move.type === "stone" && (
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        #{move.moveNumber} {getPlayerLabel(move.player)} đi
                                        tại hàng {move.row + 1}, cột {move.col + 1}
                                    </span>

                                    {move.captured.length > 0 && (
                                        <span className="text-emerald-300">
                                            Bắt {move.captured.length} quân
                                        </span>
                                    )}
                                </div>
                            )}

                            {move.type === "pass" && (
                                <span>
                                    #{move.moveNumber} {getPlayerLabel(move.player)} Pass
                                </span>
                            )}

                            {move.type === "resign" && (
                                <span>
                                    #{move.moveNumber} {getPlayerLabel(move.player)} đầu hàng.{" "}
                                    {getPlayerLabel(move.winner)} thắng.
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}