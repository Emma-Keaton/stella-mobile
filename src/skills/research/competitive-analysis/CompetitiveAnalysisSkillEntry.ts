import { Skill, SkillContext } from '../../../core/types';
import { competitiveAnalysisMetadata } from './CompetitiveAnalysisMetadata';
import { swotOperation, getBenchmarkOperation, getSourcesOperation } from './CompetitiveAnalysisOperations';
export const competitiveAnalysisSkill: Skill = {
  metadata: competitiveAnalysisMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'swot').toLowerCase();
    try {
      switch (operation) {
        case 'swot': return await swotOperation(params, context);
        case 'benchmark': return getBenchmarkOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'Competitive Analysis', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown competitive analysis operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Competitive Analysis', summary: `Error: ${e.message}`, spokenNarrative: 'Competitive analysis error', operation, ok: false }; }
  },
};
export { competitiveAnalysisMetadata } from './CompetitiveAnalysisMetadata';
export { swotOperation, getBenchmarkOperation, getSourcesOperation } from './CompetitiveAnalysisOperations';