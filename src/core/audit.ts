/**
 * Stella Mobile — Audit Log
 * Ported from core/audit.py — append-only JSONL audit log for all tool invocations.
 */

import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import { AuditEntry } from './types'

const AUDIT_DIR = Platform.OS === 'android'
  ? RNFS.DocumentDirectoryPath + '/StellaAI/logs'
  : RNFS.DocumentDirectoryPath + '/StellaAI/logs'

const AUDIT_PATH = AUDIT_DIR + '/audit.jsonl'

export class StellaAudit {
  static enabled = true

  static async init(): Promise<void> {
    if (!this.enabled) return
    try {
      const dirExists = await RNFS.exists(AUDIT_DIR)
      if (!dirExists) {
        await RNFS.mkdir(AUDIT_DIR)
      }
    } catch (e) {
      console.warn('[Audit] Failed to init log dir', e)
    }
  }

  static async record(
    actor: string,
    tool: string,
    target: string,
    result: string,
    activity?: string,
    rule?: string,
    extra?: any
  ): Promise<AuditEntry | null> {
    if (!this.enabled) return null

    const entry: AuditEntry = {
      ts: new Date().toISOString(),
      actor,
      tool,
      target,
      result,
    }
    if (activity) entry.activity = activity
    if (rule) entry.rule = rule
    if (extra) entry.extra = extra

    try {
      const line = JSON.stringify(entry) + '\n'
      const exists = await RNFS.exists(AUDIT_PATH)
      if (!exists) {
        await RNFS.writeFile(AUDIT_PATH, line, 'utf8')
      } else {
        await RNFS.appendFile(AUDIT_PATH, line, 'utf8')
      }
      return entry
    } catch (e) {
      console.warn('[Audit] Failed to write entry', e)
      return null
    }
  }

  static async tail(limit: number = 50): Promise<AuditEntry[]> {
    if (!this.enabled) return []
    try {
      const exists = await RNFS.exists(AUDIT_PATH)
      if (!exists) return []
      const content = await RNFS.readFile(AUDIT_PATH, 'utf8')
      const lines = content.split('\n').filter(l => l.trim())
      const rows: AuditEntry[] = []
      for (const line of lines) {
        try {
          rows.push(JSON.parse(line))
        } catch {
          // skip corrupt lines
        }
      }
      return rows.slice(-limit)
    } catch (e) {
      console.warn('[Audit] Failed to read log', e)
      return []
    }
  }

  static async clear(): Promise<void> {
    try {
      const exists = await RNFS.exists(AUDIT_PATH)
      if (exists) await RNFS.unlink(AUDIT_PATH)
    } catch (e) {
      console.warn('[Audit] Failed to clear log', e)
    }
  }
}
