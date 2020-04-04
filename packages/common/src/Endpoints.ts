export type ResponseStatus<T = null, E extends string = string> =
  | { status: "error"; error: E }
  | { status: "ok"; data: T };

export default interface Endpoints {
  "GET /test": {
    params: {};
    res: ResponseStatus<number>;
    req: null;
  };
}
