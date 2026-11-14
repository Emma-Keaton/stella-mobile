import { Skill, SkillContext } from '../../../core/types';
import { infogaMetadata } from './InfogaMetadata';
import { installInfogaOperation, scanInfogaOperation, getSourcesOperation } from './InfogaOperations';
export const infogaSkill: Skill = {
  metadata: infogaMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installInfogaOperation(params, context);
        case 'scan': return await scanInfogaOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Infoga', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown infoga operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Infoga', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Infoga error', operation, ok: false }; }
  },
};
export { infogaMetadata } from './InfogaMetadata';
export { installInfogaOperation, scanInfogaOperation, getSourcesOperation } from './InfogaOperations';