import GoBoard from "@/components/goban/GoBoard";

type PvPPlayPageProps = {
    searchParams: Promise<{
        size?: string;
    }>;
};

const SUPPORTED_BOARD_SIZES = [9, 12, 13, 19] as const;

type BoardSize = (typeof SUPPORTED_BOARD_SIZES)[number];

function getBoardSize(size?: string): BoardSize {
    const parsedSize = Number(size);

    if (SUPPORTED_BOARD_SIZES.includes(parsedSize as BoardSize)) {
        return parsedSize as BoardSize;
    }

    return 9;
}

export default async function PvPPlayPage({ searchParams }: PvPPlayPageProps) {
    const { size } = await searchParams;

    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GoBoard
                    initialGameMode="pvp-local"
                    initialViewerPlayer="black"
                    initialBoardSize={getBoardSize(size)}
                />
            </div>
        </main>
    );
}