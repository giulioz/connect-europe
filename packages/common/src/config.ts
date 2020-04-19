import { PlayerColors } from "./gameStateTypes";

// The possible colors for a player
export const playerColorsArray: PlayerColors[] = [
  "blue",
  "red",
  "green",
  "orange",
  "yellow",
  "purple",
];

// Since we assign a color for each player...
export const maxPlayers = playerColorsArray.length;

// How many rails can you place in a turn?
export const defaultRailsLeft = 2;

// The maximum before game over
export const maxPenalityPoints = 12;
