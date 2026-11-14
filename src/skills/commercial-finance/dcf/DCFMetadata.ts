import { SkillMetadata } from '../../../core/types';
export const dcfMetadata: SkillMetadata = {
  name: 'dcf_valuation', aliases: ['dcf_valuation', 'dcf', 'discounted_cash_flow', 'valuation', 'company_valuation'],
  description: 'Discounted Cash Flow (DCF) valuation - calculates company/investment value from projected cash flows and discount rate.',
  triggers: ['dcf', 'discounted cash flow', 'valuation', 'company valuation', 'dcf valuation', 'investment valuation'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['calculate', 'assumptions', 'sensitivity', 'sources'], default: 'calculate' }, cashFlows: { type: 'array', items: { type: 'number' }, description: 'Projected annual cash flows.' }, discountRate: { type: 'number', description: 'Discount rate / WACC (default 0.10).', default: 0.10 }, terminalGrowth: { type: 'number', description: 'Terminal growth rate (default 0.025).', default: 0.025 } }, required: [] },
  version: '1.0.0', category: 'commercial_finance', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'DCF valuation skill - linked with finance skills.',
};