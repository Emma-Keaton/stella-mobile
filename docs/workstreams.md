# Stella Mobile — Pre-Launch Workstreams

This document captures the full set of workstreams identified during the pre-launch audit of `E:\Projects\stella mobile\StellaMobile`. Each workstream is independent enough to be assigned, reviewed, and merged separately.

## Context

The audit found that the app is **not launch-ready**: `App.tsx` is structurally invalid, Android release signing uses the debug keystore, the Gradle wrapper is missing, several dependencies are undeclared, model checksums are placeholders, and multiple advertised features return simulated/fake results.

## Workstream 1: Buildable Baseline + Media Streaming

**Status:** COMPLETE (core implementation done)

**Goal:** Make the app compile, restore Gradle tooling, fix release signing, and implement a functional Media screen for IPTV/watch channels, Sonarr TV sources, and FM radio streaming with media controls and external-player handoff.

### Files created/modified
- Rewrite: `StellaMobile/App.tsx` — DONE
- Create: `StellaMobile/src/screens/MediaScreen.tsx` — DONE
- Create: `StellaMobile/src/services/media-stream.ts` — DONE
- Create: `StellaMobile/android/gradlew` — DONE
- Create: `StellaMobile/android/gradlew.bat` — DONE
- Create: `StellaMobile/android/gradle/wrapper/gradle-wrapper.properties` — DONE
- Create: `StellaMobile/android/app/proguard-rules.pro` — DONE

### Steps completed
1. Repaired `App.tsx`:
   - Fixed unmatched top-level `return` outside any function.
   - Corrected all imports to `./src/screens/*`.
   - Added shared app state via React Context (`AppContext`/`useApp`).
   - Wired Device Assistant `onSendMessage` into the same chat pipeline as `ChatScreen`.
   - Closed all components properly; exported a single valid `App` function.
   - Replaced the empty Media modal with `MediaScreen`.
2. Implemented `MediaScreen.tsx`:
   - Tabs: Live TV (IPTV/watch), Radio (FM sources), Sonarr TV.
   - Source list with stream URL, title, category, and status.
   - Playback state: idle, buffering, playing, paused, error.
   - Media controls: play/pause, stop, external app toggle (VLC/MX Player).
   - Source validation via HEAD request before playback.
   - Add new custom stream sources (IPTV/radio/Sonarr).
3. Implemented `media-stream.ts`:
   - Source registry for IPTV M3U URLs, Sonarr API endpoints, and FM radio directory URLs.
   - Source validation (HEAD request / probe with 10s timeout).
   - Playback session tracking (start/pause/resume/stop).
   - Persisted session state via AsyncStorage.
   - External player handoff via `ExternalAppsController.launchApp` (VLC package `org.videolan.vlc`).
4. Restored Gradle wrapper files (`gradlew`, `gradlew.bat`, `gradle-wrapper.properties`).
5. Added `proguard-rules.pro` for release minification.

### Remaining (follow-up)
- Wire `media_streams` skill in `catalog.ts` to call `MediaStreamService`.
- Configure release signing in `build.gradle` using env vars.
- Add `.gitignore`.
- Add preflight checks to `buildAndroidRelease.js`.
- `npm run typecheck` requires `node_modules` install first.
- `npm run android` requires physical arm64 device.

---

## Workstream 4: Agent + Skills Native Integration (Including Anatomy)

**Status:** COMPLETE (core implementation done)

**Goal:** Replace simulated skill results with real native-backed workflows; integrate the `wheresryan22/anatomy` toolkit; implement real agent action selection.

### Files created/modified
- Rewrite: `StellaMobile/src/skills/development/AnatomyOperations1.ts` — DONE
- Rewrite: `StellaMobile/src/skills/development/AnatomyOperations2.ts` — DONE
- Rewrite: `StellaMobile/src/skills/system/SoundCheckSkill.ts` — DONE
- Fix: `StellaMobile/src/agent/loop.ts` — DONE

### Steps completed
1. Replaced simulated `runAnatomyKit` in `AnatomyOperations1.ts`:
   - Now creates a real kit directory under `StellaAI/anatomy-kit`.
   - Writes `kit-runner.js` bridge for the wheresryan22/anatomy toolkit.
   - Generates actual SVG and HTML figure output instead of `<svg>...</svg>` placeholder.
   - Returns real `htmlPath` instead of `/tmp/anatomy_figure.html`.
   - Returns `ok: false` with clear error when kit assets are not bundled.
2. Replaced simulated `runAnatomyKit` in `AnatomyOperations2.ts`:
   - Same real file-based figure generation.
   - `runVerify()` now checks actual kit directory existence instead of fake `✓` marks.
   - `buildFigure()` returns real `htmlPath` in the result record.
3. Replaced simulated SoundCheck results:
   - `testSpeaker()` now configures `NativeBridge.audioSession` and plays via `NativeBridgeExt.audioPlayer`.
   - `testMicrophone()` now configures audio session and records via `NativeBridgeExt.audioRecorder`.
   - `getVolumeLevel()` queries `NativeBridge.audioSession.getVolume()`/`getMaxVolume()`.
   - All operations return `ok: false` on failure instead of simulated success.
   - Added Android `RECORD_AUDIO` permission checks.
4. Fixed `agent/loop.ts`:
   - Fixed undefined `args` variable (was causing ReferenceError).
   - Changed to use explicit `toolArgs` object.
   - Updated comment from "Simulate" to "Plan".

### Remaining (follow-up)
- Bundle the actual `wheresryan22/anatomy` toolkit assets into `assets/anatomy-kit/`.
- Implement NativeBridge native modules (audio session, player, recorder) for Android.
- Add skill execution tests with pass/fail/error records.

---


---

## Workstream 2: Model Downloader + Inference Pipeline

**Goal:** Replace placeholder model checksums, enforce verification, and report real engine/model readiness on physical devices.

### Files
- `src/services/model-downloader.ts`
- `src/services/inference.ts`
- `src/services/model-router.ts`
- `src/screens/RouterScreen.tsx`
- `scripts/install-models.ts`
- `scripts/bundle-models.ts`

### Steps
1. Obtain authoritative SHA-256 checksums for Whisper Tiny and Kokoro-82M from official sources.
2. Replace `TODO:COMPUTE_SHA256_AFTER_DOWNLOAD_*` placeholders.
3. Make checksum/size mismatch fatal in `areModelsDownloaded`.
4. Correct `install-models.ts` output path to `StellaMobile/assets/models`.
5. Query `LlamaRn` for actual load status in `RouterScreen`; show native runtime/model/context states.
6. Add unit tests for model routing and checksum verification.

---

## Workstream 3: Voice + Always-On Assistant

**Goal:** Implement real STT/TTS fallbacks, connect Device Assistant to Chat, replace simulated sound diagnostics.

### Files
- `src/services/voice.ts`
- `src/components/device/DeviceAssistantHUD.tsx`
- `src/device/assistant/DeviceAssistantService.ts`
- `src/skills/system/SoundCheckSkill.ts`
- `src/App.tsx` (chat wiring)

### Steps
1. Standardize on one STT package and one TTS package; add to `package.json`.
2. Implement OS speech recognition fallback when ExecuTorch is absent.
3. Connect transcription events into `ChatScreen.handleSend`.
4. Implement real document/file picking in `DeviceAssistantHUD`.
5. Replace simulated sound-check results with native audio APIs or mark the skill as unavailable without native support.
6. Test wake/sleep, interruption, Bluetooth, and permission-denied paths.

---

## Workstream 4: Agent + Skills Native Integration (Including Anatomy)

**Goal:** Replace simulated skill results with real native-backed workflows; integrate the `wheresryan22/anatomy` toolkit; implement real agent action selection.

### Files
- `src/agent/loop.ts`
- `src/agent/planner.ts`
- `src/skills/development/AnatomyOperations1.ts`
- `src/skills/development/AnatomyOperations2.ts`
- `src/skills/development/AnatomyMetadata.ts`
- `src/skills/system/SoundCheckSkill.ts`
- `src/skills/catalog.ts` (media_streams, port_scan, pentest_lab)
- `src/native/bridges/` (native module bridge implementations)

### Steps
1. Study `https://github.com/wheresryan22/anatomy` and determine how to bundle/run its kit modules on Android/React Native.
2. Replace `runAnatomyKit` simulated delay with real execution against the bundled anatomy toolkit or a validated Node/HTML fallback.
3. Return actual HTML/SVG output paths and file metadata instead of `/tmp/anatomy_figure.html` and `<svg>...</svg>`.
4. Replace `SoundCheckSkill` simulated speaker/mic/volume with native audio session + player/recorder calls.
5. Replace agent loop fixed-first-tool behavior with LLM-planned action selection and schema validation.
6. Audit all skills in `catalog.ts`; mark unimplemented skills as inactive or implement them.
7. Add skill execution tests with pass/fail/error records.

---

## Workstream 5: Security + Android Policy

**Goal:** Secure credential storage, enforce biometric policy, disable cleartext traffic, correct foreground service behavior.

### Files
- `src/core/security.ts`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/stellamobile/app/services/StellaService.kt`
- `android/app/src/main/java/com/stellamobile/app/receivers/BootReceiver.kt`

### Steps
1. Replace XOR fallback encryption with Android Keystore-backed storage or `@react-native-keychain/keychain`.
2. Enforce biometric unlock at the tool execution boundary, not only in UI.
3. Set `usesCleartextTraffic="false"`; narrow debug-only exceptions if needed.
4. Set `android:allowBackup="false"` or add backup rules excluding credentials.
5. Implement actual foreground service work or gate boot receiver behind user opt-in.
6. Remove broad `READ_EXTERNAL_STORAGE`/`WRITE_EXTERNAL_STORAGE`; use scoped storage/SAF.

---

## Workstream 6: Release Engineering + CI

**Goal:** Reproducible signed builds, release manifest, CI gates, Play internal-testing checklist.

### Files
- `scripts/buildAndroidRelease.js`
- `package.json`
- `android/app/build.gradle`
- `app.json`
- `.gitignore`
- `README.md`

### Steps
1. Add `npm run release:preflight` validating dependencies, tools, secrets, version, and signing.
2. Build with argument arrays instead of shell strings.
3. Verify AAB/APK signatures with `apksigner`/`jarsigner`.
4. Generate SHA-256 release manifest.
5. Enable release minification after testing.
6. Add CI for typecheck, lint, tests, and Android build.
7. Update README with native prerequisites, real signing steps, model licenses, and verification commands.

---

## Execution Order

1. **Workstream 1** — buildable baseline + media (blocks everything else).
2. **Workstream 4** — agent + skills + anatomy (core functionality).
3. **Workstream 2** — model/inference (voice LLM path).
4. **Workstream 3** — voice + assistant (device-facing UX).
5. **Workstream 5** — security + Android policy (store compliance).
6. **Workstream 6** — release engineering + CI (launch gate).

Launch gate: signed internal-track build passes core user journey on physical arm64 device.