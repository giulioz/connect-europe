import WebSocket from "ws";
import { createStore, Store } from "redux";

import {
  GameState,
  GameStateAction,
  gameStateReducer,
  removePlayer,
  Player,
} from "@trans-europa/common";

// Creates a new redux store for a game
function initState() {
  const gameStateStore = createStore(gameStateReducer);
  return gameStateStore;
}

// Sends a generic message to an array of players
async function broadcastWS<T>(
  data: T,
  players: Player[],
  usersWS: {
    [playerId: string]: { gameID: string; ws: WebSocket };
  }
) {
  const send = (ws: WebSocket, data: T) =>
    new Promise((resolve, reject) =>
      ws.send(JSON.stringify(data), err => (err ? reject(err) : resolve()))
    );

  const playersWSs = players
    .map(player => usersWS[player.id])
    .filter(Boolean)
    .filter(p => p.ws.readyState === WebSocket.OPEN);

  await Promise.all(
    playersWSs.map(p =>
      send(p.ws, data).catch(e =>
        console.error("Cannot inform player of change!", e)
      )
    )
  );
}

export default class GamesManagement {
  // Stores the current active games by id
  games: {
    [gameID: string]: Store<GameState, GameStateAction>;
  } = {};

  // Associates the user ids to their websocket and game
  usersWS: {
    [playerId: string]: { gameID: string; ws: WebSocket };
  } = {};

  // Creates a new game if it doesn't exists
  tryGetGameState(gameID: string) {
    if (!this.games[gameID]) {
      this.games[gameID] = initState();
    }

    return this.games[gameID].getState();
  }

  // Proxy for action dispatch
  handleDispatchAction(gameID: string, ws: WebSocket, action: GameStateAction) {
    // Ensure that the store exists
    this.tryGetGameState(gameID);

    // We catch users actions to register the player websocket
    if (action.type === "ADD_PLAYER") {
      this.usersWS[action.player.id] = { gameID, ws };
    } else if (action.type === "REMOVE_PLAYER") {
      // Checks if there are any players left, otherwise delete the game too
      const userGameID = this.usersWS[action.id].gameID;
      const gameState = this.games[userGameID]?.getState();
      if (gameState && gameState.players.length === 0) {
        delete this.games[userGameID];
      }

      // Remove the user record
      delete this.usersWS[action.id];
    }

    // Dispatch the action to the store
    this.games[gameID].dispatch(action);

    // Broadcasts the new state to everyone
    const state = this.games[gameID]?.getState();
    if (state) {
      broadcastWS(state, state.players, this.usersWS);
    }
  }

  // Triggered on player disconnection
  handleRemovePlayer(ws: WebSocket) {
    const playerID = Object.keys(this.usersWS).find(
      sws => this.usersWS[sws].ws === ws
    );
    if (playerID) {
      this.handleDispatchAction(
        this.usersWS[playerID].gameID,
        ws,
        removePlayer(playerID)
      );
    }
  }
}
