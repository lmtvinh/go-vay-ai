"use client";

import type { GameEndReason, GameMode, Player } from "@/lib/go/types";

type GameEndPopupProps = {
    isOpen: boolean;
    mode: GameMode;
    winner: Player | null;
    viewerPlayer?: Player;
    reason: GameEndReason;
    onPlayAgain: () => void;
    onExit: () => void;
    onReview?: () => void;
};

function getPlayerLabel(player: Player) {
    return player === "black" ? "Đen" : "Trắng";
}

function getReasonLabel(reason: GameEndReason) {
    if (reason === "resign") return "Ván cờ kết thúc vì có người đầu hàng.";
    if (reason === "double-pass") return "Ván cờ kết thúc vì hai lượt Pass liên tiếp.";
    if (reason === "score") return "Ván cờ kết thúc và đã được tính điểm cơ bản.";
    if (reason === "capture-all") return "Ván cờ kết thúc vì một bên đã bị ăn sạch quân.";
    if (reason === "abandoned") return "Ván cờ đã được lưu trước khi reset hoặc đổi chế độ.";

    return "Ván cờ đã kết thúc.";
}

function getTitle({
    mode,
    winner,
    viewerPlayer,
}: {
    mode: GameMode;
    winner: Player | null;
    viewerPlayer?: Player;
}) {
    if (!winner) return "Ván cờ kết thúc";

    if (mode === "human-vs-bot" && viewerPlayer) {
        return winner === viewerPlayer ? "Bạn thắng!" : "Bạn thua!";
    }

    return `${getPlayerLabel(winner)} thắng!`;
}

export default function GameEndPopup({
    isOpen,
    mode,
    winner,
    viewerPlayer = "black",
    reason,
    onPlayAgain,
    onExit,
    onReview,
}: GameEndPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
                    Game Over
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                    {getTitle({
                        mode,
                        winner,
                        viewerPlayer,
                    })}
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                    {getReasonLabel(reason)}
                </p>

                {winner && (
                    <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300">
                        Người thắng:{" "}
                        <span className="font-semibold text-amber-300">
                            {getPlayerLabel(winner)}
                        </span>
                    </p>
                )}

                <div className="mt-6 grid gap-3">
                    {onReview && (
                        <button
                            type="button"
                            onClick={onReview}
                            className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                        >
                            Xem phân tích
                        </button>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={onPlayAgain}
                            className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                        >
                            Chơi lại
                        </button>

                        <button
                            type="button"
                            onClick={onExit}
                            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Thoát chế độ này
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}