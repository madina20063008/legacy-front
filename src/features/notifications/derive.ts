/**
 * Derives upcoming-birthday reminders from the family graph — no backend needed.
 * Matches the spec's reminder windows (1 month → 1 week → 3 days → the day).
 */
import type { Person } from '@/types/models';

export interface BirthdayReminder {
  personId: string;
  name: string;
  /** Whole days until the next birthday (0 = today). */
  daysUntil: number;
  /** Age they will turn on that birthday. */
  turningAge: number;
  /** Next birthday date (local). */
  date: Date;
}

const WINDOW_DAYS = 32; // slightly over a month, to cover the "1 month before" cue.

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Reminders for birthdays within the next ~month, soonest first. */
export function upcomingBirthdays(people: Person[], now = new Date()): BirthdayReminder[] {
  const today = startOfDay(now);
  const reminders: BirthdayReminder[] = [];

  for (const p of people) {
    if (!p.dateOfBirth) continue;
    const birth = new Date(p.dateOfBirth);
    if (Number.isNaN(birth.getTime())) continue;

    // Next occurrence of the birthday on/after today.
    let next = startOfDay(new Date(today.getFullYear(), birth.getMonth(), birth.getDate()));
    if (next < today) next = startOfDay(new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate()));

    const daysUntil = Math.round((next.getTime() - today.getTime()) / 86_400_000);
    if (daysUntil > WINDOW_DAYS) continue;

    reminders.push({
      personId: p.id,
      name: p.name,
      daysUntil,
      turningAge: next.getFullYear() - birth.getFullYear(),
      date: next,
    });
  }

  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
}
