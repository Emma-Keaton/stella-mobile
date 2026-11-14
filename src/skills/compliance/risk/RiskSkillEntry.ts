import { Skill, SkillContext } from '../../../core/types';
import { riskMetadata } from './RiskMetadata';
import { assessRiskOperation, getRiskRegisterOperation, getMitigationOperation, getSourcesOperation } from './RiskOperations';
export const riskSkill: Skill = {
  metadata: riskMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'assess').toLowerCase();
    try {
      switch (operation) {
        case 'assess': return await assessRiskOperation(params, context);
        case 'register': return getRiskRegisterOperation();
        case 'mitigate': return getMitigationOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Risk Assessment', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown risk operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Risk Assessment', summary: `Error: ${e.message}`, spokenNarrative: 'Risk error', operation, ok: false }; }
  },
};
export { riskMetadata } from './RiskMetadata';
export { assessRiskOperation, getRiskRegisterOperation, getMitigationOperation, getSourcesOperation } from './RiskOperations';