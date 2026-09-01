export function keyOf(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function fromKey(k: string): Date {
  const p = k.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

export function sunday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function weekDays(ref: Date): Date[] {
  const s = sunday(ref);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    out.push(d);
  }
  return out;
}
