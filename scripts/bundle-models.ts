/**
 * Stella Mobile — Bundle Models for Production
 * Copies downloaded models to assets/models for app bundling.
 * Run after `npm run install:models` to prepare for production build.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_DIR = path.join(__dirname, '..', '..', 'assets', 'models')
const DEST_DIR = path.join(__dirname, '..', '..', 'android', 'app', 'src', 'main', 'assets', 'models')
const IOS_DEST_DIR = path.join(__dirname, '..', '..', 'ios', 'StellaMobile', 'models')

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyFile(src: string, dest: string): void {
  fs.copyFileSync(src, dest)
  const stats = fs.statSync(src)
  console.log(`  ✓ ${path.basename(src)} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`)
}

function main(): void {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  Stella Mobile — Bundle Models for Production            ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  const sttFile = path.join(SOURCE_DIR, 'whisper_tiny_execorch.pte')
  const ttsFile = path.join(SOURCE_DIR, 'kokoro_82m.onnx')
  const manifestFile = path.join(SOURCE_DIR, 'manifest.json')

  // Check source files exist
  const missing = [sttFile, ttsFile, manifestFile].filter(f => !fs.existsSync(f))
  if (missing.length > 0) {
    console.error('❌ Missing model files. Run `npm run install:models` first.')
    missing.forEach(f => console.error(`   Missing: ${f}`))
    process.exit(1)
  }

  // Copy to Android assets
  console.log('\n📦 Copying to Android assets...')
  ensureDir(DEST_DIR)
  copyFile(sttFile, path.join(DEST_DIR, 'whisper_tiny_execorch.pte'))
  copyFile(ttsFile, path.join(DEST_DIR, 'kokoro_82m.onnx'))
  copyFile(manifestFile, path.join(DEST_DIR, 'manifest.json'))

  // Copy to iOS resources
  console.log('\n📦 Copying to iOS resources...')
  ensureDir(IOS_DEST_DIR)
  copyFile(sttFile, path.join(IOS_DEST_DIR, 'whisper_tiny_execorch.pte'))
  copyFile(ttsFile, path.join(IOS_DEST_DIR, 'kokoro_82m.onnx'))
  copyFile(manifestFile, path.join(IOS_DEST_DIR, 'manifest.json'))

  console.log('\n✅ Models bundled successfully!')
  console.log(`   Android: ${DEST_DIR}`)
  console.log(`   iOS: ${IOS_DEST_DIR}`)
  console.log('\n📱 Now you can build the app with models included.')
  console.log('   The app will copy them to local storage on first launch.')
}

main()