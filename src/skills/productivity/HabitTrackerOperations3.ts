/**
 * Stella Mobile — Habit Tracker Operations Part 3
 * Delete habit, sources
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

export async function deleteHabit(params: any): Promise<any> {
  const { name } = params;
  
  if (!name) {
    return { title: 'Habit Tracker', summary: 'Habit name is required', spokenNarrative: 'Please provide a habit name', operation: 'delete', ok: false };
  }

  const habits = await getHabits();
  const filtered = habits.filter(h => h.name.toLowerCase() !== name.toLowerCase());
  
  if (filtered.length === habits.length) {
    return { title: 'Habit Tracker', summary: `Habit "${name}" not found`, spokenNarrative: `Habit ${name} not found`, operation: 'delete', ok: false };
  }

  await saveHabits(filtered);
  return { 
    title: 'Habit Deleted', 
    summary: `Deleted habit: ${name}`, 
    spokenNarrative: `Deleted habit ${name}`, 
    operation: 'delete', 
    ok: true, 
    record: { deleted: name } 
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

export function getSources(): any {
  return { 
    title: 'Habit Tracker Sources', 
    summary: 'Habit data stored locally via AsyncStorage. No external API required.', 
    spokenNarrative: 'Habit data stored locally on your device', 
    operation: 'sources', 
    ok: true, 
    record: { source: 'Local AsyncStorage', operations: ['add', 'list', 'complete', 'stats', 'delete', 'sources'] } 
  };
}