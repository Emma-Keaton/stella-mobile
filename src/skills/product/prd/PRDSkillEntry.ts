import { Skill, SkillContext } from '../../../core/types';
import { prdMetadata } from './PRDMetadata';
import { createPRDOperation, reviewPRDOperation, getPRDTemplateOperation, getSourcesOperation } from './PRDOperations';
export const prdSkill: Skill = {
  metadata: prdMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'create').toLowerCase();
    try {
      switch (operation) {
        case 'create': return await createPRDOperation(params, context);
        case 'review': return await reviewPRDOperation(params, context);
        case 'template': return getPRDTemplateOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'PRD', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown PRD operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'PRD', summary: `Error: ${e.message}`, spokenNarrative: 'PRD error', operation, ok: false }; }
  },
};
export { prdMetadata } from './PRDMetadata';
export { createPRDOperation, reviewPRDOperation, getPRDTemplateOperation, getSourcesOperation } from './PRDOperations';