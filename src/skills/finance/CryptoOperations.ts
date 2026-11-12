/**
 * Stella Mobile — Crypto Operations
 */

import { SkillResult } from '../core/types';
import { apiClients } from '../api/ApiClient';

export async function getPrice(coin: string, vsCurrency: string): Promise<SkillResult> {
  const data = await apiClients.coingecko.get<any>('/simple/price', {
    ids: coin,
    vs_currencies: vsCurrency,
    include_24hr_change: 'true',
    include_market_cap: 'true',
    include_last_updated_at: 'true',
  });

  const priceData = data[coin];
  if (!priceData) {
    return { title: 'Crypto Price', summary: `Coin ${coin} not found`, spokenNarrative: `I couldn't find price data for ${coin}`, operation: 'price', ok: false };
  }

  const price = priceData[vsCurrency];
  const change = priceData[`${vsCurrency}_24h_change`];
  const marketCap = priceData[`${vsCurrency}_market_cap`];
  const updated = new Date(priceData.last_updated_at * 1000).toLocaleString();

  const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  const changeEmoji = change >= 0 ? '📈' : '📉';

  const content = `${coin.toUpperCase()}: ${price.toLocaleString()} ${vsCurrency.toUpperCase()} ${changeEmoji} ${changeStr}\nMarket Cap: $${(marketCap / 1e9).toFixed(2)}B\nUpdated: ${updated}\nSource: CoinGecko (keyless)`;

  return { title: 'Crypto Price', summary: content, spokenNarrative: `${coin} is ${price.toLocaleString()} ${vsCurrency}, ${changeStr} in 24 hours`, operation: 'price', ok: true, record: { coin, vsCurrency, price, change, marketCap, updated } };
}

export async function getMarketData(coin: string, vsCurrency: string, days: number): Promise<SkillResult> {
  const data = await apiClients.coingecko.get<any>(`/coins/${coin}/market_chart`, {
    vs_currency: vsCurrency,
    days: Math.min(Math.max(days, 1), 365),
  });

  const prices = data.prices || [];
  if (prices.length === 0) {
    return { title: 'Market Data', summary: `No market data for ${coin}`, spokenNarrative: `No market data available for ${coin}`, operation: 'market', ok: false };
  }

  const current = prices[prices.length - 1][1];
  const start = prices[0][1];
  const high = Math.max(...prices.map((p: number[]) => p[1]));
  const low = Math.min(...prices.map((p: number[]) => p[1]));
  const change = ((current - start) / start * 100).toFixed(2);

  const content = `${coin.toUpperCase()} ${days}d Market Data (${vsCurrency.toUpperCase()}):\nCurrent: ${current.toLocaleString()}\n${days}d High: ${high.toLocaleString()}\n${days}d Low: ${low.toLocaleString()}\nChange: ${change >= 0 ? '+' : ''}${change}%\nSource: CoinGecko (keyless)`;

  return { title: 'Market Data', summary: content, spokenNarrative: `${coin} is ${current.toLocaleString()} ${vsCurrency}, ${change}% over ${days} days`, operation: 'market', ok: true, record: { coin, vsCurrency, days, current, high, low, change } };
}

export async function getTrending(): Promise<SkillResult> {
  const data = await apiClients.coingecko.get<any>('/search/trending');
  const coins = data.coins || [];

  const lines = coins.slice(0, 10).map((c: any, i: number) => {
    const item = c.item;
    return `${i + 1}. ${item.name} (${item.symbol.toUpperCase()}) - Rank ${item.market_cap_rank}: ${item.price_btc} BTC`;
  }).join('\n');

  const content = `Trending Cryptocurrencies:\n${lines}\n\nSource: CoinGecko (keyless)`;

  return { title: 'Trending Crypto', summary: content, spokenNarrative: `Top trending: ${coins.slice(0, 3).map((c: any) => c.item.name).join(', ')}`, operation: 'trending', ok: true, record: { coins } };
}

export async function searchCoins(query: string): Promise<SkillResult> {
  const data = await apiClients.coingecko.get<any>('/search', { query });
  const coins = data.coins || [];

  if (coins.length === 0) {
    return { title: 'Coin Search', summary: `No coins found for "${query}"`, spokenNarrative: `I couldn't find any coins matching ${query}`, operation: 'search', ok: false };
  }

  const lines = coins.slice(0, 10).map((c: any) => `${c.name} (${c.symbol.toUpperCase()}) - ${c.id}`).join('\n');
  const content = `Search results for "${query}":\n${lines}\n\nSource: CoinGecko (keyless)`;

  return { title: 'Coin Search', summary: content, spokenNarrative: `Found ${coins.length} coins matching ${query}`, operation: 'search', ok: true, record: { query, coins } };
}

export async function listCoins(vsCurrency: string, perPage: number, page: number): Promise<SkillResult> {
  const data = await apiClients.coingecko.get<any[]>('/coins/markets', {
    vs_currency: vsCurrency,
    order: 'market_cap_desc',
    per_page: Math.min(Math.max(perPage, 1), 250),
    page: Math.max(page, 1),
    sparkline: false,
  });

  const lines = data.slice(0, 20).map((c: any, i: number) => {
    const change = c.price_change_percentage_24h;
    const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
    return `${i + 1 + (page - 1) * perPage}. ${c.name} (${c.symbol.toUpperCase()}) - ${c.current_price.toLocaleString()} ${vsCurrency.toUpperCase()} (${changeStr})`;
  }).join('\n');

  const content = `Top ${perPage} Cryptocurrencies by Market Cap (${vsCurrency.toUpperCase()}):\n${lines}\n\nSource: CoinGecko (keyless)`;

  return { title: 'Crypto Market', summary: content, spokenNarrative: `Top crypto: ${data[0]?.name}, ${data[1]?.name}, ${data[2]?.name}`, operation: 'list', ok: true, record: { vsCurrency, perPage, page, count: data.length } };
}

export function getSources(): SkillResult {
  return { title: 'Crypto Sources', summary: 'Cryptocurrency data from CoinGecko (free, keyless, 50 calls/minute). Supports 10,000+ coins.', spokenNarrative: 'Crypto data comes from CoinGecko, free and keyless', operation: 'sources', ok: true, record: { source: 'CoinGecko', operations: ['price', 'market', 'trending', 'search', 'list', 'sources'] } };
}