import { SkillMetadata } from '../../../core/types';
export const reconDogMetadata: SkillMetadata = {
  name: 'recon_dog',
  aliases: ['recon_dog', 'recondog', 'recon_swiss_army', 'info_gathering'],
  description: 'ReconDog - Reconnaissance Swiss Army Knife. Extracts targets from STDIN, uses APIs (no direct contact). Features: Censys IP lookup, NS lookup, port scan, CMS detection (400+), Whois, honeypot detection, subdomain enumeration, reverse IP, technology detection (Wappalyzer).',
  triggers: ['recon_dog', 'recondog', 'recon swiss army', 'info gathering', 'subdomain enum', 'cms detect', 'tech detect'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target: { type: 'string', description: 'Target domain or IP' }, command: { type: 'string', enum: ['search', 'ns', 'port', 'cms', 'whois', 'honeypot', 'subdomain', 'reverse_ip', 'tech', 'all'], default: 'all' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'recondog', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'ReconDog is Python. No install required - python dog.py or python3 dog.py', apiSources: { recondog: { name: 'ReconDog', description: 'Reconnaissance Swiss Army Knife', url: 'https://github.com/s0md3v/ReconDog', docs: 'https://github.com/s0md3v/ReconDog#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};