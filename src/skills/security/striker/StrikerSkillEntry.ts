import { Skill, SkillContext } from '../../../core/types';
import { strikerMetadata } from './StrikerMetadata';
import { installStrikerOperation, scanStrikerOperation, getSourcesOperation } from './StrikerOperations';
export const strikerSkill: Skill = {
  metadata: strikerMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installStrikerOperation(params, context);
        case 'scan': return await scanStrikerOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Striker', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown striker operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Striker', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Striker error', operation, ok: false }; }
  },
};
export { strikerMetadata } from './StrikerMetadata';
export { installStrikerOperation, scanStrikerOperation, getSourcesOperation } from './StrikerOperations';