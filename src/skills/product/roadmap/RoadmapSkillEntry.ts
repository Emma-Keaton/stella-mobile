import { Skill, SkillContext } from '../../../core/types';
import { roadmapMetadata } from './RoadmapMetadata';
import { createRoadmapOperation, reviewRoadmapOperation, getTemplateOperation, getSourcesOperation } from './RoadmapOperations';
export const roadmapSkill: Skill = {
  metadata: roadmapMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'create').toLowerCase();
    try {
      switch (operation) {
        case 'create': return await createRoadmapOperation(params, context);
        case 'review': return await reviewRoadmapOperation(params, context);
        case 'template': return getTemplateOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'Roadmap', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown roadmap operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Roadmap', summary: `Error: ${e.message}`, spokenNarrative: 'Roadmap error', operation, ok: false }; }
  },
};
export { roadmapMetadata } from './RoadmapMetadata';
export { createRoadmapOperation, reviewRoadmapOperation, getTemplateOperation, getSourcesOperation } from './RoadmapOperations';