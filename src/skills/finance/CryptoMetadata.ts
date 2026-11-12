/**
 * Stella Mobile — Crypto Skill Metadata
 */

import { SkillMetadata } from '../core/types';

export const cryptoMetadata: SkillMetadata = {
  name: 'crypto',
  aliases: ['crypto', 'crypto_price', 'bitcoin_price', 'ethereum_price', 'cryptocurrency', 'coin_price', 'token_price'],
  description: 'Get live cryptocurrency prices, market data, and trends using CoinGecko (free, keyless). Supports 10,000+ coins.',
  triggers: ['crypto', 'bitcoin price', 'ethereum price', 'crypto price', 'bitcoin', 'ethereum', 'btc', 'eth', 'coin price', 'token price', 'cryptocurrency'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: price | market | trending | search | list | sources. Defaults to price.' },
      coin: { type: 'string', description: 'Coin ID or symbol (e.g., bitcoin, eth, btc). Required for price/market.' },
      vs_currency: { type: 'string', description: 'Quote currency (default: usd).', enum: ['usd', 'eur', 'gbp', 'jpy', 'cny', 'krw', 'btc', 'eth'] },
      days: { type: 'number', description: 'Days of market data (1-365, default: 7).' },
      per_page: { type: 'number', description: 'Results per page for list (default: 50, max: 250).' },
      page: { type: 'number', description: 'Page number for list (default: 1).' },
      query: { type: 'string', description: 'Search query for search operation.' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'finance',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    coingecko: { name: 'CoinGecko', description: 'Free cryptocurrency data API', url: 'https://api.coingecko.com/api/v3', docs: 'https://www.coingecko.com/en/api', authTier: 'keyless', rateLimit: '50 calls per minute', uses: ['price', 'market', 'trending', 'search', 'list'] },
  },
};