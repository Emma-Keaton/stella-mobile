import { SkillMetadata } from '../../../core/types';
export const riskMetadata: SkillMetadata = {
  name: 'risk_assessment', aliases: ['risk_assessment', 'risk_management', 'risk_register', 'risk_mitigation', 'compliance_risk'],
  description: 'Business risk assessment - identifies, scores, and recommends mitigation for operational, compliance, and strategic risks.',
  triggers: ['risk assessment', 'risk management', 'risk register', 'risk mitigation', 'compliance risk', 'business risk'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['assess', 'register', 'mitigate', 'template', 'sources'], default: 'assess' }, riskArea: { type: 'string', description: 'Area of risk (operational, financial, compliance, strategic).' }, likelihood: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }, impact: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }, riskDescription: { type: 'string', description: 'Risk description.' } }, required: [] },
  version: '1.0.0', category: 'compliance', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Risk assessment skill.',
};