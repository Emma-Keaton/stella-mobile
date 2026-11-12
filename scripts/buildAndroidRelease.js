/**
 * Stella Mobile — Android Release Build Script
 * Mirrors anything-llm mobile's scripts/buildAndroidRelease.js
 *
 * Steps:
 * 1. Clean gradle build
 * 2. Build AAB bundle (release)
 * 3. Save JS sourcemap for Crashlytics
 * 4. Use bundletool to extract universal APK from AAB
 * 5. Sign APK with upload keystore
 * 6. Output to release/v<version>/ (.aab + .apk + version.txt)
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function loadDotEnv(envPath = '.env') {
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match) continue
    const key = match[1]
    const value = match[2].replace(/^(["'])(.*)\1$/, '$2')
    if (!process.env[key]) process.env[key] = value
  }
}
loadDotEnv()

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = packageJson.version

console.log(`Building Stella Mobile Android release with version: ${version}`)

const isWindows = process.platform === 'win32'

function runCommand(command, options = {}) {
  const defaultOptions = { stdio: 'inherit', shell: true }
  execSync(command, { ...defaultOptions, ...options })
}

function extractArchive(zipPath, outputDir) {
  if (isWindows) {
    const extractCommand = `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outputDir}' -Force"`
    runCommand(extractCommand)
  } else {
    const extractCommand = `unzip -o "${zipPath}" -d "${outputDir}"`
    runCommand(extractCommand)
  }
}

function getJavaCommand() {
  if (isWindows) {
    const javaPaths = [
      'java',
      'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
      'C:\\Program Files\\Java\\jdk-11\\bin\\java.exe',
      'C:\\Program Files\\Java\\jdk-8\\bin\\java.exe',
    ]
    for (const javaPath of javaPaths) {
      try {
        runCommand(`"${javaPath}" -version`, { stdio: 'pipe' })
        return javaPath
      } catch (e) {
        // continue
      }
    }
    throw new Error('Java not found. Please install Java and ensure it is in your PATH.')
  }
  return 'java'
}

try {
  if (fs.existsSync('release')) fs.rmSync('release', { recursive: true })

  console.log('Cleaning the build...')
  runCommand(isWindows ? 'cd android && gradlew clean && cd ..' : 'cd android && ./gradlew clean && cd ..')

  console.log('Building the AAB bundle...')
  runCommand(isWindows ? 'cd android && gradlew bundleRelease && cd ..' : 'cd android && ./gradlew bundleRelease && cd ..')

  // Save JS sourcemap for Crashlytics
  const versionCode = fs.readFileSync('android/app/build.gradle', 'utf8').match(/versionCode\s+(\d+)/)[1]
  const sourcemapFolder = `sourcemaps/android/v${version}-${versionCode}`
  fs.mkdirSync(sourcemapFolder, { recursive: true })
  fs.copyFileSync(
    'android/app/build/generated/sourcemaps/react/release/index.android.bundle.map',
    path.join(sourcemapFolder, 'index.android.bundle.map')
  )
  console.log(`🗺️  Sourcemap saved to: ${sourcemapFolder}`)

  // Create universal APK with version in filename
  console.log('Creating universal APK with version...')
  const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab'
  const apksOutputPath = `android/app/build/outputs/apks/app-release-v${version}-universal.apks`

  const keystorePath = 'android/app/stella-mobile-upload-key.keystore'
  const keystorePassword = process.env.APP_RELEASE_STORE_PASSWORD
  const keystoreAlias = 'stella-mobile-keystore'
  if (!keystorePassword) {
    console.error('APP_RELEASE_STORE_PASSWORD environment variable is not set.')
    process.exit(1)
  }
  if (!fs.existsSync(keystorePath)) {
    console.error(`Keystore file not found at ${keystorePath}`)
    process.exit(1)
  }

  const javaCommand = getJavaCommand()

  const bundletoolCommand = [
    `"${javaCommand}" -jar scripts/bundletool-1.18.1.jar build-apks`,
    `--bundle="${aabPath}"`,
    `--output="${apksOutputPath}"`,
    '--mode=universal',
    `--ks="${keystorePath}"`,
    `--ks-key-alias="${keystoreAlias}"`,
    `--ks-pass="pass:${keystorePassword}"`,
  ].join(' ')

  runCommand(bundletoolCommand)

  const outputDir = `android/app/build/outputs/apks/universal-v${version}`
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const zipPath = `android/app/build/outputs/apks/app-release-v${version}-universal.zip`
  fs.copyFileSync(apksOutputPath, zipPath)

  console.log('Extracting universal APK...')
  extractArchive(zipPath, outputDir)

  const apkPath = path.join(outputDir, 'universal.apk')
  fs.renameSync(apkPath, path.join(outputDir, 'stella-mobile-universal.apk'))

  fs.unlinkSync(zipPath)
  fs.unlinkSync(apksOutputPath)

  // Generate release output
  const releaseFolder = `release/v${version}`
  if (!fs.existsSync(releaseFolder)) fs.mkdirSync(releaseFolder, { recursive: true })
  fs.copyFileSync(aabPath, path.join(releaseFolder, `stella-mobile-v${version}.aab`))

  const cdnFolder = path.join(releaseFolder, 'cdn')
  if (!fs.existsSync(cdnFolder)) fs.mkdirSync(cdnFolder, { recursive: true })
  fs.copyFileSync(path.join(outputDir, 'stella-mobile-universal.apk'), path.join(cdnFolder, 'stella-mobile-universal.apk'))
  fs.writeFileSync(path.join(cdnFolder, 'version.txt'), version)

  console.log(`✅ Android release build completed successfully!`)
  console.log(`📱 Universal APK: ${path.join(cdnFolder, 'stella-mobile-universal.apk')}`)
  console.log(`📦 AAB bundle: ${path.join(releaseFolder, `stella-mobile-v${version}.aab`)}`)
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}
