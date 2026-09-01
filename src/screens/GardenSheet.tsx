import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goldenApple } from '../assets';
import TreeSprite from '../components/TreeSprite';
import { stageForWeekDone } from '../state/gardenLogic';
import { useGarden } from '../state/GardenContext';
import { colors, DOW, fonts, STAGE_NAMES } from '../theme';
import { keyOf, sunday, weekDays } from '../utils/date';

export default function GardenSheet() {
  const { state, patch, complete, appleCount, seedDemo } = useGarden();
  const insets = useSafeAreaInsets();
  const now = new Date(state.now);
  const todayKey = keyOf(now);
  const week = weekDays(now);
  const weekDone = week.filter((d) => d <= now && complete(keyOf(d))).length;
  const stage = stageForWeekDone(weekDone);

  const started = state.startedAt ? new Date(state.startedAt) : now;
  const startDateShort = started.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const startTimeShort = started.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const weekOfLabel = sunday(now).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const stageHint = stage === 7
    ? 'A perfect week — golden apple awarded.'
    : `Complete ${stage === 1 && weekDone === 0 ? 'today' : 'one more day'} to reach stage ${Math.min(7, stage + 1)}.`;

  const close = () => patch({ showTree: false });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grabberRow}>
              <View style={styles.grabber} />
            </View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Your garden</Text>
                <Text style={styles.subtitle}>Week of {weekOfLabel}</Text>
              </View>
              <Pressable onPress={close} hitSlop={8}>
                <Text style={styles.closeBtn}>Close</Text>
              </Pressable>
            </View>

            <LinearGradient colors={['#EAF3E4', '#DCEBD3']} style={styles.treeCard}>
              <TreeSprite stage={stage} size={180} />
            </LinearGradient>

            <Text style={styles.stageLine}>Stage {stage} of 7 — {STAGE_NAMES[stage - 1]}</Text>
            <Text style={styles.stageHint}>{stageHint}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Image source={goldenApple} style={styles.appleImg} resizeMode="contain" />
                <View>
                  <Text style={styles.statValue}>{appleCount()}</Text>
                  <Text style={styles.statLabel}>GOLDEN APPLES</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.lungEmoji}>🫁</Text>
                <View>
                  <Text style={styles.statValue}>{state.breathCount || 0}</Text>
                  <Text style={styles.statLabel}>BREATHING{'\n'}SESSIONS</Text>
                </View>
              </View>
            </View>

            <View style={styles.startCard}>
              <Text style={styles.startDate}>{startDateShort}</Text>
              <Text style={styles.startLabel}>JOURNEY BEGAN{'\n'}{startTimeShort}</Text>
            </View>

            <View style={styles.weekStrip}>
              {week.map((d, i) => {
                const k = keyOf(d);
                const done = complete(k);
                const any = !!state.log[k];
                const future = d > now && k !== todayKey;
                const isToday = k === todayKey;
                return (
                  <View key={k} style={{ flex: 1, alignItems: 'center' }}>
                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: done ? colors.green : any ? colors.goldSoft : colors.inkFaint08,
                          opacity: future ? 0.4 : 1,
                          borderWidth: isToday ? 2 : 0,
                          borderColor: 'rgba(47,93,58,.55)',
                        },
                      ]}
                    >
                      {done && <Text style={styles.dayDotMark}>✓</Text>}
                    </View>
                    <Text style={styles.dayLabel}>{DOW[i][0]}</Text>
                  </View>
                );
              })}
            </View>

            <Pressable style={styles.seedBtn} onPress={seedDemo}>
              <Text style={styles.seedBtnText}>Load three weeks of sample history</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(35,32,26,.42)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', backgroundColor: colors.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 22 },
  grabberRow: { alignItems: 'center' },
  grabber: { width: 44, height: 4, borderRadius: 99, backgroundColor: colors.inkFaint20 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 16 },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
  subtitle: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.inkFaint55, marginTop: 6 },
  closeBtn: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.inkFaint50, paddingVertical: 4, paddingHorizontal: 6 },
  treeCard: { marginTop: 14, borderRadius: 22, padding: 16, alignItems: 'center', justifyContent: 'center' },
  stageLine: { textAlign: 'center', fontFamily: fonts.serif, fontSize: 19, color: colors.ink, marginTop: 14 },
  stageHint: { textAlign: 'center', fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.inkFaint55, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint10, padding: 16 },
  appleImg: { width: 38, height: 38 },
  lungEmoji: { fontSize: 28 },
  statValue: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  statLabel: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1, color: colors.inkFaint45, marginTop: 5 },
  startCard: { marginTop: 12, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint10, padding: 16 },
  startDate: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  startLabel: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1, color: colors.inkFaint45, marginTop: 6, lineHeight: 14 },
  weekStrip: { flexDirection: 'row', gap: 7, marginTop: 18 },
  dayDot: { height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: '100%' },
  dayDotMark: { color: colors.parchment, fontSize: 13, fontFamily: fonts.sansBold },
  dayLabel: { fontFamily: fonts.sansSemi, fontSize: 9.5, color: colors.inkFaint45, marginTop: 6 },
  seedBtn: { marginTop: 20, borderWidth: 1, borderColor: colors.inkFaint18, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  seedBtnText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkFaint60 },
});
