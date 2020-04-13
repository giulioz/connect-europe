import {
  Endpoints,
  withParameters,
  ParamsType,
  ResType,
  ReqType,
} from "@trans-europa/common";
import config from "../config";

export default async function apiCall<K extends keyof Endpoints>(
  endpoint: K,
  options: { params: ParamsType<K>; body: ReqType<K> }
): Promise<ResType<K>> {
  const method = endpoint.split(" ")[0];
  const url = withParameters(endpoint, options.params);

  const res = await fetch(config.apiURL + url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body:
      method !== "HEAD" && method !== "GET"
        ? JSON.stringify(options.body)
        : undefined,
  });

  const data: ResType<K> = await res.json();
  return data;
}
