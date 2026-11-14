import { Skill, SkillContext } from '../../../core/types';
import { dcfMetadata } from './DCFMetadata';
import { calculateDCFOperation, getAssumptionsOperation, getSourcesOperation } from './DCFOperations';
export const dcfSkill: Skill = {
  metadata: dcfMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'calculate').toLowerCase();
    try {
      switch (operation) {
        case 'calculate': return await calculateDCFOperation(params, context);
        case 'assumptions': return getAssumptionsOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'DCF Valuation', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown DCF operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'DCF Valuation', summary: `Error: ${e.message}`, spokenNarrative: 'DCF error', operation, ok: false }; }
  },
};
export { dcfMetadata } from './DCFMetadata';
export { calculateDCFOperation, getAssumptionsOperation, getSourcesOperation } from './DCFOperations';