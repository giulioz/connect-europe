/*
  Our reducer for the game model.
  It takes the actions and calculate the new state.
*/

import { GameState } from "./gameStateTypes";
import { GameStateAction } from "./gameStateActions";
import { uniquePairs } from "./utils";
import {
  calcNeededPieces,
  findWinnerPlayers,
  getInitialPlayerID,
  getTurnNextPlayerID,
} from "./gameRules";
import { defaultRailsLeft } from "./config";

// An empty game, without any player
export const initialGameState: GameState = {
  currentState: { state: "WaitingForPlayers" },
  initiatorID: null,
  lastWinnerID: null,
  players: [],
  board: [],
};

// This reducer manages the internal game state
// It won't check for feasibility, assuming administrator permissions
export function gameStateReducer(
  state: GameState = initialGameState,
  action: GameStateAction
): GameState {
  switch (action.type) {
    case "SET_STATE":
      return action.state;

    case "ADD_PLAYER":
      return {
        ...state,
        initiatorID: !state.initiatorID ? action.player.id : state.initiatorID,
        players: [...state.players, action.player],
      };

    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.id),
      };

    case "SET_PLAYER_INITIAL_POINT":
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.id
            ? { ...player, startingPoint: action.position }
            : player
        ),
      };

    case "START_GAME":
      return {
        ...state,
        currentState: {
          state: "Turn",
          playerID: getInitialPlayerID(state),
          railsLeft: defaultRailsLeft,
        },
      };

    // Also advances the game state, checking for winning condition
    // This is the only reducer with more checks, so we can keep only one action for the turn advances
    case "PLACE_RAIL": {
      const neededPieces = calcNeededPieces(action.rail);
      if (neededPieces === false || state.currentState.state !== "Turn") {
        return state;
      }

      // Filters out possible duplicates
      const boardWithPlace = uniquePairs([...state.board, action.rail]);

      const railsLeftAfterPlace = state.currentState.railsLeft - neededPieces;
      const newTurnAfterPlace = railsLeftAfterPlace <= 0;

      const gameStateAfterPlace = {
        ...state,
        currentState: newTurnAfterPlace
          ? // No rails left: advance to the next player
            {
              ...state.currentState,
              railsLeft: defaultRailsLeft,
              playerID: getTurnNextPlayerID(state, state.currentState),
            }
          : // Subtract the rails left
            {
              ...state.currentState,
              railsLeft: railsLeftAfterPlace,
            },
        board: boardWithPlace,
      };

      // Let's check if somebody has won... but we can only do this with the state after the new rail segment
      const winning = findWinnerPlayers(gameStateAfterPlace);
      if (winning.length > 0) {
        // We take the first winner: there should be no way two players can win simultaneously
        const winner = winning[0];

        // We reset the starting points when winning
        const players = state.players.map(player => ({
          ...player,
          startingPoint: null,
        }));

        return {
          ...gameStateAfterPlace,
          players,
          lastWinnerID: winner.id,
          currentState: {
            state: "EndRound",
            winnerID: winner.id,
          },
        };
      } else {
        return gameStateAfterPlace;
      }
    }
  }
}
