import { SkillMetadata } from '../../../core/types';
export const redHawkMetadata: SkillMetadata = {
  name: 'red_hawk',
  aliases: ['red_hawk', 'rhawk', 'web_scan', 'cms_detect', 'vuln_scan'],
  description: 'RED HAWK - All-in-one tool for Information Gathering, Vulnerability Scanning, and Crawling. Detects CMS, Cloudflare, Whois, Geo-IP, DNS, Subdomains, SQLi, WordPress, and more. Written in PHP.',
  triggers: ['red_hawk', 'rhawk', 'web scan', 'cms detect', 'vuln scan', 'information gathering', 'web vulnerability'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'scan', 'sources'], default: 'scan' }, target: { type: 'string', description: 'Target domain or URL' }, scan_type: { type: 'string', enum: ['basic', 'cms', 'sql', 'wordpress', 'all'], default: 'basic' }, https: { type: 'boolean', default: false } }, required: [] },
  version: '1.0.0', category: 'security', source: 'red_hawk', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'RED HAWK is PHP. Requires php-curl, php-xml. Install: git clone && php rhawk.php', apiSources: { red_hawk: { name: 'RED HAWK', description: 'PHP web vulnerability scanner', url: 'https://github.com/Tuhinshubhra/RED_HAWK', docs: 'https://github.com/Tuhinshubhra/RED_HAWK#readme', authTier: 'none', rateLimit: 'None', uses: ['scan'] } },
};