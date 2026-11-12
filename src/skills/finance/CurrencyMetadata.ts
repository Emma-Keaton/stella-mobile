/**
 * Stella Mobile — Currency Skill Metadata
 */

import { SkillMetadata } from '../core/types';

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CHF: 'Swiss Franc', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan', INR: 'Indian Rupee', BRL: 'Brazilian Real',
  MXN: 'Mexican Peso', KRW: 'South Korean Won', SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar', NZD: 'New Zealand Dollar', SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone', DKK: 'Danish Krone', PLN: 'Polish Zloty',
  CZK: 'Czech Koruna', HUF: 'Hungarian Forint', RUB: 'Russian Ruble',
  TRY: 'Turkish Lira', ZAR: 'South African Rand', ILS: 'Israeli Shekel',
};

export const currencyMetadata: SkillMetadata = {
  name: 'currency',
  aliases: ['currency', 'exchange_rate', 'forex', 'fx', 'convert_currency', 'currency_converter'],
  description: 'Convert currencies and get live exchange rates using ExchangeRate-API (free, keyless). Supports 160+ currencies.',
  triggers: ['currency', 'exchange rate', 'convert', 'forex', 'fx rate', 'currency converter', 'how much is'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: convert | rates | list | sources. Defaults to convert.' },
      from: { type: 'string', description: 'Source currency code (e.g., USD, EUR). Defaults to USD.' },
      to: { type: 'string', description: 'Target currency code (e.g., EUR, GBP). Required for convert.' },
      amount: { type: 'number', description: 'Amount to convert. Defaults to 1.' },
      base: { type: 'string', description: 'Base currency for rates operation. Defaults to USD.' },
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
    exchangerate: { name: 'ExchangeRate-API', description: 'Free currency exchange rates', url: 'https://api.exchangerate-api.com/v4/latest', docs: 'https://www.exchangerate-api.com/docs/free', authTier: 'keyless', rateLimit: '1500 requests per month', uses: ['convert', 'rates', 'list'] },
  },
};

export { CURRENCY_NAMES };