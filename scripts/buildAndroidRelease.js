/**
 * Stella Mobile — Android Release Build Script
 * Mirrors anything-llm mobile's scripts/buildAndroidRelease.js
 *
 * Steps:
 * 1. Preflight validation (env, keystore, gradle, signing config)
 * 2. Clean gradle build
 * 3. Build AAB bundle (release)
 * 4. Save JS sourcemap for Crashlytics
 * 5. Use bundletool to extract universal APK from AAB
 * 6. Sign APK with upload keystore
 * 7. Output to release/v<version>/ (.aab + .apk + version.txt)
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
/**
 * PREFLIGHT VALIDATION
 * Fails fast if any required configuration is missing or invalid.
 */
function runPreflightChecks() {
  console.log('\n🔍 Running preflight checks...\n')
  let hasErrors = false

  // 1. Required environment variables
  const requiredEnvVars = [
    'APP_RELEASE_STORE_PASSWORD',
    'APP_RELEASE_KEY_PASSWORD',
    'KEY_ALIAS',
  ]
  const optionalEnvVars = ['STORE_FILE']

  console.log('  Checking environment variables...')
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (!value || value.trim() === '') {
      console.error(`    ❌ Missing required env var: ${envVar}`)
      hasErrors = true
    } else if (value.includes('CHANGE_ME') || value.includes('placeholder') || value === 'your_password_here') {
      console.error(`    ❌ Placeholder detected in ${envVar} — replace with real value`)
      hasErrors = true
    } else {
      console.log(`    ✅ ${envVar} is set`)
    }
  }
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      console.log(`    ✅ ${envVar} is set (optional)`)
    } else {
      console.log(`    ℹ️  ${envVar} not set (optional, will use default)`)
    }
  }

  // 2. Keystore file exists and is readable
  const keystorePath = process.env.STORE_FILE || 'android/app/stella-mobile-upload-key.keystore'
  console.log('\n  Checking keystore...')
  if (!fs.existsSync(keystorePath)) {
    console.error(`    ❌ Keystore not found at: ${keystorePath}`)
    hasErrors = true
  } else {
    try {
      fs.accessSync(keystorePath, fs.constants.R_OK)
      const stats = fs.statSync(keystorePath)
      if (stats.size === 0) {
        console.error(`    ❌ Keystore file is empty: ${keystorePath}`)
        hasErrors = true
      } else {
        console.log(`    ✅ Keystore found and readable (${stats.size} bytes)`)
      }
    } catch (e) {
      console.error(`    ❌ Keystore not readable: ${e.message}`)
      hasErrors = true
    }
  }

  // 3. gradlew exists and is executable
  const gradlewPath = isWindows ? 'android\\gradlew.bat' : 'android/gradlew'
  console.log('\n  Checking Gradle wrapper...')
  if (!fs.existsSync(gradlewPath)) {
    console.error(`    ❌ Gradle wrapper not found at: ${gradlewPath}`)
    hasErrors = true
  } else {
    if (!isWindows) {
      try {
        fs.accessSync(gradlewPath, fs.constants.X_OK)
        console.log(`    ✅ gradlew is executable`)
      } catch (e) {
        console.error(`    ❌ gradlew is not executable (run: chmod +x android/gradlew)`)
        hasErrors = true
      }
    } else {
      console.log(`    ✅ gradlew.bat found`)
    }
  }

  // 4. android/app/build.gradle has release signing config + minifyEnabled true
  const buildGradlePath = 'android/app/build.gradle'
  console.log('\n  Checking build.gradle signing config...')
  if (!fs.existsSync(buildGradlePath)) {
    console.error(`    ❌ build.gradle not found at: ${buildGradlePath}`)
    hasErrors = true
  } else {
    const gradleContent = fs.readFileSync(buildGradlePath, 'utf8')
    const checks = [
      { pattern: /signingConfigs\s*\{[\s\S]*?release\s*\{/, desc: 'release signingConfig block' },
      { pattern: /storeFile\s+file\(/, desc: 'keystore storeFile reference' },
      { pattern: /storePassword/, desc: 'storePassword configuration' },
      { pattern: /keyAlias/, desc: 'keyAlias configuration' },
      { pattern: /keyPassword/, desc: 'keyPassword configuration' },
      { pattern: /buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/, desc: 'release buildType uses signingConfigs.release' },
      { pattern: /minifyEnabled\s+true/, desc: 'minifyEnabled true' },
      { pattern: /proguardFiles.*proguard-rules\.pro/, desc: 'proguard-rules.pro referenced' },
    ]
    for (const check of checks) {
      if (check.pattern.test(gradleContent)) {
        console.log(`    ✅ ${check.desc}`)
      } else {
        console.error(`    ❌ Missing: ${check.desc}`)
        hasErrors = true
      }
    }
  }

  // 5. No placeholder secrets in keystore.properties (if it exists)
  const keystorePropsPath = 'android/keystore.properties'
  console.log('\n  Checking keystore.properties for placeholders...')
  if (fs.existsSync(keystorePropsPath)) {
    const propsContent = fs.readFileSync(keystorePropsPath, 'utf8')
    const placeholderPatterns = [
      /CHANGE_ME/i,
      /placeholder/i,
      /your_.*_here/i,
      /^STORE_PASSWORD\s*=\s*$/m,
      /^KEY_PASSWORD\s*=\s*$/m,
    ]
    let foundPlaceholder = false
    for (const pattern of placeholderPatterns) {
      if (pattern.test(propsContent)) {
        console.error(`    ❌ Placeholder detected in keystore.properties`)
        foundPlaceholder = true
        hasErrors = true
        break
      }
    }
    if (!foundPlaceholder) {
      console.log(`    ✅ No placeholders in keystore.properties`)
    }
  } else {
    console.log(`    ℹ️  keystore.properties not found (using env vars)`)
  }

  // 6. bundletool exists
  const bundletoolPath = 'scripts/bundletool-1.18.1.jar'
  console.log('\n  Checking bundletool...')
  if (!fs.existsSync(bundletoolPath)) {
    console.error(`    ❌ bundletool not found at: ${bundletoolPath}`)
    hasErrors = true
  } else {
    console.log(`    ✅ bundletool found`)
  }

  console.log('') // blank line

  if (hasErrors) {
    console.error('❌ Preflight checks FAILED. Fix the issues above before building.')
    process.exit(1)
  } else {
    console.log('✅ All preflight checks passed.\n')
  }
}

try {
  // === PREFLIGHT ===
  runPreflightChecks()

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
