/**
 * Stella Mobile — GIF Search Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { gifSearchMetadata } from './GifSearchMetadata';
import { searchGifs, getTrending, getRandom, getSources } from './GifSearchOperations';

export const gifSearchSkill: Skill = {
  metadata: gifSearchMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'search').toLowerCase();

    try {
      switch (operation) {
        case 'search': return await searchGifs(params, context);
        case 'trending': return await getTrending(params, context);
        case 'random': return await getRandom(params, context);
        case 'sources': return getSources();
        default:
          return { 
            title: 'GIF Search', 
            summary: `Unknown operation '${operation}'. Available: search, trending, random, categories, sources`, 
            spokenNarrative: `Unknown GIF operation ${operation}`, 
            operation, 
            ok: false 
          };
      }
    } catch (error) {
      return { 
        title: 'GIF Search', 
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        spokenNarrative: 'GIF search error', 
        operation, 
        ok: false 
      };
    }
  },
};

export { gifSearchMetadata } from './GifSearchMetadata';
export { searchGifs, getTrending, getRandom, getSources } from './GifSearchOperations';