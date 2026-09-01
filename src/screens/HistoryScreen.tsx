import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGarden } from '../state/GardenContext';
import { colors, DOW, fonts } from '../theme';
import { keyOf } from '../utils/date';

export default function HistoryScreen() {
  const { state, patch, entry, complete } = useGarden();
  const now = new Date(state.now);
  const todayKey = keyOf(now);

  const mBase = new Date(now.getFullYear(), now.getMonth() + state.monthShift, 1);
  const monthLabel = mBase.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const first = mBase.getDay();
  const dim = new Date(mBase.getFullYear(), mBase.getMonth() + 1, 0).getDate();

  const cells = useMemo(() => {
    const out: { day: number | ''; key?: string }[] = [];
    for (let i = 0; i < first; i++) out.push({ day: '' });
    for (let d = 1; d <= dim; d++) {
      out.push({ day: d, key: keyOf(new Date(mBase.getFullYear(), mBase.getMonth(), d)) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.monthShift, state.now]);

  const selKey = state.selKey || todayKey;
  const selDate = new Date(selKey.split('-').map(Number)[0], selKey.split('-').map(Number)[1] - 1, selKey.split('-').map(Number)[2]);
  const selDayLabel = selDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const selE = entry(selKey);
  const selEntries = [
    ...selE.phys.map((n) => ({ icon: '💪', name: n })),
    ...selE.ment.map((n) => ({ icon: '🧠', name: n })),
  ];
  const selSummary = `${selE.phys.length} physical · ${selE.ment.length} mental${complete(selKey) ? ' · goal met' : ''}`;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={styles.navBtn} onPress={() => patch({ monthShift: state.monthShift - 1 })}>
            <Text style={styles.navBtnText}>‹</Text>
          </Pressable>
          <Pressable style={styles.navBtn} onPress={() => patch({ monthShift: state.monthShift + 1 })}>
            <Text style={styles.navBtnText}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.dowRow}>
        {DOW.map((d) => (
          <Text key={d} style={styles.dowLabel}>{d[0]}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((c, i) => {
          if (c.day === '') return <View key={i} style={styles.cellEmpty} />;
          const k = c.key!;
          const done = complete(k);
          const any = !!state.log[k];
          const sel = selKey === k;
          const date = new Date(k.split('-').map(Number)[0], k.split('-').map(Number)[1] - 1, k.split('-').map(Number)[2]);
          const future = date > now;
          return (
            <Pressable
              key={i}
              onPress={() => patch({ selKey: k })}
              style={[
                styles.cell,
                {
                  backgroundColor: done ? colors.green : any ? colors.goldSoft30 : '#fff',
                  borderColor: sel ? colors.ink : colors.inkFaint10,
                  opacity: future ? 0.45 : 1,
                },
              ]}
            >
              <Text style={[styles.cellText, { color: done ? colors.parchment : 'rgba(35,32,26,.75)' }]}>{c.day}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.green }]} />
          <Text style={styles.legendText}>Goal met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.gold }]} />
          <Text style={styles.legendText}>Partial</Text>
        </View>
      </View>

      <View style={styles.selCard}>
        <Text style={styles.selDayLabel}>{selDayLabel}</Text>
        <Text style={styles.selSummary}>{selSummary}</Text>
        <View style={{ gap: 8, marginTop: 14 }}>
          {selEntries.map((e, i) => (
            <View key={i} style={styles.entryRow}>
              <Text style={{ fontSize: 15 }}>{e.icon}</Text>
              <Text style={styles.entryName}>{e.name}</Text>
            </View>
          ))}
        </View>
        {selEntries.length === 0 && <Text style={styles.selEmpty}>Nothing logged this day.</Text>}
      </View>
    </ScrollView>
  );
}

const CELL_GAP = 6;

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  monthLabel: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink },
  navBtn: { width: 34, height: 34, borderRadius: 999, borderWidth: 1, borderColor: colors.inkFaint18 ?? colors.inkFaint18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  dowRow: { flexDirection: 'row', gap: CELL_GAP, marginTop: 20 },
  dowLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.sansSemi, fontSize: 9.5, letterSpacing: 0.7, color: 'rgba(35,32,26,.4)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: CELL_GAP, marginTop: 10 },
  cellEmpty: { width: `${100 / 7}%`, aspectRatio: 1 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cellText: { fontFamily: fonts.sansSemi, fontSize: 14 },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.inkFaint50 },
  selCard: { marginTop: 22, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint10, padding: 18 },
  selDayLabel: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  selSummary: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.inkFaint50, marginTop: 6 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, backgroundColor: colors.cream, paddingVertical: 11, paddingHorizontal: 12 },
  entryName: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.ink },
  selEmpty: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: 'rgba(35,32,26,.42)', marginTop: 10 },
});
