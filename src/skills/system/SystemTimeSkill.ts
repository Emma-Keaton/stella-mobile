/**
 * Stella Mobile — System Time Skill
 * Provides current time, timezone info, and date utilities
 */

import { Skill, SkillResult, SkillContext, SkillMetadata } from '../core/types';

export const systemTimeMetadata: SkillMetadata = {
  name: 'system_time',
  aliases: ['system_time', 'time', 'current_time', 'date', 'datetime', 'timezone'],
  description: 'Get current system time, date, and timezone information.',
  triggers: ['time', 'what time', 'current time', 'date', 'what date', 'timezone', 'what timezone'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: now | timestamp | timezone | sources. Defaults to now.' },
      format: { type: 'string', description: 'Time format: iso | locale | short | long. Defaults to locale.', enum: ['iso', 'locale', 'short', 'long'] },
      timezone: { type: 'string', description: 'IANA timezone (e.g., America/New_York). Defaults to device timezone.' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'system',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
};

export const systemTimeSkill: Skill = {
  metadata: systemTimeMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'now').toLowerCase();
    const format = params.format || 'locale';
    const timezone = params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      switch (operation) {
        case 'now': {
          const now = new Date();
          let timeStr: string;
          switch (format) {
            case 'iso': timeStr = now.toISOString(); break;
            case 'short': timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); break;
            case 'long': timeStr = now.toLocaleString([], { dateStyle: 'full', timeStyle: 'long' }); break;
            default: timeStr = now.toLocaleString();
          }
          const content = `Current time: ${timeStr} (${timezone})`;
          return { title: 'System Time', summary: content, spokenNarrative: `It's ${timeStr}`, operation: 'now', ok: true, record: { time: now.toISOString(), timezone, formatted: timeStr, format } };
        }
        case 'timestamp': {
          const now = Date.now();
          const content = `Unix timestamp: ${now} (milliseconds), ${Math.floor(now / 1000)} (seconds)`;
          return { title: 'Timestamp', summary: content, spokenNarrative: `The timestamp is ${now} milliseconds`, operation: 'timestamp', ok: true, record: { ms: now, s: Math.floor(now / 1000) } };
        }
        case 'timezone': {
          const content = `Device timezone: ${timezone} (Offset: ${new Date().getTimezoneOffset()} minutes)`;
          return { title: 'Timezone', summary: content, spokenNarrative: `Your timezone is ${timezone}`, operation: 'timezone', ok: true, record: { timezone, offset: new Date().getTimezoneOffset() } };
        }
        case 'sources': {
          return { title: 'Time Sources', summary: 'System time from device clock via JavaScript Date API.', spokenNarrative: 'Time comes from the device system clock', operation: 'sources', ok: true, record: { source: 'JavaScript Date API', operations: ['now', 'timestamp', 'timezone', 'sources'] } };
        }
        default:
          return { title: 'System Time', summary: `Unknown operation '${operation}'. Available: now, timestamp, timezone, sources`, spokenNarrative: `Unknown time operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'System Time', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Time service error', operation, ok: false };
    }
  },
};