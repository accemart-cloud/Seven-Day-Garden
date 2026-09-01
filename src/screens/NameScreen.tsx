import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { glowingSproutVideo } from '../assets';
import LoopingVideo from '../components/LoopingVideo';
import { useGarden } from '../state/GardenContext';
import { colors, fonts } from '../theme';

export default function NameScreen() {
  const { state, patch, submitName } = useGarden();
  const canSubmit = state.nameDraft.trim().length > 0;

  return (
    <LinearGradient colors={[colors.cream, colors.creamAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.wrap}>
            <LoopingVideo source={glowingSproutVideo} style={styles.sprout} contentFit="cover" />

            <Text style={styles.title}>
              Seven Day{'\n'}
              <Text style={styles.titleItalic}>Garden</Text>
            </Text>
            <Text style={styles.subtitle}>Before we plant anything — what should we call you?</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>YOUR NAME</Text>
              <TextInput
                value={state.nameDraft}
                onChangeText={(t) => patch({ nameDraft: t })}
                onSubmitEditing={submitName}
                placeholder="e.g. Marguerite"
                placeholderTextColor="rgba(35,32,26,.35)"
                style={styles.input}
                returnKeyType="done"
              />
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
              disabled={!canSubmit}
              onPress={submitName}
              style={[styles.beginBtn, { backgroundColor: canSubmit ? colors.green : colors.inkFaint14 }]}
            >
              <Text style={[styles.beginBtnText, { color: canSubmit ? colors.parchment : 'rgba(35,32,26,.4)' }]}>
                Begin my journey
              </Text>
            </Pressable>
            <Text style={styles.footerNote}>Nothing leaves your phone.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 20 },
  sprout: { width: 76, height: 76, borderRadius: 999, backgroundColor: colors.green },
  title: { fontFamily: fonts.serif, fontSize: 46, lineHeight: 48, color: colors.ink, marginTop: 26 },
  titleItalic: { fontStyle: 'italic' },
  subtitle: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.inkFaint60, marginTop: 14, maxWidth: 280 },
  fieldWrap: { marginTop: 34 },
  fieldLabel: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.4, color: colors.inkFaint45 },
  input: {
    marginTop: 10, borderBottomWidth: 1.5, borderBottomColor: colors.inkFaint25,
    paddingVertical: 10, paddingHorizontal: 2, fontFamily: fonts.serif, fontSize: 26, color: colors.ink,
  },
  beginBtn: { borderRadius: 999, paddingVertical: 18, alignItems: 'center' },
  beginBtnText: { fontFamily: fonts.sansSemi, fontSize: 16 },
  footerNote: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: 'rgba(35,32,26,.42)', textAlign: 'center', marginTop: 14 },
});
