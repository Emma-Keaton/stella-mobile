/**
 * Stella Mobile — Weather Operations Part 2
 * Air quality, sun times, alerts, sources
 */

import { SkillResult } from '../core/types';
import { apiClients } from '../api/ApiClient';
import { weatherCodeToString, LocationData, formatTemperature } from './WeatherMetadata';

export async function getAirQuality(location: LocationData): Promise<SkillResult> {
  const data = await apiClients.openMeteo.get<any>('/v1/air-quality', {
    latitude: location.lat,
    longitude: location.lon,
    current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia',
    timezone: location.timezone,
  });

  const current = data.current;
  if (!current) throw new Error('No air quality data');

  const aqiDesc = current.european_aqi <= 20 ? 'Very Good' : current.european_aqi <= 40 ? 'Good' : current.european_aqi <= 60 ? 'Moderate' : current.european_aqi <= 80 ? 'Poor' : 'Very Poor';

  const content = `Air quality in ${location.displayName}: ${aqiDesc} (EU AQI: ${current.european_aqi}, US AQI: ${current.us_aqi}). PM2.5: ${current.pm2_5}µg/m³, PM10: ${current.pm10}µg/m³, NO₂: ${current.nitrogen_dioxide}µg/m³, O₃: ${current.ozone}µg/m³, CO: ${current.carbon_monoxide}µg/m³. Source: Open-Meteo/CAMS (keyless).`;

  return { title: 'Air Quality', summary: content, spokenNarrative: `Air quality in ${location.displayName} is ${aqiDesc.toLowerCase()} with an AQI of ${current.european_aqi}`, operation: 'air_quality', ok: true, record: { location, current, content } };
}

export async function getSunTimes(location: LocationData): Promise<SkillResult> {
  const data = await apiClients.openMeteo.get<any>('/v1/forecast', {
    latitude: location.lat,
    longitude: location.lon,
    daily: 'sunrise,sunset,daylight_duration,sunshine_duration',
    forecast_days: 7,
    timezone: location.timezone,
  });

  const daily = data.daily;
  if (!daily) throw new Error('No sun data');

  const forecasts = [];
  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i]).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const daylightHours = Math.round((daily.daylight_duration[i] || 0) / 3600);
    forecasts.push(`${date}: Sunrise ${daily.sunrise[i]}, Sunset ${daily.sunset[i]} (${daylightHours}h daylight)`);
  }

  const content = `Sun times for ${location.displayName}:\n${forecasts.join('\n')}\nSource: Open-Meteo (keyless).`;

  return { title: 'Sunrise/Sunset', summary: content, spokenNarrative: `Today in ${location.displayName}, sunrise is at ${daily.sunrise[0]} and sunset at ${daily.sunset[0]}`, operation: 'sun', ok: true, record: { location, forecasts, content } };
}

export async function getWeatherAlerts(location: LocationData): Promise<SkillResult> {
  const data = await apiClients.openMeteo.get<any>('/v1/forecast', {
    latitude: location.lat,
    longitude: location.lon,
    current: 'weather_code',
    daily: 'weather_code',
    forecast_days: 3,
    timezone: location.timezone,
  });

  const alerts = [];
  const currentCode = data.current?.weather_code;
  if (currentCode && [95, 96, 99].includes(currentCode)) {
    alerts.push(`⚠️ CURRENT: ${weatherCodeToString(currentCode)}`);
  }

  if (data.daily?.weather_code) {
    data.daily.weather_code.forEach((code: number, i: number) => {
      if ([95, 96, 99].includes(code)) {
        const date = new Date(data.daily.time[i]).toLocaleDateString();
        alerts.push(`${date}: ${weatherCodeToString(code)}`);
      }
    });
  }

  const content = alerts.length > 0
    ? `Weather alerts for ${location.displayName}:\n${alerts.join('\n')}\nSource: Open-Meteo (keyless).`
    : `No weather alerts for ${location.displayName}. Source: Open-Meteo (keyless).`;

  return { title: 'Weather Alerts', summary: content, spokenNarrative: alerts.length > 0 ? `Weather alert: ${alerts[0]}` : `No weather alerts for ${location.displayName}`, operation: 'alerts', ok: true, record: { location, alerts, content } };
}

export function getSources(): SkillResult {
  return {
    title: 'Weather Sources',
    summary: 'Weather data from Open-Meteo (keyless, free) with geocoding via OpenStreetMap Nominatim (keyless, free). All operations run locally, no API key required.',
    spokenNarrative: 'Weather data comes from Open-Meteo and OpenStreetMap, both free and keyless',
    operation: 'sources',
    ok: true,
    record: {
      source: 'weather (Stella live weather skill)',
      operations: ['current', 'forecast', 'daily', 'air_quality', 'sun', 'alerts', 'sources'],
      apis: {
        open_meteo: { name: 'Open-Meteo', description: 'Free global weather forecast API (no key required)', url: 'https://open-meteo.com/', docs: 'https://open-meteo.com/en/docs', authTier: 'keyless', rateLimit: '1 request per second', uses: ['current', 'forecast', 'daily', 'air_quality', 'sun', 'alerts'] },
        nominatim: { name: 'OpenStreetMap Nominatim', description: 'Free geocoding service to resolve place names to coordinates', url: 'https://nominatim.org/', docs: 'https://operations.osmfoundation.org/policies/nominatim/', authTier: 'keyless', rateLimit: '1 request per second', uses: ['geocoding'] },
      },
      note: 'Live weather via Open-Meteo (keyless) with OpenStreetMap Nominatim geocoding (keyless). All operations run locally, no API key required.',
    },
  };
}