/**
 * Stella Mobile — Local Storage
 * AsyncStorage wrapper with typed get/set/remove, mirrors core/user_paths + config persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppSettings, DEFAULT_SETTINGS } from './types'

const SETTINGS_KEY = 'stella_settings_v1'
const WORKSPACE_KEY = 'stella_workspace_history_v1'
const API_KEYS_KEY = 'stella_api_keys_v1'

export class StellaStorage {
  static async getSettings(): Promise<AppSettings> {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (e) {
      console.warn('[Storage] Failed to read settings', e)
    }
    return { ...DEFAULT_SETTINGS }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }

  static async getWorkspaceHistory(): Promise<any[]> {
    try {
      const raw = await AsyncStorage.getItem(WORKSPACE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.warn('[Storage] Failed to read workspace history', e)
    }
    return []
  }

  static async saveWorkspaceHistory(history: any[]): Promise<void> {
    await AsyncStorage.setItem(WORKSPACE_KEY, JSON.stringify(history))
  }

  static async getApiKeys(): Promise<Record<string, string>> {
    try {
      const raw = await AsyncStorage.getItem(API_KEYS_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.warn('[Storage] Failed to read API keys', e)
    }
    return {}
  }

  static async saveApiKeys(keys: Record<string, string>): Promise<void> {
    await AsyncStorage.setItem(API_KEYS_KEY, JSON.stringify(keys))
  }

  static async setItem(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key)
      if (raw) return JSON.parse(raw) as T
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key}`, e)
    }
    return null
  }

  static async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
  }
}
