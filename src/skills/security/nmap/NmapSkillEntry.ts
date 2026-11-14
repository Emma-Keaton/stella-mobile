import { Skill, SkillContext } from '../../../core/types';
import { nmapMetadata } from './NmapMetadata';
import { installNmapOperation, scanNmapOperation, serviceScanOperation, osDetectOperation, scriptScanOperation, quickScanOperation, intenseScanOperation, getSourcesOperation } from './NmapOperations';

export const nmapSkill: Skill = {
  metadata: nmapMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'scan').toLowerCase();
    try {
      switch (operation) {
        case 'install': return await installNmapOperation(params, context);
        case 'scan': return await scanNmapOperation(params, context);
        case 'service_scan': return await serviceScanOperation(params, context);
        case 'os_detect': return await osDetectOperation(params, context);
        case 'script_scan': return await scriptScanOperation(params, context);
        case 'quick_scan': return await quickScanOperation(params, context);
        case 'intense_scan': return await intenseScanOperation(params, context);
        case 'sources': return getSourcesOperation();
        default:
          return { title: 'Nmap', summary: `Unknown operation '${operation}'. Available: install, scan, service_scan, os_detect, script_scan, quick_scan, intense_scan, sources`, spokenNarrative: `Unknown nmap operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) {
      return { title: 'Nmap', summary: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, spokenNarrative: 'Nmap error', operation, ok: false };
    }
  },
};

export { nmapMetadata } from './NmapMetadata';
export { installNmapOperation, scanNmapOperation, serviceScanOperation, osDetectOperation, scriptScanOperation, quickScanOperation, intenseScanOperation, getSourcesOperation } from './NmapOperations';