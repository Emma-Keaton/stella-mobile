import { SkillMetadata } from '../../../core/types';
export const competitiveAnalysisMetadata: SkillMetadata = {
  name: 'competitive_analysis', aliases: ['competitive_analysis', 'competitor_analysis', 'swot', 'competitive_intelligence', 'market_positioning'],
  description: 'Competitive analysis - SWOT analysis, competitor benchmarking, positioning analysis, and competitive landscape mapping.',
  triggers: ['competitive analysis', 'competitor analysis', 'swot analysis', 'competitive intelligence', 'market positioning', 'competitor benchmarking'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['swot', 'benchmark', 'positioning', 'landscape', 'sources'], default: 'swot' }, competitor: { type: 'string', description: 'Competitor name.' }, yourCompany: { type: 'string', description: 'Your company name.' }, market: { type: 'string', description: 'Market or industry.' } }, required: [] },
  version: '1.0.0', category: 'research', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Competitive analysis skill - linked with lead finder.',
};