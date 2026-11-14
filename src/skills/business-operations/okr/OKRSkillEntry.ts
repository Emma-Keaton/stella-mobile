import { Skill, SkillContext } from '../../../core/types';
import { okrMetadata } from './OKRMetadata';
import { createOKROperation, gradeOKROperation, getTemplateOperation, getSourcesOperation } from './OKROperations';
export const okrSkill: Skill = {
  metadata: okrMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'create').toLowerCase();
    try {
      switch (operation) {
        case 'create': return await createOKROperation(params, context);
        case 'grade': return gradeOKROperation(params, context);
        case 'template': return getTemplateOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'OKR', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown OKR operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'OKR', summary: `Error: ${e.message}`, spokenNarrative: 'OKR error', operation, ok: false }; }
  },
};
export { okrMetadata } from './OKRMetadata';
export { createOKROperation, gradeOKROperation, getTemplateOperation, getSourcesOperation } from './OKROperations';