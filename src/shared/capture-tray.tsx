import { Image, Text, View } from 'react-native';

import { PIECE_IMG, VALUE } from './chess-pieces';
import type { Side } from './chess-types';

export function CaptureTray({
  foe,
  lead,
  pieces,
}: {
  foe: Side;
  lead: number;
  pieces: string[];
}) {
  const sorted = [...pieces].sort((a, b) => (VALUE[a] ?? 0) - (VALUE[b] ?? 0));

  return (
    <View className="min-h-4 flex-row items-center gap-1.25">
      {sorted.length > 0 ? (
        <View className="flex-row items-center">
          {sorted.map((piece, index) => (
            <Image
              className="h-4 w-4"
              key={`${piece}-${index}`}
              source={PIECE_IMG[foe][piece]}
              style={index > 0 ? { marginLeft: -5 } : undefined}
            />
          ))}
        </View>
      ) : null}
      {lead > 0 ? (
        <Text
          className="text-xs text-[#8f9298]"
         >
          +{lead}
        </Text>
      ) : null}
    </View>
  );
}
