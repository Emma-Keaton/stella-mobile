import { SkillMetadata } from '../../../core/types';
export const infogaMetadata: SkillMetadata = {
  name: 'infoga',
  aliases: ['infoga', 'email_osint', 'email_lookup', 'breach_check'],
  description: 'Infoga - Email OSINT tool that gathers email account information (IP, hostname, country) from public sources (search engines, PGP key servers, Shodan) and checks if emails were leaked via haveibeenpwned.com API.',
  triggers: ['infoga', 'email osint', 'email lookup', 'breach check', 'email reconnaissance'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, domain: { type: 'string', description: 'Target domain for email harvesting' }, email: { type: 'string', description: 'Single email address to check' }, source: { type: 'string', enum: ['all', 'google', 'bing', 'pgp', 'shodan'], default: 'all' }, breach: { type: 'boolean', default: false }, verbose: { type: 'string', enum: ['0', '1', '2', '3'], default: '2' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'infoga', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'Infoga is Python. Install: git clone && python setup.py install && python infoga.py', apiSources: { infoga: { name: 'Infoga', description: 'Email OSINT tool', url: 'https://github.com/Security-Tools-Alliance/Infoga', docs: 'https://github.com/Security-Tools-Alliance/Infoga#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};