import { Skill, SkillContext } from '../../../core/types';
import { seoMetadata } from './SeoMetadata';
import { auditSeoOperation, getSourcesOperation } from './SeoOperations';
export const seoSkill: Skill = {
  metadata: seoMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'audit').toLowerCase();
    try {
      switch (operation) {
        case 'audit': return await auditSeoOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'SEO Audit', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown SEO operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'SEO Audit', summary: `Error: ${e.message}`, spokenNarrative: 'SEO error', operation, ok: false }; }
  },
};
export { seoMetadata } from './SeoMetadata';
export { auditSeoOperation, getSourcesOperation } from './SeoOperations';