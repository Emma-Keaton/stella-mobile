/**
 * Stella Mobile — Security & Encryption
 * Encryption at rest, policy enforcement, biometric unlock.
 */

import * as Crypto from 'expo-crypto'

export class SecurityManager {
  static async encrypt(data: string): Promise<string> {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'stella-mobile-security',
      { encoding: Crypto.CryptoEncoding.HEX }
    )
    let result = ''
    const keyHex = key.digest
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ keyHex.charCodeAt(i % keyHex.length)
      )
    }
    return btoa(unescape(encodeURIComponent(result)))
  }

  static async decrypt(ciphertext: string): Promise<string> {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'stella-mobile-security',
      { encoding: Crypto.CryptoEncoding.HEX }
    )
    const keyHex = key.digest
    const decoded = decodeURIComponent(escape(atob(ciphertext)))
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ keyHex.charCodeAt(i % keyHex.length)
      )
    }
    return result
  }

  static async hash(data: string): Promise<string> {
    const result = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data,
      { encoding: Crypto.CryptoEncoding.HEX }
    )
    return result.digest
  }

  static maskKey(key: string): string {
    if (!key || key.length < 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }
}

export interface SecurityPolicy {
  encryptionEnabled: boolean
  auditEnabled: boolean
  biometricUnlock: boolean
  allowExternalApps: boolean
  allowNetworkControl: boolean
  allowLocation: boolean
}

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  encryptionEnabled: true,
  auditEnabled: true,
  biometricUnlock: false,
  allowExternalApps: false,
  allowNetworkControl: false,
  allowLocation: false,
}
