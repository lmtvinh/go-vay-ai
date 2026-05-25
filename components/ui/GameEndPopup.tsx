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
};

function getPlayerLabel(player: Player) {
    return player === "black" ? "Đen" : "Trắng";
}

function getGameEndContent({
    mode,
    winner,
    viewerPlayer,
    reason,
}: {
    mode: GameMode;
    winner: Player | null;
    viewerPlayer?: Player;
    reason: GameEndReason;
}) {
    if (reason === "double-pass" && !winner) {
        return {
            badge: "Ván cờ kết thúc",
            title: "Hai người chơi đã Pass liên tiếp",
            description:
                "Ván cờ đã kết thúc. Phiên bản hiện tại chưa có tính điểm tự động, nên chưa xác định người thắng.",
            tone: "neutral" as const,
        };
    }

    if (!winner) {
        return {
            badge: "Ván cờ kết thúc",
            title: "Game Over",
            description: "Ván cờ đã kết thúc.",
            tone: "neutral" as const,
        };
    }

    const loser = winner === "black" ? "white" : "black";

    if (mode === "pvp-local") {
        return {
            badge: "PVP Result",
            title: `${getPlayerLabel(winner)} thắng`,
            description: `${getPlayerLabel(winner)} đã thắng. ${getPlayerLabel(
                loser
            )} thua ván này.`,
            tone: "win" as const,
        };
    }

    if (mode === "pvp-online") {
        const isViewerWinner = viewerPlayer === winner;

        return {
            badge: "Online Match Result",
            title: isViewerWinner ? "Bạn đã thắng" : "Bạn đã thua",
            description: isViewerWinner
                ? "Bạn đã thắng người chơi đối thủ. Có thể chơi lại hoặc rời khỏi phòng."
                : "Bạn đã thua ván này. Bạn có thể chơi lại để phục thù hoặc rời khỏi phòng.",
            tone: isViewerWinner ? ("win" as const) : ("lose" as const),
        };
    }

    if (mode === "human-bot") {
        const isViewerWinner = viewerPlayer === winner;

        return {
            badge: "Bot Match Result",
            title: isViewerWinner ? "Bạn đã thắng Bot" : "Bạn đã thua Bot",
            description: isViewerWinner
                ? "Bạn đã đánh bại Bot. Hãy thử nâng cấp độ khó ở ván tiếp theo."
                : "Bot đã thắng ván này. Hãy chơi lại để luyện thêm kỹ năng đọc khí và bắt quân.",
            tone: isViewerWinner ? ("win" as const) : ("lose" as const),
        };
    }

    if (mode === "human-ai-coach") {
        const isViewerWinner = viewerPlayer === winner;

        return {
            badge: "AI Coach Result",
            title: isViewerWinner ? "Bạn đã vượt qua AI Coach" : "AI Coach đã thắng",
            description: isViewerWinner
                ? "Bạn chơi tốt ván này. Sau này AI Coach có thể phân tích lại các nước đi quan trọng."
                : "Đây là cơ hội tốt để học. Sau này AI Coach sẽ giải thích vì sao bạn mất lợi thế.",
            tone: isViewerWinner ? ("win" as const) : ("lose" as const),
        };
    }

    if (mode === "lesson") {
        return {
            badge: "Lesson Complete",
            title: "Hoàn thành bài học",
            description:
                "Bạn đã hoàn thành bài học hiện tại. Có thể luyện lại hoặc thoát về lộ trình học.",
            tone: "win" as const,
        };
    }

    return {
        badge: "Tutorial Complete",
        title: "Hoàn thành hướng dẫn",
        description:
            "Bạn đã hoàn thành phần hướng dẫn. Có thể chơi lại để luyện tập hoặc quay về trang học.",
        tone: "win" as const,
    };
}

export default function GameEndPopup({
    isOpen,
    mode,
    winner,
    viewerPlayer,
    reason,
    onPlayAgain,
    onExit,
}: GameEndPopupProps) {
    if (!isOpen) return null;

    const content = getGameEndContent({
        mode,
        winner,
        viewerPlayer,
        reason,
    });

    const titleColor =
        content.tone === "win"
            ? "text-emerald-300"
            : content.tone === "lose"
                ? "text-red-300"
                : "text-amber-300";

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
                    {content.tone === "lose" ? "💭" : content.tone === "win" ? "🏆" : "⚪"}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    {content.badge}
                </p>

                <h2 className={`mt-3 text-2xl font-bold ${titleColor}`}>
                    {content.title}
                </h2>

                <p className="mt-4 text-sm leading-6 text-neutral-300">
                    {content.description}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        onClick={onPlayAgain}
                        className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                    >
                        Chơi lại
                    </button>

                    <button
                        onClick={onExit}
                        className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Thoát chế độ này
                    </button>
                </div>
            </div>
        </div>
    );
}