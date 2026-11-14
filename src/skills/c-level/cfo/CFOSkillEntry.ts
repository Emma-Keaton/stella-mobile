import { Skill, SkillContext } from '../../../core/types';
import { cfoMetadata } from './CFOMetadata';
import { cfoBudgetOperation, cfoForecastOperation, getSourcesOperation } from './CFOOperations';
export const cfoSkill: Skill = {
  metadata: cfoMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'budget').toLowerCase();
    try {
      switch (operation) {
        case 'budget': return await cfoBudgetOperation(params, context);
        case 'forecast': return await cfoForecastOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'CFO Advisory', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown CFO operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'CFO Advisory', summary: `Error: ${e.message}`, spokenNarrative: 'CFO error', operation, ok: false }; }
  },
};
export { cfoMetadata } from './CFOMetadata';
export { cfoBudgetOperation, cfoForecastOperation, getSourcesOperation } from './CFOOperations';