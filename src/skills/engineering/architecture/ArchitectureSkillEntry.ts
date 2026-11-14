import { Skill, SkillContext } from '../../../core/types';
import { architectureMetadata } from './ArchitectureMetadata';
import { reviewArchitectureOperation, designArchitectureOperation, getSourcesOperation } from './ArchitectureOperations';
export const architectureSkill: Skill = {
  metadata: architectureMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'review').toLowerCase();
    try {
      switch (operation) {
        case 'review': return await reviewArchitectureOperation(params, context);
        case 'design': return await designArchitectureOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Architecture Review', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown architecture operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Architecture Review', summary: `Error: ${e.message}`, spokenNarrative: 'Architecture error', operation, ok: false }; }
  },
};
export { architectureMetadata } from './ArchitectureMetadata';
export { reviewArchitectureOperation, designArchitectureOperation, getSourcesOperation } from './ArchitectureOperations';