import React, { useRef } from "react";
import { useAutoMemo } from "hooks.macro";
import { withParentSize } from "@vx/responsive";
import { WithParentSizeProps } from "@vx/responsive/lib/enhancers/withParentSize";
import { makeStyles } from "@material-ui/core/styles";

import { points, cities, pointPairs } from "../map";
import { Player } from "../gameTypes";

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
  },
  userRail: {
    filter: `drop-shadow(5px 2px 2px #ffffffaa)`,
  },
  startPoint: {
    filter: `drop-shadow(2px 5px 1px #000000aa)`,
  },
}));

const svgWidth = 1920;
const svgHeight = 1227;

const cellWidth = 47.5;
const cellHeight = 84.5;

function calcX(px: number) {
  return px * cellWidth + 47.5;
}
function calcY(py: number) {
  return py * cellHeight + 55;
}
function calcPos(px: number, py: number, offsetX = 0, offsetY = 0) {
  return { x: calcX(px) + offsetX, y: calcY(py) + offsetY };
}
function calcPosInverse(px: number, py: number) {
  const x = (px - 47.5) / cellWidth;
  const y = (py - 55) / cellHeight;
  return [x, y];
}

function calcDistancePointLine(
  x: number,
  y: number,
  pair: [[number, number], [number, number]]
) {
  const dx = pair[1][0] - pair[0][0];
  const dy = pair[1][1] - pair[0][1];
  const l2 = dx * dx + dy * dy;

  const t = ((x - pair[0][0]) * dx + (y - pair[0][1]) * dy) / l2;
  const tNorm = Math.max(0, Math.min(1, t));

  return (
    (x - (pair[0][0] + tNorm * dx)) ** 2 + (y - (pair[0][1] + tNorm * dy)) ** 2
  );
}

function calcDistancePointPoint(x: number, y: number, point: [number, number]) {
  return (x - point[0]) ** 2 + (y - point[1]) ** 2;
}

const cityBulletSize = 60;

function OffsettedLine({
  x1,
  x2,
  y1,
  y2,
  offset = 0,
  lengthOffset = 0,
  startPiece = false,
  endPiece = false,
  piecesSize = 15,
  ...rest
}: React.SVGProps<SVGLineElement> & {
  offset?: number;
  lengthOffset?: number;
  startPiece?: boolean;
  endPiece?: boolean;
  piecesSize?: number;
}) {
  const x1Parsed = x1 ? Number(x1) : 0;
  const y1Parsed = y1 ? Number(y1) : 0;
  const x2Parsed = x2 ? Number(x2) : 0;
  const y2Parsed = y2 ? Number(y2) : 0;

  const deltaX = x2Parsed - x1Parsed;
  const deltaY = y2Parsed - y1Parsed;
  const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const cosine = deltaX / delta;
  const sine = deltaY / delta;

  if (deltaY === 0) {
    return (
      <line
        x1={endPiece ? x2Parsed - piecesSize : x1Parsed + lengthOffset}
        y1={y1Parsed - offset}
        x2={startPiece ? x1Parsed + piecesSize : x2Parsed - lengthOffset}
        y2={y2Parsed - offset}
        {...rest}
      />
    );
  } else {
    if (startPiece) {
      return (
        <line
          x1={x1Parsed}
          y1={y1Parsed}
          x2={x1Parsed + cosine * piecesSize}
          y2={y1Parsed + sine * piecesSize}
          {...rest}
        />
      );
    } else if (endPiece) {
      return (
        <line
          x1={x2Parsed}
          y1={y2Parsed}
          x2={x2Parsed - cosine * piecesSize}
          y2={y2Parsed - sine * piecesSize}
          {...rest}
        />
      );
    } else {
      return (
        <line
          x1={x1Parsed + offset * cosine + cosine * lengthOffset}
          y1={y1Parsed - offset * sine + sine * lengthOffset}
          x2={x2Parsed + offset * cosine - cosine * lengthOffset}
          y2={y2Parsed - offset * sine - sine * lengthOffset}
          {...rest}
        />
      );
    }
  }
}

function RailLine({
  fromP,
  toP,
  double,
  ...rest
}: React.SVGProps<SVGLineElement> & {
  fromP: [number, number];
  toP: [number, number];
  double: boolean;
}) {
  return double ? (
    <>
      <OffsettedLine
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        stroke="black"
        strokeWidth={5}
        startPiece
        {...rest}
        offset={0}
      />
      <OffsettedLine
        stroke="black"
        strokeWidth={5}
        lengthOffset={20}
        {...rest}
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        offset={5}
      />
      <OffsettedLine
        stroke="black"
        strokeWidth={5}
        lengthOffset={20}
        {...rest}
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        offset={-5}
      />
      <OffsettedLine
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        stroke="black"
        strokeWidth={5}
        endPiece
        {...rest}
        offset={0}
      />
    </>
  ) : (
    <OffsettedLine
      stroke="black"
      strokeWidth={5}
      {...rest}
      offset={0}
      x1={calcX(fromP[0])}
      y1={calcY(fromP[1])}
      x2={calcX(toP[0])}
      y2={calcY(toP[1])}
    />
  );
}

export default withParentSize<
  {
    startingPoints: { pos: [number, number]; player: Player }[];
    userPaths: [[number, number], [number, number]][];
    placingPath: [[number, number], [number, number]] | null;
    onClick(): void;
    onMouseMove(out: {
      point: [number, number];
      segment: typeof pointPairs[0];
    }): void;
    onMouseLeave(): void;
  } & WithParentSizeProps
>(function GameBoard({
  startingPoints,
  parentWidth,
  parentHeight,
  userPaths,
  placingPath,
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

      {userPaths.map(([from, to]) => (
        <OffsettedLine
          key={`USER-${from[0]},${from[1]}-${to[0]},${to[1]}`}
          stroke="red"
          strokeWidth={8}
          lengthOffset={6}
          x1={calcX(from[0])}
          y1={calcY(from[1])}
          x2={calcX(to[0])}
          y2={calcY(to[1])}
          className={classes.userRail}
        />
      ))}

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

      {startingPoints.map(({ pos: [x, y], player: { color, id } }) => (
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
      ))}
    </svg>
  );
});
