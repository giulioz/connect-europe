export type PlayerID = string;
export type PlayerColors = "blue" | "red" | "green" | "orange" | "yellow";
export const playerColorsArray: PlayerColors[] = [
  "blue",
  "red",
  "green",
  "orange",
  "yellow",
];

export type CityName = string;
export type BoardPoint = [number, number];

export type GameState = {
  currentState: CurrentState;
  initiator: PlayerID;
  players: Player[];
  board: [BoardPoint, BoardPoint][];
};

export type Player = {
  name: string;
  id: PlayerID;
  color: PlayerColors;
  penalityPoints: number;
  targetCities: CityName[];
  startingPoint: BoardPoint;
};

export type CurrentState =
  | { state: "WaitingForPlayers" }
  | { state: "Turn"; playerID: PlayerID; railPlaced: number }
  | { state: "EndRound"; winnerID: PlayerID }
  | { state: "Finish"; winnerID: PlayerID };
