import { Skill, SkillContext } from '../../../core/types';
import { ctoMetadata } from './CTOMetadata';
import { ctoStrategyOperation, ctoArchitectureOperation, getSourcesOperation } from './CTOOperations';
export const ctoSkill: Skill = {
  metadata: ctoMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'strategy').toLowerCase();
    try {
      switch (operation) {
        case 'strategy': return await ctoStrategyOperation(params, context);
        case 'architecture': return await ctoArchitectureOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'CTO Advisory', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown CTO operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'CTO Advisory', summary: `Error: ${e.message}`, spokenNarrative: 'CTO error', operation, ok: false }; }
  },
};
export { ctoMetadata } from './CTOMetadata';
export { ctoStrategyOperation, ctoArchitectureOperation, getSourcesOperation } from './CTOOperations';