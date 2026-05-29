import GoBoard from "@/components/goban/GoBoard";
import type { Player } from "@/lib/go/types";

type BotPlayPageProps = {
    searchParams: Promise<{
        side?: string;
    }>;
};

export default async function BotPlayPage({ searchParams }: BotPlayPageProps) {
    const { side } = await searchParams;

    const viewerPlayer: Player = side === "white" ? "white" : "black";

    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GoBoard
                    initialGameMode="human-vs-bot"
                    initialViewerPlayer={viewerPlayer}
                />
            </div>
        </main>
    );
}