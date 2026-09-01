import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGarden } from '../state/GardenContext';
import { colors, fonts } from '../theme';

function Stepper({
  emoji, label, sub, value, onMinus, onPlus,
}: { emoji: string; label: string; sub: string; value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <View style={styles.stepperRow}>
        <Pressable style={styles.stepBtn} onPress={onMinus}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable style={styles.stepBtn} onPress={onPlus}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function GoalsScreen() {
  const { state, save } = useGarden();

  const physMinus = () => save({ goalPhys: Math.max(1, state.goalPhys - 1) });
  const physPlus = () => save({ goalPhys: Math.min(Math.max(1, state.favs.phys.length), state.goalPhys + 1) });
  const mentMinus = () => save({ goalMent: Math.max(1, state.goalMent - 1) });
  const mentPlus = () => save({ goalMent: Math.min(Math.max(1, state.favs.ment.length), state.goalMent + 1) });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>Your daily goal</Text>
        <Text style={styles.subtitle}>
          How many of your favorites will you aim for each day? The minimum is one physical and one mental.
        </Text>

        <View style={{ marginTop: 26, gap: 14 }}>
          <Stepper
            emoji="💪" label="Physical per day" sub={`of ${state.favs.phys.length} favorited`}
            value={state.goalPhys} onMinus={physMinus} onPlus={physPlus}
          />
          <Stepper
            emoji="🧠" label="Mental per day" sub={`of ${state.favs.ment.length} favorited`}
            value={state.goalMent} onMinus={mentMinus} onPlus={mentPlus}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            A day counts as complete when you check off {state.goalPhys} physical and {state.goalMent} mental activities.
          </Text>
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />

        <Pressable style={styles.startBtn} onPress={() => save({ screen: 'app', view: 'home' })}>
          <Text style={styles.startBtnText}>Start tracking</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  wrap: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 24 },
  title: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 35, color: colors.ink },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.inkFaint60, marginTop: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: colors.inkFaint12,
    borderRadius: 20, padding: 20, backgroundColor: '#fff',
  },
  cardEmoji: { fontSize: 30, lineHeight: 30 },
  cardLabel: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  cardSub: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 17, color: colors.inkFaint50, marginTop: 5 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 36, height: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.inkFaint18,
    backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontFamily: fonts.sansSemi, fontSize: 18, color: colors.ink },
  stepValue: { fontFamily: fonts.serif, fontSize: 26, minWidth: 18, textAlign: 'center', color: colors.ink },
  infoBox: { marginTop: 22, borderRadius: 16, backgroundColor: colors.greenSoft08, padding: 16 },
  infoText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.green },
  startBtn: { width: '100%', borderRadius: 999, paddingVertical: 18, alignItems: 'center', backgroundColor: colors.green },
  startBtnText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.parchment },
});
