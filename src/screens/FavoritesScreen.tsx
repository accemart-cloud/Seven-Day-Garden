import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBar, { TabKey } from '../components/TabBar';
import { catOf, subCategoryCount } from '../state/gardenLogic';
import { useGarden } from '../state/GardenContext';
import { Category } from '../state/types';
import { colors, fonts } from '../theme';

export default function FavoritesScreen() {
  const { state, save, patch, toggleFav, addActivity } = useGarden();
  const tab: Category = state.tab;
  const inApp = state.view === 'fav';
  const favTotal = state.favs.phys.length + state.favs.ment.length;

  const pOk = state.favs.phys.length >= 2 && subCategoryCount(state.favs.phys, state.lists, 'phys') >= 2;
  const mOk = state.favs.ment.length >= 3 && subCategoryCount(state.favs.ment, state.lists, 'ment') >= 3;

  const setTab = (t: Category) => save({ tab: t, newActCat: state.lists[t][0].cat });

  const physMinus = () => save({ goalPhys: Math.max(1, state.goalPhys - 1) });
  const physPlus = () => save({ goalPhys: Math.min(Math.max(1, state.favs.phys.length), state.goalPhys + 1) });
  const mentMinus = () => save({ goalMent: Math.max(1, state.goalMent - 1) });
  const mentPlus = () => save({ goalMent: Math.min(Math.max(1, state.favs.ment.length), state.goalMent + 1) });

  const goTab = (k: TabKey) => {
    if (k === 'home') save({ screen: 'app', view: 'home' });
    else if (k === 'cal') save({ screen: 'app', view: 'cal' });
    else save({ screen: 'fav', view: 'fav' });
  };

  const canContinue = favTotal === 10;
  const groups = state.lists[tab];
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Favorite five each</Text>
          <Text style={styles.count}>
            {(tab === 'phys' ? state.favs.phys.length : state.favs.ment.length)} of 5 · {favTotal} of 10 total
          </Text>
        </View>
        <Text style={styles.desc}>
          Pick <Text style={styles.bold}>5 physical</Text> and <Text style={styles.bold}>5 mental</Text>. Ideally at
          least <Text style={styles.bold}>2 physical</Text> from different sub-categories and{' '}
          <Text style={styles.bold}>3 mental</Text> from different sub-categories. Change them any time.
        </Text>
        <View style={{ marginTop: 12, gap: 6 }}>
          <Text style={[styles.advice, { color: pOk ? colors.green : colors.inkFaint50 }]}>
            {pOk ? '✓ 2 physical from different sub-categories' : '· Aim for 2 physical picks in 2 different sub-categories'}
          </Text>
          <Text style={[styles.advice, { color: mOk ? colors.green : colors.inkFaint50 }]}>
            {mOk ? '✓ 3 mental from different sub-categories' : '· Aim for 3 mental picks in 3 different sub-categories'}
          </Text>
        </View>
        <View style={styles.tabRow}>
          <Pressable style={[styles.tabBtn, tab === 'phys' && styles.tabBtnOn]} onPress={() => setTab('phys')}>
            <Text style={[styles.tabBtnText, tab === 'phys' && styles.tabBtnTextOn]}>💪 Physical</Text>
          </Pressable>
          <Pressable style={[styles.tabBtn, tab === 'ment' && styles.tabBtnOn]} onPress={() => setTab('ment')}>
            <Text style={[styles.tabBtnText, tab === 'ment' && styles.tabBtnTextOn]}>🧠 Mental</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
        {inApp && (
          <View style={styles.dailyGoalCard}>
            <Text style={styles.dailyGoalKicker}>DAILY GOAL</Text>
            <View style={styles.dailyGoalRow}>
              <Text style={styles.dailyGoalEmoji}>💪</Text>
              <Text style={styles.dailyGoalLabel}>Physical per day</Text>
              <Pressable style={styles.stepBtn} onPress={physMinus}><Text style={styles.stepBtnText}>−</Text></Pressable>
              <Text style={styles.stepValue}>{state.goalPhys}</Text>
              <Pressable style={styles.stepBtn} onPress={physPlus}><Text style={styles.stepBtnText}>+</Text></Pressable>
            </View>
            <View style={styles.hr} />
            <View style={styles.dailyGoalRow}>
              <Text style={styles.dailyGoalEmoji}>🧠</Text>
              <Text style={styles.dailyGoalLabel}>Mental per day</Text>
              <Pressable style={styles.stepBtn} onPress={mentMinus}><Text style={styles.stepBtnText}>−</Text></Pressable>
              <Text style={styles.stepValue}>{state.goalMent}</Text>
              <Pressable style={styles.stepBtn} onPress={mentPlus}><Text style={styles.stepBtnText}>+</Text></Pressable>
            </View>
            <Text style={styles.dailyGoalHint}>
              Minimum one of each. A day counts as complete at {state.goalPhys} physical and {state.goalMent} mental.
            </Text>
          </View>
        )}

        {groups.map((g) => (
          <View key={g.cat} style={{ marginBottom: 22 }}>
            <Text style={styles.groupLabel}>{g.cat}</Text>
            <View style={{ gap: 7 }}>
              {g.items.map((name) => {
                const on = state.favs[tab].indexOf(name) >= 0;
                return (
                  <Pressable
                    key={name}
                    onPress={() => toggleFav(tab, name)}
                    style={[styles.row, { backgroundColor: on ? colors.greenSoft10 : '#fff', borderColor: on ? 'rgba(47,93,58,.45)' : colors.inkFaint10 }]}
                  >
                    <Text style={styles.rowText}>{name}</Text>
                    <Text style={[styles.heart, { color: on ? colors.red : 'rgba(35,32,26,.2)' }]}>♥</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <AddYourOwn tab={tab} />
      </ScrollView>

      {!inApp && (
        <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
          <Pressable
            disabled={!canContinue}
            style={[styles.continueBtn, { backgroundColor: canContinue ? colors.green : colors.inkFaint14 }]}
            onPress={() => {
              if (canContinue) {
                save({
                  screen: 'goals',
                  goalPhys: Math.min(state.goalPhys, Math.max(1, state.favs.phys.length)),
                  goalMent: Math.min(state.goalMent, Math.max(1, state.favs.ment.length)),
                });
              }
            }}
          >
            <Text style={[styles.continueBtnText, { color: canContinue ? colors.parchment : 'rgba(35,32,26,.42)' }]}>
              {canContinue ? 'Set my daily goal' : `Pick ${10 - favTotal} more to continue (5 physical, 5 mental)`}
            </Text>
          </Pressable>
        </View>
      )}

      {inApp && <TabBar active="fav" onSelect={goTab} />}
    </SafeAreaView>
  );
}

function AddYourOwn({ tab }: { tab: Category }) {
  const { state, patch, addActivity } = useGarden();
  const cats = state.lists[tab];
  return (
    <View style={styles.addCard}>
      <Text style={styles.addTitle}>Add your own {tab === 'phys' ? 'physical' : 'mental'} activity</Text>
      <TextInput
        value={state.newActDraft}
        onChangeText={(t) => patch({ newActDraft: t })}
        placeholder="Activity name"
        placeholderTextColor="rgba(35,32,26,.35)"
        style={styles.addInput}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 8 }}>
        {cats.map((g) => {
          const on = state.newActCat === g.cat;
          return (
            <Pressable
              key={g.cat}
              onPress={() => patch({ newActCat: g.cat })}
              style={[styles.chip, { backgroundColor: on ? colors.ink : '#fff', borderColor: on ? colors.ink : colors.inkFaint18 }]}
            >
              <Text style={[styles.chipText, { color: on ? colors.cream : colors.inkFaint60 }]}>{g.cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable style={styles.addBtn} onPress={addActivity}>
        <Text style={styles.addBtnText}>Add to list</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 14, backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.inkFaint09 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink },
  count: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.green },
  desc: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.inkFaint60, marginTop: 8 },
  bold: { fontFamily: fonts.sansBold },
  advice: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 16 },
  tabRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  tabBtn: { flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: colors.inkFaint18 },
  tabBtnOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabBtnText: { fontFamily: fonts.sansSemi, fontSize: 13, color: 'rgba(35,32,26,.6)' },
  tabBtnTextOn: { color: colors.cream },
  body: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  dailyGoalCard: { marginBottom: 22, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint12, padding: 16 },
  dailyGoalKicker: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.3, color: colors.inkFaint45 },
  dailyGoalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  dailyGoalEmoji: { fontSize: 22, lineHeight: 22 },
  dailyGoalLabel: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  dailyGoalHint: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.inkFaint50, marginTop: 12 },
  hr: { height: 1, backgroundColor: colors.inkFaint08, marginVertical: 14 },
  stepBtn: { width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: colors.inkFaint18, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.sansSemi, fontSize: 17, color: colors.ink },
  stepValue: { fontFamily: fonts.serif, fontSize: 22, minWidth: 16, textAlign: 'center', color: colors.ink },
  groupLabel: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.3, color: colors.inkFaint45, marginBottom: 9 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 14, borderWidth: 1 },
  rowText: { fontFamily: fonts.sansMedium, fontSize: 14.5, color: colors.ink, flexShrink: 1 },
  heart: { fontSize: 16 },
  addCard: { borderWidth: 1, borderColor: colors.inkFaint25, borderStyle: 'dashed', borderRadius: 16, padding: 16 },
  addTitle: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 0.6, color: 'rgba(35,32,26,.55)', textTransform: 'uppercase' },
  addInput: { marginTop: 12, borderWidth: 1, borderColor: colors.inkFaint18, borderRadius: 10, backgroundColor: '#fff', paddingVertical: 11, paddingHorizontal: 12, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 12 },
  addBtn: { marginTop: 10, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.ink },
  addBtnText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.cream },
  footer: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 24, backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.inkFaint09 },
  continueBtn: { width: '100%', borderRadius: 999, paddingVertical: 17, alignItems: 'center' },
  continueBtnText: { fontFamily: fonts.sansSemi, fontSize: 15 },
});
