import { SkillResult, SkillContext } from '../../../core/types';
export async function categorizeEmailOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { subject = '', body = '', sender = '', urgency = 'medium' } = params;
  const text = `${subject} ${body}`.toLowerCase();
  let category = 'info';
  let priority = urgency;
  if (/invoice|payment|bill|charge/i.test(text)) category = 'billing';
  else if (/meeting|call|interview|appointment/i.test(text)) category = 'meeting';
  else if (/job|career|hire|position|apply/i.test(text)) category = 'career';
  else if (/urgent|asap|immediately|emergency/i.test(text)) { category = 'urgent'; priority = 'high'; }
  else if (/newsletter|promo|sale|discount|unsubscribe/i.test(text)) category = 'marketing';
  return { title: 'Email Triage', summary: `Category: ${category}, Priority: ${priority}`, spokenNarrative: `Email categorized as ${category} with ${priority} priority`, operation: 'categorize', ok: true, record: { subject, sender, category, priority, suggestedAction: category === 'urgent' ? 'Respond today' : category === 'billing' ? 'Process payment' : 'Archive or respond', triagedAt: Date.now() } };
}
export async function suggestResponseOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { subject = '', body = '', sender = '' } = params;
  const response = `Hi ${sender || 'there'},\n\nThank you for your email about "${subject}".\n\nI've received your message and will respond shortly.\n\nBest regards,\nStella`;
  return { title: 'Suggested Response', summary: `Draft response for: ${subject}`, spokenNarrative: `Drafted response for ${subject}`, operation: 'suggest_response', ok: true, record: { response, subject, sender, createdAt: Date.now() } };
}
export function getSummaryOperation(): SkillResult {
  return { title: 'Inbox Summary', summary: 'Inbox triage summary template', spokenNarrative: 'Inbox summary', operation: 'summary', ok: true, record: { sections: ['Urgent (respond today)', 'Action items (respond this week)', 'FYI (read when possible)', 'Marketing (unsubscribe if not needed)'] } };
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Email Triage Sources', summary: 'Email management best practices', spokenNarrative: 'Email triage uses inbox zero methodology', operation: 'sources', ok: true, record: { frameworks: ['Inbox Zero', '4D method (Delete, Delegate, Defer, Do)'] } };
}