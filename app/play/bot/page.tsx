import GoBoard from "@/components/goban/GoBoard";
import type { BotDifficulty, Player } from "@/lib/go/types";

type BotPlayPageProps = {
    searchParams: Promise<{
        side?: string;
        level?: string;
    }>;
};

function getBotDifficulty(level?: string): BotDifficulty {
    if (level === "easy") return "easy";
    if (level === "hard") return "hard";
    return "normal";
}

export default async function BotPlayPage({ searchParams }: BotPlayPageProps) {
    const { side, level } = await searchParams;

    const viewerPlayer: Player = side === "white" ? "white" : "black";
    const botDifficulty = getBotDifficulty(level);

    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GoBoard
                    initialGameMode="human-vs-bot"
                    initialViewerPlayer={viewerPlayer}
                    initialBotDifficulty={botDifficulty}
                />
            </div>
        </main>
    );
}