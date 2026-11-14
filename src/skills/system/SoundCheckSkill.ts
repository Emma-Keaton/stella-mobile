/**
 * Stella Mobile — Sound Check Skill
 * Tests audio output, microphone input, and volume levels using native audio APIs.
 */

import { Skill, SkillResult, SkillContext, SkillMetadata } from '../core/types';
import { NativeBridge, NativeBridgeExt } from '../../native/bridges';
import { PermissionsAndroid, Platform } from 'react-native';

export const soundCheckMetadata: SkillMetadata = {
  name: 'sound_check',
  aliases: ['sound_check', 'audio_test', 'test_speaker', 'test_mic', 'volume_level', 'audio_diagnostics'],
  description: 'Run a sound check on this device. Tests speaker output, microphone input, and volume levels using native audio APIs.',
  triggers: ['sound check', 'audio test', 'test speaker', 'test microphone', 'volume level', 'audio diagnostics', 'check audio'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: speaker | microphone | volume | full | sources. Defaults to full.' },
      testDuration: { type: 'number', description: 'Test duration in seconds (default 3, max 30).' },
    },
    required: [],
  },
  version: '2.0.0',
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
          return { title: 'Speaker Test', summary: result, spokenNarrative: result, operation: 'speaker', ok: result.ok, record: { test: 'speaker', duration: testDuration, result } };
        }
        case 'microphone': {
          const result = await testMicrophone(testDuration);
          return { title: 'Microphone Test', summary: result.summary, spokenNarrative: result.summary, operation: 'microphone', ok: result.ok, record: { test: 'microphone', duration: testDuration, ...result.record } };
        }
        case 'volume': {
          const result = await getVolumeLevel();
          return { title: 'Volume Level', summary: result.summary, spokenNarrative: result.summary, operation: 'volume', ok: result.ok, record: { test: 'volume', ...result.record } };
        }
        case 'full': {
          const speaker = await testSpeaker(testDuration);
          const mic = await testMicrophone(testDuration);
          const volume = await getVolumeLevel();
          const allOk = speaker.ok && mic.ok && volume.ok;
          const content = `Sound Check Complete:\n🔊 Speaker: ${speaker.summary}\n🎤 Microphone: ${mic.summary}\n🔧 Volume: ${volume.summary}`;
          return { title: 'Sound Check', summary: content, spokenNarrative: `Sound check complete. Speaker ${speaker.ok ? 'working' : 'has issues'}. Microphone ${mic.ok ? 'working' : 'has issues'}.`, operation: 'full', ok: allOk, record: { speaker, microphone: mic, volume } };
        }
        case 'sources': {
          return { title: 'Sound Check Sources', summary: 'Audio diagnostics using native AudioSession (expo-audio-session) and AudioRecorder/Player (expo-av).', spokenNarrative: 'Sound check uses native audio APIs', operation: 'sources', ok: true, record: { source: 'expo-audio-session, expo-av', operations: ['speaker', 'microphone', 'volume', 'full', 'sources'] } };
        }
        default:
          return { title: 'Sound Check', summary: `Unknown operation '${operation}'. Available: speaker, microphone, volume, full, sources`, spokenNarrative: `Unknown sound check operation ${operation}`, operation, ok: false };
      }
    } catch (error: any) {
      return { title: 'Sound Check', summary: `Error: ${error.message || 'Unknown error'}`, spokenNarrative: 'Sound check error', operation, ok: false };
    }
  },
};
async function testSpeaker(duration: number): Promise<string> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return '❌ Speaker test failed: Microphone permission required for audio diagnostics';
      }
    }

    await NativeBridge.audioSession.configure({
      mode: 'movie_playback',
      category: 'playback',
      options: ['mixWithOthers', 'allowBluetooth'],
    });

    const testToneUri = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    await NativeBridgeExt.audioPlayer.play(testToneUri, { volume: 0.8 });
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    await NativeBridgeExt.audioPlayer.stop();

    return `✅ OK - Test tone played for ${duration}s via native AudioPlayer`;
  } catch (error: any) {
    return `❌ Speaker test failed: ${error.message || 'Unknown error'}`;
  }
}

async function testMicrophone(duration: number): Promise<string> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return '❌ Microphone test failed: Microphone permission required for audio diagnostics';
      }
    }

    await NativeBridge.audioSession.configure({
      mode: 'measurement',
      category: 'record',
      options: ['mixWithOthers'],
    });

    await NativeBridgeExt.audioRecorder.startRecording({
      sampleRate: 44100,
      channels: 1,
      format: 'm4a',
      maxDuration: duration,
    });
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    await NativeBridgeExt.audioRecorder.stop();

    return `✅ OK - Microphone recorded for ${duration}s via native AudioRecorder`;
  } catch (error: any) {
    return `❌ Microphone test failed: ${error.message || 'Unknown error'}`;
  }
}

async function getVolumeLevel(): Promise<string> {
  try {
    if (NativeBridge.audioSession && typeof NativeBridge.audioSession.getVolume === 'function') {
      const level = await NativeBridge.audioSession.getVolume();
      const max = await NativeBridge.audioSession.getMaxVolume();
      const percent = Math.round((level / max) * 100);
      return `System volume: ${percent}%`;
    }
    return 'Volume: Unable to query - native audio session not available';
  } catch (error: any) {
    return `Volume: Unable to query (${error.message || 'Unknown error'})`;
  }
}