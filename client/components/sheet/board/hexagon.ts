// the rounded hexagon preview marker drawn in a 100x100 box
const HEXAGON_PATH =
  'M46 4Q50 2 54 4L91 25Q96 28 96 33V67Q96 72 91 75L54 96Q50 98 46 96L9 75Q4 72 4 67V33Q4 28 9 25Z';

// splits the path into [command, ...numbers] once, so scaling is plain arithmetic
const HEXAGON = HEXAGON_PATH.match(/[A-Z][^A-Z]*/g)!.map(
  part =>
    [part[0], ...part.slice(1).trim().split(/[ ,]+/).filter(Boolean).map(Number)] as const,
);

const round = (value: number) => Math.round(value * 100) / 100;

// the hexagon scaled to `size` with its top-left corner at (x, y)
export function hexagonPath(x: number, y: number, size: number) {
  const k = size / 100;

  return HEXAGON.map(([command, ...numbers]) => {
    if (command === 'V') return `V${round(y + numbers[0] * k)}`;
    // even positions hold x coordinates and odd positions hold y coordinates
    const coords = numbers.map((value, i) => round(i % 2 === 0 ? x + value * k : y + value * k));
    return command + coords.join(' ');
  }).join('');
}
