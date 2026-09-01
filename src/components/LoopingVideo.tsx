import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export default function LoopingVideo({
  source,
  style,
  contentFit = 'cover',
}: {
  source: number;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain' | 'fill';
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit={contentFit}
      nativeControls={false}
      fullscreenOptions={{ enable: false }}
      allowsPictureInPicture={false}
      pointerEvents="none"
    />
  );
}
