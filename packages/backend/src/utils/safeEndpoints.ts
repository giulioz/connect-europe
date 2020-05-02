import express from "express";
/* eslint-disable-next-line import/no-unresolved */
import { RequestHandler } from "express-serve-static-core";
import { Endpoints } from "@connect-europe/common";
import { ParamsType, ResType, ReqType } from "@connect-europe/common/src/utils";

type Handler<K extends keyof Endpoints> = RequestHandler<
  ParamsType<K>,
  ResType<K>,
  ReqType<K>
>;
type EndpointsList = { [key in keyof Endpoints]: Handler<key> };

export function configEndpoints(
  app: ReturnType<typeof express>,
  endpoints: EndpointsList
) {
  const entries = Object.entries(endpoints) as [
    keyof EndpointsList,
    Handler<any>
  ][];

  entries.forEach(([key, handler]) => safeEndpoint(app, key, handler));
}

export function safeEndpoint<K extends keyof Endpoints>(
  app: ReturnType<typeof express>,
  endpoint: K,
  handler: Handler<K>
) {
  if (endpoint.startsWith("GET ")) {
    app.get<ParamsType<K>, ResType<K>, ReqType<K>>(
      endpoint.substr("GET ".length),
      handler
    );
  } else if (endpoint.startsWith("POST ")) {
    app.post<ParamsType<K>, ResType<K>, ReqType<K>>(
      endpoint.substr("POST ".length),
      handler
    );
  } else if (endpoint.startsWith("PUT ")) {
    app.put<ParamsType<K>, ResType<K>, ReqType<K>>(
      endpoint.substr("PUT ".length),
      handler
    );
  } else {
    throw new Error("Not implemented");
  }
}
