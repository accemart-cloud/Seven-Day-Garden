import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGarden } from '../state/GardenContext';
import { colors, fonts } from '../theme';

export default function BreathingScreen() {
  const { state, save, startTimer, resetTimer } = useGarden();
  const phase = state.breathPhase || 'idle';
  const idle = phase === 'idle';
  const running = phase === 'run';
  const done = phase === 'done';
  const resettable = phase !== 'idle';

  const min = Math.floor((state.breathLeft ?? 300) / 60);
  const sec = String((state.breathLeft ?? 300) % 60).padStart(2, '0');

  const hint = running
    ? 'Two quick inhales through the nose, one long exhale through the mouth.'
    : done
      ? `Resetting in ${state.doneLeft}s…`
      : 'Tap to begin a five-minute cyclic sighing session.';

  return (
    <LinearGradient colors={['#E8F4FD', colors.cream]} locations={[0, 0.46]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Pressable onPress={() => save({ view: 'home' })} style={styles.backRow} hitSlop={8}>
          <Text style={styles.backText}>‹ Today</Text>
        </Pressable>

        <Text style={styles.title}>Cyclic Sighing</Text>
        <View style={styles.subheaderRow}>
          <Text style={styles.kicker}>PHYSIOLOGICAL SIGH</Text>
          <View style={styles.pill}>
            <Text style={{ fontSize: 15, lineHeight: 15 }}>🫁</Text>
            <Text style={styles.pillText}>{state.breathCount || 0} completed</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardKicker}>THE SCIENCE</Text>
          <Text style={styles.cardBody}>
            A 2023 study by Stanford researchers (Huberman et al., <Text style={{ fontStyle: 'italic' }}>Cell Reports Medicine</Text>)
            {' '}showed that cyclic sighing for just 5 minutes a day produced greater improvements in mood and anxiety
            reduction than mindfulness meditation or standard box breathing.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardKicker}>HOW TO DO IT</Text>
          <View style={{ gap: 12, marginTop: 14 }}>
            <Step n={1} text={'Take two consecutive quick inhales through your nose — one full inhale, followed immediately by a sharp "top-off" inhale to expand the lungs fully.'} />
            <Step n={2} text="Then slowly and fully exhale through your mouth." />
            <Step n={3} text="Repeat for 3–5 minutes." />
          </View>
        </View>

        <Pressable
          onPress={() => { if (idle) startTimer(); }}
          style={[
            styles.timer,
            done && { shadowColor: colors.blueGlow, shadowOpacity: 0.9, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 14, borderWidth: 2, borderColor: colors.blueGlowRing },
          ]}
        >
          <LinearGradient colors={[colors.blueMid, colors.blueDeep]} style={StyleSheet.absoluteFill as any} />
          {idle && (
            <View>
              <Text style={styles.timerStart}>Start</Text>
              <Text style={styles.timerSub}>5 minute session</Text>
            </View>
          )}
          {running && (
            <View style={styles.timerRunRow}>
              <Text style={styles.timerMin}>{min}</Text>
              <Text style={styles.timerSec}>:{sec}</Text>
            </View>
          )}
          {done && (
            <View>
              <Text style={styles.timerDone}>Done</Text>
              <Text style={styles.timerSub}>Nice work — five full minutes</Text>
            </View>
          )}
        </Pressable>

        {resettable && (
          <Pressable style={styles.resetBtn} onPress={resetTimer}>
            <Text style={styles.resetBtnText}>Reset timer</Text>
          </Pressable>
        )}
        <Text style={styles.hint}>{hint}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 30 },
  backRow: { alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.sansSemi, fontSize: 12, color: 'rgba(35,32,26,.55)' },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink, marginTop: 22 },
  subheaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  kicker: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.4, color: colors.inkFaint45 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, backgroundColor: colors.blueSoft14, paddingVertical: 6, paddingHorizontal: 12, paddingLeft: 9 },
  pillText: { fontFamily: fonts.sansSemi, fontSize: 12, color: '#22516F' },
  card: { marginTop: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint10, padding: 18 },
  cardKicker: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.3, color: colors.green },
  cardBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.inkFaint78, marginTop: 10 },
  stepBadge: { width: 22, height: 22, borderRadius: 999, backgroundColor: colors.blueSoft28, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontFamily: fonts.sansBold, fontSize: 11, color: '#22516F' },
  stepText: { flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.inkFaint78 },
  timer: { marginTop: 22, borderRadius: 24, paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  timerStart: { fontFamily: fonts.serif, fontSize: 40, color: colors.parchment, textAlign: 'center' },
  timerSub: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.4, color: 'rgba(244,239,226,.65)', marginTop: 10, textAlign: 'center' },
  timerRunRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  timerMin: { fontFamily: fonts.serif, fontSize: 68, color: colors.parchment },
  timerSec: { fontFamily: fonts.sansMedium, fontSize: 22, color: 'rgba(244,239,226,.72)' },
  timerDone: { fontFamily: fonts.serif, fontSize: 44, color: colors.parchment, textAlign: 'center' },
  resetBtn: { marginTop: 12, width: '100%', borderWidth: 1, borderColor: colors.inkFaint18, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  resetBtnText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkFaint60 },
  hint: { textAlign: 'center', fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.inkFaint45, marginTop: 10 },
});
