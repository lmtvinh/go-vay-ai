"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "go-vay-ai:lesson-progress";

type LessonProgress = {
    completedLessonIds: string[];
};

function readProgress(): LessonProgress {
    if (typeof window === "undefined") {
        return {
            completedLessonIds: [],
        };
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return {
                completedLessonIds: [],
            };
        }

        const parsed = JSON.parse(raw) as LessonProgress;

        return {
            completedLessonIds: Array.isArray(parsed.completedLessonIds)
                ? parsed.completedLessonIds
                : [],
        };
    } catch {
        return {
            completedLessonIds: [],
        };
    }
}

function saveProgress(progress: LessonProgress) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useLessonProgress() {
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

    useEffect(() => {
        const progress = readProgress();
        setCompletedLessonIds(progress.completedLessonIds);
    }, []);

    const completedLessonSet = useMemo(
        () => new Set(completedLessonIds),
        [completedLessonIds]
    );

    function markLessonCompleted(lessonId: string) {
        setCompletedLessonIds((current) => {
            if (current.includes(lessonId)) return current;

            const next = [...current, lessonId];

            saveProgress({
                completedLessonIds: next,
            });

            return next;
        });
    }

    function resetProgress() {
        saveProgress({
            completedLessonIds: [],
        });

        setCompletedLessonIds([]);
    }

    function isLessonCompleted(lessonId: string) {
        return completedLessonSet.has(lessonId);
    }

    return {
        completedLessonIds,
        completedLessonSet,
        markLessonCompleted,
        resetProgress,
        isLessonCompleted,
    };
}