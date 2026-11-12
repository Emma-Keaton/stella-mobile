/**
 * Stella Mobile — Weather Skill Entry Point
 * Main export combining metadata and operations
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { weatherMetadata } from './WeatherMetadata';
import { geocodeLocation, LocationData } from './WeatherMetadata';
import { getCurrentWeather, getHourlyForecast, getDailyForecast } from './WeatherOperations1';
import { getAirQuality, getSunTimes, getWeatherAlerts, getSources } from './WeatherOperations2';

export const weatherSkill: Skill = {
  metadata: weatherMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'current').toLowerCase();
    const locationQuery = params.location;
    const lat = params.latitude;
    const lon = params.longitude;
    const hours = Math.min(Math.max(params.hours || 24, 1), 168);
    const days = Math.min(Math.max(params.days || 7, 1), 16);
    const tempUnit = params.unit || 'celsius';
    const windUnit = params.windUnit || 'kmh';

    let location: LocationData | null = null;

    if (lat !== undefined && lon !== undefined) {
      location = { lat, lon, displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, timezone: 'auto' };
    } else if (locationQuery) {
      location = await geocodeLocation(locationQuery);
      if (!location) {
        return { title: 'Weather', summary: `Could not find location: ${locationQuery}`, spokenNarrative: `I couldn't find the location ${locationQuery}`, operation, ok: false };
      }
    } else {
      return { title: 'Weather', summary: 'No location provided. Please specify a location or provide latitude/longitude.', spokenNarrative: 'Please tell me where you want the weather for', operation, ok: false };
    }

    try {
      switch (operation) {
        case 'current': return await getCurrentWeather(location, tempUnit, windUnit);
        case 'forecast': return await getHourlyForecast(location, hours, tempUnit, windUnit);
        case 'daily': return await getDailyForecast(location, days, tempUnit, windUnit);
        case 'air_quality': return await getAirQuality(location);
        case 'sun': return await getSunTimes(location);
        case 'alerts': return await getWeatherAlerts(location);
        case 'sources': return getSources();
        default:
          return { title: 'Weather', summary: `Unknown operation '${operation}'. Available: current, forecast, daily, air_quality, sun, alerts, sources`, spokenNarrative: `Unknown weather operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Weather', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Weather service error', operation, ok: false };
    }
  },
};

export { weatherMetadata } from './WeatherMetadata';
export { geocodeLocation } from './WeatherMetadata';
export { getCurrentWeather, getHourlyForecast, getDailyForecast } from './WeatherOperations1';
export { getAirQuality, getSunTimes, getWeatherAlerts, getSources } from './WeatherOperations2';