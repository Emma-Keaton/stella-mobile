import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installBreacherOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = 'git clone https://github.com/s0md3v/breacher.git breacher';
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 60000 });
    if (result.ok) {
      return { title: 'Breacher Install', summary: 'Breacher cloned successfully', spokenNarrative: 'Breacher installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'Breacher Install', summary: result.data?.error || 'Clone failed', spokenNarrative: 'Breacher clone failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'Breacher Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Breacher install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanBreacherOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, extension = 'none', fast = false, path } = params;
  if (!target) { return { title: 'Breacher', summary: 'Target is required', spokenNarrative: 'Please provide a target URL', operation: 'scan', ok: false }; }
  let cmd = `cd breacher && python breacher.py -u ${target}`;
  if (extension !== 'none') cmd += ` --type ${extension}`;
  if (fast) cmd += ' --fast';
  if (path) cmd += ` --path ${path}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'Breacher Scan', summary: `Breacher admin panel scan of ${target} complete`, spokenNarrative: `Breacher scan of ${target} complete`, operation: 'scan', ok: true, record: { target, extension, fast, path, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Breacher', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Breacher scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'Breacher', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Breacher error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Breacher Sources', summary: 'Breacher - Multithreaded admin panel finder', spokenNarrative: 'Breacher scans web targets directly', operation: 'sources', ok: true, record: { tool: 'breacher', website: 'https://github.com/s0md3v/breacher', requires: ['python'], extensions: ['php', 'asp', 'html'], paths: 482, license: 'MIT' } };
}