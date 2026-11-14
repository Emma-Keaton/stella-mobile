/**
 * Stella Mobile — Device Info Skill Part 1
 * Device, battery, storage info using native modules
 */

import { SkillResult, SkillContext } from '../core/types';
import { Platform, Dimensions, PixelRatio } from 'react-native';
import { NativeBridge } from '../../native/bridges';

export const deviceInfoMetadata: any = {
  name: 'device_info',
  aliases: ['device_info', 'system_info', 'device_specs', 'battery_status', 'storage_info', 'system_monitor'],
  description: 'Get device information including model, OS version, battery status, storage, memory, and system metrics using native device APIs.',
  triggers: ['device info', 'system info', 'device specs', 'battery status', 'storage info', 'system monitor', 'what device', 'battery level', 'free space'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: device | battery | storage | memory | network | display | all | sources. Defaults to all.' },
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

const formatBytes = (bytes: number): string => `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;

export async function getDeviceInfo(): Promise<any> {
  try {
    const [deviceId, model, brand, appVersion, buildNumber, systemVersion] = await Promise.all([
      NativeBridge.deviceInfo.getDeviceId(),
      NativeBridge.deviceInfo.getModel(),
      NativeBridge.deviceInfo.getDeviceName(),
      NativeBridge.deviceInfo.getAppVersion(),
      NativeBridge.deviceInfo.getBuildNumber(),
      NativeBridge.deviceInfo.getSystemVersion(),
    ]);

    const info = {
      platform: Platform.OS,
      platformVersion: systemVersion,
      model,
      brand,
      manufacturer: brand,
      deviceId,
      appVersion,
      buildNumber,
    };

    const content = `Device: ${info.brand} ${info.model} (${info.platform} ${info.platformVersion})\nApp: v${info.appVersion} (build ${info.buildNumber})\nDevice ID: ${info.deviceId}`;

    return { title: 'Device Info', summary: content, spokenNarrative: `You're using a ${info.platform} device running version ${info.platformVersion}`, operation: 'device', ok: true, record: info };
  } catch (error) {
    return { title: 'Device Info', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Device info error', operation: 'device', ok: false };
  }
}

export async function getBatteryInfo(): Promise<any> {
  try {
    const [level, isCharging, health] = await Promise.all([
      NativeBridge.deviceInfo.getBatteryLevel(),
      NativeBridge.deviceInfo.isBatteryCharging(),
      NativeBridge.deviceInfo.getBatteryHealth(),
    ]);

    const info = { level, isCharging, health, technology: 'Li-ion' };

    const content = `Battery: ${Math.round(info.level * 100)}% ${info.isCharging ? '(Charging)' : ''}\nHealth: ${info.health}`;

    return { title: 'Battery Status', summary: content, spokenNarrative: `Battery is at ${Math.round(info.level * 100)} percent${info.isCharging ? ' and charging' : ''}`, operation: 'battery', ok: true, record: info };
  } catch (error) {
    return { title: 'Battery Status', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Battery info error', operation: 'battery', ok: false };
  }
}

export async function getStorageInfo(): Promise<any> {
  try {
    const [total, free] = await Promise.all([
      NativeBridge.deviceInfo.getTotalDiskCapacity(),
      NativeBridge.deviceInfo.getFreeDiskStorage(),
    ]);

    const used = total - free;
    const info = { total, free, used };

    const content = `Storage: ${formatBytes(info.free)} free of ${formatBytes(info.total)} (${formatBytes(info.used)} used)`;

    return { title: 'Storage Info', summary: content, spokenNarrative: `You have ${formatBytes(info.free)} free of ${formatBytes(info.total)}`, operation: 'storage', ok: true, record: info };
  } catch (error) {
    return { title: 'Storage Info', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Storage info error', operation: 'storage', ok: false };
  }
}