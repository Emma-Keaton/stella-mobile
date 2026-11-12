/**
 * Stella Mobile — weather_live skill (Part 1)
 * Live weather and forecasts via Open-Meteo (keyless).
 */

import { StellaSkill, SkillMetadata, SkillResult } from './base'

export class WeatherLiveSkill extends StellaSkill {
  metadata: SkillMetadata = {
    id: 'weather_live',
    name: 'Weather Live',
    description: 'Live weather and forecasts worldwide using Open-Meteo (keyless).',
    category: 'observability',
    version: '2.0.0',
    source: 'stella',
    triggers: ['weather', 'forecast', 'temperature', 'hourly', 'daily', 'air quality', 'sunrise', 'sunset'],
    parameters: { type: 'OBJECT', properties: {}, required: [] },
    operations: ['current', 'forecast', 'daily', 'air_quality', 'sun', 'sources'],
    example_prompt: "What's the weather in Tokyo right now?",
    requires_auth: false,
    destructive: false,
    active: true,
  }

  async execute(args: any): Promise<SkillResult> {
    const operation = (args.operation || 'current').toLowerCase()
    const handlers: any = {
      sources: () => this.opSources(),
      current: () => this.opCurrent(args),
      forecast: () => this.opForecast(args),
      daily: () => this.opDaily(args),
      air_quality: () => this.opAirQuality(args),
      sun: () => this.opSun(args),
    }
    const handler = handlers[operation]
    if (!handler) return this.unknownOperation(operation)
    return handler()
  }

  private async opSources(): Promise<SkillResult> {
    return this.ok({
      source: 'weather_live',
      operations: ['current', 'forecast', 'daily', 'air_quality', 'sun', 'sources'],
      note: 'Live weather via Open-Meteo (keyless).',
    }, 'sources')
  }
