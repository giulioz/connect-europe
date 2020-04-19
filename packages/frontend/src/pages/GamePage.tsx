import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useAutoMemo } from "hooks.macro";
import { useParams } from "react-router-dom";

import { addPlayer, GameState } from "@trans-europa/common";

import Layout from "../components/Layout";
import NameInsertDialog from "../components/NameInsertDialog";
import { useRemoteState } from "../api/hooks";
import FullProgress from "../components/FullProgress";
import Game from "../components/Game";

export default function GamePage() {
  const [myPlayerName, setMyPlayerName] = useState<string | null>(null);
  const myPlayerId = useAutoMemo(uuid());
  // const myPlayerId = "030dea71-430d-42c0-89c1-0537c143b15b";

  const { gameID } = useParams();
  const [gameState, dispatch, ready] = useRemoteState(gameID || null);

  const gameState2: GameState = JSON.parse(
    '{"currentState":{"state":"Finish","winnerID":"030dea71-430d-42c0-89c1-0537c143b15b","targetCities":["firenze","london","riga","warszawa","glasgow"],"startingPoint":[22,5]},"initiatorID":"030dea71-430d-42c0-89c1-0537c143b15b","players":[{"name":"A","id":"030dea71-430d-42c0-89c1-0537c143b15b","color":"blue","penalityPoints":0,"targetCities":["roma","dublin","bucaresti","paris","malmo"],"startingPoint":null}],"board":[[[21,6],[22,5]],[[19,6],[21,6]],[[18,7],[19,6]],[[16,7],[18,7]],[[15,8],[16,7]],[[13,8],[15,8]],[[11,8],[13,8]],[[20,5],[22,5]],[[13,8],[14,9]],[[13,10],[14,9]],[[12,7],[13,8]],[[11,6],[12,7]],[[10,5],[11,6]],[[18,5],[20,5]],[[9,4],[10,5]],[[8,3],[9,4]],[[18,5],[19,4]],[[19,4],[20,3]],[[20,3],[21,2]],[[21,2],[22,1]],[[22,1],[24,1]],[[8,3],[9,2]],[[8,1],[9,2]],[[8,1],[9,0]]]}'
  );

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
