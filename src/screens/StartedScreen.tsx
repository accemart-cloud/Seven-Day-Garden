import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGarden } from '../state/GardenContext';
import { colors, fonts } from '../theme';

export default function StartedScreen() {
  const { state, save } = useGarden();
  const started = state.startedAt ? new Date(state.startedAt) : new Date(state.now);
  const dateLong = started.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeLong = started.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <LinearGradient colors={[colors.green, colors.greenDark]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.wrap}>
          <Text style={styles.kicker}>JOURNEY STARTED</Text>
          <Text style={styles.welcome}>
            Welcome,{'\n'}
            <Text style={{ fontStyle: 'italic' }}>{state.name}</Text>.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardKicker}>YOUR CLOCK STARTS</Text>
            <Text style={styles.cardDate}>{dateLong}</Text>
            <Text style={styles.cardTime}>{timeLong}</Text>
          </View>

          <Text style={styles.body}>
            From this moment forward, every day you meet your goals grows your tree. Sundays reset the season —
            seven perfect days earn a golden apple.
          </Text>

          <View style={{ flex: 1 }} />

          <Pressable style={styles.btn} onPress={() => save({ screen: 'fav' })}>
            <Text style={styles.btnText}>Choose my favorites</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 20 },
  kicker: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.6, color: 'rgba(244,239,226,.6)' },
  welcome: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 46, color: colors.parchment, marginTop: 18 },
  card: {
    marginTop: 34, borderWidth: 1, borderColor: 'rgba(244,239,226,.24)', borderRadius: 18,
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 24, backgroundColor: 'rgba(244,239,226,.07)',
  },
  cardKicker: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.4, color: 'rgba(244,239,226,.6)' },
  cardDate: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, color: colors.parchment, marginTop: 12 },
  cardTime: { fontFamily: fonts.sansMedium, fontSize: 17, color: 'rgba(244,239,226,.85)', marginTop: 10 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, color: 'rgba(244,239,226,.78)', marginTop: 26 },
  btn: { width: '100%', borderRadius: 999, paddingVertical: 18, alignItems: 'center', backgroundColor: colors.parchment },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.greenDark },
});
