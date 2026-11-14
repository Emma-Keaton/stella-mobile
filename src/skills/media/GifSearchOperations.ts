/**
 * Stella Mobile — GIF Search Operations
 */

import { SkillResult, SkillContext } from '../core/types';
import { apiClients } from '../../api/ApiClient';

export async function searchGifs(params: any, context: SkillContext): Promise<any> {
  const { query, limit = 10, rating = 'g' } = params;
  
  if (!query) {
    return { title: 'GIF Search', summary: 'Search query is required', spokenNarrative: 'Please provide a search query', operation: 'search', ok: false };
  }

  // Try Giphy first, then Tenor
  const providers = ['giphy', 'tenor'];
  
  for (const provider of providers) {
    const apiKey = apiClients[provider]?.getApiSource?.()?.url?.includes('giphy') 
      ? context.settings?.giphyApiKey 
      : context.settings?.tenorApiKey;
    
    if (apiKey) {
      try {
        const client = apiClients[provider];
        const response = await client.get('/search', {
          q: query,
          limit: Math.min(limit, 50),
          rating,
          api_key: apiKey,
        });
        
        const gifs = response.data || [];
        const lines = gifs.slice(0, Math.min(limit, 10)).map((gif: any, i: number) => 
          `${i + 1}. ${gif.title || 'GIF'} - ${gif.images?.original?.url || gif.media_formats?.gif?.url || 'URL unavailable'}`
        ).join('\n');
        
        return { 
          title: 'GIF Search Results', 
          summary: `Found ${gifs.length} GIFs for "${params.query}":\n${lines}`, 
          spokenNarrative: `Found ${gifs.length} GIFs for ${params.query}`, 
          operation: 'search', 
          ok: true, 
          record: { query: params.query, count: gifs.length, gifs: gifs.slice(0, limit) } 
        };
      } catch (e) {
        // Try next provider
        continue;
      }
    }
  }
  
  // No API keys available
  return { 
    title: 'GIF Search', 
    summary: `Search for "${params.query}" requires API keys for Giphy/Tenor.\n\nAdd API keys in Settings:\n- Giphy API key (developers.giphy.com)\n- Tenor API key (developers.google.com/tenor)`, 
    spokenNarrative: 'GIF search requires API keys', 
    operation: 'search', 
    ok: false 
  };
}

export async function getTrending(params: any, context: SkillContext): Promise<any> {
  const { limit = 10, rating = 'g' } = params;
  
  for (const provider of ['giphy', 'tenor']) {
    const apiKey = provider === 'giphy' ? context.settings?.giphyApiKey : context.settings?.tenorApiKey;
    if (!apiKey) continue;
    
    try {
      const client = apiClients[provider];
      const response = await client.get('/trending', {
        limit: Math.min(limit, 50),
        rating,
        api_key: apiKey,
      });
      
      const gifs = response.data || [];
      return { 
        title: 'Trending GIFs', 
        summary: `Top ${gifs.length} trending GIFs from ${provider}`, 
        spokenNarrative: `Here are trending GIFs from ${provider}`, 
        operation: 'trending', 
        ok: true, 
        record: { provider, count: gifs.length, gifs: gifs.slice(0, params.limit || 10) } 
      };
    } catch (e) {
      continue;
    }
  }
  
  return { title: 'Trending', summary: 'No API keys configured for Giphy/Tenor', spokenNarrative: 'Need API keys for trending', operation: 'trending', ok: false };
}

export async function getRandom(params: any, context: SkillContext): Promise<any> {
  const { rating = 'g', tag } = params;
  
  for (const provider of ['giphy', 'tenor']) {
    const apiKey = provider === 'giphy' ? context.settings?.giphyApiKey : context.settings?.tenorApiKey;
    if (!apiKey) continue;
    
    try {
      const client = apiClients[provider];
      const response = await client.get('/random', {
        rating,
        tag,
        api_key: apiKey,
      });
      
      const gif = response.data;
      return { 
        title: 'Random GIF', 
        summary: `${gif.title || 'Random GIF'} - ${gif.images?.original?.url || gif.media_formats?.gif?.url}`, 
        spokenNarrative: 'Here is a random GIF', 
        operation: 'random', 
        ok: true, 
        record: { gif } 
      };
    } catch (e) {
      continue;
    }
  }
  
  return { title: 'Random GIF', summary: 'No API keys configured', spokenNarrative: 'Need API keys', operation: 'random', ok: false };
}

export function getSources(): any {
  return { 
    title: 'GIF Sources', 
    summary: 'GIFs from Giphy and Tenor APIs. Requires free API keys from developers.giphy.com and developers.google.com/tenor', 
    spokenNarrative: 'GIFs from Giphy and Tenor', 
    operation: 'sources', 
    ok: true, 
    record: { 
      source: 'Giphy API, Tenor API', 
      operations: ['search', 'trending', 'random', 'categories', 'sources'],
      setup: 'Get free API keys from developers.giphy.com and developers.google.com/tenor'
    } 
  };
}