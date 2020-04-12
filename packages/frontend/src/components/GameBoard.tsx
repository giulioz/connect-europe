import React from "react";
import { useAutoMemo } from "hooks.macro";
import { withParentSize } from "@vx/responsive";
import { makeStyles } from "@material-ui/core/styles";

import { points, cities } from "../map";

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
}));

function calcX(px: number) {
  return px * 47.5 + 47.5;
}
function calcY(py: number) {
  return py * 84.5 + 55;
}
function calcPos(px: number, py: number, offsetX = 0, offsetY = 0) {
  return { x: calcX(px) + offsetX, y: calcY(py) + offsetY };
}

const cityBulletSize = 60;

function uniquePairs(pairs: [[number, number], [number, number]][]) {
  return pairs.reduce(
    (acc: [[number, number], [number, number]][], pair) =>
      !acc.find(
        accElement =>
          accElement[0][0] === pair[0][0] &&
          accElement[0][1] === pair[0][1] &&
          accElement[1][0] === pair[1][0] &&
          accElement[1][1] === pair[1][1]
      )
        ? [...acc, pair]
        : acc,
    []
  );
}

const pointPairs = points
  .reduce(
    (arr: [[number, number], [number, number]][], p1) =>
      uniquePairs([
        ...arr,
        ...points
          .filter(
            p2 =>
              !(p2[0] === p1[0] && p2[1] === p1[1]) &&
              (Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2) <=
                Math.sqrt(2) ||
                (p2[1] - p1[1] === 0 && p2[0] - p1[0] === 2))
          )
          .map<[[number, number], [number, number]]>(
            p2 =>
              [p1, p2].sort((a, b) => a[0] - b[0]) as [
                [number, number],
                [number, number]
              ]
          ),
      ]),
    []
  )
  .map(([from, to]) => ({ from, to, double: Math.random() > 0.75 }));

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

export default withParentSize(function GameBoard({
  parentWidth,
  parentHeight,
}) {
  const classes = useStyles();

  return (
    <svg
      className={classes.gameBoardSvg}
      width={parentWidth}
      height={parentHeight}
      viewBox="0 0 1920 1227"
      preserveAspectRatio="xMidYMid meet"
    >
      <image href={`${process.env.PUBLIC_URL}/background.png`}></image>

      {/* {points.map(([x, y]) => (
        <circle
          key={[x, y].join(",")}
          cx={x * 47.5 + 47.5}
          cy={y * 84.5 + 55}
          fill="yellow"
          r={8}
        />
      ))} */}

      {useAutoMemo(
        pointPairs.map(({ from, to, double }) => (
          <RailLine
            fromP={from}
            toP={to}
            double={double}
            key={`${from}-${to}-${double}`}
            onMouseMove={console.log}
          />
        ))
      )}

      {useAutoMemo(
        cities.map(({ name, color, position: [x, y], textWidth }) => (
          <>
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
          </>
        ))
      )}
    </svg>
  );
});
