import { SkillMetadata } from '../../../core/types';
export const dracnmapMetadata: SkillMetadata = {
  name: 'dracnmap',
  aliases: ['dracnmap', 'dracnmap_scan', 'nmap_wrapper'],
  description: 'Dracnmap - Bash wrapper for Nmap that simplifies complex nmap commands with advanced scanning techniques and NSE script engine.',
  triggers: ['dracnmap', 'dracnmap scan', 'nmap wrapper', 'advanced nmap scan'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target: { type: 'string', description: 'Target host or IP' }, scan_type: { type: 'string', description: 'Dracnmap scan type option' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'dracnmap', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'Dracnmap is a Bash script. Requires nmap. Install: git clone && chmod +x && ./Dracnmap.sh', apiSources: { dracnmap: { name: 'Dracnmap', description: 'Bash wrapper for Nmap', url: 'https://github.com/Screetsec/Dracnmap', docs: 'https://github.com/Screetsec/Dracnmap#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};