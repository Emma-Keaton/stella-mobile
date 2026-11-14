/**
 * Stella Mobile — Activity Suggester Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { activitySuggesterMetadata } from './ActivitySuggesterMetadata';
import { suggestActivity, getSources } from './ActivitySuggesterOperations';

export const activitySuggesterSkill: Skill = {
  metadata: activitySuggesterMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'suggest').toLowerCase();

    try {
      switch (operation) {
        case 'suggest': return await suggestActivity(params, context);
        case 'sources': return getSources();
        default:
          return { 
            title: 'Activity Suggester', 
            summary: `Unknown operation '${operation}'. Available: suggest, sources`, 
            spokenNarrative: `Unknown activity operation ${operation}`, 
            operation, 
            ok: false 
          };
      }
    } catch (error) {
      return { 
        title: 'Activity Suggester', 
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        spokenNarrative: 'Activity suggestion error', 
        operation, 
        ok: false 
      };
    }
  },
};

export { activitySuggesterMetadata } from './ActivitySuggesterMetadata';
export { suggestActivity, getSources } from './ActivitySuggesterOperations';