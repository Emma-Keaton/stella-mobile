/**
 * Stella Mobile — Weather Operations Part 1
 * Current weather, hourly forecast, daily forecast
 */

import { SkillResult } from '../core/types';
import { apiClients } from '../api/ApiClient';
import { weatherCodeToString, LocationData, formatTemperature, formatWindSpeed } from './WeatherMetadata';

export async function getCurrentWeather(location: LocationData, tempUnit: string, windUnit: string): Promise<SkillResult> {
  const data = await apiClients.openMeteo.get<any>('/v1/forecast', {
    latitude: location.lat,
    longitude: location.lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    timezone: location.timezone,
  });

  const current = data.current;
  if (!current) throw new Error('No current weather data');

  const content = `Current weather in ${location.displayName}: ${weatherCodeToString(current.weather_code)}, ${formatTemperature(current.temperature_2m, tempUnit as any)} (feels like ${formatTemperature(current.apparent_temperature, tempUnit as any)}), ${current.relative_humidity_2m}% humidity, ${formatWindSpeed(current.wind_speed_10m, windUnit as any)} wind, ${current.precipitation}mm precipitation. Source: Open-Meteo (keyless).`;

  return { title: 'Current Weather', summary: content, spokenNarrative: content, operation: 'current', ok: true, record: { location, current, content } };
}

export async function getHourlyForecast(location: LocationData, hours: number, tempUnit: string, windUnit: string): Promise<SkillResult> {
  const data = await apiClients.openMeteo.get<any>('/v1/forecast', {
    latitude: location.lat,
    longitude: location.lon,
    hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    forecast_hours: hours,
    timezone: location.timezone,
  });

  const hourly = data.hourly;
  if (!hourly) throw new Error('No hourly forecast data');

  const forecasts = [];
  for (let i = 0; i < Math.min(hours, hourly.time.length); i++) {
    const time = new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    forecasts.push(
      `${time}: ${weatherCodeToString(hourly.weather_code[i])}, ${formatTemperature(hourly.temperature_2m[i], tempUnit as any)} (feels ${formatTemperature(hourly.apparent_temperature[i], tempUnit as any)}), ${hourly.precipitation_probability[i]}% rain, ${formatWindSpeed(hourly.wind_speed_10m[i], windUnit as any)}`
    );
  }

  const content = `Hourly forecast for ${location.displayName} (next ${hours}h):\n${forecasts.join('\n')}\nSource: Open-Meteo (keyless).`;

  return { title: 'Hourly Forecast', summary: content, spokenNarrative: `Here's the hourly forecast for ${location.displayName}. ${forecasts.slice(0, 3).join('. ')}`, operation: 'forecast', ok: true, record: { location, forecasts, content } };
}

export async function getDailyForecast(location: LocationData, days: number, tempUnit: string, windUnit: string): Promise<SkillResult> {
  const data = await apiClients.openMeteo.get<any>('/v1/forecast', {
    latitude: location.lat,
    longitude: location.lon,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset,uv_index_max',
    forecast_days: days,
    timezone: location.timezone,
  });

  const daily = data.daily;
  if (!daily) throw new Error('No daily forecast data');

  const forecasts = [];
  for (let i = 0; i < Math.min(days, daily.time.length); i++) {
    const date = new Date(daily.time[i]).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    forecasts.push(
      `${date}: ${weatherCodeToString(daily.weather_code[i])}, High ${formatTemperature(daily.temperature_2m_max[i], tempUnit as any)} / Low ${formatTemperature(daily.temperature_2m_min[i], tempUnit as any)}, ${daily.precipitation_probability_max[i]}% rain, UV ${daily.uv_index_max[i]}, ${formatWindSpeed(daily.wind_speed_10m_max[i], windUnit as any)} wind`
    );
  }

  const content = `Daily forecast for ${location.displayName} (${days} days):\n${forecasts.join('\n')}\nSource: Open-Meteo (keyless).`;

  return { title: 'Daily Forecast', summary: content, spokenNarrative: `Here's the ${days}-day forecast for ${location.displayName}. ${forecasts.slice(0, 2).join('. ')}`, operation: 'daily', ok: true, record: { location, forecasts, content } };
}