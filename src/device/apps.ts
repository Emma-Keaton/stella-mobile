/**
 * Stella Mobile — External Apps Control
 * Launch and control external applications on the device.
 */

import Linking from 'react-native-link-intent-launcher' // or react-native-intent-launcher

export class ExternalAppsController {
  static async launchApp(packageName: string, appName?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      // Try Android intent
      const intent = `intent:#Intent;package=${packageName};end`
      await Linking.openURL(intent)
      return { ok: true }
    } catch (e: any) {
      // Fallback to regular linking
      try {
        const supported = await Linking.canOpenURL(packageName)
        if (supported) {
          await Linking.openURL(packageName)
          return { ok: true }
        }
      } catch {}
      return { ok: false, error: `Cannot launch app: ${packageName}` }
    }
  }

  static async getInstalledApps(): Promise<Array<{ package_name: string; app_name: string; version: string }>> {
    // On React Native, this requires a native module
    // Return empty array as placeholder — would need react-native-installed-apps or similar
    return []
  }

  static async isAppInstalled(packageName: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(packageName)
      return supported
    } catch {
      return false
    }
  }
}
