/**
 * Stella Mobile — Native Module Accessors (Core)
 * Provides typed access to native modules with fallbacks
 */

import { NativeModules, NativeEventEmitter } from 'react-native';
import type { 
  AudioSessionModule, 
  DeviceInfoModule, 
  LocationModule 
} from '../modules/NativeModuleTypes';

// Get native modules
const {
  AudioSessionManager,
  DeviceInfoManager,
  LocationManager,
} = NativeModules;

// Typed module accessors
export const nativeModules = {
  audioSession: AudioSessionManager as AudioSessionModule | null,
  deviceInfo: DeviceInfoManager as DeviceInfoModule | null,
  location: LocationManager as LocationModule | null,
};

// Event emitters
export const nativeEvents = {
  audioSession: nativeModules.audioSession ? new NativeEventEmitter(nativeModules.audioSession as any) : null,
  location: nativeModules.location ? new NativeEventEmitter(nativeModules.location as any) : null,
};

// Helper: Check if native module is available
export function isNativeModuleAvailable(name: keyof typeof nativeModules): boolean {
  return nativeModules[name] !== null;
}

// Helper: Get native module with descriptive error
export function getNativeModule<T extends keyof typeof nativeModules>(name: T): typeof nativeModules[T] {
  const module = nativeModules[name];
  if (!module) {
    const installCommands = getInstallCommand(name);
    throw new Error(
      `Native module '${name}' is not available.\n` +
      `Install required package:\n${installCommands}\n` +
      `Then run: npx expo prebuild (or rebuild native)`
    );
  }
  return module;
}

function getInstallCommand(moduleName: string): string {
  const commands: Record<string, string> = {
    audioSession: 'expo install expo-audio-session',
    deviceInfo: 'expo install expo-device',
    location: 'expo install expo-location',
  };
  return commands[moduleName] || `expo install <package-for-${moduleName}>`;
}

// Safe async wrappers with fallbacks
export const NativeBridge = {
  // Audio Session
  audioSession: {
    async configure(config: any) {
      if (!nativeModules.audioSession) return { ok: false, error: 'AudioSession not available' };
      return nativeModules.audioSession.configure(config);
    },
    async setMode(mode: string) {
      if (!nativeModules.audioSession) return { ok: false, error: 'AudioSession not available' };
      return nativeModules.audioSession.setMode(mode as any);
    },
    async setActive(active: boolean) {
      if (!nativeModules.audioSession) return { ok: false, error: 'AudioSession not available' };
      return nativeModules.audioSession.setActive(active);
    },
    async getVolume() {
      if (!nativeModules.audioSession) return 0.5;
      return nativeModules.audioSession.getVolume();
    },
    async setVolume(level: number) {
      if (!nativeModules.audioSession) return { ok: false };
      return nativeModules.audioSession.setVolume(level);
    },
    async getAvailableOutputs() {
      if (!nativeModules.audioSession) return [];
      return nativeModules.audioSession.getAvailableOutputs();
    },
  },

  // Device Info
  deviceInfo: {
    async getDeviceId() {
      if (!nativeModules.deviceInfo) return 'unknown-device';
      return nativeModules.deviceInfo.getDeviceId();
    },
    async getModel() {
      if (!nativeModules.deviceInfo) return 'Unknown';
      return nativeModules.deviceInfo.getModel();
    },
    async getSystemVersion() {
      if (!nativeModules.deviceInfo) return '0.0.0';
      return nativeModules.deviceInfo.getSystemVersion();
    },
    async getBatteryLevel() {
      if (!nativeModules.deviceInfo) return 1.0;
      return nativeModules.deviceInfo.getBatteryLevel();
    },
    async isBatteryCharging() {
      if (!nativeModules.deviceInfo) return false;
      return nativeModules.deviceInfo.isBatteryCharging();
    },
    async getTotalDiskCapacity() {
      if (!nativeModules.deviceInfo) return 0;
      return nativeModules.deviceInfo.getTotalDiskCapacity();
    },
    async getFreeDiskStorage() {
      if (!nativeModules.deviceInfo) return 0;
      return nativeModules.deviceInfo.getFreeDiskStorage();
    },
    async getTotalMemory() {
      if (!nativeModules.deviceInfo) return 0;
      return nativeModules.deviceInfo.getTotalMemory();
    },
    async getAvailableMemory() {
      if (!nativeModules.deviceInfo) return 0;
      return nativeModules.deviceInfo.getAvailableMemory();
    },
    async getIpAddress() {
      if (!nativeModules.deviceInfo) return '0.0.0.0';
      return nativeModules.deviceInfo.getIpAddress();
    },
    async hasPermission(permission: string) {
      if (!nativeModules.deviceInfo) return false;
      return nativeModules.deviceInfo.hasPermission(permission);
    },
  },

  // Location
  location: {
    async getCurrentPosition(options?: any) {
      if (!nativeModules.location) {
        return { latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() };
      }
      return nativeModules.location.getCurrentPosition(options);
    },
    async requestPermission(type: 'whenInUse' | 'always' = 'whenInUse') {
      if (!nativeModules.location) return 'granted';
      return nativeModules.location.requestPermission(type);
    },
    async geocode(address: string) {
      if (!nativeModules.location) return [];
      return nativeModules.location.geocode(address);
    },
    async reverseGeocode(lat: number, lon: number) {
      if (!nativeModules.location) return [];
      return nativeModules.location.reverseGeocode(lat, lon);
    },
  },
};