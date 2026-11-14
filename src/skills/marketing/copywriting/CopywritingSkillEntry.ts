import { Skill, SkillContext } from '../../../core/types';
import { copywritingMetadata } from './CopywritingMetadata';
import { writeAdCopyOperation, writeEmailCopyOperation, writeLandingCopyOperation, writeSocialCopyOperation, getSourcesOperation } from './CopywritingOperations';

export const copywritingSkill: Skill = {
  metadata: copywritingMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'ad').toLowerCase();
    try {
      switch (operation) {
        case 'ad': return await writeAdCopyOperation(params, context);
        case 'email': return await writeEmailCopyOperation(params, context);
        case 'landing': return await writeLandingCopyOperation(params, context);
        case 'social': return await writeSocialCopyOperation(params, context);
        case 'framework': return { title: 'Copywriting Frameworks', summary: 'Available: AIDA, PAS, BAB, FFF', spokenNarrative: 'Available frameworks: AIDA, PAS, BAB, FFF', operation: 'framework', ok: true, record: { frameworks: ['AIDA', 'PAS', 'BAB', 'FFF'] } };
        case 'sources': return getSourcesOperation();
        default: return { title: 'Copywriting', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown copywriting operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Copywriting', summary: `Error: ${e.message}`, spokenNarrative: 'Copywriting error', operation, ok: false }; }
  },
};
export { copywritingMetadata } from './CopywritingMetadata';
export { writeAdCopyOperation, writeEmailCopyOperation, writeLandingCopyOperation, writeSocialCopyOperation, getSourcesOperation } from './CopywritingOperations';