"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { SavedGameReview } from "@/lib/go/gameReviewStorage";
import {
    clearGameReviewHistory,
    readGameReviewHistory,
} from "@/lib/go/gameReviewStorage";

function getPlayerLabel(player: "black" | "white") {
    return player === "black" ? "Đen" : "Trắng";
}

function getEndReasonLabel(reason: SavedGameReview["endReason"]) {
    if (reason === "resign") return "Đầu hàng";
    if (reason === "double-pass") return "Hai lượt Pass";
    if (reason === "score") return "Tính điểm";
    return "Hoàn thành";
}

function formatDate(value: string) {
    try {
        return new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

function getGameModeLabel(review: SavedGameReview) {
    if (review.gameMode === "human-vs-bot") return "Người vs Bot";
    return "Người vs Người";
}

function getBotDifficultyLabel(review: SavedGameReview) {
    if (review.botDifficulty === "easy") return "Dễ";
    if (review.botDifficulty === "hard") return "Khó";
    return "Thường";
}

export default function GameReviewList() {
    const [reviews, setReviews] = useState<SavedGameReview[]>([]);

    useEffect(() => {
        setReviews(readGameReviewHistory());
    }, []);

    function handleClearHistory() {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa toàn bộ lịch sử review không?"
        );

        if (!confirmed) return;

        clearGameReviewHistory();
        setReviews([]);
    }

    if (reviews.length === 0) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h1 className="text-3xl font-bold text-white">
                    Chưa có lịch sử ván đấu
                </h1>

                <p className="mt-3 text-neutral-400">
                    Hãy chơi một ván và kết thúc bằng Pass hoặc Resign để tạo review.
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

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                        Review History
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-white">
                        Lịch sử phân tích ván đấu
                    </h1>

                    <p className="mt-3 text-neutral-400">
                        Xem lại các ván đã chơi gần đây. Hiện tại hệ thống lưu tối đa
                        20 ván gần nhất trên trình duyệt của bạn.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/play"
                        className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Chơi ván mới
                    </Link>

                    <button
                        type="button"
                        onClick={handleClearHistory}
                        className="rounded-full border border-red-400/40 px-5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
                    >
                        Xóa lịch sử
                    </button>
                </div>
            </header>

            <section className="grid gap-4">
                {reviews.map((review, index) => (
                    <article
                        key={review.id}
                        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-sm text-neutral-500">
                                    Ván #{reviews.length - index} ·{" "}
                                    {formatDate(review.createdAt)}
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    Bàn {review.boardSize}x{review.boardSize} ·{" "}
                                    {getGameModeLabel(review)} · {getEndReasonLabel(review.endReason)}
                                </h2>

                                <p className="mt-2 text-sm text-neutral-400">
                                    Tổng nước: {review.moves.length} · Đen bắt{" "}
                                    {review.blackCaptured} · Trắng bắt{" "}
                                    {review.whiteCaptured}
                                </p>

                                {review.gameMode === "human-vs-bot" && (
                                    <p className="mt-2 text-sm text-neutral-500">
                                        Bạn cầm {getPlayerLabel(review.viewerPlayer ?? "black")} · Bot{" "}
                                        {getBotDifficultyLabel(review)}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300">
                                    Người thắng:{" "}
                                    <span className="font-semibold text-amber-300">
                                        {review.winner
                                            ? getPlayerLabel(review.winner)
                                            : "Chưa xác định"}
                                    </span>
                                </div>

                                {review.score && (
                                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300">
                                        Điểm: Đen {review.score.blackTotal} - Trắng{" "}
                                        {review.score.whiteTotal}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href={`/review/${review.id}`}
                                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
                            >
                                Xem chi tiết
                            </Link>

                            {index === 0 && (
                                <Link
                                    href="/review/latest"
                                    className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Xem latest
                                </Link>
                            )}
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}