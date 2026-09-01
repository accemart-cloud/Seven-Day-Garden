import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { stageImages } from '../assets';
import { colors } from '../theme';

export default function TreeSprite({ stage, size }: { stage: number; size: number }) {
  const glow = stage === 7;
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size },
        glow && {
          shadowColor: colors.gold,
          shadowOpacity: 0.9,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
        },
      ]}
    >
      <Image source={stageImages[stage - 1]} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%' },
});
