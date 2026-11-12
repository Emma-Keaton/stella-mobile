/**
 * Stella Mobile — API Client
 * Base class for API interactions with rate limiting, caching, and error handling
 */

import { ApiSource } from '../core/types';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class ApiClient {
  private cache: Map<string, CacheEntry> = new Map();
  private rateLimits: Map<string, number> = new Map();
  private defaultTimeout = 10000;

  constructor(
    private apiSource: ApiSource,
    private options: {
      cacheEnabled?: boolean;
      cacheTtl?: number;
      timeout?: number;
    } = {}
  ) {}

  private getCacheKey(url: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${this.apiSource.name}:${url}:${paramStr}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const lastCall = this.rateLimits.get(this.apiSource.name) || 0;
    const rateLimitMs = this.parseRateLimit(this.apiSource.rateLimit);
    
    if (now - lastCall < rateLimitMs) {
      await new Promise(resolve => setTimeout(resolve, rateLimitMs - (now - lastCall)));
    }
    
    this.rateLimits.set(this.apiSource.name, Date.now());
  }

  private parseRateLimit(rateLimit: string): number {
    const match = rateLimit.match(/(\d+)\s*request[s]?\s*per\s*(second|minute|hour)/i);
    if (match) {
      const count = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      const unitMs = unit === 'second' ? 1000 : unit === 'minute' ? 60000 : 3600000;
      return unitMs / count;
    }
    return 1000;
  }
return 1000;
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: { skipCache?: boolean; headers?: Record<string, string> }
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = this.getCacheKey(url, params);

    if (this.options.cacheEnabled !== false && !options?.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }
    }

    await this.enforceRateLimit();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout || this.defaultTimeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Stella-Mobile/1.0',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (this.options.cacheEnabled !== false) {
        const ttl = this.options.cacheTtl || 5 * 60 * 1000;
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
        });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async post<T = any>(
    endpoint: string,
    body: any,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    await this.enforceRateLimit();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout || this.defaultTimeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Stella-Mobile/1.0',
          ...options?.headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = this.apiSource.url.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    let url = `${baseUrl}/${cleanEndpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }
// Pre-configured API clients for common services
export const apiClients = {
  openMeteo: new ApiClient({
    name: 'Open-Meteo',
    description: 'Free global weather forecast API',
    url: 'https://api.open-meteo.com',
    docs: 'https://open-meteo.com/en/docs',
    authTier: 'keyless',
    rateLimit: '1 request per second',
    uses: ['weather', 'forecast', 'air_quality'],
  }, { cacheEnabled: true, cacheTtl: 10 * 60 * 1000 }),

  nominatim: new ApiClient({
    name: 'OpenStreetMap Nominatim',
    description: 'Free geocoding service',
    url: 'https://nominatim.openstreetmap.org',
    docs: 'https://operations.osmfoundation.org/policies/nominatim/',
    authTier: 'keyless',
    rateLimit: '1 request per second',
    uses: ['geocoding'],
  }, { cacheEnabled: true, cacheTtl: 24 * 60 * 60 * 1000 }),

  github: new ApiClient({
    name: 'GitHub API',
    description: 'GitHub REST API',
    url: 'https://api.github.com',
    docs: 'https://docs.github.com/en/rest',
    authTier: 'api_key',
    rateLimit: '5000 requests per hour',
    uses: ['repos', 'issues', 'users'],
  }, { cacheEnabled: true, cacheTtl: 5 * 60 * 1000 }),

  openWeather: new ApiClient({
    name: 'OpenWeatherMap',
    description: 'Weather data API (requires API key)',
    url: 'https://api.openweathermap.org/data/2.5',
    docs: 'https://openweathermap.org/api',
    authTier: 'api_key',
    rateLimit: '60 calls per minute',
    uses: ['weather', 'forecast', 'air_pollution'],
  }, { cacheEnabled: true, cacheTtl: 10 * 60 * 1000 }),

  exchangerate: new ApiClient({
    name: 'ExchangeRate-API',
    description: 'Free currency exchange rates',
    url: 'https://api.exchangerate-api.com/v4/latest',
    docs: 'https://www.exchangerate-api.com/docs/free',
    authTier: 'keyless',
    rateLimit: '1500 requests per month',
    uses: ['currency', 'exchange'],
  }, { cacheEnabled: true, cacheTtl: 60 * 60 * 1000 }),

  coingecko: new ApiClient({
    name: 'CoinGecko',
    description: 'Free cryptocurrency data API',
    url: 'https://api.coingecko.com/api/v3',
    docs: 'https://www.coingecko.com/en/api',
    authTier: 'keyless',
    rateLimit: '50 calls per minute',
    uses: ['crypto', 'prices', 'markets'],
  }, { cacheEnabled: true, cacheTtl: 2 * 60 * 1000 }),

  restcountries: new ApiClient({
    name: 'REST Countries',
    description: 'Country information API',
    url: 'https://restcountries.com/v3.1',
    docs: 'https://restcountries.com/',
    authTier: 'keyless',
    rateLimit: '100 requests per second',
    uses: ['countries', 'geography'],
  }, { cacheEnabled: true, cacheTtl: 24 * 60 * 60 * 1000 }),

  ipapi: new ApiClient({
    name: 'ipapi.co',
    description: 'IP geolocation API',
    url: 'https://ipapi.co',
    docs: 'https://ipapi.co/',
    authTier: 'keyless',
    rateLimit: '1000 requests per day',
    uses: ['geolocation', 'ip'],
  }, { cacheEnabled: true, cacheTtl: 24 * 60 * 60 * 1000 }),

  newsapi: new ApiClient({
    name: 'NewsAPI',
    description: 'News headlines API',
    url: 'https://newsapi.org/v2',
    docs: 'https://newsapi.org/docs',
    authTier: 'api_key',
    rateLimit: '100 requests per day (free)',
    uses: ['news', 'headlines'],
  }, { cacheEnabled: true, cacheTtl: 30 * 60 * 1000 }),

  unsplash: new ApiClient({
    name: 'Unsplash',
    description: 'Free high-resolution photos API',
    url: 'https://api.unsplash.com',
    docs: 'https://unsplash.com/documentation',
    authTier: 'api_key',
    rateLimit: '50 requests per hour',
    uses: ['photos', 'images'],
  }, { cacheEnabled: true, cacheTtl: 60 * 60 * 1000 }),
};

  clearCache(): void {
    this.cache.clear();
  }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getApiSource(): ApiSource {
    return this.apiSource;
  }
}