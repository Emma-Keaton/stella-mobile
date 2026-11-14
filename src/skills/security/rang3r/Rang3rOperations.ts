import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installRang3rOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = [
      'git clone https://github.com/floriankunushevci/rang3r.git rang3r',
      'cd rang3r && pip install termcolor',
    ].join(' && ');
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 120000 });
    if (result.ok) {
      return { title: 'rang3r Install', summary: 'rang3r installed successfully', spokenNarrative: 'rang3r installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'rang3r Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'rang3r install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'rang3r Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'rang3r install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanRang3rOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target_ip } = params;
  if (!target_ip) { return { title: 'rang3r', summary: 'Target IP is required', spokenNarrative: 'Please provide a target IP address', operation: 'scan', ok: false }; }
  const cmd = `cd rang3r && python rang3r.py --ip ${target_ip}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'rang3r Scan', summary: `rang3r scan of ${target_ip} complete`, spokenNarrative: `rang3r scan of ${target_ip} complete`, operation: 'scan', ok: true, record: { target_ip, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'rang3r', summary: result.data?.error || 'Scan failed', spokenNarrative: 'rang3r scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'rang3r', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'rang3r error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'rang3r Sources', summary: 'rang3r - Multi-thread IP + Port Scanner', spokenNarrative: 'rang3r scans IP ranges directly', operation: 'sources', ok: true, record: { tool: 'rang3r', website: 'https://github.com/floriankunushevci/rang3r', requires: ['python2.7', 'termcolor'], license: 'GPL-3.0', os: ['Linux', 'Kali Linux'] } };
}