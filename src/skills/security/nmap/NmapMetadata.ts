import { SkillMetadata } from '../../../core/types';

export const nmapMetadata: SkillMetadata = {
  name: 'nmap',
  aliases: ['nmap', 'network_mapper', 'port_scan', 'network_scan', 'security_scan'],
  description: 'Nmap (Network Mapper) - Free and open source network discovery and security auditing tool. Scans for open ports, services, OS versions, and vulnerabilities.',
  triggers: ['nmap', 'network mapper', 'port scan', 'network scan', 'security scan', 'network discovery', 'service scan'],
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['install', 'scan', 'service_scan', 'os_detect', 'script_scan', 'quick_scan', 'intense_scan', 'parse', 'sources'],
        default: 'scan',
        description: 'Operation to perform',
      },
      target: { type: 'string', description: 'Target host, IP, or network range (e.g., 192.168.1.1, example.com, 192.168.1.0/24)' },
      ports: { type: 'string', description: 'Port range to scan (e.g., 1-1000, 22,80,443)' },
      scan_type: { type: 'string', enum: ['tcp_syn', 'tcp_connect', 'udp', 'ping', 'none'], default: 'tcp_syn', description: 'Scan technique' },
      timing: { type: 'string', enum: ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'], default: 'T3', description: 'Timing template' },
      scripts: { type: 'string', description: 'NSE scripts to run (e.g., vuln, safe, auth, discovery)' },
      output_format: { type: 'string', enum: ['normal', 'xml', 'grepable', 'all'], default: 'normal' },
      output_file: { type: 'string', description: 'Output file path' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'security',
  source: 'nmap',
  active: true,
  author: 'Stella',
  surface: 'both',
  requires: ['internet', 'storage'],
  notes: 'Nmap is written in C/C++. Installed via package manager (apt/pkg) or compiled from source. On mobile via Termux: pkg install nmap',
  apiSources: {
    nmap: { name: 'Nmap Network Mapper', description: 'Network discovery and security auditing', url: 'https://nmap.org', docs: 'https://nmap.org/book/man.html', authTier: 'none', rateLimit: 'None', uses: ['scan', 'service_scan', 'os_detect', 'script_scan'] },
  },
};