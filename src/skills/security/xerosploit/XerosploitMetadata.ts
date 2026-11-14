import { SkillMetadata } from '../../../core/types';
export const xerosploitMetadata: SkillMetadata = {
  name: 'xerosploit',
  aliases: ['xerosploit', 'mitm', 'man_in_the_middle', 'bettercap'],
  description: 'Xerosploit - Advanced Man-in-the-Middle framework powered by bettercap and nmap. Performs MITM attacks, DoS, port scanning, HTML/JS injection, DNS spoofing, sniffing, and more.',
  triggers: ['xerosploit', 'mitm', 'man in the middle', 'bettercap', 'dns spoof', 'sniffing', 'port scan mitm'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['install', 'run', 'scan', 'sources'], default: 'run' }, target: { type: 'string', description: 'Target IP address' }, gateway: { type: 'string', description: 'Gateway IP address' }, module: { type: 'string', description: 'Xerosploit module to run' } }, required: [] },
  version: '1.0.0', category: 'security', source: 'xerosploit', active: true, author: 'Stella', surface: 'both', requires: ['internet', 'storage'], notes: 'Xerosploit is Python. Requires nmap, hping3, build-essential, ruby-dev, libpcap-dev, libgmp3-dev, tabulate, terminaltables. Install: git clone && sudo python install.py', apiSources: { xerosploit: { name: 'Xerosploit', description: 'MITM framework', url: 'https://github.com/LionSec/xerosploit', docs: 'https://github.com/LionSec/xerosploit#readme', authTier: 'none', rateLimit: 'None', uses: ['run', 'scan'] } },
};