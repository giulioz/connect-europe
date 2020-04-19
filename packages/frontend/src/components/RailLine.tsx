import React from "react";
import OffsettedLine from "./OffsettedLine";
import { calcX, calcY } from "../mapRenderConfig";

export default function RailLine({
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
