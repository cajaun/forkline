import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

// a solid outer circle holding an inner circle that loses a wedge from twelve towards nine
export const ClockFace = memo(function ClockFace({
  fraction,
  inner,
  outer,
  size,
}: {
  fraction: number;
  inner: string;
  outer: string;
  size: number;
}) {
  const center = size / 2;
  const radius = center - size * 0.14;
  const left = Math.min(1, Math.max(0, fraction));
  // the remaining slice runs clockwise from twelve so the missing part opens on the left
  const angle = left * 2 * Math.PI;
  const endX = center + radius * Math.sin(angle);
  const endY = center - radius * Math.cos(angle);
  const slice = `M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 ${left > 0.5 ? 1 : 0} 1 ${endX} ${endY} Z`;

  return (
    <Svg height={size} width={size}>
      <Circle cx={center} cy={center} fill={outer} r={center} />
      {left >= 1 ? (
        <Circle cx={center} cy={center} fill={inner} r={radius} />
      ) : left > 0 ? (
        <Path d={slice} fill={inner} />
      ) : null}
    </Svg>
  );
});
