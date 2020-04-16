export type PlayerID = string;
export type PlayerColors =
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "yellow"
  | "purple";
export const playerColorsArray: PlayerColors[] = [
  "blue",
  "red",
  "green",
  "orange",
  "yellow",
  "purple",
];
export const maxPlayers = playerColorsArray.length;

export type CityName = string;
export type BoardPoint = [number, number];

export type GameState = {
  gameID: string;
  currentState: CurrentState;
  initiatorID: PlayerID;
  lastWinnerID: PlayerID | null;
  players: Player[];
  board: [BoardPoint, BoardPoint][];
};

export type Player = {
  name: string;
  id: PlayerID;
  color: PlayerColors;
  penalityPoints: number;
  targetCities: CityName[];
  startingPoint: BoardPoint | null;
};

export type CurrentState =
  | { state: "WaitingForPlayers" }
  | { state: "Turn"; playerID: PlayerID; railsLeft: number }
  | { state: "EndRound"; winnerID: PlayerID }
  | { state: "Finish"; winnerID: PlayerID };

export const defaultRailsLeft = 2;
