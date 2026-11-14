import { SkillMetadata } from '../../../core/types';
export const rang3rMetadata: SkillMetadata = {
  name: 'rang3r',
  aliases: ['rang3r', 'multi_thread_scanner', 'ip_port_scan', 'network_scanner'],
  description: 'rang3r - Multi-threaded IP + Port Scanner written in Python 2.7. Scans all alive hosts within a specified range and scans for most vulnerable ports. Linux/Kali focused.',
  triggers: ['rang3r', 'multi thread scanner', 'ip port scan', 'network scanner', 'port scanner'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target_ip: { type: 'string', description: 'Target IP address or range' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'rang3r', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'rang3r is Python 2.7. Requires termcolor. Install: git clone && python rang3r.py --ip <target>', apiSources: { rang3r: { name: 'rang3r', description: 'Multi-thread IP + Port Scanner', url: 'https://github.com/floriankunushevci/rang3r', docs: 'https://github.com/floriankunushevci/rang3r#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};