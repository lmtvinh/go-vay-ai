"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import GameReplay from "@/components/review/GameReplay";
import MoveSuggestions from "@/components/review/MoveSuggestions";
import ScoreTerritoryBoard from "@/components/review/ScoreTerritoryBoard";

import type { FocusSuggestionPayload } from "@/components/review/MoveSuggestions";
import type { SavedGameReview } from "@/lib/go/gameReviewStorage";
import { readLatestGameReview } from "@/lib/go/gameReviewStorage";

function getPlayerLabel(player: "black" | "white") {
    return player === "black" ? "Đen" : "Trắng";
}

function getEndReasonLabel(reason: SavedGameReview["endReason"]) {
    if (reason === "resign") return "Đầu hàng";
    if (reason === "double-pass") return "Hai lượt Pass liên tiếp";
    if (reason === "score") return "Tính điểm";
    return "Hoàn thành";
}

function getReviewBoardSize(review: SavedGameReview) {
    return review.boardSize ?? review.board.length;
}

export default function LatestGameReview() {
    const replaySectionRef = useRef<HTMLDivElement | null>(null);

    const [review, setReview] = useState<SavedGameReview | null>(null);
    const [focusedReviewSuggestion, setFocusedReviewSuggestion] =
        useState<FocusSuggestionPayload | null>(null);

    useEffect(() => {
        setReview(readLatestGameReview());
    }, []);

    function handleFocusSuggestion(payload: FocusSuggestionPayload) {
        setFocusedReviewSuggestion(payload);

        window.setTimeout(() => {
            replaySectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 0);
    }

    function clearFocusedSuggestion() {
        setFocusedReviewSuggestion(null);
    }

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

    const boardSize = getReviewBoardSize(review);

    const stoneMoves = review.moves.filter((move) => move.type === "stone");
    const passMoves = review.moves.filter((move) => move.type === "pass");

    const blackMoves = stoneMoves.filter((move) => move.player === "black");
    const whiteMoves = stoneMoves.filter((move) => move.player === "white");

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
                        Đây là bản review cơ bản dựa trên lịch sử nước đi. Với PvP,
                        phần gợi ý có thể xem theo cả hai bên: Tất cả, Đen hoặc Trắng.
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
                    <p className="text-sm text-neutral-500">Kích thước bàn</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-300">
                        {boardSize}x{boardSize}
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
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
                    <p className="text-sm text-neutral-500">Nước Đen</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {blackMoves.length}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Nước Trắng</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {whiteMoves.length}
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Nước bắt quân</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-300">
                        {captureMoves.length}
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-neutral-500">Pass</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {passMoves.length}
                    </p>
                </div>
            </section>

            {review.score && (
                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Điểm cơ bản
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-neutral-400">
                                Đây là cách tính đơn giản để người mới hiểu ván cờ.
                                Điểm gồm quân còn trên bàn, vùng đất được bao quanh và
                                số quân đã bắt.
                            </p>
                        </div>

                        <div className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-black">
                            {review.score.winner
                                ? `${getPlayerLabel(review.score.winner)} thắng ${review.score.margin
                                } điểm`
                                : "Hòa"}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <h3 className="font-bold text-white">Đen</h3>

                            <div className="mt-3 space-y-2 text-sm text-neutral-300">
                                <p>Quân trên bàn: {review.score.blackStones}</p>
                                <p>Đất: {review.score.blackTerritory}</p>
                                <p>Quân đã bắt: {review.score.blackCaptured}</p>
                                <p className="pt-2 text-lg font-bold text-amber-300">
                                    Tổng: {review.score.blackTotal}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <h3 className="font-bold text-white">Trắng</h3>

                            <div className="mt-3 space-y-2 text-sm text-neutral-300">
                                <p>Quân trên bàn: {review.score.whiteStones}</p>
                                <p>Đất: {review.score.whiteTerritory}</p>
                                <p>Quân đã bắt: {review.score.whiteCaptured}</p>
                                <p className="pt-2 text-lg font-bold text-amber-300">
                                    Tổng: {review.score.whiteTotal}
                                </p>
                            </div>
                        </div>
                    </div>

                    <ScoreTerritoryBoard
                        board={review.board}
                        score={review.score}
                    />

                    {review.score.neutralTerritory > 0 && (
                        <p className="mt-4 text-sm text-neutral-500">
                            Vùng trung lập/chưa rõ:{" "}
                            {review.score.neutralTerritory} điểm.
                        </p>
                    )}
                </section>
            )}

            {focusedReviewSuggestion && (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-5 py-3 text-sm text-amber-200">
                    Đang xem thử gợi ý {focusedReviewSuggestion.label} cho{" "}
                    {getPlayerLabel(focusedReviewSuggestion.player)} ở nước #
                    {focusedReviewSuggestion.moveNumber}. Bàn replay đã được cuộn lên
                    phía trên.
                </div>
            )}

            <div ref={replaySectionRef}>
                <GameReplay
                    moves={review.moves}
                    boardSize={boardSize}
                    focusedPoint={focusedReviewSuggestion?.point ?? null}
                    focusedLibertyPoints={
                        focusedReviewSuggestion?.libertyPoints ?? []
                    }
                    focusedBoard={focusedReviewSuggestion?.board ?? null}
                    focusedMoveNumber={
                        focusedReviewSuggestion?.moveNumber ?? null
                    }
                    focusedLabel={focusedReviewSuggestion?.label ?? null}
                    focusedReason={focusedReviewSuggestion?.reason ?? null}
                    onClearFocus={clearFocusedSuggestion}
                />
            </div>

            <MoveSuggestions
                moves={review.moves}
                onFocusSuggestion={handleFocusSuggestion}
            />

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

                    {review.endReason === "score" && review.score && (
                        <p>
                            Ván kết thúc bằng tính điểm cơ bản.{" "}
                            {review.score.winner
                                ? `${getPlayerLabel(review.score.winner)} thắng ${review.score.margin
                                } điểm.`
                                : "Hai bên hòa điểm."}
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