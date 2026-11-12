/**
 * Stella Mobile — Device Info Skill Entry Point
 * Combines all device info operations into a single skill
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { deviceInfoMetadata } from './DeviceInfoSkill';
import { getDeviceInfo, getBatteryInfo, getStorageInfo } from './DeviceInfoSkill';
import { getMemoryInfo, getNetworkInfo, getDisplayInfo, getAllInfo, getSources } from './DeviceInfoSkill2';

export const deviceInfoSkill: Skill = {
  metadata: deviceInfoMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'all').toLowerCase();

    try {
      switch (operation) {
        case 'device': return await getDeviceInfo();
        case 'battery': return await getBatteryInfo();
        case 'storage': return await getStorageInfo();
        case 'memory': return await getMemoryInfo();
        case 'network': return await getNetworkInfo();
        case 'display': return await getDisplayInfo();
        case 'all': return await getAllInfo();
        case 'sources': return getSources();
        default:
          return { title: 'Device Info', summary: `Unknown operation '${operation}'. Available: device, battery, storage, memory, network, display, all, sources`, spokenNarrative: `Unknown device info operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Device Info', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Device info error', operation, ok: false };
    }
  },
};

export { deviceInfoMetadata } from './DeviceInfoSkill';