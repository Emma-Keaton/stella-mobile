import { SkillResult, SkillContext } from '../../../core/types';
export async function createAgendaOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { meetingTitle, attendees = [], duration = 30, goal } = params;
  if (!meetingTitle) return { title: 'Meeting Prep', summary: 'Meeting title is required', spokenNarrative: 'Please provide a meeting title', operation: 'agenda', ok: false };
  const agenda = `# ${meetingTitle}\n\n**Attendees:** ${attendees.join(', ')}\n**Duration:** ${duration} minutes\n**Goal:** ${goal || 'TBD'}\n\n## Agenda\n1. Welcome & introductions (5 min)\n2. Review objectives (10 min)\n3. Discussion (${Math.max(0, duration - 20)} min)\n4. Action items & next steps (5 min)\n`;
  return { title: 'Meeting Agenda', summary: `Agenda for "${meetingTitle}" (${duration} min)`, spokenNarrative: `Created agenda for ${meetingTitle}`, operation: 'agenda', ok: true, record: { agenda, meetingTitle, attendees, duration, goal, createdAt: Date.now() } };
}
export function getTalkingPointsOperation(): SkillResult {
  return { title: 'Talking Points', summary: 'Common meeting talking points', spokenNarrative: 'Talking points template', operation: 'talking_points', ok: true, record: { points: ['Opening statement', 'Key message', 'Supporting data', 'Call to action', 'Closing'] } };
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Meeting Prep Sources', summary: 'Meeting facilitation best practices', spokenNarrative: 'Meeting prep uses facilitation best practices', operation: 'sources', ok: true, record: { frameworks: ['RACI', 'Stand-up format', 'Retrospective format'] } };
}