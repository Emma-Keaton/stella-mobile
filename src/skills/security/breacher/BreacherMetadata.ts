import { SkillMetadata } from '../../../core/types';
export const breacherMetadata: SkillMetadata = {
  name: 'breacher',
  aliases: ['breacher', 'admin_panel_finder', 'directory_bruteforce', 'admin_finder'],
  description: 'Breacher - Advanced multithreaded admin panel finder written in Python. Finds admin login pages and EAR vulnerabilities. Supports PHP, ASP, HTML extensions. 482 paths, custom paths, multithreading.',
  triggers: ['breacher', 'admin panel finder', 'directory bruteforce', 'admin finder', 'admin panel scan'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target: { type: 'string', description: 'Target URL or domain' }, extension: { type: 'string', enum: ['php', 'asp', 'html', 'none'], default: 'none' }, fast: { type: 'boolean', default: false }, path: { type: 'string', description: 'Custom path prefix' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'breacher', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'Breacher is Python. Install: git clone && python breacher.py -u <url>', apiSources: { breacher: { name: 'Breacher', description: 'Multithreaded admin panel finder', url: 'https://github.com/s0md3v/breacher', docs: 'https://github.com/s0md3v/breacher#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};