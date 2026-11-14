import { SkillResult, SkillContext } from '../../../core/types';
export async function createPRDOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { title, problem, goals = [], audience, successMetrics = [], timeline } = params;
  if (!title || !problem) {
    return { title: 'PRD', summary: 'Title and problem statement are required', spokenNarrative: 'Please provide product title and problem', operation: 'create', ok: false };
  }
  const prd = `# ${title}\n\n## Problem Statement\n${problem}\n\n## Target Audience\n${audience || 'TBD'}\n\n## Goals\n${goals.map(g => `- ${g}`).join('\n') || '- TBD'}\n\n## Success Metrics\n${successMetrics.map(m => `- ${m}`).join('\n') || '- TBD'}\n\n## Timeline\n${timeline || 'TBD'}\n\n## Release Criteria\n- All success metrics defined\n- User acceptance testing complete\n- Stakeholder sign-off`;
  return { title: 'PRD Created', summary: `PRD for "${title}"`, spokenNarrative: `Created PRD for ${title}`, operation: 'create', ok: true, record: { prd, title, problem, goals, audience, successMetrics, timeline, createdAt: Date.now() } };
}
export async function reviewPRDOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { prd } = params;
  if (!prd) return { title: 'PRD Review', summary: 'PRD content is required', spokenNarrative: 'Please provide PRD content', operation: 'review', ok: false };
  const checks = [];
  if (!prd.includes('Problem')) checks.push('Missing problem statement');
  if (!prd.includes('Goal')) checks.push('Missing goals');
  if (!prd.includes('Metric')) checks.push('Missing success metrics');
  if (!prd.includes('Audience')) checks.push('Missing target audience');
  return { title: 'PRD Review', summary: `${checks.length} issue(s) found`, spokenNarrative: `PRD review found ${checks.length} issues`, operation: 'review', ok: true, record: { checks, score: Math.max(0, 100 - checks.length * 25) } };
}
export function getPRDTemplateOperation(): SkillResult {
  return { title: 'PRD Template', summary: 'Standard PRD template sections', spokenNarrative: 'PRD template available', operation: 'template', ok: true, record: { sections: ['Problem Statement', 'Target Audience', 'Goals', 'Success Metrics', 'Timeline', 'Release Criteria', 'User Stories', 'Technical Considerations'] } };
}
export function getSourcesOperation(): SkillResult {
  return { title: 'PRD Sources', summary: 'PRD creation uses product management best practices', spokenNarrative: 'PRD uses product management best practices', operation: 'sources', ok: true, record: { frameworks: ['Marty Cagan', 'Product Leadership', 'Intercom on Product'] } };
}