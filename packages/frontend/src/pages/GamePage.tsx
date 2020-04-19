import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useAutoMemo } from "hooks.macro";
import { useParams } from "react-router-dom";

import { addPlayer, createPlayer } from "@trans-europa/common";

import Layout from "../components/Layout";
import NameInsertDialog from "../components/NameInsertDialog";
import { useRemoteState } from "../api/hooks";
import FullProgress from "../components/FullProgress";
import Game from "../components/Game";

export default function GamePage() {
  const [myPlayerName, setMyPlayerName] = useState<string | null>(null);
  const myPlayerId = useAutoMemo(uuid());

  const { gameID } = useParams();
  const [gameState, dispatch, ready] = useRemoteState(gameID || null);

  useEffect(() => {
    async function initPlayer() {
      if (
        gameState &&
        ready &&
        myPlayerName &&
        !gameState.players.find(p => p.id === myPlayerId)
      ) {
        const player = createPlayer(gameState, myPlayerId, myPlayerName);
        if (player) {
          dispatch(addPlayer(player));
        }
      }
    }

    initPlayer();
  }, [gameState, myPlayerName, myPlayerId, ready, dispatch]);

  return (
    <Layout>
      <NameInsertDialog open={!myPlayerName} onSetName={setMyPlayerName} />
      {myPlayerName &&
      gameState !== null &&
      dispatch !== null &&
      gameID &&
      ready ? (
        <Game
          gameState={gameState}
          dispatch={dispatch}
          myPlayerId={myPlayerId}
        />
      ) : (
        myPlayerName && <FullProgress />
      )}
    </Layout>
  );
}
