import { GameState } from "./gameTypes";
import { GameStateAction } from "./gameStateActions";

export type ResponseStatus<T = null, E extends string = string> =
  | { status: "error"; error: E }
  | { status: "ok"; data: T };

export type WSPayload = {
  gameID: string;
  action: GameStateAction;
};

export interface Endpoints {
  "GET /state/:gameID": {
    params: { gameID: GameState["gameID"] };
    res: ResponseStatus<GameState>;
    req: null;
  };
}
