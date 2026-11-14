import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installStrikerOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = [
      'git clone https://github.com/s0md3v/Striker.git striker',
      'cd striker && pip3 install -r requirements.txt',
    ].join(' && ');
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 120000 });
    if (result.ok) {
      return { title: 'Striker Install', summary: 'Striker installed successfully', spokenNarrative: 'Striker installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'Striker Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'Striker install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'Striker Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Striker install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanStrikerOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, phase = 'all' } = params;
  if (!target) { return { title: 'Striker', summary: 'Target is required', spokenNarrative: 'Please provide a target domain', operation: 'scan', ok: false }; }
  let cmd = `cd striker && python3 striker.py ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 600000 });
    if (result.ok) {
      return { title: 'Striker Scan', summary: `Striker scan of ${target} complete (phase ${phase})`, spokenNarrative: `Striker scan of ${target} complete`, operation: 'scan', ok: true, record: { target, phase, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Striker', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Striker scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'Striker', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Striker error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Striker Sources', summary: 'Striker - Offensive information and vulnerability scanner', spokenNarrative: 'Striker scans targets directly', operation: 'sources', ok: true, record: { tool: 'striker', website: 'https://github.com/s0md3v/Striker', requires: ['python3', 'pip3'], phases: ['1: Attack Surface Discovery', '2: Sweeping', '3: Aggressive Info Gathering', '4: Vulnerability Scanning'], license: 'GPL-3.0' } };
}