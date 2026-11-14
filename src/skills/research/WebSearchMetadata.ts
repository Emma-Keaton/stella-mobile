/**
 * Stella Mobile — Web Search Skill
 * Search the web using multiple free search APIs (DuckDuckGo, Bing, etc.)
 */

import { SkillMetadata } from '../core/types';

export const webSearchMetadata: SkillMetadata = {
  name: 'web_search',
  aliases: ['web_search', 'search_web', 'google_search', 'duckduckgo', 'search', 'look_up', 'find_online'],
  description: 'Search the web using free search APIs (DuckDuckGo HTML, Bing, etc.). Supports both local LLM synthesis and direct API results. No API key required for basic search.',
  triggers: ['search', 'search web', 'web search', 'google', 'duckduckgo', 'look up', 'find online', 'search for'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: search | news | images | sources. Defaults to search.',
        enum: ['search', 'news', 'images', 'sources']
      },
      query: { type: 'string', description: 'Search query.' },
      limit: { type: 'number', description: 'Number of results (default 10, max 50).' },
      safeSearch: { type: 'boolean', description: 'Enable safe search (default true).' },
      region: { type: 'string', description: 'Region code (e.g., us-en, uk-en, de-de).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'research',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    duckduckgo: { name: 'DuckDuckGo HTML', description: 'Free web search via HTML scraping', url: 'https://html.duckduckgo.com/html/', docs: 'https://duckduckgo.com/', authTier: 'keyless', rateLimit: 'Respectful scraping', uses: ['search'] },
    bing: { name: 'Bing Web Search', description: 'Microsoft Bing Search API (requires key for production)', url: 'https://api.bing.microsoft.com/v7.0/search', docs: 'https://docs.microsoft.com/en-us/bing/search-apis/', authTier: 'api_key', rateLimit: 'Varies by tier', uses: ['search', 'news', 'images'] },
  },
};