import { Skill, SkillContext } from '../../../core/types';
import { pricingMetadata } from './PricingMetadata';
import { costPlusPricingOperation, valueBasedPricingOperation, competitivePricingOperation, getSourcesOperation } from './PricingOperations';
export const pricingSkill: Skill = {
  metadata: pricingMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'cost_plus').toLowerCase();
    try {
      switch (operation) {
        case 'cost_plus': return await costPlusPricingOperation(params, context);
        case 'value_based': return await valueBasedPricingOperation(params, context);
        case 'competitive': return await competitivePricingOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Pricing Strategy', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown pricing operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Pricing Strategy', summary: `Error: ${e.message}`, spokenNarrative: 'Pricing error', operation, ok: false }; }
  },
};
export { pricingMetadata } from './PricingMetadata';
export { costPlusPricingOperation, valueBasedPricingOperation, competitivePricingOperation, getSourcesOperation } from './PricingOperations';