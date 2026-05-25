export type Player = "black" | "white";

export type Stone = Player | null;

export type Board = Stone[][];

export type Point = {
  row: number;
  col: number;
};

export type Move = {
  row: number;
  col: number;
  player: Player;
  captured: Point[];
  moveNumber: number;
};