/*
  Here lies our game state model
*/

export type PlayerID = string;
export type PlayerColors =
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "yellow"
  | "purple";

export type CityName = string;
export type BoardPoint = [number, number];

export type GameState = {
  currentState: CurrentState;
  initiatorID: PlayerID | null;
  players: Player[];
  board: [BoardPoint, BoardPoint][];
};

export type Player = {
  name: string;
  id: PlayerID;
  color: PlayerColors;
  // Calculated as number of steps to reach the remaining target cities
  penalityPoints: number;
  targetCities: CityName[];
  startingPoint: BoardPoint | null;
};

export type TurnState = {
  state: "Turn";
  playerID: PlayerID;
  railsLeft: number;
};

export type WinningState = {
  winnerID: PlayerID;
  targetCities: CityName[];
  startingPoint: BoardPoint;
  board: [BoardPoint, BoardPoint][];
};

export type CurrentState =
  // Game started: still waiting for the players to join
  // In the meantime, everybody sets his own starting point
  | { state: "WaitingForPlayers" }

  // It's somebody's turn to play!
  | TurnState

  // End of a game round, we calculate the penalityPoints and who has to quit
  // In the meantime, everyone sets his own starting point for the new round
  | ({ state: "EndRound" } & WinningState)

  // Game over! Adios and glory to the winner
  | ({ state: "Finish" } & WinningState);
