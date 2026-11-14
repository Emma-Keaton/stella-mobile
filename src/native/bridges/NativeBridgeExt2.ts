/**
 * Stella Mobile — Native Module Accessors Extended (Part 2)
 * Permissions, Haptics, Network Info
 */

import { NativeModules, NativeEventEmitter } from 'react-native';
import type { 
  PermissionsModule,
  HapticsModule,
  NetworkInfoModule
} from '../modules/NativeModuleExtendedTypes';

// Get native modules
const {
  PermissionsManager,
  HapticsManager,
  NetworkInfoManager,
} = NativeModules;

// Typed module accessors
export const nativeModulesExt2 = {
  permissions: PermissionsManager as PermissionsModule | null,
  haptics: HapticsManager as HapticsModule | null,
  networkInfo: NetworkInfoManager as NetworkInfoModule | null,
};

// Extended NativeBridge - Permissions, Haptics, Network
export const NativeBridgeExt2 = {
  // Permissions
  permissions: {
    async check(permission: string) {
      if (!nativeModulesExt2.permissions) return 'granted';
      return nativeModulesExt2.permissions.check(permission as any);
    },
    async request(permission: string) {
      if (!nativeModulesExt2.permissions) return 'granted';
      return nativeModulesExt2.permissions.request(permission as any);
    },
    async requestMultiple(permissions: string[]) {
      if (!nativeModulesExt2.permissions) {
        return permissions.reduce((acc, p) => ({ ...acc, [p]: 'granted' }), {});
      }
      return nativeModulesExt2.permissions.requestMultiple(permissions as any);
    },
    async openSettings() {
      if (!nativeModulesExt2.permissions) return;
      return nativeModulesExt2.permissions.openSettings();
    },
  },

  // Haptics
  haptics: {
    async trigger(type: string) {
      if (!nativeModulesExt2.haptics) return { ok: true };
      return nativeModulesExt2.haptics.trigger(type as any);
    },
    async impactOccurred(style: 'light' | 'medium' | 'heavy') {
      if (!nativeModulesExt2.haptics) return { ok: true };
      return nativeModulesExt2.haptics.impactOccurred(style);
    },
    async notificationOccurred(type: 'success' | 'warning' | 'error') {
      if (!nativeModulesExt2.haptics) return { ok: true };
      return nativeModulesExt2.haptics.notificationOccurred(type);
    },
    async selectionChanged() {
      if (!nativeModulesExt2.haptics) return { ok: true };
      return nativeModulesExt2.haptics.selectionChanged();
    },
  },

  // Network Info
  networkInfo: {
    async fetch() {
      if (!nativeModulesExt2.networkInfo) {
        return { type: 'wifi', isConnected: true, isInternetReachable: true, isWifiEnabled: true };
      }
      return nativeModulesExt2.networkInfo.fetch();
    },
    addListener(listener: (state: any) => void) {
      if (!nativeModulesExt2.networkInfo) return () => {};
      return nativeModulesExt2.networkInfo.addListener(listener);
    },
  },
};