import { SkillMetadata } from '../../../core/types';
export const seoMetadata: SkillMetadata = {
  name: 'seo_audit', aliases: ['seo_audit', 'seo_analysis', 'search_engine_optimization', 'seo_check', 'website_seo'],
  description: 'Performs SEO audit on websites - checks meta tags, headings, content structure, page speed factors, and mobile-friendliness.',
  triggers: ['seo audit', 'seo analysis', 'search engine optimization', 'seo check', 'website seo', 'seo review', 'optimize seo'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['audit', 'keywords', 'meta', 'content', 'technical', 'sources'], default: 'audit' }, url: { type: 'string', description: 'Website URL to audit.' }, keywords: { type: 'array', items: { type: 'string' }, description: 'Target keywords.' }, competitorUrls: { type: 'array', items: { type: 'string' }, description: 'Competitor URLs for comparison.' } }, required: [] },
  version: '1.0.0', category: 'marketing', source: 'claude-skills', active: true, author: 'Stella', surface: 'mobile', notes: 'Marketing SEO audit skill.',
};