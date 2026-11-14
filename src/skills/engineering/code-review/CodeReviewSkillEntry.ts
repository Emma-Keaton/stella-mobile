/**
 * Stella Mobile — Code Review Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../../core/types';
import { codeReviewMetadata } from './CodeReviewMetadata';
import { reviewCodeOperation, securityReviewOperation, performanceReviewOperation, getSourcesOperation } from './CodeReviewOperations';

export const codeReviewSkill: Skill = {
  metadata: codeReviewMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'review').toLowerCase();

    try {
      switch (operation) {
        case 'review': return await reviewCodeOperation(params, context);
        case 'security': return await securityReviewOperation(params, context);
        case 'performance': return await performanceReviewOperation(params, context);
        case 'sources': return getSourcesOperation();
        default:
          return {
            title: 'Code Review',
            summary: `Unknown operation '${operation}'. Available: review, security, performance, sources`,
            spokenNarrative: `Unknown code review operation ${operation}`,
            operation,
            ok: false,
          };
      }
    } catch (error: any) {
      return {
        title: 'Code Review',
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        spokenNarrative: 'Code review error',
        operation,
        ok: false,
      };
    }
  },
};

export { codeReviewMetadata } from './CodeReviewMetadata';
export { reviewCodeOperation, securityReviewOperation, performanceReviewOperation, getSourcesOperation } from './CodeReviewOperations';