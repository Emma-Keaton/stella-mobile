/**
 * Stella Mobile — Workspace History
 * Ported from agent/scratchpad.py + core/audit.py — workspace history for mobile.
 */

import { StellaStorage } from '../core/storage'
import { WorkspaceHistoryEntry } from '../core/types'

const HISTORY_KEY = 'stella_workspace_history_v2'
const MAX_ENTRIES = 1000

export class WorkspaceHistory {
  private entries: WorkspaceHistoryEntry[] = []
  private maxEntries: number

  constructor(maxEntries = MAX_ENTRIES) {
    this.maxEntries = maxEntries
  }

  async init(): Promise<void> {
    const saved = await StellaStorage.getItem<any[]>(HISTORY_KEY)
    if (saved) {
      this.entries = saved
    }
  }

  async add(entry: Omit<WorkspaceHistoryEntry, 'id' | 'timestamp'>): Promise<WorkspaceHistoryEntry> {
    const fullEntry: WorkspaceHistoryEntry = {
      id: `wh_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      ...entry,
    }

    this.entries.unshift(fullEntry)

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries)
    }

    await StellaStorage.setItem(HISTORY_KEY, this.entries)
    return fullEntry
  }

  getAll(): WorkspaceHistoryEntry[] {
    return [...this.entries]
  }

  getByType(type: WorkspaceHistoryEntry['type']): WorkspaceHistoryEntry[] {
    return this.entries.filter(e => e.type === type)
  }

  getRecent(limit: number = 20): WorkspaceHistoryEntry[] {
    return this.entries.slice(0, limit)
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.entries.findIndex(e => e.id === id)
    if (idx === -1) return false
    this.entries.splice(idx, 1)
    await StellaStorage.setItem(HISTORY_KEY, this.entries)
    return true
  }

  async clear(): Promise<void> {
    this.entries = []
    await StellaStorage.setItem(HISTORY_KEY, [])
  }

  async addChat(title: string, description: string, data: any): Promise<WorkspaceHistoryEntry> {
    return this.add({ type: 'chat', title, description, data })
  }

  async addAgent(title: string, description: string, data: any): Promise<WorkspaceHistoryEntry> {
    return this.add({ type: 'agent', title, description, data })
  }

  async addSkill(title: string, description: string, data: any): Promise<WorkspaceHistoryEntry> {
    return this.add({ type: 'skill', title, description, data })
  }

  async addMedia(title: string, description: string, data: any): Promise<WorkspaceHistoryEntry> {
    return this.add({ type: 'media', title, description, data })
  }

  async addMap(title: string, description: string, data: any): Promise<WorkspaceHistoryEntry> {
    return this.add({ type: 'map', title, description, data })
  }

  async addDevice(title: string, description: string, data: any): Promise<WorkspaceHistoryEntry> {
    return this.add({ type: 'device', title, description, data })
  }
}

export const workspaceHistory = new WorkspaceHistory()
