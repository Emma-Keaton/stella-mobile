import { SkillMetadata } from '../../../core/types';
export const reconSpiderMetadata: SkillMetadata = {
  name: 'recon_spider',
  aliases: ['recon_spider', 'reconspider', 'osint_framework', 'osint_scan', 'recon'],
  description: 'ReconSpider - Advanced OSINT Framework for scanning IP addresses, emails, websites, organizations. Aggregates data, visualizes on dashboard, facilitates alerting. Combines Wave, Photon, ReconDog capabilities.',
  triggers: ['recon_spider', 'reconspider', 'osint framework', 'osint scan', 'recon', 'osint reconnaissance'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target: { type: 'string', description: 'Target (IP, email, website, domain, phone)' }, module: { type: 'string', enum: ['host', 'phone', 'dns_map', 'metadata', 'reverse_image', 'honeypot', 'mac', 'ip_heatmap', 'torrent', 'username', 'ip2proxy', 'mail_breach'], default: 'host' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'reconspider', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'ReconSpider is Python 3. Install: git clone && python setup.py', apiSources: { reconspider: { name: 'ReconSpider', description: 'OSINT framework', url: 'https://github.com/bhavsec/reconspider', docs: 'https://github.com/bhavsec/reconspider#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};