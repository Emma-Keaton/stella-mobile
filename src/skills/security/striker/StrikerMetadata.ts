import { SkillMetadata } from '../../../core/types';
export const strikerMetadata: SkillMetadata = {
  name: 'striker',
  aliases: ['striker', 'offensive_scanner', 'vuln_scanner', 'recon_scanner'],
  description: 'Striker - Offensive information and vulnerability scanner. Phase 1: Attack surface discovery (subdomains, alive hosts, port scan). Phase 2: Sweeping (misconfigured headers, crossdomain.xml, sensitive files). Phase 3: Aggressive info gathering (crawl, outdated JS, CMS detection, tech detection, form collection). Phase 4: Vulnerability scanning.',
  triggers: ['striker', 'offensive scanner', 'vuln scanner', 'recon scanner', 'attack surface', 'vulnerability scan'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target: { type: 'string', description: 'Target domain' }, phase: { type: 'string', enum: ['1', '2', '3', '4', 'all'], default: 'all' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'striker', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'Striker is Python 3. Install: git clone && python3 striker.py example.com', apiSources: { striker: { name: 'Striker', description: 'Offensive information and vulnerability scanner', url: 'https://github.com/s0md3v/Striker', docs: 'https://github.com/s0md3v/Striker#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};