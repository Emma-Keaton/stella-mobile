import { SkillMetadata } from '../../../core/types';
export const okrMetadata: SkillMetadata = {
  name: 'okr', aliases: ['okr', 'objectives_key_results', 'goal_setting', 'quarterly_goals', 'okr_planning'],
  description: 'OKR (Objectives and Key Results) framework - setting ambitious objectives with measurable key results and tracking progress.',
  triggers: ['okr', 'objectives key results', 'goal setting', 'quarterly goals', 'okr planning', 'goal framework'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['create', 'track', 'grade', 'template', 'sources'], default: 'create' }, objective: { type: 'string', description: 'Qualitative objective.' }, keyResults: { type: 'array', items: { type: 'string' }, description: 'Measurable key results.' }, quarter: { type: 'string', description: 'Quarter (e.g., Q1 2024).' } }, required: [] },
  version: '1.0.0', category: 'business_operations', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'OKR goal-setting skill.',
};