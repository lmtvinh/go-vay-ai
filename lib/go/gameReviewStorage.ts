"use client";

import type {
    Board,
    GameEndReason,
    Move,
    Player,
} from "@/lib/go/types";
import type { BasicScoreResult } from "@/lib/go/scoring";

const STORAGE_KEY = "go-vay-ai:latest-game-review";
export type SavedGameReview = {
    boardSize: number;
    board: Board;
    moves: Move[];
    blackCaptured: number;
    whiteCaptured: number;
    winner: Player | null;
    endReason: GameEndReason;
    createdAt: string;
    score?: BasicScoreResult;
};

export function saveLatestGameReview(review: SavedGameReview) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(review));
}

export function readLatestGameReview(): SavedGameReview | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        return JSON.parse(raw) as SavedGameReview;
    } catch {
        return null;
    }
}

export function clearLatestGameReview() {
    window.localStorage.removeItem(STORAGE_KEY);
}