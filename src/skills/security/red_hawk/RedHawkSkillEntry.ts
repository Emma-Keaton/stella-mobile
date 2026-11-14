import { Skill, SkillContext } from '../../../core/types';
import { redHawkMetadata } from './RedHawkMetadata';
import { installRedHawkOperation, scanRedHawkOperation, getSourcesOperation } from './RedHawkOperations';
export const redHawkSkill: Skill = {
  metadata: redHawkMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installRedHawkOperation(params, context);
        case 'scan': return await scanRedHawkOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'RED HAWK', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown red_hawk operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'RED HAWK', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'RED HAWK error', operation, ok: false }; }
  },
};
export { redHawkMetadata } from './RedHawkMetadata';
export { installRedHawkOperation, scanRedHawkOperation, getSourcesOperation } from './RedHawkOperations';