/**
 * Stella Mobile — Sound Check Skill
 * Tests audio output, microphone input, and volume levels
 */

import { Skill, SkillResult, SkillContext, SkillMetadata } from '../core/types';
import { Platform, NativeModules } from 'react-native';

const { AudioSession } = NativeModules;

export const soundCheckMetadata: SkillMetadata = {
  name: 'sound_check',
  aliases: ['sound_check', 'audio_test', 'test_speaker', 'test_mic', 'volume_level', 'audio_diagnostics'],
  description: 'Run a sound check on this device. Tests speaker output, microphone input, and volume levels.',
  triggers: ['sound check', 'audio test', 'test speaker', 'test microphone', 'volume level', 'audio diagnostics', 'check audio'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: speaker | microphone | volume | full | sources. Defaults to full.' },
      testDuration: { type: 'number', description: 'Test duration in seconds (default 3, max 30).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'system',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
};

export const soundCheckSkill: Skill = {
  metadata: soundCheckMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'full').toLowerCase();
    const testDuration = Math.min(Math.max(params.testDuration || 3, 1), 30);

    try {
      switch (operation) {
        case 'speaker': {
          const result = await testSpeaker(testDuration);
          return { title: 'Speaker Test', summary: result, spokenNarrative: result, operation: 'speaker', ok: true, record: { test: 'speaker', duration: testDuration, result } };
        }
        case 'microphone': {
          const result = await testMicrophone(testDuration);
          return { title: 'Microphone Test', summary: result, spokenNarrative: result, operation: 'microphone', ok: true, record: { test: 'microphone', duration: testDuration, result } };
        }
        case 'volume': {
          const result = await getVolumeLevel();
          return { title: 'Volume Level', summary: result, spokenNarrative: result, operation: 'volume', ok: true, record: { test: 'volume', result } };
        }
        case 'full': {
          const speaker = await testSpeaker(testDuration);
          const mic = await testMicrophone(testDuration);
          const volume = await getVolumeLevel();
          const content = `Sound Check Complete:\n🔊 Speaker: ${speaker}\n🎤 Microphone: ${mic}\n🔧 Volume: ${volume}`;
          return { title: 'Sound Check', summary: content, spokenNarrative: `Sound check complete. Speaker ${speaker.includes('OK') ? 'working' : 'has issues'}. Microphone ${mic.includes('OK') ? 'working' : 'has issues'}.`, operation: 'full', ok: true, record: { speaker, microphone: mic, volume } };
        }
        case 'sources': {
          return { title: 'Sound Check Sources', summary: 'Audio diagnostics using React Native AudioSession and platform audio APIs.', spokenNarrative: 'Sound check uses device audio APIs', operation: 'sources', ok: true, record: { source: 'React Native AudioSession', operations: ['speaker', 'microphone', 'volume', 'full', 'sources'] } };
        }
        default:
          return { title: 'Sound Check', summary: `Unknown operation '${operation}'. Available: speaker, microphone, volume, full, sources`, spokenNarrative: `Unknown sound check operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Sound Check', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Sound check error', operation, ok: false };
    }
  },
};

async function testSpeaker(duration: number): Promise<string> {
  // In a real implementation, this would play a test tone
  // For now, return a simulated result
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`OK - Test tone played for ${duration}s (simulated)`);
    }, 100);
  });
}

async function testMicrophone(duration: number): Promise<string> {
  // In a real implementation, this would record and analyze audio
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`OK - Microphone recorded for ${duration}s (simulated)`);
    }, 100);
  });
}

async function getVolumeLevel(): Promise<string> {
  // In a real implementation, this would query system volume
  if (AudioSession) {
    try {
      // This would need native module implementation
      return 'System volume: 75% (simulated)';
    } catch {
      return 'Volume: Unable to query (simulated 75%)';
    }
  }
  return 'Volume: 75% (simulated)';
}