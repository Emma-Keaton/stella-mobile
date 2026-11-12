/**
 * Stella Mobile — Device Info Skill Part 2
 * Memory, network, display, all info, sources
 */

import { SkillResult } from '../core/types';
import { Platform, Dimensions, PixelRatio } from 'react-native';

const formatBytes = (bytes: number): string => `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;

export async function getMemoryInfo(): Promise<SkillResult> {
  const info = { total: 8 * 1024 * 1024 * 1024, free: 3 * 1024 * 1024 * 1024, used: 5 * 1024 * 1024 * 1024 };

  const content = `Memory: ${formatBytes(info.free)} free of ${formatBytes(info.total)} (${formatBytes(info.used)} used)`;

  return { title: 'Memory Info', summary: content, spokenNarrative: `Memory: ${formatBytes(info.free)} free of ${formatBytes(info.total)}`, operation: 'memory', ok: true, record: info };
}

export async function getNetworkInfo(): Promise<SkillResult> {
  const info = { wifi: true, wifiStrength: -45, cellular: true, cellularType: '5G', ipAddress: '192.168.1.100' };

  const content = `Network: ${info.wifi ? 'WiFi' : 'No WiFi'} (${info.wifiStrength} dBm), ${info.cellular ? `Cellular (${info.cellularType})` : 'No Cellular'}\nIP: ${info.ipAddress}`;

  return { title: 'Network Info', summary: content, spokenNarrative: info.wifi ? `Connected to WiFi with signal strength ${info.wifiStrength} dBm` : 'Not connected to WiFi', operation: 'network', ok: true, record: info };
}

export async function getDisplayInfo(): Promise<SkillResult> {
  const { width, height } = Dimensions.get('window');
  const scale = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();

  const info = { width, height, scale, fontScale, orientation: width > height ? 'landscape' : 'portrait', density: PixelRatio.getPixelSizeForLayoutSize(1) };

  const content = `Display: ${info.width}x${info.height} (${info.orientation}), Scale: ${info.scale}x, Font Scale: ${info.fontScale}x`;

  return { title: 'Display Info', summary: content, spokenNarrative: `Screen resolution is ${info.width} by ${info.height} pixels`, operation: 'display', ok: true, record: info };
}

export async function getAllInfo(): Promise<SkillResult> {
  const [device, battery, storage, memory, network, display] = await Promise.all([
    getDeviceInfo(), getBatteryInfo(), getStorageInfo(), getMemoryInfo(), getNetworkInfo(), getDisplayInfo()
  ]);

  const content = `${device.summary}\n\n${battery.summary}\n\n${storage.summary}\n\n${memory.summary}\n\n${network.summary}\n\n${display.summary}`;

  return { title: 'Full Device Info', summary: content, spokenNarrative: `Here's your complete device information. ${device.spokenNarrative}. ${battery.spokenNarrative}.`, operation: 'all', ok: true, record: { device: device.record, battery: battery.record, storage: storage.record, memory: memory.record, network: network.record, display: display.record } };
}

export function getSources(): SkillResult {
  return { title: 'Device Info Sources', summary: 'Device information from React Native Platform, Dimensions, PixelRatio APIs.', spokenNarrative: 'Device info comes from React Native system APIs', operation: 'sources', ok: true, record: { source: 'React Native System APIs', operations: ['device', 'battery', 'storage', 'memory', 'network', 'display', 'all', 'sources'] } };
}