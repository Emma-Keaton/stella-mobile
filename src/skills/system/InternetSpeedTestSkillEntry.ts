/**
 * Stella Mobile — Internet Speed Test Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { internetSpeedTestMetadata } from './InternetSpeedTestMetadata';
import { runSpeedTest, listServers, getHistory, getSources } from './InternetSpeedTestOperations';

export const internetSpeedTestSkill: Skill = {
  metadata: internetSpeedTestMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'run').toLowerCase();

    try {
      switch (operation) {
        case 'run': return await runSpeedTest(params, context);
        case 'servers': return await listServers();
        case 'history': return await getHistory();
        case 'sources': return getSources();
        default:
          return { 
            title: 'Speed Test', 
            summary: `Unknown operation '${operation}'. Available: run, servers, history, sources`, 
            spokenNarrative: `Unknown speed test operation ${operation}`, 
            operation, 
            ok: false 
          };
      }
    } catch (error) {
      return { 
        title: 'Speed Test', 
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        spokenNarrative: 'Speed test error', 
        operation, 
        ok: false 
      };
    }
  },
};

export { internetSpeedTestMetadata } from './InternetSpeedTestMetadata';
export { runSpeedTest, listServers, getHistory, getSources } from './InternetSpeedTestOperations';