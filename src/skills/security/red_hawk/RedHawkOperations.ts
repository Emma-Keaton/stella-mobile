import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installRedHawkOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = [
      'git clone https://github.com/Tuhinshubhra/RED_HAWK.git',
      'cd RED_HAWK && php rhawk.php fix',
    ].join(' && ');
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 120000 });
    if (result.ok) {
      return { title: 'RED HAWK Install', summary: 'RED HAWK installed successfully', spokenNarrative: 'RED HAWK installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'RED HAWK Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'RED HAWK install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'RED HAWK Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'RED HAWK install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanRedHawkOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, scan_type = 'basic', https = false } = params;
  if (!target) { return { title: 'RED HAWK', summary: 'Target is required', spokenNarrative: 'Please provide a target domain', operation: 'scan', ok: false }; }
  const httpsFlag = https ? 'y' : 'n';
  let cmd = `cd RED_HAWK && echo -e "${httpsFlag}\\n${target}\\n${scan_type}" | php rhawk.php`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'RED HAWK Scan', summary: `RED HAWK scan of ${target} complete`, spokenNarrative: `RED HAWK scan of ${target} complete`, operation: 'scan', ok: true, record: { target, scan_type, https, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'RED HAWK', summary: result.data?.error || 'Scan failed', spokenNarrative: 'RED HAWK scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'RED HAWK', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'RED HAWK error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'RED HAWK Sources', summary: 'RED HAWK - PHP web vulnerability scanner', spokenNarrative: 'RED HAWK scans web targets directly', operation: 'sources', ok: true, record: { tool: 'red_hawk', website: 'https://github.com/Tuhinshubhra/RED_HAWK', requires: ['php', 'php-curl', 'php-xml'], license: 'MIT' } };
}