import { Player, GameState } from "./gameTypes";

export const addPlayer = (name: Player["name"]) => ({
  type: "ADD_PLAYER" as const,
  name,
});

export const removePlayer = (id: Player["id"]) => ({
  type: "REMOVE_PLAYER" as const,
  id,
});

export const setPlayerInitialPoint = (
  id: Player["id"],
  position: Player["startingPoint"]
) => ({
  type: "SET_PLAYER_INITIAL_POINT" as const,
  id,
  position,
});

export const startGame = () => ({
  type: "START_GAME" as const,
});

export const placeRail = (rail: GameState["board"][0]) => ({
  type: "PLACE_RAIL" as const,
  rail,
});

export type GameStateAction =
  | ReturnType<typeof addPlayer>
  | ReturnType<typeof removePlayer>
  | ReturnType<typeof setPlayerInitialPoint>
  | ReturnType<typeof startGame>
  | ReturnType<typeof placeRail>;
