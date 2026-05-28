export type Player = "black" | "white";

export type Stone = Player | null;

export type Board = Stone[][];

export type Point = {
  row: number;
  col: number;
};

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

export type GameStatus = "playing" | "finished";

export type GameMode =
  | "pvp-local"
  | "pvp-online"
  | "human-vs-bot"
  | "human-ai"
  | "tutorial"
  | "lesson";

export type GameEndReason =
  | "resign"
  | "double-pass"
  | "score"
  | "lesson-complete";