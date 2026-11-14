import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installDracnmapOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const result = await apiClients.termux.post('/exec', { command: 'git clone https://github.com/Screetsec/Dracnmap.git && cd Dracnmap && chmod +x Dracnmap.sh', timeout: 60000 });
    if (result.ok) {
      return { title: 'Dracnmap Install', summary: 'Dracnmap cloned successfully', spokenNarrative: 'Dracnmap installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'Dracnmap Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'Dracnmap install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'Dracnmap Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Dracnmap install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanDracnmapOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, scan_type } = params;
  if (!target) { return { title: 'Dracnmap', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'scan', ok: false }; }
  let cmd = 'cd Dracnmap && sudo ./Dracnmap.sh';
  if (scan_type) cmd += ` ${scan_type}`;
  cmd += ` ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'Dracnmap Scan', summary: `Dracnmap scan of ${target} complete`, spokenNarrative: `Dracnmap scan of ${target} complete`, operation: 'scan', ok: true, record: { target, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Dracnmap', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Dracnmap scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'Dracnmap', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Dracnmap error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Dracnmap Sources', summary: 'Dracnmap - Bash wrapper for Nmap', spokenNarrative: 'Dracnmap uses nmap backend', operation: 'sources', ok: true, record: { tool: 'dracnmap', website: 'https://github.com/Screetsec/Dracnmap', requires: ['nmap'], license: 'GPL-3.0' } };
}