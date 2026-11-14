import { SkillMetadata } from '../../../core/types';
export const saasMetricsMetadata: SkillMetadata = {
  name: 'saas_metrics', aliases: ['saas_metrics', 'saas_kpis', 'mrr_churn', 'ltv_cac', 'saas_analytics'],
  description: 'SaaS metrics calculation - MRR, ARR, churn, LTV, CAC, LTV:CAC ratio, and net revenue retention.',
  triggers: ['saas metrics', 'saas kpis', 'mrr', 'churn rate', 'ltv cac', 'saas analytics', 'recurring revenue'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['mrr_arr', 'churn', 'ltv_cac', 'nrr', 'sources'], default: 'mrr_arr' }, monthlyRevenue: { type: 'number', description: 'Monthly recurring revenue.' }, customers: { type: 'number', description: 'Number of customers.' }, churnRate: { type: 'number', description: 'Monthly churn rate (decimal, e.g., 0.05).' }, arpu: { type: 'number', description: 'Average revenue per user.' } }, required: [] },
  version: '1.0.0', category: 'commercial_finance', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'SaaS metrics skill - linked with finance skills.',
};