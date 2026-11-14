import { SkillResult, SkillContext } from '../../../core/types';
import { apiClients } from '../../../api/ApiClient';

export async function installNmapOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const termuxResult = await apiClients.termux.post('/exec', {
      command: 'pkg install -y nmap',
      timeout: 120000,
    });

    if (termuxResult.ok) {
      return {
        title: 'Nmap Install',
        summary: 'Nmap installed successfully via Termux',
        spokenNarrative: 'Nmap installed successfully',
        operation: 'install',
        ok: true,
        record: { method: 'termux', package: 'nmap', installedAt: Date.now() },
      };
    }

    const backendResult = await apiClients.backend.post('/security/install', {
      tool: 'nmap',
      method: 'apt',
    });

    return {
      title: 'Nmap Install',
      summary: backendResult.ok ? 'Nmap installed via backend' : 'Nmap installation failed',
      spokenNarrative: backendResult.ok ? 'Nmap installed' : 'Nmap installation failed',
      operation: 'install',
      ok: backendResult.ok,
      record: { method: 'backend', ...backendResult.record },
    };
  } catch (e: any) {
    return {
      title: 'Nmap Install',
      summary: `Installation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
      spokenNarrative: 'Nmap installation failed',
      operation: 'install',
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

export async function scanNmapOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, ports, scan_type = 'tcp_syn', timing = 'T3', scripts, output_format = 'normal', output_file } = params;

  if (!target) {
    return {
      title: 'Nmap Scan',
      summary: 'Target is required',
      spokenNarrative: 'Please provide a target host or IP',
      operation: 'scan',
      ok: false,
    };
  }

  let cmd = 'nmap';
  cmd += ` -${scan_type === 'tcp_syn' ? 'sS' : scan_type === 'tcp_connect' ? 'sT' : scan_type === 'udp' ? 'sU' : scan_type === 'ping' ? 'sn' : 'Pn'}`;
  cmd += ` -${timing}`;
  if (ports) cmd += ` -p ${ports}`;
  if (scripts) cmd += ` --script ${scripts}`;
  if (output_format === 'xml') cmd += ` -oX ${output_file || '-'}`;
  else if (output_format === 'grepable') cmd += ` -oG ${output_file || '-'}`;
  else if (output_format === 'all') cmd += ` -oA ${output_file || 'scan'}`;
  cmd += ` ${target}`;

  try {
    const result = await apiClients.termux.post('/exec', {
      command: cmd,
      timeout: 300000,
    });

    if (result.ok) {
      const parsed = parseNmapOutput(result.data?.output || '', output_format);
      return {
        title: 'Nmap Scan Results',
        summary: `Scan of ${target} complete: ${parsed.openPorts} open port(s), ${parsed.hostsUp} host(s) up`,
        spokenNarrative: `Nmap scan of ${target} found ${parsed.openPorts} open ports on ${parsed.hostsUp} hosts`,
        operation: 'scan',
        ok: true,
        record: {
          target,
          command: cmd,
          output: result.data?.output,
          parsed,
          scannedAt: Date.now(),
        },
      };
    }

    return {
      title: 'Nmap Scan',
      summary: result.data?.error || 'Scan failed',
      spokenNarrative: 'Nmap scan failed',
      operation: 'scan',
      ok: false,
    };
  } catch (e: any) {
    return {
      title: 'Nmap Scan',
      summary: `Scan error: ${e instanceof Error ? e.message : 'Unknown error'}`,
      spokenNarrative: 'Nmap scan error',
      operation: 'scan',
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

function parseNmapOutput(output: string, format: string): any {
  const hostsUp = (output.match(/Nmap scan report for/g) || []).length;

export async function serviceScanOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, ports, timing = 'T3' } = params;
  if (!target) {
    return { title: 'Nmap Service Scan', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'service_scan', ok: false };
  }
  let cmd = `nmap -sV -${timing}`;
  if (ports) cmd += ` -p ${ports}`;
  cmd += ` ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'Nmap Service Scan', summary: `Service scan of ${target} complete`, spokenNarrative: `Service scan of ${target} complete`, operation: 'service_scan', ok: true, record: { target, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Nmap Service Scan', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Service scan failed', operation: 'service_scan', ok: false };
  } catch (e: any) {
    return { title: 'Nmap Service Scan', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Service scan error', operation: 'service_scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function osDetectOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, timing = 'T3' } = params;
  if (!target) {
    return { title: 'Nmap OS Detect', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'os_detect', ok: false };
  }
  const cmd = `nmap -O -${timing} ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 300000 });
    if (result.ok) {
      return { title: 'Nmap OS Detection', summary: `OS detection for ${target} complete`, spokenNarrative: `OS detection for ${target} complete`, operation: 'os_detect', ok: true, record: { target, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Nmap OS Detect', summary: result.data?.error || 'Scan failed', spokenNarrative: 'OS detection failed', operation: 'os_detect', ok: false };
  } catch (e: any) {
    return { title: 'Nmap OS Detect', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'OS detection error', operation: 'os_detect', ok: false, error: e instanceof Error ? e.message : 'Unknown error' };

export async function scriptScanOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target, scripts = 'vuln', timing = 'T3' } = params;
  if (!target) {
    return { title: 'Nmap Script Scan', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'script_scan', ok: false };
  }
  const cmd = `nmap --script ${scripts} -${timing} ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 600000 });
    if (result.ok) {
      return { title: 'Nmap Script Scan', summary: `NSE script scan (${scripts}) of ${target} complete`, spokenNarrative: `NSE script scan of ${target} complete`, operation: 'script_scan', ok: true, record: { target, scripts, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Nmap Script Scan', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Script scan failed', operation: 'script_scan', ok: false };
  } catch (e: any) {
    return { title: 'Nmap Script Scan', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Script scan error', operation: 'script_scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function quickScanOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target } = params;
  if (!target) {
    return { title: 'Nmap Quick Scan', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'quick_scan', ok: false };
  }
  const cmd = `nmap -T4 -F ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 120000 });
    if (result.ok) {
      return { title: 'Nmap Quick Scan', summary: `Quick scan of ${target} complete`, spokenNarrative: `Quick scan of ${target} complete`, operation: 'quick_scan', ok: true, record: { target, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Nmap Quick Scan', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Quick scan failed', operation: 'quick_scan', ok: false };
  } catch (e: any) {
    return { title: 'Nmap Quick Scan', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Quick scan error', operation: 'quick_scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function intenseScanOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { target } = params;
  if (!target) {
    return { title: 'Nmap Intense Scan', summary: 'Target is required', spokenNarrative: 'Please provide a target', operation: 'intense_scan', ok: false };
  }
  const cmd = `nmap -T4 -A -v ${target}`;
  try {
    const result = await apiClients.termux.post('/exec', { command: cmd, timeout: 600000 });
    if (result.ok) {
      return { title: 'Nmap Intense Scan', summary: `Intense scan of ${target} complete`, spokenNarrative: `Intense scan of ${target} complete`, operation: 'intense_scan', ok: true, record: { target, command: cmd, output: result.data?.output, scannedAt: Date.now() } };
    }
    return { title: 'Nmap Intense Scan', summary: result.data?.error || 'Scan failed', spokenNarrative: 'Intense scan failed', operation: 'intense_scan', ok: false };
  } catch (e: any) {
    return { title: 'Nmap Intense Scan', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Intense scan error', operation: 'intense_scan', ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export function getSourcesOperation(): SkillResult {
  return { title: 'Nmap Sources', summary: 'Nmap Network Mapper - https://nmap.org', spokenNarrative: 'Nmap uses direct network scanning', operation: 'sources', ok: true, record: { tool: 'nmap', website: 'https://nmap.org', documentation: 'https://nmap.org/book/man.html', license: 'Nmap license (GPLv2 compatible)', installMethods: ['apt install nmap', 'pkg install nmap', './configure && make && make install'] } };
}
  }
}
  const openPorts = (output.match(/open\s+/g) || []).length;
  const ports: any[] = [];
  const lines = output.split('\n');
  for (const line of lines) {
    const portMatch = line.match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)/);
    if (portMatch) {
      ports.push({ port: portMatch[1], protocol: portMatch[2], service: portMatch[3], state: 'open' });
    }
  }
  return { hostsUp, openPorts: ports.length, ports };
}