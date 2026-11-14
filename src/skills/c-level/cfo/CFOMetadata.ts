import { SkillMetadata } from '../../../core/types';
export const cfoMetadata: SkillMetadata = {
  name: 'cfo_advisor', aliases: ['cfo_advisor', 'cfo_advice', 'financial_advice', 'budget_advice', 'finance_advisor'],
  description: 'CFO-level financial advisory - budgeting, forecasting, cash flow, financial planning, and capital allocation decisions.',
  triggers: ['cfo advice', 'financial advice', 'budget advice', 'cash flow', 'financial planning', 'capital allocation', 'finance advisor'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['budget', 'forecast', 'cashflow', 'investment', 'report', 'sources'], default: 'budget' }, topic: { type: 'string', description: 'Financial topic.' }, amount: { type: 'number', description: 'Amount or budget figure.' }, period: { type: 'string', description: 'Time period (monthly, quarterly, yearly).' } }, required: [] },
  version: '1.0.0', category: 'c_level', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'CFO advisory skill.',
};