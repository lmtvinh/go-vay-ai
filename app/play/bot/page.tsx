import GoBoard from "@/components/goban/GoBoard";
import type { BotDifficulty, Player } from "@/lib/go/types";

type BotPlayPageProps = {
    searchParams: Promise<{
        side?: string;
        level?: string;
        size?: string;
    }>;
};

const SUPPORTED_BOARD_SIZES = [9, 12, 13, 19] as const;

type BoardSize = (typeof SUPPORTED_BOARD_SIZES)[number];

function getBotDifficulty(level?: string): BotDifficulty {
    if (level === "easy") return "easy";
    if (level === "hard") return "hard";
    return "normal";
}

function getBoardSize(size?: string): BoardSize {
    const parsedSize = Number(size);

    if (SUPPORTED_BOARD_SIZES.includes(parsedSize as BoardSize)) {
        return parsedSize as BoardSize;
    }

    return 9;
}

export default async function BotPlayPage({ searchParams }: BotPlayPageProps) {
    const { side, level, size } = await searchParams;

    const viewerPlayer: Player = side === "white" ? "white" : "black";
    const botDifficulty = getBotDifficulty(level);
    const boardSize = getBoardSize(size);

    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GoBoard
                    initialGameMode="human-vs-bot"
                    initialViewerPlayer={viewerPlayer}
                    initialBotDifficulty={botDifficulty}
                    initialBoardSize={boardSize}
                />
            </div>
        </main>
    );
}