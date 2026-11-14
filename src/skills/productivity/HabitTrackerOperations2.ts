/**
 * Stella Mobile — Habit Tracker Operations Part 2
 * Complete habit, stats
 */

import { SkillResult } from '../core/types';
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

async function getHabits(): Promise<any[]> {
  try {
    const data = await NativeBridge.deviceInfo.getItem?.(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveHabits(habits: any[]): Promise<void> {
  await NativeBridge.deviceInfo.setItem?.(STORAGE_KEY, JSON.stringify(habits));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateStreak(habit: any): number {
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

export async function completeHabit(params: any): Promise<any> {
  const { name, date = getTodayKey() } = params;
  
  if (!name) {
    return { title: 'Habit Tracker', summary: 'Habit name is required', spokenNarrative: 'Please provide a habit name', operation: 'complete', ok: false };
  }

  const habits = await getHabits();
  const habitIndex = habits.findIndex(h => h.name.toLowerCase() === name.toLowerCase());
  
  if (habitIndex === -1) {
    return { title: 'Habit Tracker', summary: `Habit "${name}" not found`, spokenNarrative: `Habit ${name} not found`, operation: 'complete', ok: false };
  }

  const habit = habits[habitIndex];
  const currentCount = habit.completions[date] || 0;
  habit.completions[date] = currentCount + 1;
  
  habit.streak = calculateStreak(habit);
  if (habit.streak > habit.bestStreak) {
    habit.bestStreak = habit.streak;
  }
  
  await saveHabits(habits);

  const completed = habit.completions[date] >= habit.targetCount;
  return { 
    title: 'Habit Completed', 
    summary: `✅ ${name} ${completed ? '(target reached!)' : `(${habit.completions[date]}/${habit.targetCount})`}\nStreak: ${habit.streak} | Best: ${habit.bestStreak}`, 
    spokenNarrative: `Completed ${name}. Streak is now ${habit.streak}`, 
    operation: 'complete', 
    ok: true, 
    record: { habit: habits[habitIndex], completed, streak: habit.streak } 
  };
}

export async function getStats(): Promise<any> {
  const habits = await getHabits();
  
  if (habits.length === 0) {
    return { 
      title: 'Habit Stats', 
      summary: 'No habits to show stats for', 
      spokenNarrative: 'No habits yet', 
      operation: 'stats', 
      ok: true, 
      record: { totalHabits: 0 } 
    };
  }

  const totalCompletions = habits.reduce((sum, h) => sum + Object.values(h.completions).reduce((a, b) => a + b, 0), 0);
  const avgStreak = habits.reduce((sum, h) => sum + h.streak, 0) / habits.length;
  const bestStreak = Math.max(...habits.map(h => h.bestStreak));
  const completedToday = habits.filter(h => h.completions[getTodayKey()] >= h.targetCount).length;

  const lines = [
    `Total Habits: ${habits.length}`,
    `Completed Today: ${completedToday}/${habits.length}`,
    `Total Completions: ${totalCompletions}`,
    `Average Streak: ${avgStreak.toFixed(1)}`,
    `Best Streak: ${bestStreak}`,
  ];

  return { 
    title: 'Habit Statistics', 
    summary: lines.join('\n'), 
    spokenNarrative: `You have ${habits.length} habits with ${completedToday} completed today`, 
    operation: 'stats', 
    ok: true, 
    record: { totalHabits: habits.length, completedToday, totalCompletions, avgStreak, bestStreak } 
  };
}

async function getHabits(): Promise<any[]> {
  try {
    const data = await NativeBridge.deviceInfo.getItem?.(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveHabits(habits: any[]): Promise<void> {
  await NativeBridge.deviceInfo.setItem?.(STORAGE_KEY, JSON.stringify(habits));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}