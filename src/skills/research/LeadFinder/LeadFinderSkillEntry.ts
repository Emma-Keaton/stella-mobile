/**
 * Stella Mobile — Lead Finder Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../../core/types';
import { leadFinderMetadata } from './LeadFinderMetadata';
import { scanLeadsOperation, enrichLeadsOperation, exportLeadsOperation, getSourcesOperation } from './LeadFinderOperations';

export const leadFinderSkill: Skill = {
  metadata: leadFinderMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();

    try {
      switch (operation) {
        case 'scan': return await scanLeadsOperation(params, context);
        case 'enrich': return await enrichLeadsOperation(params, context);
        case 'export': return await exportLeadsOperation(params, context);
        case 'sources': return getSourcesOperation();
        default:
          return {
            title: 'Lead Finder',
            summary: `Unknown operation '${operation}'. Available: scan, enrich, export, sources`,
            spokenNarrative: `Unknown lead finder operation ${operation}`,
            operation,
            ok: false,
          };
      }
    } catch (error: any) {
      return {
        title: 'Lead Finder',
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        spokenNarrative: 'Lead finder error',
        operation,
        ok: false,
      };
    }
  },
};

export { leadFinderMetadata } from './LeadFinderMetadata';
export { scanLeadsOperation, enrichLeadsOperation, exportLeadsOperation, getSourcesOperation } from './LeadFinderOperations';