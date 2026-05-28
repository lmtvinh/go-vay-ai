"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import LatestGameReview from "@/components/review/LatestGameReview";

import type { SavedGameReview } from "@/lib/go/gameReviewStorage";
import {
    readGameReviewById,
    saveLatestGameReview,
} from "@/lib/go/gameReviewStorage";

type GameReviewByIdProps = {
    reviewId: string;
};

export default function GameReviewById({ reviewId }: GameReviewByIdProps) {
    const [review, setReview] = useState<SavedGameReview | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const foundReview = readGameReviewById(reviewId);

        if (foundReview) {
            saveLatestGameReview(foundReview);
            setReview(foundReview);
        }

        setIsLoaded(true);
    }, [reviewId]);

    if (!isLoaded) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h1 className="text-2xl font-bold text-white">
                    Đang tải review...
                </h1>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <h1 className="text-2xl font-bold text-white">
                    Không tìm thấy review
                </h1>

                <p className="mt-3 text-neutral-400">
                    Ván này có thể đã bị xóa khỏi lịch sử localStorage.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <Link
                        href="/review"
                        className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                    >
                        Về lịch sử review
                    </Link>

                    <Link
                        href="/play"
                        className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
                    >
                        Chơi ván mới
                    </Link>
                </div>
            </div>
        );
    }

    return <LatestGameReview />;
}