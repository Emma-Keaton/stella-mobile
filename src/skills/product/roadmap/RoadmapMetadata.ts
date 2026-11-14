import { SkillMetadata } from '../../../core/types';
export const roadmapMetadata: SkillMetadata = {
  name: 'roadmap', aliases: ['roadmap', 'product_roadmap', 'release_plan', 'sprint_plan', 'quarterly_plan'],
  description: 'Creates product roadmaps with initiatives, timelines, milestones, and dependency mapping.',
  triggers: ['product roadmap', 'roadmap', 'release plan', 'quarterly plan', 'sprint plan', 'product roadmap', 'roadmap planning'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['create', 'review', 'milestones', 'template', 'sources'], default: 'create' }, vision: { type: 'string', description: 'Product vision statement.' }, initiatives: { type: 'array', items: { type: 'string' }, description: 'Strategic initiatives.' }, quarters: { type: 'number', description: 'Number of quarters to plan (default 4).', default: 4 }, dependencies: { type: 'array', items: { type: 'string' }, description: 'Known dependencies.' } }, required: [] },
  version: '1.0.0', category: 'product', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Product roadmap creation skill.',
};