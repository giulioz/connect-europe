export const svgWidth = 1920;
export const svgHeight = 1227;

export const cellWidth = 47.5;
export const cellHeight = 84.5;

export function calcX(px: number) {
  return px * cellWidth + 47.5;
}

export function calcY(py: number) {
  return py * cellHeight + 55;
}

export function calcPos(px: number, py: number, offsetX = 0, offsetY = 0) {
  return { x: calcX(px) + offsetX, y: calcY(py) + offsetY };
}

export function calcPosInverse(px: number, py: number) {
  const x = (px - 47.5) / cellWidth;
  const y = (py - 55) / cellHeight;
  return [x, y];
}

export const cityBulletSize = 60;
