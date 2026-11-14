/**
 * Stella Mobile — Space Facts Skill
 * Get interesting space facts, astronomy data, and ISS tracking
 */

import { SkillMetadata } from '../core/types';

export const spaceFactsMetadata: SkillMetadata = {
  name: 'space_facts',
  aliases: ['space_facts', 'space_fact', 'astronomy', 'astronomy_fact', 'nasa_fact', 'space_trivia'],
  description: 'Get interesting space facts, astronomy data, and space exploration information. Uses free NASA APIs and open astronomy data.',
  triggers: ['space fact', 'space facts', 'astronomy', 'space trivia', 'nasa', 'space information', 'universe fact'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: random | apod | mars | iss | sources. Defaults to random.',
        enum: ['random', 'apod', 'mars', 'iss', 'sources']
      },
      date: { type: 'string', description: 'Date in YYYY-MM-DD format for APOD (default today).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'research',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    nasa_apod: { name: 'NASA APOD', description: 'Astronomy Picture of the Day', url: 'https://api.nasa.gov/planetary/apod', docs: 'https://api.nasa.gov/', authTier: 'api_key', rateLimit: '1000 requests/hour with key', uses: ['apod'] },
    nasa_mars: { name: 'NASA Mars Rover', description: 'Mars rover photos', url: 'https://api.nasa.gov/mars-photos/api/v1', docs: 'https://api.nasa.gov/', authTier: 'api_key', rateLimit: '1000 requests/hour', uses: ['mars'] },
    open_notify: { name: 'Open Notify', description: 'ISS location and astronaut data', url: 'http://api.open-notify.org', docs: 'http://open-notify.org/', authTier: 'keyless', rateLimit: 'No strict limit', uses: ['iss'] },
  },
};