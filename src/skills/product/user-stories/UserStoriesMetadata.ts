import { SkillMetadata } from '../../../core/types';
export const userStoriesMetadata: SkillMetadata = {
  name: 'user_stories', aliases: ['user_stories', 'write_user_stories', 'agile_stories', 'story_points', 'acceptance_criteria'],
  description: 'Writes agile user stories with acceptance criteria, story points, and priority for product backlogs.',
  triggers: ['user stories', 'write user stories', 'agile stories', 'story points', 'acceptance criteria', 'backlog', 'sprint planning'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['create', 'estimate', 'prioritize', 'template', 'sources'], default: 'create' }, feature: { type: 'string', description: 'Feature name.' }, userRole: { type: 'string', description: 'User role (e.g., admin, customer, guest).' }, goal: { type: 'string', description: 'What the user wants to achieve.' }, benefit: { type: 'string', description: 'Why they want it / business value.' }, count: { type: 'number', description: 'Number of stories to generate (default 3).', default: 3 } }, required: [] },
  version: '1.0.0', category: 'product', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Agile user story creation skill.',
};