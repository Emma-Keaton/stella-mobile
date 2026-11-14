import { SkillMetadata } from '../../../core/types';
export const soc2Metadata: SkillMetadata = {
  name: 'soc2', aliases: ['soc2', 'soc2_compliance', 'trust_service', 'soc2_audit', 'soc2_type2'],
  description: 'SOC 2 Type II compliance assessment - evaluates security, availability, confidentiality, processing integrity, and privacy trust service criteria.',
  triggers: ['soc2', 'soc2 compliance', 'soc2 audit', 'trust service criteria', 'soc2 type ii', 'compliance audit'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['assess', 'criteria', 'controls', 'evidence', 'sources'], default: 'assess' }, trustCriteria: { type: 'array', items: { type: 'string' }, description: 'Trust service criteria to assess.' }, hasControls: { type: 'boolean', description: 'Has documented controls.' }, auditDate: { type: 'string', description: 'Last audit date.' } }, required: [] },
  version: '1.0.0', category: 'compliance', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'SOC 2 compliance assessment skill.',
};