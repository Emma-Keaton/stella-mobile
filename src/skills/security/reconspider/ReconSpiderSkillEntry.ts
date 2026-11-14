import { Skill, SkillContext } from '../../../core/types';
import { reconSpiderMetadata } from './ReconSpiderMetadata';
import { installReconSpiderOperation, scanReconSpiderOperation, getSourcesOperation } from './ReconSpiderOperations';
export const reconSpiderSkill: Skill = {
  metadata: reconSpiderMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installReconSpiderOperation(params, context);
        case 'scan': return await scanReconSpiderOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'ReconSpider', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown recon_spider operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'ReconSpider', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'ReconSpider error', operation, ok: false }; }
  },
};
export { reconSpiderMetadata } from './ReconSpiderMetadata';
export { installReconSpiderOperation, scanReconSpiderOperation, getSourcesOperation } from './ReconSpiderOperations';