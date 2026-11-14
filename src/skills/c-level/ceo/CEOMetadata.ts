import { SkillMetadata } from '../../../core/types';
export const ceoMetadata: SkillMetadata = {
  name: 'ceo_advisor', aliases: ['ceo_advisor', 'ceo_advice', 'executive_advice', 'leadership_advice', 'c_level_advisor'],
  description: 'CEO-level strategic advisory - company vision, board preparation, strategic decisions, investor relations, and executive decision support.',
  triggers: ['ceo advice', 'executive advice', 'strategic decision', 'board preparation', 'company vision', 'leadership advice', 'c level advisor'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['strategy', 'board_prep', 'decision', 'investor', 'vision', 'sources'], default: 'strategy' }, topic: { type: 'string', description: 'Strategic topic or decision.' }, context: { type: 'string', description: 'Business context.' }, stakeholders: { type: 'array', items: { type: 'string' }, description: 'Key stakeholders.' } }, required: [] },
  version: '1.0.0', category: 'c_level', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'CEO advisory skill.',
};