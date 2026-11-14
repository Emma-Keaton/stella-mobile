import { Skill, SkillContext } from '../../../core/types';
import { userStoriesMetadata } from './UserStoriesMetadata';
import { createUserStoriesOperation, estimateStoriesOperation, getTemplateOperation, getSourcesOperation } from './UserStoriesOperations';
export const userStoriesSkill: Skill = {
  metadata: userStoriesMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'create').toLowerCase();
    try {
      switch (operation) {
        case 'create': return await createUserStoriesOperation(params, context);
        case 'estimate': return await estimateStoriesOperation(params, context);
        case 'template': return getTemplateOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'User Stories', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown user stories operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'User Stories', summary: `Error: ${e.message}`, spokenNarrative: 'User stories error', operation, ok: false }; }
  },
};
export { userStoriesMetadata } from './UserStoriesMetadata';
export { createUserStoriesOperation, estimateStoriesOperation, getTemplateOperation, getSourcesOperation } from './UserStoriesOperations';