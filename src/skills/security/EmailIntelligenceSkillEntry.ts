/**
 * Stella Mobile — Email Intelligence Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { emailIntelligenceMetadata } from './EmailIntelligenceMetadata';
import { enrichEmail, extractWebsiteEmails, domainEmailSearch } from './EmailIntelligenceOperations1';
import { verifyEmail, checkBreach } from './EmailIntelligenceOperations2';
import { osintScan, fullScan, getSources } from './EmailIntelligenceOperations3';

export const emailIntelligenceSkill: Skill = {
  metadata: emailIntelligenceMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'full').toLowerCase();

    try {
      switch (operation) {
        case 'enrich': return await enrichEmail(params, context);
        case 'verify': return await verifyEmail(params, context);
        case 'breach': return await checkBreach(params, context);
        case 'osint': return await osintScan(params, context);
        case 'full': return await fullScan(params, context);
        case 'extract_website': return await extractWebsiteEmails(params, context);
        case 'domain_search': return await domainEmailSearch(params, context);
        case 'sources': return getSources();
        default:
          return {
            title: 'Email Intelligence',
            summary: `Unknown operation '${operation}'. Available: enrich, verify, breach, osint, full, extract_website, domain_search, sources`,
            spokenNarrative: `Unknown email intelligence operation ${operation}`,
            operation,
            ok: false,
          };
      }
    } catch (error) {
      return {
        title: 'Email Intelligence',
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        spokenNarrative: 'Email intelligence error',
        operation,
        ok: false,
      };
    }
  },
};

export { emailIntelligenceMetadata } from './EmailIntelligenceMetadata';
export { enrichEmail, extractWebsiteEmails, domainEmailSearch } from './EmailIntelligenceOperations1';
export { verifyEmail, checkBreach } from './EmailIntelligenceOperations2';
export { osintScan, fullScan, getSources } from './EmailIntelligenceOperations3';