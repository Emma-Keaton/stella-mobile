/**
 * Stella Mobile — Writing Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { writingMetadata } from './WritingSkillMetadata';
import { generateText, editText, summarizeText } from './WritingSkillOperations';
import { rewriteText, proofreadText, brainstormIdeas, createOutline, getSources } from './WritingSkillOperations2';

export const writingSkill: Skill = {
  metadata: writingMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'generate').toLowerCase();

    try {
      switch (operation) {
        case 'generate': return await generateText(params, context);
        case 'edit': return await editText(params, context);
        case 'summarize': return await summarizeText(params, context);
        case 'rewrite': return await rewriteText(params, context);
        case 'proofread': return await proofreadText(params, context);
        case 'brainstorm': return await brainstormIdeas(params, context);
        case 'outline': return await createOutline(params, context);
        case 'sources': return getSources();
        default:
          return { 
            title: 'Writing', 
            summary: `Unknown operation '${operation}'. Available: generate, edit, summarize, rewrite, proofread, brainstorm, outline, sources`, 
            spokenNarrative: `Unknown writing operation ${operation}`, 
            operation, 
            ok: false 
          };
      }
    } catch (error) {
      return { 
        title: 'Writing', 
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        spokenNarrative: 'Writing error', 
        operation, 
        ok: false 
      };
    }
  },
};

export { writingMetadata } from './WritingSkillMetadata';
export { generateText, editText, summarizeText } from './WritingSkillOperations';
export { rewriteText, proofreadText, brainstormIdeas, createOutline, getSources } from './WritingSkillOperations2';