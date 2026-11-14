/**
 * Stella Mobile — Gif Search Skill
 * Search and display GIFs from Giphy/Tenor APIs
 */

import { SkillMetadata } from '../core/types';

export const gifSearchMetadata: SkillMetadata = {
  name: 'gif_search',
  aliases: ['gif_search', 'gif', 'gifs', 'find_gif', 'search_gif', 'animated_gif'],
  description: 'Search and display animated GIFs from Giphy and Tenor APIs. Supports trending, categories, and search.',
  triggers: ['gif', 'gifs', 'find gif', 'search gif', 'animated gif', 'show me a gif'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: search | trending | categories | random | sources. Defaults to search.',
        enum: ['search', 'trending', 'categories', 'random', 'sources']
      },
      query: { type: 'string', description: 'Search query for GIFs.' },
      limit: { type: 'number', description: 'Number of results (default 10, max 50).' },
      rating: { type: 'string', description: 'Content rating: g, pg, pg-13, r. Defaults to g.', enum: ['g', 'pg', 'pg-13', 'r'] },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'media',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    giphy: { name: 'Giphy API', description: 'GIF search and trending', url: 'https://api.giphy.com/v1/gifs', docs: 'https://developers.giphy.com/docs/', authTier: 'api_key', rateLimit: 'Free tier available', uses: ['search', 'trending', 'random'] },
    tenor: { name: 'Tenor API', description: 'Google Tenor GIF search', url: 'https://tenor.googleapis.com/v2', docs: 'https://developers.google.com/tenor', authTier: 'api_key', rateLimit: 'Free tier available', uses: ['search', 'trending', 'random'] },
  },
};