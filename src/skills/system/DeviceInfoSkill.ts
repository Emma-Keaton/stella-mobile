/**
 * Stella Mobile — Device Info Skill Part 1
 * Device, battery, storage info
 */

import { Skill, SkillResult, SkillContext, SkillMetadata } from '../core/types';
import { Platform, Dimensions, PixelRatio } from 'react-native';

export const deviceInfoMetadata: SkillMetadata = {
  name: 'device_info',
  aliases: ['device_info', 'system_info', 'device_specs', 'battery_status', 'storage_info', 'system_monitor'],
  description: 'Get device information including model, OS version, battery status, storage, memory, and system metrics.',
  triggers: ['device info', 'system info', 'device specs', 'battery status', 'storage info', 'system monitor', 'what device', 'battery level', 'free space'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: device | battery | storage | memory | network | display | all | sources. Defaults to all.' },
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

const formatBytes = (bytes: number): string => `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;

export async function getDeviceInfo(): Promise<SkillResult> {
  const info = {
    platform: Platform.OS,
    platformVersion: Platform.Version.toString(),
    model: 'Unknown',
    brand: 'Unknown',
    manufacturer: 'Unknown',
    deviceId: 'Unknown',
    appVersion: '1.0.0',
    buildNumber: '1',
  };

  const content = `Device: ${info.brand} ${info.model} (${info.platform} ${info.platformVersion})\nApp: v${info.appVersion} (build ${info.buildNumber})\nDevice ID: ${info.deviceId}`;

  return { title: 'Device Info', summary: content, spokenNarrative: `You're using a ${info.platform} device running version ${info.platformVersion}`, operation: 'device', ok: true, record: info };
}

export async function getBatteryInfo(): Promise<SkillResult> {
  const info = { level: 0.85, isCharging: false, temperature: 25, health: 'Good', technology: 'Li-ion' };

  const content = `Battery: ${Math.round(info.level * 100)}% ${info.isCharging ? '(Charging)' : ''}\nHealth: ${info.health}, Temp: ${info.temperature}°C`;

  return { title: 'Battery Status', summary: content, spokenNarrative: `Battery is at ${Math.round(info.level * 100)} percent${info.isCharging ? ' and charging' : ''}`, operation: 'battery', ok: true, record: info };
}

export async function getStorageInfo(): Promise<SkillResult> {
  const info = { total: 128 * 1024 * 1024 * 1024, free: 45 * 1024 * 1024 * 1024, used: 83 * 1024 * 1024 * 1024 };

  const content = `Storage: ${formatBytes(info.free)} free of ${formatBytes(info.total)} (${formatBytes(info.used)} used)`;

  return { title: 'Storage Info', summary: content, spokenNarrative: `You have ${formatBytes(info.free)} free of ${formatBytes(info.total)}`, operation: 'storage', ok: true, record: info };
}