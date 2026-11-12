/**
 * Stella Mobile — Currency Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { currencyMetadata } from './CurrencyMetadata';
import { convertCurrency, getRates, listCurrencies, getSources } from './CurrencyOperations';

export const currencySkill: Skill = {
  metadata: currencyMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'convert').toLowerCase();
    const from = (params.from || 'USD').toUpperCase();
    const to = params.to?.toUpperCase();
    const amount = params.amount || 1;
    const base = (params.base || 'USD').toUpperCase();

    try {
      switch (operation) {
        case 'convert': {
          if (!to) return { title: 'Currency', summary: 'Target currency (to) is required for conversion', spokenNarrative: 'Please specify the target currency', operation: 'convert', ok: false };
          return await convertCurrency(from, to, amount);
        }
        case 'rates': return await getRates(base);
        case 'list': return listCurrencies();
        case 'sources': return getSources();
        default:
          return { title: 'Currency', summary: `Unknown operation '${operation}'. Available: convert, rates, list, sources`, spokenNarrative: `Unknown currency operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Currency', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Currency service error', operation, ok: false };
    }
  },
};

export { currencyMetadata } from './CurrencyMetadata';
export { convertCurrency, getRates, listCurrencies, getSources } from './CurrencyOperations';