import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installReconSpiderOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = [
      'git clone https://github.com/bhavsec/reconspider.git',
      'cd reconspider && python setup.py install',
    ].join(' && ');
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 120000 });
    if (result.ok) {
      return { title: 'ReconSpider Install', summary: 'ReconSpider installed successfully', spokenNarrative: 'ReconSpider installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'ReconSpider Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'ReconSpider install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'ReconSpider Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'ReconSpider install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanReconSpiderOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, module = 'host' } = params;
  if (!target) { return { title: 'ReconSpider', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'scan', ok: false }; }
  let cmd = `cd reconspider && python reconspider.py`;
  try {
    const result = await apiClients.termux.post('/exec', { command: `echo -e "${module}\\n${target}\\n0" | ${cmd}`, timeout: 300000 });
    if (result.ok) {
      return { title: 'ReconSpider Scan', summary: `ReconSpider ${module} scan of ${target} complete`, spokenNarrative: `ReconSpider scan of ${target} complete`, operation: 'scan', ok: true, record: { target, module, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'ReconSpider', summary: result.data?.error || 'Scan failed', spokenNarrative: 'ReconSpider scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'ReconSpider', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'ReconSpider error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'ReconSpider Sources', summary: 'ReconSpider - OSINT Framework', spokenNarrative: 'ReconSpider uses public OSINT sources', operation: 'sources', ok: true, record: { tool: 'reconspider', website: 'https://github.com/bhavsec/reconspider', requires: ['python3'], license: 'GPL-3.0', modules: ['host', 'phone', 'dns_map', 'metadata', 'reverse_image', 'honeypot', 'mac', 'ip_heatmap', 'torrent', 'username', 'ip2proxy', 'mail_breach'] } };
}