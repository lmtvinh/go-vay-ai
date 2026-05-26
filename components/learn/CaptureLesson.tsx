"use client";

import { useState } from "react";
import Link from "next/link";

import {
    createEmptyBoard,
    getStoneGroupAnalysis,
    placeStone,
} from "@/lib/go/board";

import type { Board, Player, Point } from "@/lib/go/types";
import LessonFeedbackPopup from "@/components/ui/LessonFeedbackPopup";
import BoardGrid from "@/components/goban/BoardGrid";

type Feedback = {
    type: "success" | "error";
    title: string;
    description: string;
};

function getPointKey(point: Point) {
    return `${point.row},${point.col}`;
}

function createCaptureLessonBoard(): Board {
    const board = createEmptyBoard();

    // Bài học: quân trắng ở giữa chỉ còn 1 khí bên phải.
    // Đen cần đi hàng 5, cột 6 để bắt quân trắng.
    board[4][4] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[5][4] = "black";

    return board;
}

export default function CaptureLesson() {
    const [board, setBoard] = useState<Board>(() => createCaptureLessonBoard());
    const [currentPlayer] = useState<Player>("black");
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const selectedAnalysis = selectedPoint
        ? getStoneGroupAnalysis(board, selectedPoint.row, selectedPoint.col)
        : null;

    const highlightedGroupKeys = new Set(
        selectedAnalysis?.group.map(getPointKey) ?? []
    );

    const highlightedLibertyKeys = new Set(
        selectedAnalysis?.liberties.map(getPointKey) ?? []
    );

    function resetLesson() {
        setBoard(createCaptureLessonBoard());
        setSelectedPoint(null);
        setFeedback(null);
    }

    function handleClick(row: number, col: number) {
        if (board[row][col] !== null) {
            setSelectedPoint({ row, col });
            return;
        }

        const result = placeStone(board, row, col, currentPlayer);

        if (!result.ok) {
            setFeedback({
                type: "error",
                title: "Nước đi chưa hợp lệ",
                description: result.error,
            });
            return;
        }

        setBoard(result.board);
        setSelectedPoint(null);

        const isCorrectMove = row === 4 && col === 5;
        const capturedWhiteStone = result.captured.some(
            (point) => point.row === 4 && point.col === 4
        );

        if (isCorrectMove && capturedWhiteStone) {
            setFeedback({
                type: "success",
                title: "Đúng rồi, bạn đã bắt quân trắng",
                description:
                    "Quân trắng ở giữa chỉ còn 1 khí bên phải. Khi Đen đi vào khí cuối cùng đó, quân trắng hết khí và bị bắt khỏi bàn.",
            });
        } else {
            setFeedback({
                type: "error",
                title: "Chưa đúng nước bắt quân",
                description:
                    "Hãy quan sát các khí của quân trắng. Mục tiêu là chặn khí cuối cùng của quân trắng ở bên phải.",
            });
        }
    }

    return (
        <>
            <LessonFeedbackPopup
                isOpen={feedback !== null}
                type={feedback?.type ?? "error"}
                title={feedback?.title ?? ""}
                description={feedback?.description ?? ""}
                onRetry={resetLesson}
                onClose={() => setFeedback(null)}
            />

            <BoardGrid
                board={board}
                onPointClick={handleClick}
                highlightedGroupKeys={highlightedGroupKeys}
                highlightedLibertyKeys={highlightedLibertyKeys}
                ariaLabelPrefix="Lesson point"
            />
        </>
    );
}