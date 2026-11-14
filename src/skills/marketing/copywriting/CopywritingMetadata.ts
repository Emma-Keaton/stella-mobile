import { SkillMetadata } from '../../../core/types';
export const copywritingMetadata: SkillMetadata = {
  name: 'copywriting', aliases: ['copywriting', 'ad_copy', 'marketing_copy', 'sales_copy', 'email_copy', 'landing_page_copy'],
  description: 'Writes persuasive marketing copy for ads, emails, landing pages, and social media using proven frameworks (AIDA, PAS, BAB).',
  triggers: ['write copy', 'copywriting', 'ad copy', 'marketing copy', 'sales copy', 'email copy', 'landing page copy', 'persuasive copy'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['ad', 'email', 'landing', 'social', 'framework', 'sources'], default: 'ad' }, product: { type: 'string', description: 'Product or service name.' }, audience: { type: 'string', description: 'Target audience.' }, offer: { type: 'string', description: 'Main offer or value proposition.' }, tone: { type: 'string', enum: ['professional', 'casual', 'urgent', 'friendly', 'luxury'], default: 'professional' }, framework: { type: 'string', enum: ['AIDA', 'PAS', 'BAB', 'FFF'], default: 'AIDA' } }, required: [] },
  version: '1.0.0', category: 'marketing', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Marketing copywriting skill.',
};