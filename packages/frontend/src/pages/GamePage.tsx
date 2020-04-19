import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAutoMemo } from "hooks.macro";

import { addPlayer, generatePlayerID } from "@trans-europa/common";

import Layout from "../components/Layout";
import NameInsertDialog from "../components/NameInsertDialog";
import { useRemoteState } from "../api/hooks";
import FullProgress from "../components/FullProgress";
import Game from "../components/Game";

export default function GamePage() {
  const [myPlayerName, setMyPlayerName] = useState<string | null>(null);
  const myPlayerId = useAutoMemo(generatePlayerID());

  const { gameID } = useParams();
  const [gameState, dispatch, ready] = useRemoteState(gameID || null);

  // DEBUG
  (window as any).gameState = gameState;

  useEffect(() => {
    async function initPlayer() {
      if (
        gameState &&
        ready &&
        myPlayerName &&
        !gameState.players.find(p => p.id === myPlayerId)
      ) {
        dispatch(addPlayer(myPlayerId, myPlayerName));
      }
    }

    initPlayer();
  }, [gameState, myPlayerName, myPlayerId, ready, dispatch]);

  const myPlayer = gameState?.players.find(p => p.id === myPlayerId);

  return (
    <Layout>
      <NameInsertDialog open={!myPlayerName} onSetName={setMyPlayerName} />
      {myPlayerName &&
      gameState !== null &&
      dispatch !== null &&
      gameID &&
      myPlayer &&
      ready ? (
        <Game gameState={gameState} dispatch={dispatch} myPlayer={myPlayer} />
      ) : (
        myPlayerName && <FullProgress />
      )}
    </Layout>
  );
}
