import GoBoard from "@/components/goban/GoBoard";

export default function PvPPlayPage() {
    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GoBoard
                    initialGameMode="pvp-local"
                    initialViewerPlayer="black"
                />
            </div>
        </main>
    );
}