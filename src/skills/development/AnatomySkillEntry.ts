/**
 * Stella Mobile — Anatomy Skill Entry Point
 * Combines metadata and operations into a single skill
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { anatomyMetadata } from './AnatomyMetadata';
import { getSources, getExamples, getKit, getWorkflow } from './AnatomyOperations1';
import { runVerify, getFigurePlan, getReferences, buildFigure } from './AnatomyOperations2';

export const anatomySkill: Skill = {
  metadata: anatomyMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'sources').toLowerCase();

    try {
      switch (operation) {
        case 'sources': return await getSources();
        case 'examples': return await getExamples(params);
        case 'kit': return await getKit(params);
        case 'workflow': return await getWorkflow();
        case 'verify': return await runVerify();
        case 'figure_plan': return await getFigurePlan(params);
        case 'references': return await getReferences();
        case 'build': return await buildFigure(params, context);
        default:
          return { title: 'Anatomy', summary: `Unknown operation '${operation}'. Available: sources, examples, kit, workflow, verify, figure_plan, references, build`, spokenNarrative: `Unknown anatomy operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Anatomy', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Anatomy service error', operation, ok: false };
    }
  },
};

export { anatomyMetadata } from './AnatomyMetadata';
export { getSources, getExamples, getKit, getWorkflow } from './AnatomyOperations1';
export { runVerify, getFigurePlan, getReferences, buildFigure } from './AnatomyOperations2';