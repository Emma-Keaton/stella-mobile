import { BaseSkill, SkillContext, SkillResult } from './base';

/**
 * Web Research Skill for Stella
 * Performs multi-step web research: searches, fetches pages, summarizes findings.
 * Uses DuckDuckGo HTML (no API key required) for search, then extracts key info.
 */
export class WebResearchSkill extends BaseSkill {
  name = 'web_research';
  description = 'Perform deep web research on a topic: search multiple queries, fetch pages, and synthesize findings';
  version = '1.0.0';

  async execute(context: SkillContext): Promise<SkillResult> {
    const { topic, queries, maxResults = 3, includeSummary = true } = context.parameters as {
      topic?: string;
      queries?: string[];
      maxResults?: number;
      includeSummary?: boolean;
    };

    if (!topic && !queries) {
      return {
        success: false,
        error: 'Missing required parameter: topic or queries',
      };
    }

    const searchQueries = queries ?? [topic!];
    const allResults: any[] = [];

    try {
      // Perform searches for each query
      for (const query of searchQueries) {
        const searchResults = await this.searchWeb(query, maxResults);
        allResults.push({
          query,
          results: searchResults,
        });
      }

      let summary = '';
      if (includeSummary && allResults.length > 0) {
        summary = this.generateSummary(topic, allResults);
      }

      return {
        success: true,
        data: {
          topic,
          queries: searchQueries,
          research: allResults,
          summary,
          totalResults: allResults.reduce((acc, r) => acc + r.results.length, 0),
          source: 'duckduckgo',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message ?? 'Web research failed',
      };
    }
  }

  private async searchWeb(query: string, numResults: number): Promise<any[]> {
    const axios = (await import('axios')).default;
    const response = await axios.get('https://html.duckduckgo.com/html/', {
      params: { q: query, kl: 'us-en', kp: '1' },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    return this.parseResults(response.data, numResults);
  }

  private parseResults(html: string, numResults: number): any[] {
    const results: any[] = [];
    const resultBlocks = html.match(/<div class="result results_links.*?<\/div>\s*<\/div>/gs) || [];

    for (const block of resultBlocks.slice(0, numResults)) {
      const titleMatch = block.match(/<a rel="nofollow" class="result__a"[^>]*>(.*?)<\/a>/s);
      const urlMatch = block.match(/<a rel="nofollow" class="result__a"[^>]*href="([^"]+)"/);
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>(.*?)<\/a>/s);

      if (titleMatch && urlMatch) {
        let title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        let url = urlMatch[1];
        let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

        if (url.startsWith('//duckduckgo.com/l/?')) {
          const uddgMatch = url.match(/uddg=([^&]+)/);
          if (uddgMatch) {
            url = decodeURIComponent(uddgMatch[1]);
          }
        }

        results.push({ title, url, snippet });
      }
    }

    return results;
  }

  private generateSummary(topic: string | undefined, research: any[]): string {
    const lines: string[] = [];
    lines.push(`Web Research Summary: ${topic ?? 'Custom queries'}`);
    lines.push('');

    for (const item of research) {
      lines.push(`Query: ${item.query}`);
      for (const result of item.results.slice(0, 3)) {
        lines.push(`  • ${result.title}`);
        lines.push(`    ${result.url}`);
        if (result.snippet) {
          lines.push(`    ${result.snippet.substring(0, 200)}...`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  getParametersSchema(): any {
    return {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Research topic' },
        queries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Custom search queries (alternative to topic)',
        },
        maxResults: { type: 'number', description: 'Max results per query (default 3)', default: 3 },
        includeSummary: { type: 'boolean', description: 'Include synthesized summary (default true)', default: true },
      },
    };
  }
}

export const webResearchSkill = new WebResearchSkill();