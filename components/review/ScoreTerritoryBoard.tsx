"use client";

import BoardGrid from "@/components/goban/BoardGrid";
import type { Board } from "@/lib/go/types";
import type { BasicScoreResult } from "@/lib/go/scoring";

type ScoreTerritoryBoardProps = {
    board: Board;
    score: BasicScoreResult;
};

export default function ScoreTerritoryBoard({
    board,
    score,
}: ScoreTerritoryBoardProps) {
    return (
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">
                        Bản đồ vùng đất
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                        Các chấm mờ trên bàn thể hiện vùng đất mà hệ thống tính
                        cho mỗi bên trong bản tính điểm cơ bản.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-neutral-950/70 px-3 py-1 text-white">
                        Đất Đen
                    </span>

                    <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-black">
                        Đất Trắng
                    </span>

                    <span className="rounded-full bg-neutral-500/40 px-3 py-1 text-neutral-200">
                        Trung lập
                    </span>
                </div>
            </div>

            <BoardGrid
                board={board}
                onPointClick={() => { }}
                isDisabled
                ariaLabelPrefix="Score territory point"
                territoryPoints={{
                    black: score.blackTerritoryPoints ?? [],
                    white: score.whiteTerritoryPoints ?? [],
                    neutral: score.neutralTerritoryPoints ?? [],
                }}
                showCoordinates
            />
        </div>
    );
}