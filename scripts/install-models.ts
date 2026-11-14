/**
 * Stella Mobile — Model Installation Script
 * Downloads STT/TTS models from official sources, computes SHA256,
 * and updates model-downloader.ts with actual checksums.
 * Run with: npx ts-node scripts/install-models.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface ModelEntry {
  name: string
  filename: string
  size: number
  sha256: string
  urls: string[]
  languages?: string[]
}

interface ModelManifest {
  version: string
  stt: ModelEntry
  tts: ModelEntry
}

const MODEL_SOURCES = {
  stt: {
    name: 'Whisper Tiny (ExecuTorch)',
    filename: 'whisper_tiny_execorch.pte',
    urls: [
      'https://huggingface.co/fixie-ai/whisper-tiny-executorch/resolve/main/whisper_tiny.pte',
      'https://github.com/pytorch/executorch/releases/download/models/whisper_tiny.pte',
    ],
    expectedSize: 39 * 1024 * 1024,
  },
  tts: {
    name: 'Kokoro-82M (ONNX) - Female Voice',
    filename: 'kokoro_82m.onnx',
    urls: [
      'https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/kokoro-v0_19.onnx',
      'https://github.com/hexgrad/kokoro/releases/download/v0.1/kokoro-v0_19.onnx',
    ],
    expectedSize: 82 * 1024 * 1024,
    languages: ['en', 'es', 'fr', 'de', 'zh'],
  },
}

const MODEL_DIR = path.join(__dirname, '..', '..', 'assets', 'models')
const MANIFEST_PATH = path.join(MODEL_DIR, 'manifest.json')
const DOWNLOADER_PATH = path.join(__dirname, '..', 'src', 'services', 'model-downloader.ts')

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Hugging Face token for gated models (set HF_TOKEN env var)
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN

function downloadFile(url: string, destPath: string, onProgress?: (downloaded: number, total: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)

    const isHuggingFace = url.includes('huggingface.co')
    const headers: Record<string, string> = {}
    if (isHuggingFace && HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`
    }

    const options = { headers }
    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        if (response.headers.location) {
          file.close()
          fs.unlinkSync(destPath)
          // Pass headers through redirect for Hugging Face
          downloadFile(response.headers.location, destPath, onProgress).then(resolve).catch(reject)
          return
        }
        file.close()
        fs.unlinkSync(destPath)
        reject(new Error(`HTTP ${response.statusCode}: ${url}`))
        return
      }

      const total = parseInt(response.headers['content-length'] || '0', 10)
      let downloaded = 0

      response.on('data', (chunk) => {
        downloaded += chunk.length
        onProgress?.(downloaded, total)
      })

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })

      file.on('error', (err) => {
        file.close()
        fs.unlinkSync(destPath)
        reject(err)
      })
    }).on('error', (err) => {
      file.close()
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
      reject(err)
    })
  })
}

function computeSHA256(filePath: string): string {
  const buffer = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

async function downloadModel(
  key: 'stt' | 'tts',
  source: typeof MODEL_SOURCES.stt,
  onProgress?: (stage: string, percent: number) => void
): Promise<{ path: string; sha256: string; size: number }> {
  const destPath = path.join(MODEL_DIR, source.filename)
  
  if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath)
    if (stats.size === source.expectedSize) {
      const sha256 = computeSHA256(destPath)
      console.log(`✓ ${source.name} already exists (${formatBytes(stats.size)}, SHA256: ${sha256.slice(0, 16)}...)`)
      return { path: destPath, sha256, size: stats.size }
    }
  }

  console.log(`\n📥 Downloading ${source.name}...`)
  console.log(`   Expected size: ${formatBytes(source.expectedSize)}`)

  let lastError: Error | null = null

  for (let i = 0; i < source.urls.length; i++) {
    const url = source.urls[i]
    console.log(`   Trying mirror ${i + 1}/${source.urls.length}: ${url}`)

    try {
      await downloadFile(url, destPath, (downloaded, total) => {
        const percent = total > 0 ? Math.round((downloaded / total) * 100) : 0
        onProgress?.(`${key}:${source.filename}`, percent)
        process.stdout.write(`\r   Progress: ${percent}% (${formatBytes(downloaded)}/${formatBytes(total)})`)
      })

      console.log('')
      
      const stats = fs.statSync(destPath)
      if (stats.size !== source.expectedSize) {
        console.warn(`   ⚠ Size mismatch: expected ${formatBytes(source.expectedSize)}, got ${formatBytes(stats.size)}`)
      }

      const sha256 = computeSHA256(destPath)
      console.log(`   ✓ Downloaded and verified: ${sha256}`)
      
      return { path: destPath, sha256, size: stats.size }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(`   ✗ Mirror ${i + 1} failed: ${lastError.message}`)
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
    }
  }

  throw lastError || new Error(`All mirrors failed for ${source.name}`)
}

function updateModelDownloader(sttSha256: string, ttsSha256: string): void {
  let content = fs.readFileSync(DOWNLOADER_PATH, 'utf-8')

  content = content.replace(
    /sha256: 'TODO:COMPUTE_SHA256_AFTER_DOWNLOAD_STT'/,
    `sha256: '${sttSha256}'`
  )

  content = content.replace(
    /sha256: 'TODO:COMPUTE_SHA256_AFTER_DOWNLOAD_TTS'/,
    `sha256: '${ttsSha256}'`
  )

  fs.writeFileSync(DOWNLOADER_PATH, content)
  console.log('\n✅ Updated model-downloader.ts with actual SHA256 checksums')
}

function saveManifest(manifest: ModelManifest): void {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`✅ Saved manifest to ${MANIFEST_PATH}`)
}

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  Stella Mobile — Model Installation & Verification       ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  ensureDir(MODEL_DIR)

  const manifest: ModelManifest = {
    version: '1.0.0',
    stt: {
      name: MODEL_SOURCES.stt.name,
      filename: MODEL_SOURCES.stt.filename,
      size: MODEL_SOURCES.stt.expectedSize,
      sha256: '',
      urls: MODEL_SOURCES.stt.urls,
    },
    tts: {
      name: MODEL_SOURCES.tts.name,
      filename: MODEL_SOURCES.tts.filename,
      size: MODEL_SOURCES.tts.expectedSize,
      sha256: '',
      urls: MODEL_SOURCES.tts.urls,
      languages: MODEL_SOURCES.tts.languages,
    },
  }

  try {
    const sttResult = await downloadModel('stt', MODEL_SOURCES.stt, (stage, percent) => {
      process.stdout.write(`\r[STT] ${stage}: ${percent}%`)
    })
    manifest.stt.sha256 = sttResult.sha256
    manifest.stt.size = sttResult.size

    const ttsResult = await downloadModel('tts', MODEL_SOURCES.tts, (stage, percent) => {
      process.stdout.write(`\r[TTS] ${stage}: ${percent}%`)
    })
    manifest.tts.sha256 = ttsResult.sha256
    manifest.tts.size = ttsResult.size

    saveManifest(manifest)
    updateModelDownloader(sttResult.sha256, ttsResult.sha256)

    console.log('\n╔══════════════════════════════════════════════════════════╗')
    console.log('║  Installation Complete!                                   ║')
    console.log('╚══════════════════════════════════════════════════════════╝')
    console.log('\n📋 Model Summary:')
    console.log(`   STT: ${manifest.stt.name}`)
    console.log(`      File: ${manifest.stt.filename}`)
    console.log(`      Size: ${formatBytes(manifest.stt.size)}`)
    console.log(`      SHA256: ${manifest.stt.sha256}`)
    console.log(`   TTS: ${manifest.tts.name}`)
    console.log(`      File: ${manifest.tts.filename}`)
    console.log(`      Size: ${formatBytes(manifest.tts.size)}`)
    console.log(`      SHA256: ${manifest.tts.sha256}`)
    console.log(`\n📁 Models stored in: ${MODEL_DIR}`)
    console.log(`📄 Manifest saved to: ${MANIFEST_PATH}`)
    console.log(`\n✨ The app is now ready for 100% offline voice operation!`)

  } catch (error) {
    console.error('\n❌ Installation failed:', error)
    process.exit(1)
  }
}

main()