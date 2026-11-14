import { SkillMetadata } from '../../../core/types';
export const marketResearchMetadata: SkillMetadata = {
  name: 'market_research', aliases: ['market_research', 'market_analysis', 'market_sizing', 'customer_research', 'tam_sam_som'],
  description: 'Market research - TAM/SAM/SOM calculation, customer segmentation, market trends, and opportunity assessment.',
  triggers: ['market research', 'market analysis', 'market sizing', 'tam sam som', 'customer research', 'opportunity assessment', 'market trends'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['tam_sam_som', 'segmentation', 'trends', 'opportunity', 'sources'], default: 'tam_sam_som' }, market: { type: 'string', description: 'Market or industry name.' }, geography: { type: 'string', description: 'Geographic region.' }, targetCustomer: { type: 'string', description: 'Target customer segment.' } }, required: [] },
  version: '1.0.0', category: 'research', source: 'claude-skills', active: true, author: 'Stella', surface: 'mobile', notes: 'Market research skill - linked with lead finder and web search.',
};