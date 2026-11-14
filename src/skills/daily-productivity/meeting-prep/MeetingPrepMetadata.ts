import { SkillMetadata } from '../../../core/types';
export const meetingPrepMetadata: SkillMetadata = {
  name: 'meeting_prep', aliases: ['meeting_prep', 'meeting_preparation', 'agenda', 'meeting_agenda', 'meeting_notes'],
  description: 'Meeting preparation - creates agendas, talking points, questions to ask, and follow-up action items.',
  triggers: ['meeting prep', 'meeting preparation', 'meeting agenda', 'prepare for meeting', 'meeting notes', 'meeting planning'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['agenda', 'talking_points', 'questions', 'followup', 'sources'], default: 'agenda' }, meetingTitle: { type: 'string', description: 'Meeting title.' }, attendees: { type: 'array', items: { type: 'string' }, description: 'Meeting attendees.' }, duration: { type: 'number', description: 'Duration in minutes.' }, goal: { type: 'string', description: 'Meeting goal or objective.' } }, required: [] },
  version: '1.0.0', category: 'daily_productivity', source: 'claude-skills', active: true, author: 'Stella', surface: 'mobile', notes: 'Meeting preparation skill.',
};