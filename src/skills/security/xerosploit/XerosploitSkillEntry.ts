import { Skill, SkillContext } from '../../../core/types';
import { xerosploitMetadata } from './XerosploitMetadata';
import { installXerosploitOperation, runXerosploitOperation, getSourcesOperation } from './XerosploitOperations';
export const xerosploitSkill: Skill = {
  metadata: xerosploitMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'run').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installXerosploitOperation(params, context);
        case 'run': return await runXerosploitOperation(params, context);
        case 'sources': return getSourcesOperation();
        default: return { title: 'Xerosploit', summary: `Unknown operation '${operation}'. Available: install, run, sources`, spokenNarrative: `Unknown xerosploit operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Xerosploit', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Xerosploit error', operation, ok: false }; }
  },
};
export { xerosploitMetadata } from './XerosploitMetadata';
export { installXerosploitOperation, runXerosploitOperation, getSourcesOperation } from './XerosploitOperations';