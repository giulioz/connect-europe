import { useEffect, useState, useRef, useReducer } from "react";

import {
  Endpoints,
  ResType,
  ParamsType,
  GameState,
  gameStateReducer,
  GameStateAction,
  setState,
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

export function useRemoteState(): [
  GameState | null,
  ((action: GameStateAction) => void) | null
] {
  const [state, dispatch] = useReducer(gameStateReducer, null);
  const [ready, setReady] = useState<boolean>(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    async function init() {
      const received = await apiCall("GET /initialState", {
        params: {},
        body: null,
      });
      if (received.status === "ok") {
        dispatch(setState(received.data));
      }

      webSocketRef.current = new WebSocket(config.wsURL);
      webSocketRef.current.onmessage = message => {
        console.log(message);
        dispatch(JSON.parse(message.data));
      };
      webSocketRef.current.onopen = () => {
        setReady(true);
      };
    }

    init();
  }, []);

  function handleDispatch(action: GameStateAction) {
    if (!ready || !webSocketRef.current) {
      return;
    }

    webSocketRef.current.send(JSON.stringify(action));
  }

  return [state, handleDispatch];
}
