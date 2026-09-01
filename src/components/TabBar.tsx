import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

export type TabKey = 'home' | 'cal' | 'fav';

export default function TabBar({ active, onSelect }: { active: TabKey; onSelect: (k: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  const items: { key: TabKey; icon: string; label: string }[] = [
    { key: 'home', icon: '◈', label: 'Today' },
    { key: 'cal', icon: '▤', label: 'History' },
    { key: 'fav', icon: '♥', label: 'Favorites' },
  ];
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(10, insets.bottom) }]}>
      {items.map((it) => {
        const on = active === it.key;
        return (
          <Pressable key={it.key} onPress={() => onSelect(it.key)} style={[styles.tab, on && styles.tabOn]}>
            <Text style={styles.icon}>{it.icon}</Text>
            <Text style={[styles.label, { color: on ? colors.ink : 'rgba(35,32,26,.42)' }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 26,
    paddingTop: 10,
    backgroundColor: 'rgba(247,243,234,.96)',
    borderTopWidth: 1,
    borderTopColor: colors.inkFaint09,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 16 },
  tabOn: { backgroundColor: colors.inkFaint09 },
  icon: { fontSize: 17, lineHeight: 20 },
  label: { fontFamily: fonts.sansSemi, fontSize: 10.5, marginTop: 5 },
});
