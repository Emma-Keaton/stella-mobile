import { SkillMetadata } from '../../../core/types';
export const architectureMetadata: SkillMetadata = {
  name: 'architecture_review', aliases: ['architecture_review', 'system_design', 'architecture_audit', 'design_review'],
  description: 'Reviews system architecture for scalability, reliability, maintainability, and anti-patterns. Provides architecture decision guidance.',
  triggers: ['architecture review', 'system design', 'architecture audit', 'design review', 'scalability review', 'technical architecture'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['review', 'design', 'patterns', 'scalability', 'sources'], default: 'review' }, architecture: { type: 'string', description: 'Architecture description or diagram text.' }, focus: { type: 'string', enum: ['scalability', 'reliability', 'security', 'maintainability', 'cost', 'all'], default: 'all' }, includeDiagram: { type: 'boolean', default: true } }, required: [] },
  version: '1.0.0', category: 'engineering', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Engineering architecture review skill.',
};