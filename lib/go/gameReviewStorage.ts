"use client";

import type {
    Board,
    BotDifficulty,
    GameEndReason,
    GameMode,
    Move,
    Player,
} from "@/lib/go/types";

import type { BasicScoreResult } from "@/lib/go/scoring";

const LATEST_REVIEW_KEY = "go-vay-ai:latest-game-review";
const REVIEW_HISTORY_KEY = "go-vay-ai:game-review-history";
const MAX_REVIEW_HISTORY = 20;

export type SavedGameReview = {
    id: string;
    boardSize: number;
    board: Board;
    moves: Move[];
    blackCaptured: number;
    whiteCaptured: number;
    winner: Player | null;
    endReason: GameEndReason;
    createdAt: string;
    score?: BasicScoreResult;

    gameMode?: GameMode;
    viewerPlayer?: Player;
    botDifficulty?: BotDifficulty;
};

function createReviewId() {
    return `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeReview(review: Omit<SavedGameReview, "id"> | SavedGameReview) {
    return {
        ...review,
        id: "id" in review && review.id ? review.id : createReviewId(),
    };
}

export function saveLatestGameReview(
    review: Omit<SavedGameReview, "id"> | SavedGameReview
) {
    const normalizedReview = normalizeReview(review);

    window.localStorage.setItem(
        LATEST_REVIEW_KEY,
        JSON.stringify(normalizedReview)
    );

    saveReviewToHistory(normalizedReview);
}

export function readLatestGameReview(): SavedGameReview | null {
    try {
        const raw = window.localStorage.getItem(LATEST_REVIEW_KEY);

        if (!raw) return null;

        return JSON.parse(raw) as SavedGameReview;
    } catch {
        return null;
    }
}

export function readGameReviewHistory(): SavedGameReview[] {
    try {
        const raw = window.localStorage.getItem(REVIEW_HISTORY_KEY);

        if (!raw) return [];

        const parsed = JSON.parse(raw) as SavedGameReview[];

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveReviewToHistory(review: SavedGameReview) {
    const currentHistory = readGameReviewHistory();

    const nextHistory = [
        review,
        ...currentHistory.filter((item) => item.id !== review.id),
    ].slice(0, MAX_REVIEW_HISTORY);

    window.localStorage.setItem(
        REVIEW_HISTORY_KEY,
        JSON.stringify(nextHistory)
    );
}

export function readGameReviewById(reviewId: string) {
    return (
        readGameReviewHistory().find((review) => review.id === reviewId) ??
        null
    );
}

export function clearLatestGameReview() {
    window.localStorage.removeItem(LATEST_REVIEW_KEY);
}

export function clearGameReviewHistory() {
    window.localStorage.removeItem(REVIEW_HISTORY_KEY);
    window.localStorage.removeItem(LATEST_REVIEW_KEY);
}