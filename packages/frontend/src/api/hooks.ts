import { useEffect, useState, useRef } from "react";
import { useAutoCallback } from "hooks.macro";

import {
  Endpoints,
  ResType,
  ParamsType,
  GameState,
  GameStateAction,
  WSPayload,
} from "@connect-europe/common";
import apiCall from "./apiCall";
import config from "../config";

const emptyParams = {};

export function useRemoteData<K extends keyof Endpoints>(
  endpoint: K,
  params: ParamsType<K>
) {
  const [data, setData] = useState<ResType<K> | null>(null);

  useEffect(() => {
    async function loadData() {
      const received = await apiCall(endpoint, {
        params,
        body: null,
      });
      setData(received);
    }

    loadData();
  }, [endpoint, params]);

  return data;
}

export function useNewGameID() {
  const res = useRemoteData("GET /newGameID", emptyParams);

  return res?.status === "ok" ? res.data : false;
}

export function useRemoteState(
  gameID: string | null
): [
  GameState | null,
  (action: GameStateAction) => void,
  boolean,
  (gameID: string) => Promise<void>
] {
  const [state, setState] = useState<GameState | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    async function init(gameID: string) {
      const received = await apiCall("GET /state/:gameID", {
        params: { gameID },
        body: null,
      });
      if (received.status === "ok") {
        setState(received.data);
      }

      webSocketRef.current = new WebSocket(config.wsURL);
      webSocketRef.current.onmessage = message => {
        const parsedState = JSON.parse(message.data) as GameState;
        if (parsedState) {
          setState(parsedState);
        } else {
          console.error("Invalid state received!", message.data);
        }
      };
      webSocketRef.current.onopen = () => {
        setReady(true);
      };
    }

    if (gameID) {
      init(gameID);
    }
  }, [gameID]);

  const handleDispatch = useAutoCallback(function handleDispatch(
    action: GameStateAction
  ) {
    if (!ready || !webSocketRef.current || !gameID) {
      return;
    }

    const payload: WSPayload = { action, gameID };
    webSocketRef.current.send(JSON.stringify(payload));
  });

  const handleForceUpdate = useAutoCallback(async function handleForceUpdate(
    gameID: string
  ) {
    const received = await apiCall("GET /state/:gameID", {
      params: { gameID },
      body: null,
    });
    if (received.status === "ok") {
      setState(received.data);
    }
  });

  return [state, handleDispatch, ready, handleForceUpdate];
}
