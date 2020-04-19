import React from "react";
import { GameState, Player } from "@trans-europa/common";

export default function StateDescription({
  gameState,
  myPlayer,
}: {
  gameState: GameState;
  myPlayer: Player;
}) {
  switch (gameState.currentState.state) {
    case "WaitingForPlayers":
      return (
        <>
          {!myPlayer.startingPoint && <>Place your starting point. </>}
          {gameState.initiatorID === myPlayer.id && (
            <>Press START GAME when everybody is ready.</>
          )}
          {gameState.initiatorID !== myPlayer.id && myPlayer.startingPoint && (
            <>Wait for the other players…</>
          )}
        </>
      );

    case "Turn":
      if (gameState.currentState.playerID === myPlayer.id) {
        return (
          <>
            It's your turn. You can place {gameState.currentState.railsLeft}{" "}
            more rails.
          </>
        );
      } else {
        return <>Wait for your turn.</>;
      }

    case "EndRound": {
      const winnerID = gameState.currentState.winnerID;
      const winnerPlayer = gameState.players.find(
        player => player.id === winnerID
      );
      return (
        <>
          {winnerPlayer &&
            (gameState.currentState.winnerID === myPlayer.id ? (
              <>You won this round! </>
            ) : (
              <>{winnerPlayer.name} won this round. </>
            ))}
          Place your starting point for the next round.
        </>
      );
    }

    case "Finish": {
      const winnerID = gameState.lastWinnerID;
      const winnerPlayer = gameState.players.find(
        player => player.id === winnerID
      );
      return (
        <>
          {winnerPlayer &&
            (gameState.currentState.winnerID === myPlayer.id ? (
              <>You won!</>
            ) : (
              <>{winnerPlayer.name} won.</>
            ))}
        </>
      );
    }
  }
}
