import GameReviewById from "@/components/review/GameReviewById";

type ReviewDetailPageProps = {
    params: Promise<{
        reviewId: string;
    }>;
};

export default async function ReviewDetailPage({
    params,
}: ReviewDetailPageProps) {
    const { reviewId } = await params;

    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <GameReviewById reviewId={reviewId} />
            </div>
        </main>
    );
}