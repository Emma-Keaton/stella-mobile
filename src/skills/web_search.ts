import axios from 'axios';
import { BaseSkill, SkillContext, SkillResult } from './base';

/**
 * Web Search Skill for Stella
 * Provides web search and web research capabilities using DuckDuckGo HTML
 * (no API key required) or a configurable search API endpoint.
 */
export class WebSearchSkill extends BaseSkill {
  name = 'web_search';
  description = 'Search the web for information and return results';
  version = '1.0.0';

  private searchEndpoint: string;

  constructor() {
    super();
    // DuckDuckGo HTML endpoint - no API key required
    this.searchEndpoint = 'https://html.duckduckgo.com/html/';
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const { query, numResults = 5, safeSearch = true } = context.parameters as {
      query?: string;
      numResults?: number;
      safeSearch?: boolean;
    };

    if (!query) {
      return {
        success: false,
        error: 'Missing required parameter: query',
      };
    }

    try {
      const results = await this.searchWeb(query, numResults, safeSearch);
      return {
        success: true,
        data: {
          query,
          results,
          count: results.length,
          source: 'duckduckgo',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message ?? 'Web search failed',
      };
    }
  }

  private async searchWeb(query: string, numResults: number, safeSearch: boolean): Promise<any[]> {
    const params: Record<string, string> = {
      q: query,
      kl: 'us-en',
    };
    if (safeSearch) {
      params.kp = '1'; // Safe search on
    }

    const response = await axios.get(this.searchEndpoint, {
      params,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const html = response.data;
    return this.parseDuckDuckGoResults(html, numResults);
  }

  private parseDuckDuckGoResults(html: string, numResults: number): any[] {
    const results: any[] = [];

    // Simple regex-based parsing of DuckDuckGo HTML results
    // Each result is in a <div class="result"> block
    const resultBlocks = html.match(/<div class="result results_links.*?<\/div>\s*<\/div>/gs) || [];

    for (const block of resultBlocks.slice(0, numResults)) {
      const titleMatch = block.match(/<a rel="nofollow" class="result__a"[^>]*>(.*?)<\/a>/s);
      const urlMatch = block.match(/<a rel="nofollow" class="result__a"[^>]*href="([^"]+)"/);
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>(.*?)<\/a>/s);

      if (titleMatch && urlMatch) {
        let title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        let url = urlMatch[1];
        let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

        // Decode DuckDuckGo redirect URL
        if (url.startsWith('//duckduckgo.com/l/?')) {
          const uddgMatch = url.match(/uddg=([^&]+)/);
          if (uddgMatch) {
            url = decodeURIComponent(uddgMatch[1]);
          }
        }

        results.push({
          title,
          url,
          snippet,
        });
      }
    }

    return results;
  }

  getParametersSchema(): any {
    return {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        numResults: { type: 'number', description: 'Number of results to return (default 5)', default: 5 },
        safeSearch: { type: 'boolean', description: 'Enable safe search (default true)', default: true },
      },
      required: ['query'],
    };
  }
}

export const webSearchSkill = new WebSearchSkill();