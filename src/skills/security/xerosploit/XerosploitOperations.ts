import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installXerosploitOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = [
      'git clone https://github.com/LionSec/xerosploit.git',
      'cd xerosploit && sudo python install.py',
    ].join(' && ');
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 120000 });
    if (result.ok) {
      return { title: 'Xerosploit Install', summary: 'Xerosploit installed successfully', spokenNarrative: 'Xerosploit installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'Xerosploit Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'Xerosploit install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'Xerosploit Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Xerosploit install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function runXerosploitOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, gateway, module } = params;
  if (!target || !gateway) {
    return { title: 'Xerosploit', summary: 'Target and gateway are required', spokenNarrative: 'Please provide target and gateway IPs', operation: 'run', ok: false };
  }
  let cmd = 'cd xerosploit && sudo xerosploit';
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'Xerosploit', summary: `Xerosploit MITM started for ${target} via ${gateway}`, spokenNarrative: 'Xerosploit MITM started', operation: 'run', ok: true, record: { target, gateway, module, command: cmd, output: result.data?.output, startedAt: Date.now() } };
    }
    return { title: 'Xerosploit', summary: result.data?.error || 'Run failed', spokenNarrative: 'Xerosploit run failed', operation: 'run', ok: false };
  } catch (e: any) { return { title: 'Xerosploit', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Xerosploit error', operation: 'run', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Xerosploit Sources', summary: 'Xerosploit - MITM framework', spokenNarrative: 'Xerosploit uses bettercap and nmap', operation: 'sources', ok: true, record: { tool: 'xerosploit', website: 'https://github.com/LionSec/xerosploit', requires: ['nmap', 'hping3', 'build-essential', 'ruby-dev', 'libpcap-dev', 'libgmp3-dev', 'tabulate', 'terminaltables'], license: 'GPL-3.0' } };
}