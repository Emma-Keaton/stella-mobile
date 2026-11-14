import { Skill, SkillContext } from '../../../core/types';
import { rang3rMetadata } from './Rang3rMetadata';
import { installRang3rOperation, scanRang3rOperation, getSourcesOperation } from './Rang3rOperations';
export const rang3rSkill: Skill = {
  metadata: rang3rMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installRang3rOperation(params, context);
        case 'scan': return await scanRang3rOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'rang3r', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown rang3r operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'rang3r', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'rang3r error', operation, ok: false }; }
  },
};
export { rang3rMetadata } from './Rang3rMetadata';
export { installRang3rOperation, scanRang3rOperation, getSourcesOperation } from './Rang3rOperations';