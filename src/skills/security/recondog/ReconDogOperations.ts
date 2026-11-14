import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installReconDogOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = 'git clone https://github.com/s0md3v/ReconDog.git recondog';
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 60000 });
    if (result.ok) {
      return { title: 'ReconDog Install', summary: 'ReconDog cloned successfully', spokenNarrative: 'ReconDog installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'ReconDog Install', summary: result.data?.error || 'Clone failed', spokenNarrative: 'ReconDog clone failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'ReconDog Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'ReconDog install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanReconDogOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, command = 'all' } = params;
  if (!target) { return { title: 'ReconDog', summary: 'Target is required', spokenNarrative: 'Please provide a target domain or IP', operation: 'scan', ok: false }; }
  const cmdMap: Record<string, string> = { search: '1', ns: '2', port: '3', cms: '4', whois: '5', honeypot: '6', subdomain: '7', reverse_ip: '8', tech: '9', all: '10' };
  const cmdOpt = cmdMap[command] || '10';
  let cmd = `cd recondog && echo -e "${cmdOpt}\\n${target}\\n0" | python dog.py`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'ReconDog Scan', summary: `ReconDog ${command} scan of ${target} complete`, spokenNarrative: `ReconDog scan of ${target} complete`, operation: 'scan', ok: true, record: { target, command, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'ReconDog', summary: result.data?.error || 'Scan failed', spokenNarrative: 'ReconDog scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'ReconDog', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'ReconDog error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'ReconDog Sources', summary: 'ReconDog - Reconnaissance Swiss Army Knife', spokenNarrative: 'ReconDog uses APIs (no direct contact)', operation: 'sources', ok: true, record: { tool: 'recondog', website: 'https://github.com/s0md3v/ReconDog', requires: ['python'], commands: ['search', 'ns', 'port', 'cms', 'whois', 'honeypot', 'subdomain', 'reverse_ip', 'tech', 'all'], license: 'Apache-2.0' } };
}