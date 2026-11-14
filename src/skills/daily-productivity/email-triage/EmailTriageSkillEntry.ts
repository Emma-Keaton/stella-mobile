import { Skill, SkillContext } from '../../../core/types';
import { emailTriageMetadata } from './EmailTriageMetadata';
import { categorizeEmailOperation, suggestResponseOperation, getSummaryOperation, getSourcesOperation } from './EmailTriageOperations';
export const emailTriageSkill: Skill = {
  metadata: emailTriageMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'categorize').toLowerCase();
    try {
      switch (operation) {
        case 'categorize': return await categorizeEmailOperation(params, context);
        case 'suggest_response': return await suggestResponseOperation(params, context);
        case 'summary': return getSummaryOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'Email Triage', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown email triage operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Email Triage', summary: `Error: ${e.message}`, spokenNarrative: 'Email triage error', operation, ok: false }; }
  },
};
export { emailTriageMetadata } from './EmailTriageMetadata';
export { categorizeEmailOperation, suggestResponseOperation, getSummaryOperation, getSourcesOperation } from './EmailTriageOperations';