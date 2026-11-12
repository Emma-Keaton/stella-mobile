# Stella Mobile

Stella Mobile — a React Native mobile assistant with always-on voice, Device Assistant, 3D anatomy model viewing, web research, OSINT tools, and dual-model LLM routing.

## Features

### Device Assistant (Always-On Voice)
- Wake word detection ("Hey Stella", configurable)
- Sleep/wake cycle with auto-sleep timer
- HUD overlay with text input + file attachments
- Female-voice TTS responses
- Microphone permission handling
- Wake gesture (long-press home / assist action replaces Google Assistant)

### Anatomy 3D Models
- Interactive 3D model viewer for k2-horizon architecture models
- Disassemble / reassemble toggle
- Part visibility control (hide/show individual parts)
- Export to OBJ, STL, GLTF, GLB formats
- Handles bundled, under-construction, and exported model formats

### Web Search & Research
- Web search via DuckDuckGo (no API key required)
- Multi-query deep research with synthesized summaries

### OSINT & Security
- Subdomain enumeration, SSL/TLS scanning
- Social media lookup (Sherlock)
- Email intelligence (theHarvester)
- Full OSINT reconnaissance

### Dual-Model LLM Routing
- Normal LLM → upstream engine
- k2-horizon → mbuzai fork engine
- k2 models show [3D] badge in Models screen to open Anatomy3DModal

### Chat & Voice
- Chat streaming with markdown rendering
- Voice-to-voice (STT + TTS)
- File attachments in chat

## Project Structure

```
StellaMobile/
├── src/
│   ├── agent/                 # Agent lifecycle, loop, planner, scratchpad
│   ├── anatomy/               # Anatomy skill
│   ├── components/
│   │   ├── anatomy/           # Anatomy3DModal
│   │   ├── device/            # DeviceAssistantHUD
│   │   └── ui/                # StarSpinner (4-pointer star from Stella web)
│   ├── core/                  # Types, storage, security, errors, audit
│   ├── device/
│   │   └── assistant/         # DeviceAssistantService (wake word, sleep/wake)
│   ├── skills/                # Skills catalog, registry, web_search, web_research
│   ├── screens/               # Chat, Settings, Models, Maps, Onboarding, etc.
│   ├── services/              # Chat, inference, model-router, ModelFileManager
│   └── theme/                 # Stella theme colors
├── assets/
│   └── images/                # Stella logo, icon, badge assets
├── android/                   # Android native code
│   ├── app/src/main/
│   │   ├── res/
│   │   │   ├── drawable/splash_screen.xml
│   │   │   ├── values/themes.xml (SplashTheme + Stella colors)
│   │   │   └── mipmap-*/      # Stella launcher icons (all densities)
│   │   ├── AndroidManifest.xml (wake gesture intent filters)
│   │   └── java/com/stellamobile/app/
│   │       ├── MainActivity.kt (wake gesture handling)
│   │       └── MainApplication.kt
├── package.json
├── tsconfig.json
├── metro.config.js
└── README.md
```

## Installation

```bash
cd "E:/Projects/stella mobile/StellaMobile"
npm install
```

### Required Dependencies
- `react-native-svg` — for the StarSpinner component
- `llama.rn@0.12.9` — for local LLM inference
- `react-native-reanimated` — for animations

## Android Build

### Debug
```bash
npm run android
```

### Release
```bash
# Configure signing in .env (copy from .env.example)
cp .env.example .env
# Set APP_RELEASE_STORE_PASSWORD in .env
npm run build:android:release
```

## Configuration

1. Copy `.env.example` to `.env` and fill in your values
2. Enable Device Assistant in Settings → Device Assistant
3. Configure wake word (default: "Hey Stella")
4. Set auto-sleep minutes (default: 5)
5. Optionally set Stella as default assistant app in Android Settings

## Wake Gesture

Stella replaces Google Assistant on:
- Long-press home button (`android.intent.action.ASSIST`)
- Voice wake command (`android.intent.action.VOICE_COMMAND`)

## Themes

Stella supports 5 themes (matching the Stella web):
- `void` — teal/cyan/purple gradient
- `oled` — oled-optimized void
- `aurora` — purple/pink gradient
- `light` — light teal/blue gradient
- `solar` — yellow/orange/red gradient

The splash screen uses `?attr/colorPrimary` for a theme-responsive background.

## License

See LICENSE file in the parent Stella repository.