import { Skill, SkillContext } from '../../../core/types';
import { saasMetricsMetadata } from './SaaSMetricsMetadata';
import { calculateSaaSMetricsOperation, getChurnOperation, getSourcesOperation } from './SaaSMetricsOperations';
export const saasMetricsSkill: Skill = {
  metadata: saasMetricsMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'mrr_arr').toLowerCase();
    try {
      switch (operation) {
        case 'mrr_arr': return await calculateSaaSMetricsOperation(params, context);
        case 'churn': return getChurnOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'SaaS Metrics', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown SaaS metrics operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'SaaS Metrics', summary: `Error: ${e.message}`, spokenNarrative: 'SaaS metrics error', operation, ok: false }; }
  },
};
export { saasMetricsMetadata } from './SaaSMetricsMetadata';
export { calculateSaaSMetricsOperation, getChurnOperation, getSourcesOperation } from './SaaSMetricsOperations';