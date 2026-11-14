/**
 * Stella Mobile — Media Stream Service
 * Manages IPTV/watch sources, Sonarr TV sources, and FM radio sources.
 * Provides source validation, playback session tracking, and external player handoff.
 */

import { AsyncStorage } from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'
import { ExternalAppsController } from '../device/apps'

const SOURCES_KEY = 'stella_media_sources_v1'
const SESSION_KEY = 'stella_media_session_v1'

export type MediaSourceType = 'iptv' | 'sonarr' | 'radio'

export interface MediaSource {
  id: string
  name: string
  type: MediaSourceType
  url: string
  category?: string
  language?: string
  logo?: string
  enabled: boolean
  lastPlayed?: number
}

export interface PlaybackSession {
  id: string
  sourceId: string
  sourceName: string
  type: MediaSourceType
  startedAt: number
  endedAt?: number
  externalPlayer?: boolean
  status: 'playing' | 'paused' | 'stopped' | 'error'
  async initialize(): Promise<void> {
    await this.loadSources()
    await this.loadSessions()
  }

  private async loadSources(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(SOURCES_KEY)
      if (raw) {
        const parsed: MediaSource[] = JSON.parse(raw)
        parsed.forEach((s) => this.sources.set(s.id, s))
      } else {
        await this.resetToDefaults()
      }
    } catch {
      await this.resetToDefaults()
    }
  }

  private async resetToDefaults(): Promise<void> {
    this.sources.clear()
    DEFAULT_SOURCES.forEach((s) => this.sources.set(s.id, s))
    await this.saveSources()
  }

  private async saveSources(): Promise<void> {
    await AsyncStorage.setItem(SOURCES_KEY, JSON.stringify(Array.from(this.sources.values())))
  }

  private async loadSessions(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY)
      if (raw) {
        this.sessions = JSON.parse(raw)
      }
    } catch {
      this.sessions = []
    }
  }

  private async saveSessions(): Promise<void> {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(this.sessions))
  }

  getSources(): MediaSource[] {
    return Array.from(this.sources.values()).filter((s) => s.enabled)
  }

  getSource(id: string): MediaSource | undefined {
    return this.sources.get(id)
  }

  async addSource(source: Omit<MediaSource, 'id'>): Promise<string> {
    const id = `media_${Date.now()}`
    const newSource: MediaSource = { ...source, id }
    this.sources.set(id, newSource)
    await this.saveSources()
    return id
  }

  async updateSource(id: string, updates: Partial<MediaSource>): Promise<boolean> {
    const existing = this.sources.get(id)
    if (!existing) return false
    this.sources.set(id, { ...existing, ...updates })
    await this.saveSources()
    return true
  }

  async removeSource(id: string): Promise<boolean> {
    const deleted = this.sources.delete(id)
    if (deleted) await this.saveSources()
    return deleted
  }

  async validateSource(url: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok) return { ok: true }
      return { ok: false, error: `HTTP ${response.status}` }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Validation failed' }
    }
  }

  setSessionChangeHandler(handler: (session: PlaybackSession | null) => void): void {
    this.onSessionChange = handler
  }

  async startSession(sourceId: string, externalPlayer = false): Promise<PlaybackSession> {
    const source = this.sources.get(sourceId)
    if (!source) throw new Error(`Source ${sourceId} not found`)

    if (this.currentSession) {
      await this.stopSession()
    }

    const session: PlaybackSession = {
      id: `session_${Date.now()}`,
      sourceId,
      sourceName: source.name,
      type: source.type,
      startedAt: Date.now(),
      externalPlayer,
      status: 'playing',
    }

    this.currentSession = session
    this.sessions.push(session)
    await this.saveSessions()
    this.onSessionChange?.(session)

    source.lastPlayed = Date.now()
    await this.saveSources()

    return session
  }

  async pauseSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.status = 'paused'
      this.onSessionChange?.(this.currentSession)
      await this.saveSessions()
    }
  }

  async resumeSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.status = 'playing'
      this.onSessionChange?.(this.currentSession)
      await this.saveSessions()
    }
  }

  async stopSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.endedAt = Date.now()
      this.currentSession.status = 'stopped'
      this.onSessionChange?.(null)
      await this.saveSessions()
      this.currentSession = null
    }
  }

  getCurrentSession(): PlaybackSession | null {
    return this.currentSession
  }

  getSessions(): PlaybackSession[] {
    return [...this.sessions].reverse()
  }

  async streamInExternalApp(sourceId: string): Promise<{ ok: boolean; error?: string }> {
    const source = this.sources.get(sourceId)
    if (!source) return { ok: false, error: 'Source not found' }

    try {
      const result = await ExternalAppsController.launchApp('org.videolan.vlc', source.url)
      if (result.ok) {
        await this.startSession(sourceId, true)
        return { ok: true }
      }
      return { ok: false, error: result.error || 'Failed to launch external app' }
    } catch (e: any) {
      return { ok: false, error: e.message || 'External app launch failed' }
    }
  }
}

export const mediaStreamService = new MediaStreamService()

const DEFAULT_SOURCES: MediaSource[] = [
  { id: 'iptv_1', name: 'Pluto TV', type: 'iptv', url: 'https://iptv-org.github.io/iptv/index.m3u', category: 'Entertainment', enabled: true },
  { id: 'iptv_2', name: 'Free Cable TV', type: 'iptv', url: 'https://iptv-org.github.io/iptv/countries/us.m3u', category: 'US', enabled: true },
  { id: 'sonarr_1', name: 'Sonarr TV Library', type: 'sonarr', url: 'http://localhost:8989/api/v3/series', category: 'TV Shows', enabled: false },
  { id: 'radio_1', name: 'BBC Radio 1', type: 'radio', url: 'https://stream-live.bbc.co.uk/bbc_radio_one', category: 'Music', enabled: true },
  { id: 'radio_2', name: 'KEXP Seattle', type: 'radio', url: 'https://icecast.kexp.org/kexp128', category: 'Music', enabled: true },
]

export class MediaStreamService {
  private sources: Map<string, MediaSource> = new Map()
  private sessions: PlaybackSession[] = []
  private currentSession: PlaybackSession | null = null
  private onSessionChange?: (session: PlaybackSession | null) => void