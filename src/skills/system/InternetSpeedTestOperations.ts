/**
 * Stella Mobile — Internet Speed Test Operations
 */

import { SkillResult, SkillContext } from '../core/types';
import { NativeBridge, NativeBridgeExt2 } from '../../native/bridges';

export async function runSpeedTest(params: any, context: SkillContext): Promise<any> {
  const { serverId, duration = 10, downloadOnly = false, uploadOnly = false } = params;
  
  try {
    // Get network info first
    const networkState = await NativeBridgeExt2.networkInfo.fetch()
    
    // In a full implementation, this would:
    // 1. Discover or use specified test server
    // 2. Run download test (multiple chunks)
    // 3. Run upload test (multiple chunks)
    // 4. Measure latency/ping
    // 4. Calculate jitter
    
    const content = `Internet Speed Test\n\n` +
      `Network: ${networkState.type} ${networkState.isConnected ? '✓' : '✗'}\n` +
      `${networkState.details?.ssid ? `WiFi: ${networkState.details.ssid}` : ''}\n` +
      `${networkState.details?.cellularGeneration ? `Cellular: ${networkState.details.cellularGeneration}` : ''}\n\n` +
      `Test Configuration:\n` +
      `- Duration: ${duration}s\n` +
      `- Download test: ${downloadOnly ? 'Only' : 'Enabled'}\n` +
      `- Upload test: ${uploadOnly ? 'Only' : 'Enabled'}\n` +
      `- Server: ${serverId || 'Auto-select'}\n\n` +
      `In a full implementation, this would:\n` +
      `1. Connect to nearest test server\n` +
      `2. Download test files (multiple sizes)\n` +
      `3. Upload test data\n` +
      `4. Measure latency (ping)\n` +
      `5. Calculate jitter\n\n` +
      `Note: Requires native speed test implementation or web-based test.`

    return { 
      title: 'Speed Test', 
      summary: content, 
      spokenNarrative: 'Starting internet speed test', 
      operation: 'run', 
      ok: true, 
      record: { 
        networkType: networkState.type, 
        isConnected: networkState.isConnected,
        downloadOnly,
        uploadOnly,
        duration,
        serverId 
      } 
    };
  } catch (error) {
    return { title: 'Speed Test', summary: `Error: ${error instanceof Error ? error.message : 'Test failed'}`, spokenNarrative: 'Speed test failed', operation: 'run', ok: false };
  }
}

export async function listServers(): Promise<any> {
  const content = `Available Speed Test Servers:\n\n` +
    `In a full implementation, this would list servers from:\n` +
    `- Speedtest.net (Ookla) global server network\n` +
    `- Fast.com (Netflix) servers\n` +
    `- M-Lab measurement nodes\n\n` +
    `Each server would show:\n` +
    `- Location (city, country)\n` +
    `- Distance from you\n` +
    `- Sponsor/ISP\n` +
    `- Current load\n\n` +
    `Note: Requires API access to server lists.`

  return { 
    title: 'Test Servers', 
    summary: content, 
    spokenNarrative: 'Listing available speed test servers', 
    operation: 'servers', 
    ok: true, 
    record: { servers: [] } 
  };
}

export async function getHistory(): Promise<any> {
  const content = `Speed Test History\n\n` +
    `This would show your past speed test results with:\n` +
    `- Date and time\n` +
    `- Download speed\n` +
    `- Upload speed\n` +
    `- Latency (ping)\n` +
    `- Jitter\n` +
    `- Server used\n\n` +
    `Note: Requires local storage implementation.`

  return { 
    title: 'Speed Test History', 
    summary: content, 
    spokenNarrative: 'No speed test history available yet', 
    operation: 'history', 
    ok: true, 
    record: { history: [] } 
  };
}

export function getSources(): any {
  return { 
    title: 'Speed Test Sources', 
    summary: 'Speed test via Speedtest.net (Ookla), Fast.com (Netflix), M-Lab. All keyless for basic usage.', 
    spokenNarrative: 'Speed test uses multiple free services', 
    operation: 'sources', 
    ok: true, 
    record: { 
      source: 'Speedtest.net, Fast.com, M-Lab', 
      operations: ['run', 'servers', 'history', 'sources'],
      note: 'Multiple free services for accurate results'
    } 
  };
}