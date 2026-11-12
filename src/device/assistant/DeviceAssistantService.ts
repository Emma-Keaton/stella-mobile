/**
 * Stella Mobile — Device Assistant Service
 * Handles wake word detection, sleep/wake cycle, HUD overlay management,
 * and always-on background listening for Stella activation.
 */

import Voice from '@react-native-voice/voice'
import Speech from 'expo-speech'

export type DeviceAssistantStatus = 'sleeping' | 'listening' | 'wake_detected' | 'active' | 'speaking'

export interface DeviceAssistantConfig {
  enabled: boolean
  wakeWord: string // e.g., "Hey Stella"
  sensitivity: 'low' | 'medium' | 'high'
  alwaysOn: boolean
  wakeGesture: 'shake' | 'double_tap' | 'none'
  hudOpacity: number
  autoSleepMinutes: number
}

export interface DeviceAssistantEvent {
  type: 'wake_detected' | 'sleep' | 'wake' | 'active' | 'speaking' | 'error'
  timestamp: number
  data?: any
}

export class DeviceAssistantService {
  private config: DeviceAssistantConfig
  private status: DeviceAssistantStatus = 'sleeping'
  private isEnabled: boolean = false
  private wakeWordListener: ((event: DeviceAssistantEvent) => void) | null = null
  private sleepTimer: NodeJS.Timeout | null = null
  private voiceRecognitionActive: boolean = false

  private AUTO_SLEEP_MS = 300000 // 5 minutes default

  constructor() {
    this.config = {
      enabled: false,
      wakeWord: 'Hey Stella',
      sensitivity: 'medium',
      alwaysOn: false,
      wakeGesture: 'none',
      hudOpacity: 0.9,
      autoSleepMinutes: 5,
    }
  }

  // ── Configuration ──
  setConfig(config: Partial<DeviceAssistantConfig>): void {
    this.config = { ...this.config, ...config }
    if (config.autoSleepMinutes !== undefined) {
      this.AUTO_SLEEP_MS = config.autoSleepMinutes * 60 * 1000
    }
  }

  getConfig(): DeviceAssistantConfig {
    return { ...this.config }
  }

  getStatus(): DeviceAssistantStatus {
    return this.status
  }

  isEnabled(): boolean {
    return this.isEnabled
  }

  // ── Enable/Disable Assistant ──
  async enable(): Promise<boolean> {
    try {
      const granted = await Voice.requestPermission()
      if (!granted) {
        console.warn('[DeviceAssistant] Microphone permission not granted')
        return false
      }
      this.isEnabled = true
      this.status = 'sleeping'
      this.startListening()
      console.log('[DeviceAssistant] Stella device assistant enabled')
      return true
    } catch (e: any) {
      console.error('[DeviceAssistant] Enable failed:', e)
      return false
    }
  }

  disable(): void {
    this.isEnabled = false
    this.status = 'sleeping'
    this.stopListening()
    this.stopSleepTimer()
    console.log('[DeviceAssistant] Stella device assistant disabled')
  }

  // ── Wake Word Listening ──
  private startListening(): void {
    if (!this.isEnabled || this.voiceRecognitionActive) return

    try {
      Voice.start('en-US').then(() => {
        this.voiceRecognitionActive = true
        this.status = 'listening'
        console.log('[DeviceAssistant] Voice recognition started - listening for wake word')
      }).catch((e: any) => {
        console.error('[DeviceAssistant] Voice start failed:', e)
      })
    } catch (e: any) {
      console.error('[DeviceAssistant] Voice start error:', e)
    }
  }

  private stopListening(): void {
    if (!this.voiceRecognitionActive) return
    try {
      Voice.stop()
    } catch {}
    Voice.destroy().catch(() => {})
    this.voiceRecognitionActive = false
    this.status = 'sleeping'
  }

  // ── Wake Word Detection ──
  onWakeWord(callback: (event: DeviceAssistantEvent) => void): void {
    this.wakeWordListener = callback
  }

  private handleWakeWord(transcript: string): void {
    const wakeWord = this.config.wakeWord.toLowerCase()
    if (transcript.toLowerCase().includes(wakeWord.toLowerCase())) {
      this.wakeUp()
      this.wakeWordListener?.({
        type: 'wake_detected',
        timestamp: Date.now(),
        data: { transcript, wakeWord: this.config.wakeWord },
      })
    }
  }

  // ── Wake/Sleep Cycle ──
  wakeUp(): void {
    this.status = 'wake_detected'
    this.stopSleepTimer()
    this.startSleepTimer()
    console.log('[DeviceAssistant] Stella woke up')
  }

  sleep(): void {
    this.status = 'sleeping'
    this.stopSleepTimer()
    console.log('[DeviceAssistant] Stella went to sleep')
  }

  setActive(active: boolean): void {
    this.status = active ? 'active' : 'sleeping'
    if (active) {
      this.stopSleepTimer()
      this.startSleepTimer()
    } else {
      this.startSleepTimer()
    }
  }

  setSpeaking(speaking: boolean): void {
    this.status = speaking ? 'speaking' : 'active'
  }

  // ── Sleep Timer ──
  private startSleepTimer(): void {
    this.stopSleepTimer()
    if (!this.config.alwaysOn && this.config.autoSleepMinutes > 0) {
      this.sleepTimer = setTimeout(() => {
        this.sleep()
      }, this.AUTO_SLEEP_MS)
    }
  }

  private stopSleepTimer(): void {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer)
      this.sleepTimer = null
    }
  }

  // ── Speech Output ──
  async speak(text: string): Promise<void> {
    if (!this.isEnabled) return
    this.setSpeaking(true)
    try {
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 1.0,
        voice: 'female', // Stella is female
      })
    } catch (e: any) {
      console.error('[DeviceAssistant] TTS error:', e)
    } finally {
      this.setSpeaking(false)
      this.setActive(true)
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop()
    } catch {}
    this.setSpeaking(false)
    this.setActive(true)
  }

  // ── Cleanup ──
  destroy(): void {
    this.stopListening()
    this.stopSleepTimer()
    this.isEnabled = false
    this.status = 'sleeping'
  }
}

export const deviceAssistantService = new DeviceAssistantService()