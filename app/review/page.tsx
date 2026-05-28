import GameReviewList from "@/components/review/GameReviewList";

export default function ReviewPage() {
    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GameReviewList />
            </div>
        </main>
    );
}