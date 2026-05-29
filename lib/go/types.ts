export type Player = "black" | "white";

export type Stone = Player | null;

export type Board = Stone[][];

export type Point = {
    row: number;
    col: number;
};

export type GameStatus = "playing" | "finished";

export type GameMode =
    | "pvp-local"
    | "human-vs-bot";

export type BotDifficulty = "easy" | "normal" | "hard";

export type GameEndReason =
    | "resign"
    | "double-pass"
    | "score"
    | "capture-all"
    | "abandoned";

export type StoneMove = {
    type: "stone";
    row: number;
    col: number;
    player: Player;
    captured: Point[];
    moveNumber: number;
};

export type PassMove = {
    type: "pass";
    player: Player;
    moveNumber: number;
};

export type ResignMove = {
    type: "resign";
    player: Player;
    winner: Player;
    moveNumber: number;
};

export type Move = StoneMove | PassMove | ResignMove;