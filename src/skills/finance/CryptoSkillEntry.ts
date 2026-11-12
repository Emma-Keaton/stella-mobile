/**
 * Stella Mobile — Crypto Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { cryptoMetadata } from './CryptoMetadata';
import { getPrice, getMarketData, getTrending, searchCoins, listCoins, getSources } from './CryptoOperations';

export const cryptoSkill: Skill = {
  metadata: cryptoMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'price').toLowerCase();
    const coin = params.coin?.toLowerCase() || 'bitcoin';
    const vsCurrency = (params.vs_currency || 'usd').toLowerCase();
    const days = Math.min(Math.max(params.days || 7, 1), 365);
    const perPage = Math.min(Math.max(params.per_page || 50, 1), 250);
    const page = Math.max(params.page || 1, 1);
    const query = params.query;

    try {
      switch (operation) {
        case 'price': return await getPrice(coin, vsCurrency);
        case 'market': return await getMarketData(coin, vsCurrency, days);
        case 'trending': return await getTrending();
        case 'search': {
          if (!query) return { title: 'Crypto', summary: 'Query required for search', spokenNarrative: 'Please provide a search query', operation: 'search', ok: false };
          return await searchCoins(query);
        }
        case 'list': return await listCoins(vsCurrency, perPage, page);
        case 'sources': return getSources();
        default:
          return { title: 'Crypto', summary: `Unknown operation '${operation}'. Available: price, market, trending, search, list, sources`, spokenNarrative: `Unknown crypto operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Crypto', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Crypto service error', operation, ok: false };
    }
  },
};

export { cryptoMetadata } from './CryptoMetadata';
export { getPrice, getMarketData, getTrending, searchCoins, listCoins, getSources } from './CryptoOperations';