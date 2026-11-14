import { Skill, SkillContext } from '../../../core/types';
import { dracnmapMetadata } from './DracnmapMetadata';
import { installDracnmapOperation, scanDracnmapOperation, getSourcesOperation } from './DracnmapOperations';
export const dracnmapSkill: Skill = {
  metadata: dracnmapMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installDracnmapOperation(params, context);
        case 'scan': return await scanDracnmapOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Dracnmap', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown dracnmap operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Dracnmap', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Dracnmap error', operation, ok: false }; }
  },
};
export { dracnmapMetadata } from './DracnmapMetadata';
export { installDracnmapOperation, scanDracnmapOperation, getSourcesOperation } from './DracnmapOperations';