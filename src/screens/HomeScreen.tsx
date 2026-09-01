import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { breathingVideo } from '../assets';
import LoopingVideo from '../components/LoopingVideo';
import TreeSprite from '../components/TreeSprite';
import { catOf, stageForWeekDone } from '../state/gardenLogic';
import { useGarden } from '../state/GardenContext';
import { Category } from '../state/types';
import { colors, DOW, fonts } from '../theme';
import { keyOf, weekDays } from '../utils/date';

export default function HomeScreen() {
  const { state, save, patch, entry, complete, toggleDone } = useGarden();
  const now = new Date(state.now);
  const todayKey = keyOf(now);
  const dayEntry = entry(todayKey);
  const activeCat = state.activeCat;

  const week = useMemo(() => weekDays(now), [state.now]);
  const weekDone = week.filter((d) => d <= now && complete(keyOf(d))).length;
  const stage = stageForWeekDone(weekDone);

  const clockDate = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const clockTime = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });

  const dayStatusLabel = complete(todayKey) ? 'Day complete 🌱' : dayEntry.phys.length + dayEntry.ment.length > 0 ? 'In progress' : 'Not started';

  const activeNames = activeCat
    ? state.favs[activeCat].concat((dayEntry[activeCat] || []).filter((n) => state.favs[activeCat!].indexOf(n) < 0))
    : [];

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable style={styles.breathIcon} onPress={() => save({ view: 'breath' })}>
          <LoopingVideo source={breathingVideo} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.treeBadge} onPress={() => patch({ showTree: true })}>
          <TreeSprite stage={stage} size={62} />
          <Text style={styles.treeBadgeLabel}>STAGE {stage}</Text>
        </Pressable>
      </View>

      <View style={styles.helloRow}>
        <Text style={styles.hello}>Hello, {state.name}</Text>
        <Text style={styles.dayStatus}>{dayStatusLabel}</Text>
      </View>
      <View style={styles.clockRow}>
        <Text style={styles.clockDate}>{clockDate.toUpperCase()}</Text>
        <View style={styles.clockDivider} />
        <Text style={styles.clockTime}>{clockTime}</Text>
      </View>

      <View style={styles.cardsRow}>
        <GoalCard
          emoji="💪" label="Physical" done={dayEntry.phys.length} goal={state.goalPhys}
          active={activeCat === 'phys'} met={dayEntry.phys.length >= state.goalPhys}
          onPress={() => save({ activeCat: activeCat === 'phys' ? null : 'phys', addingDaily: false })}
        />
        <GoalCard
          emoji="🧠" label="Mental" done={dayEntry.ment.length} goal={state.goalMent}
          active={activeCat === 'ment'} met={dayEntry.ment.length >= state.goalMent}
          onPress={() => save({ activeCat: activeCat === 'ment' ? null : 'ment', addingDaily: false })}
        />
      </View>

      {activeCat ? (
        <View style={styles.activeCard}>
          <View style={styles.activeHeaderRow}>
            <Text style={styles.activeTitle}>{activeCat === 'phys' ? "TODAY'S PHYSICAL LIST" : "TODAY'S MENTAL LIST"}</Text>
            <Pressable onPress={() => save({ activeCat: null })}>
              <Text style={styles.hideBtn}>Hide</Text>
            </Pressable>
          </View>
          <View style={{ gap: 8, marginTop: 14 }}>
            {activeNames.map((name) => {
              const done = (dayEntry[activeCat] || []).indexOf(name) >= 0;
              return (
                <Pressable
                  key={name}
                  onPress={() => toggleDone(activeCat, name)}
                  style={[styles.itemRow, { backgroundColor: done ? colors.greenSoft09 : colors.cream, borderColor: done ? 'rgba(47,93,58,.4)' : colors.inkFaint08 }]}
                >
                  <View style={[styles.checkBox, { backgroundColor: done ? colors.green : '#fff', borderColor: done ? colors.green : colors.inkFaint18 }]}>
                    {done && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{name}</Text>
                    <Text style={styles.itemCat}>{catOf(state.lists, activeCat, name)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <AddDaily activeCat={activeCat} todayKey={todayKey} />
        </View>
      ) : (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyHintText}>Tap 💪 or 🧠 to open today's checklist.</Text>
        </View>
      )}

      <View style={styles.weekCard}>
        <View style={styles.weekHeaderRow}>
          <Text style={styles.weekKicker}>THIS WEEK</Text>
          <Text style={styles.weekDoneLabel}>{weekDone} of 7 days complete</Text>
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
      </View>
    </ScrollView>
  );
}

function GoalCard({
  emoji, label, done, goal, active, met, onPress,
}: { emoji: string; label: string; done: number; goal: number; active: boolean; met: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.goalCard,
        { borderColor: active ? 'rgba(35,32,26,.35)' : colors.inkFaint10 },
        met && { shadowColor: colors.glow, shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
      ]}
    >
      <Text style={styles.goalEmoji}>{emoji}</Text>
      <Text style={styles.goalLabel}>{label}</Text>
      <Text style={styles.goalCount}>
        {done}
        <Text style={styles.goalCountGoal}>/{goal}</Text>
      </Text>
    </Pressable>
  );
}

function AddDaily({ activeCat, todayKey }: { activeCat: Category; todayKey: string }) {
  const { state, patch, addDaily } = useGarden();
  if (state.addingDaily) {
    return (
      <View style={styles.addDailyRow}>
        <TextInput
          value={state.dailyDraft}
          onChangeText={(t) => patch({ dailyDraft: t })}
          placeholder={`Today only — e.g. Pruned the roses`}
          placeholderTextColor="rgba(35,32,26,.35)"
          style={styles.addDailyInput}
        />
        <Pressable style={styles.addDailyBtn} onPress={addDaily}>
          <Text style={styles.addDailyBtnText}>Add</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable style={styles.addDailyPrompt} onPress={() => patch({ addingDaily: true })}>
      <Text style={styles.addDailyPromptText}>+ Custom {activeCat === 'phys' ? 'physical' : 'mental'} activity for today</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 30 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  breathIcon: { width: 150, height: 112, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.blueLight },
  treeBadge: { width: 76, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint10, paddingHorizontal: 6, paddingTop: 6, paddingBottom: 8, alignItems: 'center' },
  treeBadgeLabel: { fontFamily: fonts.sansSemi, fontSize: 9, letterSpacing: 0.7, color: colors.inkFaint50, marginTop: 5 },
  helloRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 26 },
  hello: { fontFamily: fonts.serif, fontSize: 27, color: colors.ink },
  dayStatus: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.inkFaint50 },
  clockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  clockDate: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.2, color: colors.inkFaint50 },
  clockDivider: { flex: 1, height: 1, backgroundColor: colors.inkFaint12 },
  clockTime: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.inkFaint50 },
  cardsRow: { flexDirection: 'row', gap: 14, marginTop: 16 },
  goalCard: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 20, backgroundColor: '#fff', borderWidth: 1 },
  goalEmoji: { fontSize: 44, lineHeight: 46 },
  goalLabel: { fontFamily: fonts.sansSemi, fontSize: 13, marginTop: 10, color: colors.ink },
  goalCount: { fontFamily: fonts.serif, fontSize: 26, marginTop: 8, color: colors.ink },
  goalCountGoal: { fontSize: 16, opacity: 0.55 },
  activeCard: { marginTop: 20, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.inkFaint10, padding: 18, paddingBottom: 20 },
  activeHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeTitle: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.inkFaint50 },
  hideBtn: { fontFamily: fonts.sansMedium, fontSize: 12, color: 'rgba(35,32,26,.45)' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 13, borderRadius: 14, borderWidth: 1 },
  checkBox: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  checkMark: { color: colors.cream, fontSize: 13, fontFamily: fonts.sansBold },
  itemName: { fontFamily: fonts.sansMedium, fontSize: 14.5, color: colors.ink },
  itemCat: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkFaint45, marginTop: 3 },
  addDailyRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addDailyInput: { flex: 1, borderWidth: 1, borderColor: colors.inkFaint18, borderRadius: 10, padding: 11, fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  addDailyBtn: { borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: colors.green },
  addDailyBtnText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.parchment },
  addDailyPrompt: { marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.inkFaint25, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 11 },
  addDailyPromptText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkFaint60 },
  emptyHint: { marginTop: 20, alignItems: 'center', borderRadius: 22, borderWidth: 1, borderColor: colors.inkFaint20, borderStyle: 'dashed', paddingVertical: 26, paddingHorizontal: 20 },
  emptyHintText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.inkFaint50 },
  weekCard: { marginTop: 22, borderRadius: 22, backgroundColor: colors.greenSoft07, padding: 18 },
  weekHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekKicker: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.1, color: colors.green },
  weekDoneLabel: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.green },
  weekStrip: { flexDirection: 'row', gap: 7, marginTop: 14 },
  dayDot: { height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: '100%' },
  dayDotMark: { color: colors.parchment, fontSize: 13, fontFamily: fonts.sansBold },
  dayLabel: { fontFamily: fonts.sansSemi, fontSize: 9.5, color: colors.inkFaint45, marginTop: 6 },
});
