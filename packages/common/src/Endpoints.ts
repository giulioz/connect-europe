import { GameState } from "./gameTypes";

export type ResponseStatus<T = null, E extends string = string> =
  | { status: "error"; error: E }
  | { status: "ok"; data: T };

export default interface Endpoints {
  "GET /initialState": {
    params: {};
    res: ResponseStatus<GameState>;
    req: null;
  };
}
