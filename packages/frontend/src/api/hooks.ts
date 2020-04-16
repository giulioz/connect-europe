import { useEffect, useState, useRef, useReducer } from "react";

import {
  Endpoints,
  ResType,
  ParamsType,
  GameState,
  gameStateReducer,
} from "@trans-europa/common";
import apiCall from "./apiCall";
import config from "../config";

export function useRemoteData<K extends keyof Endpoints>(
  endpoint: K,
  params?: ParamsType<K>
) {
  const [data, setData] = useState<ResType<K> | null>(null);

  useEffect(() => {
    async function loadData() {
      const received = await apiCall(endpoint, {
        params: params || {},
        body: null,
      });
      setData(received);
    }

    loadData();
  }, [endpoint, params]);

  return data;
}

export function useRemoteState() {
  const [initialState, setInitialState] = useState<GameState | null>(null);
  const [state, dispatch] = useReducer(gameStateReducer, initialState as any);
  const [ready, setReady] = useState<boolean>(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const dispatchRef = useRef<() => void | null>(null);

  useEffect(() => {
    async function init() {
      const received = await apiCall("GET /initialState", {
        params: {},
        body: null,
      });
      if (received.status === "ok") {
        setInitialState(received.data);
      }

      webSocketRef.current = new WebSocket(config.wsURL);
      webSocketRef.current.onopen = () => {
        setReady(true);
      };
      webSocketRef.current.onmessage = message => {
        console.log(message);
        dispatch(message as any);
      };
    }

    init();
  }, []);

  return [state, dispatchRef.current];
}
