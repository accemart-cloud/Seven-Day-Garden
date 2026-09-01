import { ActivityGroupSource } from '../data/activities';
import { keyOf, fromKey, sunday, weekDays } from '../utils/date';
import { ActivityGroup, Category, DayEntry, Lists, Log } from './types';

export function mkLists(src: ActivityGroupSource[]): ActivityGroup[] {
  return src.map((g) => ({ cat: g[0], items: g[1].slice() }));
}

export function entry(log: Log, key: string): DayEntry {
  return log[key] || { phys: [], ment: [] };
}

export function isComplete(log: Log, key: string, goalPhys: number, goalMent: number): boolean {
  const e = entry(log, key);
  return e.phys.length >= goalPhys && e.ment.length >= goalMent;
}

export function appleCount(log: Log, goalPhys: number, goalMent: number): number {
  const weeks: Record<string, boolean> = {};
  Object.keys(log).forEach((k) => { weeks[keyOf(sunday(fromKey(k)))] = true; });
  let n = 0;
  Object.keys(weeks).forEach((ws) => {
    const all = weekDays(fromKey(ws)).every((d) => isComplete(log, keyOf(d), goalPhys, goalMent));
    if (all) n++;
  });
  return n;
}

export function catOf(lists: Lists, cat: Category, name: string): string {
  const g = lists[cat].find((g) => g.items.indexOf(name) >= 0);
  return g ? g.cat : 'Custom';
}

export function subCategoryCount(favs: string[], lists: Lists, cat: Category): number {
  const set: Record<string, boolean> = {};
  favs.forEach((n) => { set[catOf(lists, cat, n)] = true; });
  return Object.keys(set).length;
}

export function stageForWeekDone(weekDone: number): number {
  return Math.min(7, Math.max(1, weekDone || 1));
}
