import { Skill, SkillContext } from '../../../core/types';
import { taskMgmtMetadata } from './TaskMgmtMetadata';
import { createTasksOperation, prioritizeOperation, getTimeblockOperation, getSourcesOperation } from './TaskMgmtOperations';
export const taskMgmtSkill: Skill = {
  metadata: taskMgmtMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'create').toLowerCase();
    try {
      switch (operation) {
        case 'create': return await createTasksOperation(params, context);
        case 'prioritize': return await prioritizeOperation(params, context);
        case 'timeblock': return getTimeblockOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'Task Management', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown task management operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Task Management', summary: `Error: ${e.message}`, spokenNarrative: 'Task management error', operation, ok: false }; }
  },
};
export { taskMgmtMetadata } from './TaskMgmtMetadata';
export { createTasksOperation, prioritizeOperation, getTimeblockOperation, getSourcesOperation } from './TaskMgmtOperations';