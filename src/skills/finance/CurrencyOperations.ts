/**
 * Stella Mobile — Currency Operations
 */

import { SkillResult } from '../core/types';
import { apiClients } from '../api/ApiClient';
import { CURRENCY_NAMES } from './CurrencyMetadata';

export async function convertCurrency(from: string, to: string, amount: number): Promise<SkillResult> {
  const data = await apiClients.exchangerate.get<any>(`/latest/${from}`);
  const rate = data.rates?.[to];

  if (!rate) {
    return { title: 'Currency', summary: `Currency ${to} not found for base ${from}`, spokenNarrative: `I couldn't find the exchange rate for ${to}`, operation: 'convert', ok: false };
  }

  const converted = amount * rate;
  const fromName = CURRENCY_NAMES[from] || from;
  const toName = CURRENCY_NAMES[to] || to;

  const content = `${amount} ${from} (${fromName}) = ${converted.toFixed(2)} ${to} (${toName})\nRate: 1 ${from} = ${rate.toFixed(4)} ${to}\nSource: ExchangeRate-API (keyless, updated daily)`;

  return { title: 'Currency Conversion', summary: content, spokenNarrative: `${amount} ${fromName} equals ${converted.toFixed(2)} ${toName}`, operation: 'convert', ok: true, record: { from, to, amount, converted, rate, fromName, toName } };
}

export async function getRates(base: string): Promise<SkillResult> {
  const data = await apiClients.exchangerate.get<any>(`/latest/${base}`);
  const rates = data.rates || {};

  const major = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR'].filter(c => c !== base);
  const lines = major.map(c => `1 ${base} = ${rates[c]?.toFixed(4) || 'N/A'} ${c} (${CURRENCY_NAMES[c] || c})`).join('\n');

  const content = `Exchange rates for ${base} (${CURRENCY_NAMES[base] || base}):\n${lines}\n\nSource: ExchangeRate-API (keyless)`;

  return { title: 'Exchange Rates', summary: content, spokenNarrative: `Current rates for ${base}: ${major.slice(0, 3).map(c => `${rates[c]?.toFixed(2)} ${c}`).join(', ')}`, operation: 'rates', ok: true, record: { base, rates, major } };
}

export function listCurrencies(): SkillResult {
  const entries = Object.entries(CURRENCY_NAMES).map(([code, name]) => `${code}: ${name}`).join(', ');
  const content = `Supported currencies (${Object.keys(CURRENCY_NAMES).length}):\n${entries}\n\nSource: ExchangeRate-API`;

  return { title: 'Supported Currencies', summary: content, spokenNarrative: `I support ${Object.keys(CURRENCY_NAMES).length} currencies including USD, EUR, GBP, JPY, and many more`, operation: 'list', ok: true, record: { currencies: CURRENCY_NAMES } };
}

export function getSources(): SkillResult {
  return { title: 'Currency Sources', summary: 'Exchange rates from ExchangeRate-API (free, keyless, updated daily). No API key required.', spokenNarrative: 'Currency data comes from ExchangeRate-API, free and keyless', operation: 'sources', ok: true, record: { source: 'ExchangeRate-API', operations: ['convert', 'rates', 'list', 'sources'] } };
}