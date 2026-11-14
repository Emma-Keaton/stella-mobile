import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';
export async function installInfogaOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const cmds = [
      'git clone https://github.com/Security-Tools-Alliance/Infoga.git infoga',
      'cd infoga && python setup.py install',
    ].join(' && ');
    const result = await apiClients.termux.post('/exec', { command: cmds, timeout: 120000 });
    if (result.ok) {
      return { title: 'Infoga Install', summary: 'Infoga installed successfully', spokenNarrative: 'Infoga installed', operation: 'install', ok: true, record: { method: 'git', installedAt: Date.now() } };
    }
    return { title: 'Infoga Install', summary: result.data?.error || 'Install failed', spokenNarrative: 'Infoga install failed', operation: 'install', ok: false };
  } catch (e: any) { return { title: 'Infoga Install', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Infoga install error', operation: 'install', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export async function scanInfogaOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { domain, email, source = 'all', breach = false, verbose = '2' } = params;
  if (!domain && !email) { return { title: 'Infoga', summary: 'Domain or email is required', spokenNarrative: 'Please provide a domain or email', operation: 'scan', ok: false }; }
  let cmd = 'cd infoga && python infoga.py';
  if (domain) cmd += ` --domain ${domain}`;
  if (email) cmd += ` --info ${email}`;
  cmd += ` --source ${source}`;
  if (breach) cmd += ' --breach';
  cmd += ` -v ${verbose}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'Infoga Scan', summary: `Infoga email OSINT complete`, spokenNarrative: `Infoga scan complete`, operation: 'scan', ok: true, record: { domain, email, source, breach, verbose, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Infoga', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Infoga scan failed', operation: 'scan', ok: false };
  } catch (e: any) { return { title: 'Infoga', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Infoga error', operation: 'scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'Infoga Sources', summary: 'Infoga - Email OSINT tool', spokenNarrative: 'Infoga uses public email sources', operation: 'sources', ok: true, record: { tool: 'infoga', website: 'https://github.com/Security-Tools-Alliance/Infoga', requires: ['python'], sources: ['search engines', 'pgp key servers', 'shodan', 'haveibeenpwned.com'], license: 'GPL-3.0' } };
}