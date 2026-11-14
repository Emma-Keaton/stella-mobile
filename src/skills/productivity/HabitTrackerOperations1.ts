/**
 * Stella Mobile — Habit Tracker Operations Part 1
 * Core habit management
 */

import { SkillResult, SkillContext } from '../core/types';
import { NativeBridge } from '../../native/bridges';

const STORAGE_KEY = 'stella_habits_v1';

interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reminderTime?: string;
  targetCount: number;
  createdAt: number;
  completions: Record<string, number>;
  streak: number;
  bestStreak: number;
}

async function getHabits(): Promise<Habit[]> {
  try {
    const data = await NativeBridge.deviceInfo.getItem?.(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveHabits(habits: Habit[]): Promise<void> {
  await NativeBridge.deviceInfo.setItem?.(STORAGE_KEY, JSON.stringify(habits));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateStreak(habit: Habit): number {
  const completions = habit.completions;
  if (!completions || Object.keys(completions).length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  const todayKey = getTodayKey();
  
  if (completions[todayKey] && completions[todayKey] >= habit.targetCount) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    if (completions[yesterdayKey] && completions[yesterdayKey] >= habit.targetCount) {
      streak = 1;
      currentDate = yesterday;
    } else {
      return 0;
    }
  }
  
  while (true) {
    currentDate.setDate(currentDate.getDate() - 1);
    const key = currentDate.toISOString().split('T')[0];
    if (completions[key] && completions[key] >= habit.targetCount) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export async function addHabit(params: any): Promise<any> {
  const { name, frequency = 'daily', reminderTime, targetCount = 1 } = params;
  
  if (!name) {
    return { title: 'Habit Tracker', summary: 'Habit name is required', spokenNarrative: 'Please provide a habit name', operation: 'add', ok: false };
  }

  const habits = await getHabits();
  if (habits.some(h => h.name.toLowerCase() === name.toLowerCase())) {
    return { title: 'Habit Tracker', summary: `Habit "${name}" already exists`, spokenNarrative: `Habit ${name} already exists`, operation: 'add', ok: false };
  }

  const newHabit: Habit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    frequency,
    reminderTime,
    targetCount,
    createdAt: Date.now(),
    completions: {},
    streak: 0,
    bestStreak: 0,
  };

  habits.push(newHabit);
  await saveHabits(habits);

  return { 
    title: 'Habit Added', 
    summary: `Added habit: ${name} (${frequency})${reminderTime ? ` with reminder at ${reminderTime}` : ''}`, 
    spokenNarrative: `Added habit ${name}`, 
    operation: 'add', 
    ok: true, 
    record: newHabit 
  };
}

export async function listHabits(): Promise<any> {
  const habits = await getHabits();
  
  if (habits.length === 0) {
    return { 
      title: 'Habits', 
      summary: 'No habits tracked yet. Add your first habit!', 
      spokenNarrative: 'No habits yet', 
      operation: 'list', 
      ok: true, 
      record: { habits: [], count: 0 } 
    };
  }

  const todayKey = getTodayKey();
  const lines = habits.map((h, i) => {
    const completedToday = h.completions[todayKey] >= h.targetCount;
    const status = completedToday ? '✅' : '⭕';
    const streak = calculateStreak(h);
    return `${i + 1}. ${status} ${h.name} — ${h.frequency} | Streak: ${streak}${h.reminderTime ? ` | ⏰ ${h.reminderTime}` : ''}`;
  });

  return { 
    title: 'Your Habits', 
    summary: `${habits.length} habit(s):\n${lines.join('\n')}`, 
    spokenNarrative: `You have ${habits.length} habits`, 
    operation: 'list', 
    ok: true, 
    record: { habits, count: habits.length } 
  };
}