/**
 * Stella Mobile — Internet Speed Test Skill
 * Test download/upload speed, latency, and network quality
 */

import { SkillMetadata } from '../core/types';

export const internetSpeedTestMetadata: SkillMetadata = {
  name: 'internet_speed_test',
  aliases: ['internet_speed_test', 'speed_test', 'bandwidth_test', 'network_speed', 'wifi_speed', 'connection_test'],
  description: 'Test internet connection speed including download/upload bandwidth, latency (ping), jitter, and packet loss. Uses multiple test servers for accurate results.',
  triggers: ['speed test', 'internet speed', 'bandwidth test', 'network speed', 'wifi speed', 'connection test', 'how fast is my internet'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: run | servers | history | sources. Defaults to run.',
        enum: ['run', 'servers', 'history', 'sources']
      },
      serverId: { type: 'string', description: 'Specific test server ID (optional).' },
      duration: { type: 'number', description: 'Test duration in seconds (default 10, max 60).' },
      downloadOnly: { type: 'boolean', description: 'Only test download speed.' },
      uploadOnly: { type: 'boolean', description: 'Only test upload speed.' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'system',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    speedtest_net: { name: 'Speedtest.net', description: 'Ookla Speedtest servers', url: 'https://www.speedtest.net/api', docs: 'https://www.speedtest.net/', authTier: 'keyless', rateLimit: 'Respectful usage', uses: ['run', 'servers'] },
    fast_com: { name: 'Fast.com', description: 'Netflix Fast.com speed test', url: 'https://fast.com/', docs: 'https://fast.com/', authTier: 'keyless', rateLimit: 'Respectful usage', uses: ['run'] },
    mlab: { name: 'Measurement Lab (M-Lab)', description: 'Open internet measurement platform', url: 'https://www.measurementlab.net/', docs: 'https://www.measurementlab.net/', authTier: 'keyless', rateLimit: 'Respectful usage', uses: ['run', 'servers'] },
  },
};