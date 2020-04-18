/*
  The actions creators that we can send to our store
*/

import { Player, GameState, BoardPoint } from "./gameStateTypes";

// Overwrites the state
export const setState = (state: GameState) => ({
  type: "SET_STATE" as const,
  state,
});

// Adds a new player and sets the initiator if null
export const addPlayer = (player: Player) => ({
  type: "ADD_PLAYER" as const,
  player,
});

// Removes a player from the game by id
export const removePlayer = (id: Player["id"]) => ({
  type: "REMOVE_PLAYER" as const,
  id,
});

// Sets the player starting point
export const setPlayerInitialPoint = (
  id: Player["id"],
  position: BoardPoint
) => ({
  type: "SET_PLAYER_INITIAL_POINT" as const,
  id,
  position,
});

// Starts a new game or another round, requires the initial point to be set
export const startGame = () => ({
  type: "START_GAME" as const,
});

// Places a new piece of rail, checking for victory condition
export const placeRail = (rail: GameState["board"][0]) => ({
  type: "PLACE_RAIL" as const,
  rail,
});

export type GameStateAction =
  | ReturnType<typeof setState>
  | ReturnType<typeof addPlayer>
  | ReturnType<typeof removePlayer>
  | ReturnType<typeof setPlayerInitialPoint>
  | ReturnType<typeof startGame>
  | ReturnType<typeof placeRail>;
