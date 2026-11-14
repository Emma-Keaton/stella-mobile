import { Skill, SkillContext } from '../../../core/types';
import { reconDogMetadata } from './ReconDogMetadata';
import { installReconDogOperation, scanReconDogOperation, getSourcesOperation } from './ReconDogOperations';
export const reconDogSkill: Skill = {
  metadata: reconDogMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installReconDogOperation(params, context);
        case 'scan': return await scanReconDogOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'ReconDog', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown recon_dog operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'ReconDog', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'ReconDog error', operation, ok: false }; }
  },
};
export { reconDogMetadata } from './ReconDogMetadata';
export { installReconDogOperation, scanReconDogOperation, getSourcesOperation } from './ReconDogOperations';