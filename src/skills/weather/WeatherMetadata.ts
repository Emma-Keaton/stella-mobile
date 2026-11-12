/**
 * Stella Mobile — Weather Skill
 * Live weather and forecasts using Open-Meteo (keyless) + Nominatim geocoding
 * Rewritten from the original Python weather_live skill for React Native/TypeScript
 */

import { Skill, SkillMetadata, SkillResult, SkillContext } from '../core/types';
import { apiClients } from '../api/ApiClient';

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
  67: 'Heavy freezing rain', 71: 'Slight snow fall', 73: 'Moderate snow fall',
  75: 'Heavy snow fall', 77: 'Snow grains', 80: 'Slight rain showers',
  81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers',
  86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function weatherCodeToString(code: number): string {
  return WEATHER_CODES[code] || `Unknown (${code})`;
}

interface LocationData {
  lat: number;
  lon: number;
  displayName: string;
  timezone: string;
}

async function geocodeLocation(query: string): Promise<LocationData | null> {
  if (query.toLowerCase() === 'here') {
    return null;
  }

  try {
    const data = await apiClients.nominatim.get<any[]>('/search', {
      q: query,
      format: 'json',
      limit: 1,
      addressdetails: 1,
    });

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name,
        timezone: 'auto',
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(temp * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

function formatWindSpeed(speed: number, unit: 'kmh' | 'ms' | 'mph' = 'kmh'): string {
  switch (unit) {
    case 'ms': return `${speed} m/s`;
    case 'mph': return `${Math.round(speed * 0.621371)} mph`;
    default: return `${speed} km/h`;
  }
}

export const weatherMetadata: SkillMetadata = {
  name: 'weather',
  aliases: ['weather_live', 'live_weather', 'weather', 'weather_forecast', 'current_weather', 'hourly_forecast', 'daily_forecast', 'air_quality', 'weather_alert', 'weather_conditions', 'temperature', 'humidity'],
  description: 'Live weather and forecasts for any location worldwide using Open-Meteo (free, no API key required). Provides current conditions, hourly/daily forecasts, air quality, sunrise/sunset, and weather alerts. Geocoding via OpenStreetMap Nominatim (also keyless).',
  triggers: ['weather', 'weather in', 'weather for', 'temperature', 'forecast', 'hourly forecast', 'daily forecast', 'air quality', 'sunrise', 'sunset', 'is it raining', 'is it sunny', 'current temperature', 'live weather', 'weather alert', 'weather conditions'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: current | forecast | daily | air_quality | sun | alerts | sources. Defaults to current.' },
      location: { type: 'string', description: 'Place name (city, town, address) or "here" for device location.' },
      latitude: { type: 'number', description: 'Latitude coordinate (used directly if location is not given).' },
      longitude: { type: 'number', description: 'Longitude coordinate (used directly if location is not given).' },
      hours: { type: 'number', description: 'Number of hourly forecast hours (default 24, max 168).' },
      days: { type: 'number', description: 'Number of daily forecast days (default 7, max 16).' },
      unit: { type: 'string', description: 'Temperature unit: celsius | fahrenheit. Defaults to celsius.', enum: ['celsius', 'fahrenheit'] },
      windUnit: { type: 'string', description: 'Wind speed unit: kmh | ms | mph. Defaults to kmh.', enum: ['kmh', 'ms', 'mph'] },
    },
    required: [],
  },
  version: '2.0.0',
  category: 'observability',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  notes: 'All operations use keyless APIs (Open-Meteo + Nominatim). No API key required.',
  apiSources: {
    open_meteo: { name: 'Open-Meteo', description: 'Free global weather forecast API (no key required)', url: 'https://open-meteo.com/', docs: 'https://open-meteo.com/en/docs', authTier: 'keyless', rateLimit: '1 request per second', uses: ['current', 'forecast', 'daily', 'air_quality', 'sun', 'alerts'] },
    nominatim: { name: 'OpenStreetMap Nominatim', description: 'Free geocoding service to resolve place names to coordinates', url: 'https://nominatim.org/', docs: 'https://operations.osmfoundation.org/policies/nominatim/', authTier: 'keyless', rateLimit: '1 request per second', uses: ['geocoding'] },
  },
};