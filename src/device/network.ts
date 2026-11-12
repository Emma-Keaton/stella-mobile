/**
 * Stella Mobile — Network Control
 * Control network interfaces and settings.
 */

import NetInfo from '@react-native-community/netinfo'

export class NetworkController {
  static async getInterfaces(): Promise<Array<{ name: string; type: string; connected: boolean; ip_address?: string; ssid?: string }>> {
    try {
      const state = await NetInfo.fetch()
      return [{
        name: state.type || 'unknown',
        type: state.type || 'unknown',
        connected: state.isConnected ?? false,
        ip_address: state.ipAddress,
      }]
    } catch {
      return []
    }
  }

  static async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch()
      return state.isConnected ?? false
    } catch {
      return false
    }
  }

  static async getConnectionType(): Promise<string> {
    try {
      const state = await NetInfo.fetch()
      return state.type || 'unknown'
    } catch {
      return 'unknown'
    }
  }
}
