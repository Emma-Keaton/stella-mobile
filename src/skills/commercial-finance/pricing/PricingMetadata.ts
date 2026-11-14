import { SkillMetadata } from '../../../core/types';
export const pricingMetadata: SkillMetadata = {
  name: 'pricing_strategy', aliases: ['pricing_strategy', 'pricing_model', 'price_optimization', 'pricing_analysis'],
  description: 'Pricing strategy - cost-plus, value-based, competitive pricing, and price elasticity analysis.',
  triggers: ['pricing strategy', 'pricing model', 'price optimization', 'pricing analysis', 'value based pricing', 'cost plus pricing'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['cost_plus', 'value_based', 'competitive', 'elasticity', 'sources'], default: 'cost_plus' }, cost: { type: 'number', description: 'Cost per unit.' }, margin: { type: 'number', description: 'Desired margin percentage (decimal).' }, competitorPrice: { type: 'number', description: 'Competitor price.' }, value: { type: 'number', description: 'Perceived customer value.' } }, required: [] },
  version: '1.0.0', category: 'commercial_finance', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Pricing strategy skill - linked with finance skills.',
};