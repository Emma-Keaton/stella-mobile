import { Skill, SkillContext } from '../../../core/types';
import { sopMetadata } from './SOPMetadata';
import { createSOPOperation, getTemplateOperation, getSourcesOperation } from './SOPOperations';
export const sopSkill: Skill = {
  metadata: sopMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'create').toLowerCase();
    try {
      switch (operation) {
        case 'create': return await createSOPOperation(params, context);
        case 'template': return getTemplateOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'SOP', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown SOP operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'SOP', summary: `Error: ${e.message}`, spokenNarrative: 'SOP error', operation, ok: false }; }
  },
};
export { sopMetadata } from './SOPMetadata';
export { createSOPOperation, getTemplateOperation, getSourcesOperation } from './SOPOperations';