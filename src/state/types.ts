export type Category = 'phys' | 'ment';

export type ActivityGroup = { cat: string; items: string[] };
export type Lists = { phys: ActivityGroup[]; ment: ActivityGroup[] };
export type Favs = { phys: string[]; ment: string[] };
export type DayEntry = { phys: string[]; ment: string[] };
export type Log = Record<string, DayEntry>;

export type Screen = 'name' | 'started' | 'fav' | 'goals' | 'app';
export type View = 'home' | 'cal' | 'breath' | 'fav';
export type BreathPhase = 'idle' | 'run' | 'done';

export interface GardenState {
  screen: Screen;
  nameDraft: string;
  name: string;
  startedAt: number | null;
  lists: Lists;
  favs: Favs;
  goalPhys: number;
  goalMent: number;
  log: Log;
  tab: Category;
  newActDraft: string;
  newActCat: string;
  view: View;
  activeCat: Category | null;
  addingDaily: boolean;
  dailyDraft: string;
  breathPhase: BreathPhase;
  breathLeft: number;
  doneLeft: number;
  breathCount: number;
  showTree: boolean;
  monthShift: number;
  selKey: string | null;
  now: number;
}

/** Fields written to AsyncStorage — mirrors the prototype's save() keep-list. */
export const PERSIST_KEYS: (keyof GardenState)[] = [
  'screen', 'name', 'startedAt', 'lists', 'favs', 'goalPhys', 'goalMent',
  'log', 'tab', 'view', 'activeCat', 'breathCount',
];
