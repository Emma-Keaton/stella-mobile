import { SkillMetadata } from '../../../core/types';
export const ctoMetadata: SkillMetadata = {
  name: 'cto_advisor', aliases: ['cto_advisor', 'cto_advice', 'technology_advice', 'technical_strategy', 'engineering_advisor'],
  description: 'CTO-level technology advisory - technical strategy, architecture decisions, engineering hiring, tech stack evaluation, and innovation roadmap.',
  triggers: ['cto advice', 'technology advice', 'technical strategy', 'architecture decision', 'tech stack', 'engineering advice', 'technology strategy'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['strategy', 'architecture', 'hiring', 'stack', 'innovation', 'sources'], default: 'strategy' }, topic: { type: 'string', description: 'Technology topic.' }, currentStack: { type: 'array', items: { type: 'string' }, description: 'Current technology stack.' }, teamSize: { type: 'number', description: 'Engineering team size.' } }, required: [] },
  version: '1.0.0', category: 'c_level', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'CTO advisory skill.',
};