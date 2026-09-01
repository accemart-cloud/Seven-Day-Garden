import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MENT, PHYS } from '../data/activities';
import { fromKey, keyOf, sunday, weekDays } from '../utils/date';
import { appleCount as computeAppleCount, entry as computeEntry, isComplete, mkLists } from './gardenLogic';
import { Category, DayEntry, GardenState, PERSIST_KEYS } from './types';

const KEY = 'sevenDayGarden.v1';

// One-time content fix: "Strategic Card Games (Bridge, Chess)" was split into
// two separate activities. Saved data from before the split still has the
// old combined label baked into lists/favs/log, so rewrite it on load.
const OLD_CARD_GAMES_LABEL = 'Strategic Card Games (Bridge, Chess)';
const NEW_CARD_GAMES_LABEL = 'Strategic Card Games';
const CHESS_LABEL = 'Chess';
const PROBLEM_SOLVING_CATEGORY = 'Active Problem Solving & Brain Exercises';

function migrateSavedActivityLabels(saved: any): any {
  if (!saved) return saved;
  const rename = (arr?: string[]) => arr?.map((n) => (n === OLD_CARD_GAMES_LABEL ? NEW_CARD_GAMES_LABEL : n));

  if (saved.lists) {
    (['phys', 'ment'] as const).forEach((cat) => {
      const groups = saved.lists[cat];
      if (!Array.isArray(groups)) return;
      groups.forEach((g: any) => {
        if (Array.isArray(g.items)) g.items = rename(g.items);
        if (g.cat === PROBLEM_SOLVING_CATEGORY && Array.isArray(g.items) && !g.items.includes(CHESS_LABEL)) {
          g.items.push(CHESS_LABEL);
        }
      });
    });
  }
  if (saved.favs) {
    (['phys', 'ment'] as const).forEach((cat) => {
      if (Array.isArray(saved.favs[cat])) saved.favs[cat] = rename(saved.favs[cat]);
    });
  }
  if (saved.log) {
    Object.values(saved.log).forEach((e: any) => {
      if (!e) return;
      if (Array.isArray(e.phys)) e.phys = rename(e.phys);
      if (Array.isArray(e.ment)) e.ment = rename(e.ment);
    });
  }
  return saved;
}

function initialState(): GardenState {
  return {
    screen: 'name', nameDraft: '', name: '', startedAt: null,
    lists: { phys: mkLists(PHYS), ment: mkLists(MENT) },
    favs: { phys: [], ment: [] },
    goalPhys: 1, goalMent: 1,
    log: {}, tab: 'phys', newActDraft: '', newActCat: PHYS[0][0],
    view: 'home', activeCat: null, addingDaily: false, dailyDraft: '',
    breathPhase: 'idle', breathLeft: 300, doneLeft: 10, breathCount: 0,
    showTree: false, monthShift: 0, selKey: null, now: Date.now(),
  };
}

interface GardenApi {
  state: GardenState;
  ready: boolean;
  patch: (p: Partial<GardenState>) => void;
  save: (p: Partial<GardenState>) => void;
  entry: (key: string) => DayEntry;
  complete: (key: string) => boolean;
  appleCount: () => number;
  submitName: () => void;
  toggleFav: (cat: Category, name: string) => void;
  toggleDone: (cat: Category, name: string) => void;
  addActivity: () => void;
  addDaily: () => void;
  reset: () => void;
  startTimer: () => void;
  resetTimer: () => void;
}

const GardenCtx = createContext<GardenApi | null>(null);

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GardenState>(initialState);
  const [ready, setReady] = useState(false);
  const breathTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const saved = raw ? migrateSavedActivityLabels(JSON.parse(raw)) : null;
        if (saved) setState((prev) => ({ ...prev, ...saved, now: Date.now() }));
      } catch {
        // ignore corrupt storage
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setState((prev) => ({ ...prev, now: Date.now() })), 1000);
    return () => clearInterval(t);
  }, []);

  const patch = useCallback((p: Partial<GardenState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  const save = useCallback((p: Partial<GardenState>) => {
    setState((prev) => {
      const next = { ...prev, ...p };
      const keep: Partial<GardenState> = {};
      PERSIST_KEYS.forEach((k) => { (keep as any)[k] = (next as any)[k]; });
      AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
      return next;
    });
  }, []);

  const entryFn = useCallback((key: string) => computeEntry(state.log, key), [state.log]);
  const complete = useCallback((key: string) => isComplete(state.log, key, state.goalPhys, state.goalMent), [state.log, state.goalPhys, state.goalMent]);
  const appleCount = useCallback(() => computeAppleCount(state.log, state.goalPhys, state.goalMent), [state.log, state.goalPhys, state.goalMent]);

  const submitName = useCallback(() => {
    setState((prev) => {
      const n = prev.nameDraft.trim();
      if (!n) return prev;
      const next = { ...prev, name: n, startedAt: Date.now(), screen: 'started' as const };
      const keep: Partial<GardenState> = {};
      PERSIST_KEYS.forEach((k) => { (keep as any)[k] = (next as any)[k]; });
      AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
      return next;
    });
  }, []);

  const toggleFav = useCallback((cat: Category, name: string) => {
    setState((prev) => {
      const favs = { phys: prev.favs.phys.slice(), ment: prev.favs.ment.slice() };
      const arr = favs[cat];
      const i = arr.indexOf(name);
      if (i >= 0) arr.splice(i, 1);
      else if (arr.length < 5) arr.push(name);
      const next = { ...prev, favs };
      const keep: Partial<GardenState> = {};
      PERSIST_KEYS.forEach((k) => { (keep as any)[k] = (next as any)[k]; });
      AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
      return next;
    });
  }, []);

  const toggleDone = useCallback((cat: Category, name: string) => {
    setState((prev) => {
      const k = keyOf(new Date(prev.now));
      const e = computeEntry(prev.log, k);
      const next0 = { phys: e.phys.slice(), ment: e.ment.slice() };
      const i = next0[cat].indexOf(name);
      if (i >= 0) next0[cat].splice(i, 1); else next0[cat].push(name);
      const log = { ...prev.log, [k]: next0 };
      const next = { ...prev, log };
      const keep: Partial<GardenState> = {};
      PERSIST_KEYS.forEach((kk) => { (keep as any)[kk] = (next as any)[kk]; });
      AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
      return next;
    });
  }, []);

  const addActivity = useCallback(() => {
    setState((prev) => {
      const n = prev.newActDraft.trim();
      if (!n) return prev;
      const lists = {
        phys: mkLists(prev.lists.phys.map((g) => [g.cat, g.items] as [string, string[]])),
        ment: mkLists(prev.lists.ment.map((g) => [g.cat, g.items] as [string, string[]])),
      };
      const g = lists[prev.tab].find((g) => g.cat === prev.newActCat) || lists[prev.tab][0];
      g.items.push(n);
      const next = { ...prev, lists, newActDraft: '' };
      const keep: Partial<GardenState> = {};
      PERSIST_KEYS.forEach((k) => { (keep as any)[k] = (next as any)[k]; });
      AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
      return next;
    });
  }, []);

  const addDaily = useCallback(() => {
    setState((prev) => {
      const n = prev.dailyDraft.trim();
      if (!n || !prev.activeCat) return prev;
      const todayKey = keyOf(new Date(prev.now));
      const e0 = computeEntry(prev.log, todayKey);
      const next0 = { phys: e0.phys.slice(), ment: e0.ment.slice() };
      next0[prev.activeCat].push(n);
      const log = { ...prev.log, [todayKey]: next0 };
      const next = { ...prev, log, dailyDraft: '', addingDaily: false };
      const keep: Partial<GardenState> = {};
      PERSIST_KEYS.forEach((k) => { (keep as any)[k] = (next as any)[k]; });
      AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    AsyncStorage.removeItem(KEY).catch(() => {});
    setState(initialState());
  }, []);

  const startTimer = useCallback(() => {
    if (breathTimer.current) return;
    setState((prev) => ({ ...prev, breathPhase: 'run', breathLeft: 300 }));
    breathTimer.current = setInterval(() => {
      setState((prev) => {
        if (prev.breathPhase === 'run') {
          const left = prev.breathLeft - 1;
          if (left <= 0) {
            const next = { ...prev, breathPhase: 'done' as const, breathLeft: 0, doneLeft: 10, breathCount: (prev.breathCount || 0) + 1 };
            const keep: Partial<GardenState> = {};
            PERSIST_KEYS.forEach((k) => { (keep as any)[k] = (next as any)[k]; });
            AsyncStorage.setItem(KEY, JSON.stringify(keep)).catch(() => {});
            return next;
          }
          return { ...prev, breathLeft: left };
        } else if (prev.breathPhase === 'done') {
          const d = prev.doneLeft - 1;
          if (d <= 0) {
            if (breathTimer.current) { clearInterval(breathTimer.current); breathTimer.current = null; }
            return { ...prev, breathPhase: 'idle', breathLeft: 300 };
          }
          return { ...prev, doneLeft: d };
        }
        return prev;
      });
    }, 1000);
  }, []);

  const resetTimer = useCallback(() => {
    if (breathTimer.current) { clearInterval(breathTimer.current); breathTimer.current = null; }
    setState((prev) => ({ ...prev, breathPhase: 'idle', breathLeft: 300, doneLeft: 10 }));
  }, []);

  useEffect(() => () => { if (breathTimer.current) clearInterval(breathTimer.current); }, []);

  const value = useMemo<GardenApi>(() => ({
    state, ready, patch, save, entry: entryFn, complete, appleCount,
    submitName, toggleFav, toggleDone, addActivity, addDaily, reset,
    startTimer, resetTimer,
  }), [state, ready, patch, save, entryFn, complete, appleCount, submitName, toggleFav, toggleDone, addActivity, addDaily, reset, startTimer, resetTimer]);

  return <GardenCtx.Provider value={value}>{children}</GardenCtx.Provider>;
}

export function useGarden(): GardenApi {
  const ctx = useContext(GardenCtx);
  if (!ctx) throw new Error('useGarden must be used within GardenProvider');
  return ctx;
}

export { fromKey, keyOf, sunday, weekDays };
