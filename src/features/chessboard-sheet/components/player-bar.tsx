import { Image, Text, View } from 'react-native';

import { CaptureTray } from '../../../shared/capture-tray';
import { VALUE } from '../../../shared/chess-pieces';
import type { Side } from '../../../shared/chess-types';
import { playerAvatars, players } from '../../../shared/players';

export function SheetPlayerBar({
  captured,
  side,
}: {
  captured: string[];
  side: Side;
}) {
  const foe: Side = side === 'w' ? 'b' : 'w';
  const capturedValue = captured.reduce((sum, piece) => sum + (VALUE[piece] ?? 0), 0);

  return (
    <View className="h-11 w-full flex-row items-center gap-2 rounded-[18px] bg-[#f2f2f2] px-1.5">
      <Image className="h-8 w-8 rounded-xl" source={playerAvatars[side]} />
      <View className="min-w-0 flex-1 justify-center gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="text-[13px] text-[#262626]"
            style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
            {players[side].name}
          </Text>
          <Text
            className="text-[11px] text-[#8f9298]"
            style={{ fontFamily: 'SF-Compact-Rounded-Medium' }}>
            {players[side].rating}
          </Text>
        </View>
        <CaptureTray foe={foe} lead={capturedValue} pieces={captured} />
      </View>
      <View className="rounded-xl bg-white px-2 py-1.5">
        <Text
          className="text-[13px] text-[#262626]"
          style={{ fontFamily: 'SF-Pro-Rounded-Bold', fontVariant: ['tabular-nums'] }}>
          3:00
        </Text>
      </View>
    </View>
  );
}
