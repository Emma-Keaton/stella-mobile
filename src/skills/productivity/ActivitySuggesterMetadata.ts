/**
 * Stella Mobile — Activity Suggester Skill
 * Suggests random activities from Bored API (keyless, free)
 */

import { SkillMetadata } from '../core/types';

export const activitySuggesterMetadata: SkillMetadata = {
  name: 'activity_suggester',
  aliases: ['activity_suggester', 'activity_suggest', 'bored_activity', 'random_activity', 'suggest_activity', 'what_to_do'],
  description: 'Suggest a random activity from the Bored API (boredapi.com). Supports filtering by type: education, recreational, social, diy, charity, cooking, relaxation, music, busywork. No API key required.',
  triggers: ['activity', 'suggest activity', 'random activity', 'what to do', 'bored', 'activity suggestion', 'random thing to do'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: suggest | sources. Defaults to suggest.', enum: ['suggest', 'sources'] },
      type: { type: 'string', description: 'Activity type filter: education, recreational, social, diy, charity, cooking, relaxation, music, busywork.', enum: ['education', 'recreational', 'social', 'diy', 'charity', 'cooking', 'relaxation', 'music', 'busywork'] },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'productivity',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    boredapi: { name: 'Bored API', description: 'Free random activity suggestions', url: 'https://www.boredapi.com/api/activity', docs: 'https://www.boredapi.com/', authTier: 'keyless', rateLimit: 'No strict limit', uses: ['suggest'] },
  },
};