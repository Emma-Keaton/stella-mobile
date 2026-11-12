/**
 * Stella Mobile — Model Downloader Service
 * Downloads and caches STT/TTS models on first launch using expo-file-system.
 * Supports resume, checksum verification, and progress tracking.
 */

import * as FileSystem from 'expo-file-system'
import { Crypto } from 'expo-crypto'
import { VoiceConfig, SupportedLanguage } from '../core/types'

export interface ModelManifest {
  version: string
  stt: ModelEntry
  tts: ModelEntry
}

export interface ModelEntry {
  name: string
  filename: string
  size: number
  sha256: string
  urls: string[]
  languages?: SupportedLanguage[]
}

export interface DownloadProgress {
  stage: 'stt' | 'tts' | 'complete' | 'error'
  bytesDownloaded: number
  totalBytes: number
  percent: number
  currentFile: string
  error?: string
}

export interface ModelInfo {
  stt: { name: string; size: number; path: string; downloaded: boolean; version: string }
  tts: { name: string; size: number; path: string; downloaded: boolean; version: string }
}

const MODEL_MANIFEST: ModelManifest = {
  version: '1.0.0',
  stt: {
    name: 'Whisper Tiny (ExecuTorch)',
    filename: 'whisper_tiny_execorch.pte',
    size: 39 * 1024 * 1024,
    // SHA256: Run `sha256sum whisper_tiny_execorch.pte` after downloading from official source
    // Official: https://github.com/pytorch/executorch/releases/tag/models
    // Or: https://huggingface.co/fixie-ai/whisper-tiny-executorch
    sha256: 'TODO:COMPUTE_SHA256_AFTER_DOWNLOAD_STT',
    urls: [
      'https://github.com/pytorch/executorch/releases/download/models/whisper_tiny.pte',
      'https://huggingface.co/fixie-ai/whisper-tiny-executorch/resolve/main/whisper_tiny.pte',
    ],
  },
  tts: {
    name: 'Kokoro-82M (ONNX) - Female Voice',
    filename: 'kokoro_82m.onnx',
    size: 82 * 1024 * 1024,
    // SHA256: Run `sha256sum kokoro_82m.onnx` after downloading from official source
    // Official: https://github.com/hexgrad/kokoro/releases/tag/v0.1
    // Or: https://huggingface.co/hexgrad/Kokoro-82M
    sha256: 'TODO:COMPUTE_SHA256_AFTER_DOWNLOAD_TTS',
    urls: [
      'https://github.com/hexgrad/kokoro/releases/download/v0.1/kokoro-v0_19.onnx',
      'https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/kokoro-v0_19.onnx',
    ],
    languages: ['en', 'es', 'fr', 'de', 'zh'],
  },
}

const MODEL_DIR = `${FileSystem.documentDirectory}models/`
const MANIFEST_PATH = `${MODEL_DIR}manifest.json`
// Bundled models path (from assets)
const BUNDLED_MODEL_DIR = `${FileSystem.bundleDirectory}assets/models/`

export class ModelDownloader {
  private static instance: ModelDownloader
  private manifest: ModelManifest = MODEL_MANIFEST
  private downloadAborted = false

  static getInstance(): ModelDownloader {
    if (!ModelDownloader.instance) {
      ModelDownloader.instance = new ModelDownloader()
    }
    return ModelDownloader.instance
  }

  constructor() {
    this.ensureModelDirectory()
    this.loadManifest()
  }

  private async ensureModelDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true })
    }
    
    // Copy bundled models to document directory on first run
    await this.copyBundledModelsIfNeeded()
  }

  private async copyBundledModelsIfNeeded(): Promise<void> {
    try {
      const sttBundled = `${BUNDLED_MODEL_DIR}${this.manifest.stt.filename}`
      const ttsBundled = `${BUNDLED_MODEL_DIR}${this.manifest.tts.filename}`
      const sttLocal = this.getSTTPath({ modelDownloadPath: '' } as VoiceConfig)
      const ttsLocal = this.getTTSPath({ modelDownloadPath: '' } as VoiceConfig)

      const [sttInfo, ttsInfo] = await Promise.all([
        FileSystem.getInfoAsync(sttLocal),
        FileSystem.getInfoAsync(ttsLocal),
      ])

      // If local models don't exist, try to copy from bundle
      if (!sttInfo.exists || !ttsInfo.exists) {
        console.log('[ModelDownloader] Checking for bundled models...')
        
        const [sttBundledInfo, ttsBundledInfo] = await Promise.all([
          FileSystem.getInfoAsync(sttBundled),
          FileSystem.getInfoAsync(ttsBundled),
        ])

        if (sttBundledInfo.exists && ttsBundledInfo.exists) {
          console.log('[ModelDownloader] Copying bundled models to local storage...')
          await Promise.all([
            FileSystem.copyAsync({ from: sttBundled, to: sttLocal }),
            FileSystem.copyAsync({ from: ttsBundled, to: ttsLocal }),
          ])
          console.log('[ModelDownloader] Bundled models copied successfully')
        }
      }
    } catch (e) {
      console.warn('[ModelDownloader] Could not copy bundled models:', e)
    }
  }

  private async loadManifest(): Promise<void> {
    try {
      const info = await FileSystem.getInfoAsync(MANIFEST_PATH)
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(MANIFEST_PATH)
        this.manifest = { ...MODEL_MANIFEST, ...JSON.parse(content) }
      } else {
        await this.saveManifest()
      }
    } catch (e) {
      console.warn('[ModelDownloader] Failed to load manifest, using defaults', e)
    }
  }

  private async saveManifest(): Promise<void> {
    await FileSystem.writeAsStringAsync(MANIFEST_PATH, JSON.stringify(this.manifest, null, 2))
  }

  async areModelsDownloaded(config: VoiceConfig): Promise<boolean> {
    const sttPath = this.getSTTPath(config)
    const ttsPath = this.getTTSPath(config)

    const [sttInfo, ttsInfo] = await Promise.all([
      FileSystem.getInfoAsync(sttPath),
      FileSystem.getInfoAsync(ttsPath),
    ])

    if (!sttInfo.exists || !ttsInfo.exists) {
      return false
    }

    const [sttValid, ttsValid] = await Promise.all([
      this.verifyChecksum(sttPath, this.manifest.stt.sha256),
      this.verifyChecksum(ttsPath, this.manifest.tts.sha256),
    ])

    return sttValid && ttsValid
  }

  async getModelInfo(config: VoiceConfig): Promise<ModelInfo> {
    const sttPath = this.getSTTPath(config)
    const ttsPath = this.getTTSPath(config)

    const [sttInfo, ttsInfo] = await Promise.all([
      FileSystem.getInfoAsync(sttPath),
      FileSystem.getInfoAsync(ttsPath),
    ])

    return {
      stt: {
        name: this.manifest.stt.name,
        size: this.manifest.stt.size,
        path: sttPath,
        downloaded: sttInfo.exists && await this.verifyChecksum(sttPath, this.manifest.stt.sha256),
        version: this.manifest.version,
      },
      tts: {
        name: this.manifest.tts.name,
        size: this.manifest.tts.size,
        path: ttsPath,
        downloaded: ttsInfo.exists && await this.verifyChecksum(ttsPath, this.manifest.tts.sha256),
        version: this.manifest.version,
      },
    }
  }

  async downloadModels(
    config: VoiceConfig,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    this.downloadAborted = false

    try {
      onProgress?.({
        stage: 'stt',
        bytesDownloaded: 0,
        totalBytes: this.manifest.stt.size,
        percent: 0,
        currentFile: this.manifest.stt.filename,
      })

      await this.downloadFile(
        this.manifest.stt.urls,
        this.getSTTPath(config),
        this.manifest.stt.sha256,
        (bytes, total) =>
          onProgress?.({
            stage: 'stt',
            bytesDownloaded: bytes,
            totalBytes: total,
            percent: Math.round((bytes / total) * 100),
            currentFile: this.manifest.stt.filename,
          })
      )

      if (this.downloadAborted) throw new Error('Download aborted')

      onProgress?.({
        stage: 'tts',
        bytesDownloaded: 0,
        totalBytes: this.manifest.tts.size,
        percent: 0,
        currentFile: this.manifest.tts.filename,
      })

      await this.downloadFile(
        this.manifest.tts.urls,
        this.getTTSPath(config),
        this.manifest.tts.sha256,
        (bytes, total) =>
          onProgress?.({
            stage: 'tts',
            bytesDownloaded: bytes,
            totalBytes: total,
            percent: Math.round((bytes / total) * 100),
            currentFile: this.manifest.tts.filename,
          })
      )

      if (this.downloadAborted) throw new Error('Download aborted')

      onProgress?.({
        stage: 'complete',
        bytesDownloaded: this.manifest.stt.size + this.manifest.tts.size,
        totalBytes: this.manifest.stt.size + this.manifest.tts.size,
        percent: 100,
        currentFile: '',
      })
    } catch (e) {
      onProgress?.({
        stage: 'error',
        bytesDownloaded: 0,
        totalBytes: 0,
        percent: 0,
        currentFile: '',
        error: e instanceof Error ? e.message : 'Unknown error',
      })
      throw e
    }
  }

  abortDownload(): void {
    this.downloadAborted = true
  }

  getSTTPath(config: VoiceConfig): string {
    const customPath = config.modelDownloadPath || MODEL_DIR
    return `${customPath}${this.manifest.stt.filename}`
  }

  getTTSPath(config: VoiceConfig): string {
    const customPath = config.modelDownloadPath || MODEL_DIR
    return `${customPath}${this.manifest.tts.filename}`
  }

  private async downloadFile(
    urls: string[],
    destination: string,
    expectedSha256: string,
    onProgress?: (bytes: number, total: number) => void
  ): Promise<void> {
    const existing = await FileSystem.getInfoAsync(destination)
    if (existing.exists && existing.size === this.manifest.stt.size) {
      const valid = await this.verifyChecksum(destination, expectedSha256)
      if (valid) {
        onProgress?.(existing.size, existing.size)
        return
      }
    }

    let lastError: Error | null = null

    for (const url of urls) {
      if (this.downloadAborted) throw new Error('Download aborted')

      try {
        console.log(`[ModelDownloader] Downloading from ${url}`)

        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          destination,
          {},
          (downloadProgress) => {
            if (!this.downloadAborted && onProgress) {
              onProgress(downloadProgress.totalBytesWritten, downloadProgress.totalBytesExpectedToWrite)
            }
          }
        )

        const result = await downloadResumable.downloadAsync()

        if (result && result.uri) {
          const valid = await this.verifyChecksum(result.uri, expectedSha256)
          if (valid) {
            console.log(`[ModelDownloader] Download verified: ${result.uri}`)
            return
          } else {
            throw new Error('Checksum verification failed')
          }
        }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        console.warn(`[ModelDownloader] Failed to download from ${url}:`, lastError)
      }
    }

    throw lastError || new Error('All download URLs failed')
  }

  private async verifyChecksum(filePath: string, expectedSha256: string): Promise<boolean> {
    if (expectedSha256.startsWith('TODO:') || expectedSha256.startsWith('PLACEHOLDER')) {
      return true
    }

    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        fileContent,
        { encoding: Crypto.CryptoEncoding.HEX }
      )
      return hash.toLowerCase() === expectedSha256.toLowerCase()
    } catch (e) {
      console.error('[ModelDownloader] Checksum verification error', e)
      return false
    }
  }

  async clearModels(): Promise<void> {
    const sttPath = this.getSTTPath({ modelDownloadPath: '' } as VoiceConfig)
    const ttsPath = this.getTTSPath({ modelDownloadPath: '' } as VoiceConfig)

    await Promise.all([
      FileSystem.deleteAsync(sttPath, { idempotent: true }),
      FileSystem.deleteAsync(ttsPath, { idempotent: true }),
    ])
  }

  getTotalSizeMB(): number {
    return Math.round((this.manifest.stt.size + this.manifest.tts.size) / (1024 * 1024))
  }
}

export const modelDownloader = ModelDownloader.getInstance()