import { Skill, SkillContext } from '../../../core/types';
import { soc2Metadata } from './SOC2Metadata';
import { assessSOC2Operation, getCriteriaOperation, getControlsOperation, getSourcesOperation } from './SOC2Operations';
export const soc2Skill: Skill = {
  metadata: soc2Metadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'assess').toLowerCase();
    try {
      switch (operation) {
        case 'assess': return await assessSOC2Operation(params, context);
        case 'criteria': return getCriteriaOperation();
        case 'controls': return getControlsOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'SOC 2', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown SOC 2 operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'SOC 2', summary: `Error: ${e.message}`, spokenNarrative: 'SOC 2 error', operation, ok: false }; }
  },
};
export { soc2Metadata } from './SOC2Metadata';
export { assessSOC2Operation, getCriteriaOperation, getControlsOperation, getSourcesOperation } from './SOC2Operations';