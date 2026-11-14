# Stella Mobile — Complete Skills Inventory

## Overview
This document lists all skills created for Stella Mobile, organized by category. Each skill follows the structured format with metadata, operations, and native bridge integration.

---

## Skills by Category

### 🌤️ Weather (1 skill)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `weather` | Live weather, forecasts, air quality, sun times, alerts | `expo-location` (geocoding) | Open-Meteo (keyless), Nominatim (keyless) |

### ⚙️ System (4 skills)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `system_time` | Current time, timestamp, timezone | JS Date API | None |
| `sound_check` | Speaker test, microphone test, volume level | `expo-audio-session`, `expo-av` | Native audio |
| `device_info` | Device specs, battery, storage, memory, network, display | `expo-device`, `expo-battery`, `expo-file-system`, `netinfo` | Native device APIs |
| `internet_speed_test` | Download/upload speed, latency, jitter | `netinfo` | Speedtest.net, Fast.com, M-Lab |
### 💰 Finance (2 skills)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `currency` | Currency conversion, exchange rates | None | ExchangeRate-API (keyless) |
| `crypto` | Cryptocurrency prices, market data, trending | None | CoinGecko (keyless) |

### 🛠️ Development (2 skills)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `anatomy` | Technical illustrations, isometric SVG, 3D models | None (Node.js kit) | wheresryan22/anatomy kit (keyless) |
| `modeling_3d` | Interactive 3D models, Three.js, React Three Fiber | None | Three.js, @react-three/fiber (keyless) |

### 📍 Location (1 skill)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `location` | GPS, geocoding, maps, directions, nearby | `expo-location`, `react-native-maps` | OpenStreetMap Nominatim (keyless), Google Maps/Apple Maps |

### 📱 Media (2 skills)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `gif_search` | GIF search, trending, random | None | Giphy API, Tenor API (API keys) |
| `media_stream` | Media streaming | Native media | Native media |

### 📋 Productivity (4 skills)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `activity_suggester` | Random activity suggestions | None | BoredAPI (keyless) |
| `habit_tracker` | Habit tracking with streaks | `AsyncStorage` | Local storage |
| `writing` | Writing assistant (generate, edit, summarize, rewrite, proofread) | None | Local LLM + Cloud LLMs (OpenAI, Anthropic, Google) |
| `email_intelligence` | Email enrichment, verification, breach check, OSINT | `expo-crypto` | Hunter.io, Clearbit, AbstractAPI, EmailRep.io, HaveIBeenPwned, Gravatar, GitHub |

### 🔬 Research (2 skills)
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `space_facts` | Space facts, APOD, Mars rover, ISS tracking | None | NASA APOD, Mars Rover, Open Notify (keyless) |
| `web_search` | Web search, news, images | None | DuckDuckGo HTML (keyless), Bing API (optional key) |

### 🔒 Security (1 skill)
---

## Architecture Summary

### Core Components
- **SkillRegistry**: Central registry for skill registration and execution
- **SkillLoader**: Auto-registers all 19 skills on startup
- **ApiClient**: Base API client with caching, rate limiting, error handling
- **UnifiedInference**: Supports both local (llama.rn) and cloud (OpenAI, Anthropic, Google) LLMs
- **NativeBridge**: Typed access to native modules (Audio, Device, Location, Maps, Permissions, Haptics, Network)

### Native Module Dependencies
```
expo-audio-session    → Audio routing, volume control
expo-av               → Audio recording/playback
expo-device           → Device info, battery, storage
expo-location         → GPS, geocoding
expo-battery          → Battery status
expo-file-system      → Storage info
expo-permissions      → Runtime permissions
expo-haptics          → Haptic feedback
expo-crypto           → Cryptographic operations
@react-native-community/netinfo → Network info
react-native-maps     → Native maps
three, @react-three/fiber → 3D modeling
```

### Cloud LLM Providers (Auto-selected)
| Provider | Models | Use Case |
|----------|--------|----------|
| Local (llama.rn) | Llama 3.2, etc. | Privacy, offline, simple tasks |
| OpenAI | GPT-4, GPT-3.5 | Complex reasoning, coding |
| Anthropic | Claude 3 Opus/Sonnet | Analysis, writing, reasoning |
| Google | Gemini Pro/Ultra | Multimodal, search integration |

---

## Native Bridge Architecture

```
NativeBridge (Core)
├── audioSession      → expo-audio-session
├── deviceInfo        → expo-device
├── location          → expo-location

NativeBridgeExt (Audio)
├── audioRecorder     → expo-av
├── audioPlayer       → expo-av

NativeBridgeExt2 (Extended)
├── maps              → react-native-maps
├── permissions       → expo-permissions
├── haptics           → expo-haptics
├── networkInfo       → @react-native-community/netinfo
```

---

## Skill Metadata Structure
Each skill includes:
```typescript
{
  name: string,
  aliases: string[],
  description: string,
  triggers: string[],
  parameters: JSONSchema,
  version: string,
  category: string,
  source: string,
  active: boolean,
  author: string,
  surface: 'mobile' | 'desktop' | 'both',
  notes?: string,
  apiSources: Record<string, ApiSource>
}
```

---

## Environment Variables Required (.env)
```bash
# Release signing
APP_RELEASE_STORE_PASSWORD=
APP_RELEASE_KEY_PASSWORD=

# Voice models
UPSTREAM_MODEL_URL=
MBUZAI_MODEL_URL=

# API Keys (optional - for enhanced features)
OPENWEATHER_API_KEY=
NEWSAPI_API_KEY=
GITHUB_TOKEN=
UNSPLASH_ACCESS_KEY=
UNSPLASH_SECRET_KEY=
COINGECKO_API_KEY=
EXCHANGERATE_API_KEY=
ALPHAVANTAGE_API_KEY=
TWELVE_DATA_API_KEY=
FRED_API_KEY=
NASA_API_KEY=

# Email Intelligence
HUNTER_IO_API_KEY=
CLEARBIT_API_KEY=
ABSTRACT_API_KEY=
HIBP_API_KEY=

# GIF Search
GIPHY_API_KEY=
TENOR_API_KEY=

# Cloud LLMs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
```

---

## Build Commands
```bash
# Install dependencies
npm install

# Download & verify voice models (computes SHA256)
npm run install:models

# Bundle models for production
npm run bundle:models

# Prebuild native code
npx expo prebuild

# Build Android
npm run android

# Build iOS
npm run ios
```

---

## Usage Example
```typescript
import { skillRegistry, loadAllSkills } from '@/skills';

// Load all skills on app start
loadAllSkills();

// Execute a skill
const result = await skillRegistry.execute('sound_check', {
  operation: 'full',
  testDuration: 5
}, { permissions: ['microphone', 'audio'] });

console.log(result.spokenNarrative);
// "Sound check complete. Speaker working. Microphone working."
```
| Skill | Description | Native Bridges | APIs |
|-------|-------------|----------------|------|
| `email_intelligence` | Email enrichment, verification, breach check, OSINT | `expo-crypto` | Hunter.io, Clearbit, AbstractAPI, EmailRep.io, HaveIBeenPwned, Gravatar, GitHub |

---

## Total Skills: **19**