import { Skill, SkillContext } from '../../../core/types';
import { ceoMetadata } from './CEOMetadata';
import { ceoStrategyOperation, boardPrepOperation, getSourcesOperation } from './CEOOperations';
export const ceoSkill: Skill = {
  metadata: ceoMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'strategy').toLowerCase();
    try {
      switch (operation) {
        case 'strategy': return await ceoStrategyOperation(params, context);
        case 'board_prep': return await boardPrepOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'CEO Advisory', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown CEO operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'CEO Advisory', summary: `Error: ${e.message}`, spokenNarrative: 'CEO error', operation, ok: false }; }
  },
};
export { ceoMetadata } from './CEOMetadata';
export { ceoStrategyOperation, boardPrepOperation, getSourcesOperation } from './CEOOperations';