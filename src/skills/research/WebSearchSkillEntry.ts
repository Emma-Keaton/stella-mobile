/**
 * Stella Mobile — Web Search Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { webSearchMetadata } from './WebSearchMetadata';
import { searchWeb, searchNews, searchImages, getSources } from './WebSearchOperations';

export const webSearchSkill: Skill = {
  metadata: webSearchMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'search').toLowerCase();

    try {
      switch (operation) {
        case 'search': return await searchWeb(params, context);
        case 'news': return await searchNews(params, context);
        case 'images': return await searchImages(params, context);
        case 'sources': return getSources();
        default:
          return { 
            title: 'Web Search', 
            summary: `Unknown operation '${operation}'. Available: search, news, images, sources`, 
            spokenNarrative: `Unknown search operation ${operation}`, 
            operation, 
            ok: false 
          };
      }
    } catch (error) {
      return { 
        title: 'Web Search', 
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        spokenNarrative: 'Search error', 
        operation, 
        ok: false 
      };
    }
  },
};

export { webSearchMetadata } from './WebSearchMetadata';
export { searchWeb, searchNews, searchImages, getSources } from './WebSearchOperations';