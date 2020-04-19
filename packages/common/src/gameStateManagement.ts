/*
  Our reducer for the game model.
  It takes the actions and calculate the new state.
*/

import { GameState, Player, BoardPoint } from "./gameStateTypes";
import { GameStateAction } from "./gameStateActions";
import { uniquePairs } from "./utils";
import {
  calcNeededPieces,
  findWinnerPlayers,
  getInitialPlayerID,
  getTurnNextPlayerID,
  createPlayer,
  reshufflePlayerTargets,
  calculateEndTurnPenalityPoints,
  isPlayerGameOver,
} from "./gameRules";
import { defaultRailsLeft } from "./config";

// An empty game, without any player
export const initialGameState: GameState = {
  currentState: { state: "WaitingForPlayers" },
  initiatorID: null,
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

    case "ADD_PLAYER": {
      // WARNING: This action is not pure, since it uses random
      const player = createPlayer(state, action.id, action.name);
      if (!player) {
        return state;
      }

      return {
        ...state,
        initiatorID: !state.initiatorID ? player.id : state.initiatorID,
        players: [...state.players, player],
      };
    }

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
      // How many rail pieces we need?
      const neededPieces = calcNeededPieces(action.rail);
      if (neededPieces === false || state.currentState.state !== "Turn") {
        return state;
      }

      // Filters out possible duplicates
      const boardWithPlace = uniquePairs([...state.board, action.rail]);

      // How will be the state after the place?
      const railsLeftAfterPlace = state.currentState.railsLeft - neededPieces;
      const nextTurnPlayerID = getTurnNextPlayerID(state, state.currentState);
      const gameStateAfterPlace: GameState = {
        ...state,
        currentState:
          railsLeftAfterPlace <= 0
            ? // No rails left: advance to the next player
              {
                ...state.currentState,
                railsLeft: defaultRailsLeft,
                playerID: nextTurnPlayerID,
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

        // We reset the starting points and targets when winning
        // We also calculate the penalityPoints
        const players = state.players.reduce(
          (prev: Player[], player) => [
            ...prev,
            {
              ...player,
              startingPoint: null,
              targetCities: reshufflePlayerTargets(prev),
              penalityPoints:
                player.penalityPoints +
                calculateEndTurnPenalityPoints(gameStateAfterPlace, player),
            },
          ],
          []
        );

        // Game is finished if there is a single player left
        const stillAlivePlayers = players.filter(
          player => !isPlayerGameOver(player)
        );
        const isGameOver = stillAlivePlayers.length <= 1;

        return {
          ...gameStateAfterPlace,
          board: [],
          players,
          currentState: {
            state: isGameOver ? "Finish" : "EndRound",
            winnerID: winner.id,
            targetCities: winner.targetCities,
            startingPoint: winner.startingPoint as BoardPoint,
            board: gameStateAfterPlace.board,
          },
        };
      } else {
        return gameStateAfterPlace;
      }
    }

    default:
      return state;
  }
}
