/**
 * Stella Mobile — Habit Tracker Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { habitTrackerMetadata } from './HabitTrackerMetadata';
import { addHabit, listHabits } from './HabitTrackerOperations1';
import { completeHabit, getStats } from './HabitTrackerOperations2';
import { deleteHabit, getSources } from './HabitTrackerOperations3';

export const habitTrackerSkill: Skill = {
  metadata: habitTrackerMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'list').toLowerCase();

    try {
      switch (operation) {
        case 'add': return await addHabit(params);
        case 'list': return await listHabits();
        case 'complete': return await completeHabit(params);
        case 'stats': return await getStats();
        case 'delete': return await deleteHabit(params);
        case 'sources': return getSources();
        default:
          return { 
            title: 'Habit Tracker', 
            summary: `Unknown operation '${operation}'. Available: add, list, complete, stats, delete, sources`, 
            spokenNarrative: `Unknown habit operation ${operation}`, 
            operation, 
            ok: false 
          };
      }
    } catch (error) {
      return { 
        title: 'Habit Tracker', 
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        spokenNarrative: 'Habit tracker error', 
        operation, 
        ok: false 
      };
    }
  },
};

export { habitTrackerMetadata } from './HabitTrackerMetadata';
export { addHabit, listHabits } from './HabitTrackerOperations1';
export { completeHabit, getStats } from './HabitTrackerOperations2';
export { deleteHabit, getSources } from './HabitTrackerOperations3';