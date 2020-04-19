import React, { useRef } from "react";
import { useAutoMemo } from "hooks.macro";
import { withParentSize } from "@vx/responsive";
import { WithParentSizeProps } from "@vx/responsive/lib/enhancers/withParentSize";
import { makeStyles } from "@material-ui/core/styles";

import {
  Player,
  points,
  cities,
  pointPairs,
  City,
  BoardPoint,
  WinningState,
} from "@trans-europa/common";
import RailLine from "./RailLine";
import OffsettedLine from "./OffsettedLine";
import {
  calcPosInverse,
  svgWidth,
  svgHeight,
  calcX,
  calcY,
  calcPos,
  cityBulletSize,
} from "../mapRenderConfig";
import { calcDistancePointLine, calcDistancePointPoint } from "../utils";
import {
  dijkstra,
  vertexKey,
  compareTwoPoints,
} from "@trans-europa/common/dist/utils";

const useStyles = makeStyles(theme => ({
  gameBoardSvg: {
    display: "block",
  },
  cityNameContainer: {
    fill: "green",
    stroke: theme.palette.common.white,
    opacity: 0.5,
  },
  cityName: {
    fill: theme.palette.common.white,
    textAnchor: "middle",
    font: `20px sans-serif`,
    userSelect: "none",
  },
  userRail: {
    filter: `drop-shadow(5px 2px 2px #ffffffaa)`,
  },
  startPoint: {
    filter: `drop-shadow(2px 5px 1px #000000aa)`,
  },
}));

type GameBoardProps = {
  usersStartingPoints: { pos: BoardPoint; player: Player }[];
  userPaths: [BoardPoint, BoardPoint][];
  placingPath: [BoardPoint, BoardPoint] | null;
  winningState: WinningState | null;
  onClick(): void;
  onMouseMove(out: { point: BoardPoint; segment: typeof pointPairs[0] }): void;
  onMouseLeave(): void;
} & WithParentSizeProps;

export default withParentSize<GameBoardProps>(function GameBoard({
  parentWidth,
  parentHeight,
  usersStartingPoints,
  userPaths,
  placingPath,
  winningState,
  onClick,
  onMouseMove,
  onMouseLeave,
}) {
  const classes = useStyles();

  const svgRef = useRef<SVGSVGElement | null>(null);

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;

    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const tPoint = point.matrixTransform(
      (svgRef.current.getScreenCTM() as any).inverse()
    );
    const [nx, ny] = calcPosInverse(tPoint.x, tPoint.y);

    const targetSegment = pointPairs.sort(
      (a, b) =>
        calcDistancePointLine(nx, ny, [a.from, a.to]) -
        calcDistancePointLine(nx, ny, [b.from, b.to])
    )[0];

    const targetPoint = points.sort(
      (a, b) =>
        calcDistancePointPoint(nx, ny, a) - calcDistancePointPoint(nx, ny, b)
    )[0];

    onMouseMove({
      segment: targetSegment,
      point: targetPoint,
    });
  }

  const winningCitiesPos = useAutoMemo(
    winningState
      ? winningState.targetCities
          .map(wc => cities.find(c => c.name === wc) as City)
          .map(c => c.position)
      : null
  );

  const winningCitiesHighlighedPieces = useAutoMemo(() => {
    if (!winningCitiesPos || !winningState) {
      return null;
    }

    const { previousVertices } = dijkstra(
      points,
      userPaths,
      winningState.startingPoint
    );

    const paths: [BoardPoint, BoardPoint][] = [];
    function recurse(point: BoardPoint) {
      const prev = previousVertices[vertexKey(point)];
      if (prev) {
        paths.push([point, prev]);
        recurse(prev);
      }
    }
    winningCitiesPos.forEach(cityPos => {
      recurse(cityPos);
    });

    return paths;
  });

  return (
    <svg
      ref={svgRef}
      className={classes.gameBoardSvg}
      width={parentWidth}
      height={parentHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="xMidYMid meet"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <image href={`${process.env.PUBLIC_URL}/background.png`}></image>

      {useAutoMemo(
        pointPairs.map(({ from, to, double }) => (
          <RailLine
            fromP={from}
            toP={to}
            double={double}
            key={`${from}-${to}-${double}`}
            opacity={0.4}
          />
        ))
      )}

      {useAutoMemo(
        userPaths.map(([from, to]) => {
          const isWinningPiece =
            winningCitiesHighlighedPieces &&
            winningCitiesHighlighedPieces.find(
              p =>
                compareTwoPoints(p, [from, to]) ||
                compareTwoPoints(p, [to, from])
            );

          return (
            <OffsettedLine
              key={`USER-${from[0]},${from[1]}-${to[0]},${to[1]}`}
              stroke={isWinningPiece ? "red" : "blue"}
              strokeWidth={isWinningPiece ? 16 : 8}
              lengthOffset={isWinningPiece ? 0 : 6}
              x1={calcX(from[0])}
              y1={calcY(from[1])}
              x2={calcX(to[0])}
              y2={calcY(to[1])}
              className={classes.userRail}
            />
          );
        })
      )}

      {placingPath && (
        <OffsettedLine
          stroke="yellow"
          strokeWidth={8}
          lengthOffset={6}
          x1={calcX(placingPath[0][0])}
          y1={calcY(placingPath[0][1])}
          x2={calcX(placingPath[1][0])}
          y2={calcY(placingPath[1][1])}
          className={classes.userRail}
        />
      )}

      {useAutoMemo(
        cities.map(({ name, color, position: [x, y], textWidth }) => (
          <React.Fragment key={`city-${name}`}>
            <image
              {...calcPos(x, y)}
              width={cityBulletSize}
              height={cityBulletSize}
              transform={`translate(-${cityBulletSize / 2},-${cityBulletSize /
                2})`}
              href={`${process.env.PUBLIC_URL}/${color}.png`}
            ></image>
            <rect
              {...calcPos(x, y)}
              transform={`translate(${-(textWidth + 8)},${cityBulletSize / 2})`}
              width={textWidth * 2 + 16}
              height={32}
              rx={5}
              className={classes.cityNameContainer}
            />
            <text
              {...calcPos(x, y)}
              transform={`translate(0,${cityBulletSize / 2 + 23})`}
              className={classes.cityName}
            >
              {name.toUpperCase()}
            </text>
          </React.Fragment>
        ))
      )}

      {useAutoMemo(
        usersStartingPoints.map(({ pos: [x, y], player: { color, id } }) => (
          <React.Fragment key={`startPoint-${x}-${y}-${id}`}>
            <circle
              cx={calcX(x)}
              cy={calcY(y)}
              fill={color}
              opacity={1}
              r={10}
              className={classes.startPoint}
            />
            <circle
              cx={calcX(x)}
              cy={calcY(y)}
              fill={color}
              opacity={0.5}
              r={14}
              className={classes.startPoint}
            />
          </React.Fragment>
        ))
      )}
    </svg>
  );
});
