import { Skill, SkillContext } from '../../../core/types';
import { marketResearchMetadata } from './MarketResearchMetadata';
import { tamSamSomOperation, getSegmentationOperation, getSourcesOperation } from './MarketResearchOperations';
export const marketResearchSkill: Skill = {
  metadata: marketResearchMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'tam_sam_som').toLowerCase();
    try {
      switch (operation) {
        case 'tam_sam_som': return await tamSamSomOperation(params, context);
        case 'segmentation': return getSegmentationOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'Market Research', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown market research operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Market Research', summary: `Error: ${e.message}`, spokenNarrative: 'Market research error', operation, ok: false }; }
  },
};
export { marketResearchMetadata } from './MarketResearchMetadata';
export { tamSamSomOperation, getSegmentationOperation, getSourcesOperation } from './MarketResearchOperations';