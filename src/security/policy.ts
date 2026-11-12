/**
 * Stella Mobile — Security Policy Engine
 * Evaluates whether actions are permitted based on settings.
 */

import { AppSettings } from '../core/types'

export class PolicyEngine {
  static evaluate(
    settings: AppSettings,
    action: string,
    requiresAuth: boolean,
    destructive: boolean
  ): { allowed: boolean; reason?: string } {
    if (destructive && !settings.security.encryption_enabled) {
      return { allowed: false, reason: 'Encryption must be enabled for destructive actions' }
    }
    if (action === 'network_control' && !settings.device.allow_network_control) {
      return { allowed: false, reason: 'Network control not enabled in Settings' }
    }
    if (action === 'external_apps' && !settings.device.allow_external_apps) {
      return { allowed: false, reason: 'External app control not enabled in Settings' }
    }
    if (action === 'location' && !settings.device.allow_location) {
      return { allowed: false, reason: 'Location access not enabled in Settings' }
    }
    return { allowed: true }
  }

  static requiresConfirmation(destructive: boolean): boolean {
    return destructive
  }
}
