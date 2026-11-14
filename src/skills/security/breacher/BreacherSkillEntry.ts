import { Skill, SkillContext } from '../../../core/types';
import { breacherMetadata } from './BreacherMetadata';
import { installBreacherOperation, scanBreacherOperation, getSourcesOperation } from './BreacherOperations';
export const breacherSkill: Skill = {
  metadata: breacherMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installBreacherOperation(params, context);
        case 'scan': return await scanBreacherOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Breacher', summary: `Unknown operation '${operation}'. Available: install, scan, sources`, spokenNarrative: `Unknown breacher operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Breacher', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Breacher error', operation, ok: false }; }
  },
};
export { breacherMetadata } from './BreacherMetadata';
export { installBreacherOperation, scanBreacherOperation, getSourcesOperation } from './BreacherOperations';