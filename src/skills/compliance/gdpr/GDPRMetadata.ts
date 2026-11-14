import { SkillMetadata } from '../../../core/types';
export const gdprMetadata: SkillMetadata = {
  name: 'gdpr', aliases: ['gdpr', 'gdpr_compliance', 'data_protection', 'privacy_assessment', 'gdpr_audit'],
  description: 'GDPR compliance assessment - checks data processing, consent, DSAR, DPO requirements, and breach notification readiness.',
  triggers: ['gdpr', 'gdpr compliance', 'data protection', 'gdpr audit', 'privacy compliance', 'data subject request', 'dsar'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['assess', 'checklist', 'dsar', 'breach', 'sources'], default: 'assess' }, dataTypes: { type: 'array', items: { type: 'string' }, description: 'Types of personal data processed.' }, hasDPO: { type: 'boolean', description: 'Has Data Protection Officer.' }, hasConsent: { type: 'boolean', description: 'Has explicit consent mechanism.' }, dataRetention: { type: 'string', description: 'Data retention policy.' } }, required: [] },
  version: '1.0.0', category: 'compliance', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'GDPR compliance assessment skill.',
};