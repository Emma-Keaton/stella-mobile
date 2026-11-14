import { SkillMetadata } from '../../../core/types';
export const emailTriageMetadata: SkillMetadata = {
  name: 'email_triage', aliases: ['email_triage', 'inbox_zero', 'email_sorting', 'email_prioritization', 'inbox_management'],
  description: 'Email triage - categorizes emails by priority, suggests responses, flags action items, and helps achieve inbox zero.',
  triggers: ['email triage', 'inbox zero', 'email sorting', 'email prioritization', 'inbox management', 'triage email'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['categorize', 'suggest_response', 'flag_action', 'summary', 'sources'], default: 'categorize' }, subject: { type: 'string', description: 'Email subject line.' }, sender: { type: 'string', description: 'Email sender.' }, body: { type: 'string', description: 'Email body content.' }, urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Perceived urgency.' } }, required: [] },
  version: '1.0.0', category: 'daily_productivity', source: 'claude-skills', active: true, author: 'Stella', surface: 'mobile', notes: 'Email triage skill - linked with outreach skill.',
};