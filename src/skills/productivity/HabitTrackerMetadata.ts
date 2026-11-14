/**
 * Stella Mobile — Habit Tracker Skill
 * Track daily habits with streaks, reminders, and statistics
 */

import { SkillMetadata } from '../core/types';

export const habitTrackerMetadata: SkillMetadata = {
  name: 'habit_tracker',
  aliases: ['habit_tracker', 'habit', 'habits', 'daily_habits', 'streak_tracker', 'habit_builder'],
  description: 'Track daily habits with streaks, reminders, and statistics. Stores data locally using AsyncStorage. Supports custom habits, frequency, reminders, and streak tracking.',
  triggers: ['habit', 'habits', 'habit tracker', 'track habit', 'daily habit', 'streak', 'habit streak', 'build habit'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: add | list | complete | stats | delete | sources. Defaults to list.',
        enum: ['add', 'list', 'complete', 'stats', 'delete', 'sources']
      },
      name: { type: 'string', description: 'Habit name (required for add/complete/delete).' },
      frequency: { type: 'string', description: 'Frequency: daily, weekly, monthly. Defaults to daily.', enum: ['daily', 'weekly', 'monthly'] },
      reminderTime: { type: 'string', description: 'Reminder time in HH:MM format (24h).' },
      targetCount: { type: 'number', description: 'Target completions per period (default 1).' },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to today).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'productivity',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  notes: 'Data stored locally via AsyncStorage. No external API required.',
};