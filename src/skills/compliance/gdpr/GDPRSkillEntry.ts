import { Skill, SkillContext } from '../../../core/types';
import { gdprMetadata } from './GDPRMetadata';
import { assessGDPROperation, getGDPRChecklistOperation, getDSAROperation, getSourcesOperation } from './GDPROperations';
export const gdprSkill: Skill = {
  metadata: gdprMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'assess').toLowerCase();
    try {
      switch (operation) {
        case 'assess': return await assessGDPROperation(params, context);
        case 'checklist': return getGDPRChecklistOperation();
        case 'dsar': return getDSAROperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'GDPR', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown GDPR operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'GDPR', summary: `Error: ${e.message}`, spokenNarrative: 'GDPR error', operation, ok: false }; }
  },
};
export { gdprMetadata } from './GDPRMetadata';
export { assessGDPROperation, getGDPRChecklistOperation, getDSAROperation, getSourcesOperation } from './GDPROperations';