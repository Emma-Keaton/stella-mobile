# Stella Mobile — Enhanced Skills Architecture

## Overview

This document describes the enhanced, structured skills system that replaces the initial flat skill setup. The new architecture provides:

1. **Modular skill organization** by category (weather, system, finance, development, location)
2. **Native module integration** for full device capabilities
3. **Structured skill metadata** with API sources, triggers, and parameters
4. **Operation-based execution** for granular control
5. **Type-safe TypeScript** implementation

---

## Skill Categories & Skills

| Category | Skills | Native Modules Required |
|----------|--------|------------------------|
| **Weather** | `weather` | expo-location (geocoding), Open-Meteo API |
| **System** | `system_time`, `sound_check`, `device_info` | expo-device, expo-av, expo-audio-session, expo-battery, expo-file-system, @react-native-community/netinfo |
| **Finance** | `currency`, `crypto` | ExchangeRate-API, CoinGecko API |
| **Development** | `anatomy`, `modeling_3d` | three.js, @react-three/fiber |
| **Location** | `location` | expo-location, react-native-maps |
## Native Module Integration

Each skill now connects to native device capabilities through the **NativeBridge** layer:

### NativeBridge (Core)
- `audioSession` → `expo-audio-session` (audio routing, volume, interruptions)
- `deviceInfo` → `expo-device` (model, OS, IDs, sensors)
- `location` → `expo-location` (GPS, geocoding, background tracking)

### NativeBridgeExt (Audio/Recording)
- `audioRecorder` → `expo-av` (recording with levels, formats)
- `audioPlayer` → `expo-av` (playback with volume, rate, looping)

### NativeBridgeExt2 (Extended)
- `permissions` → `expo-permissions` (runtime permission checks)
- `haptics` → `expo-haptics` (feedback, impact, notifications)
- `networkInfo` → `@react-native-community/netinfo` (connectivity, WiFi/cellular details)

### NativeBridgeMaps (Maps)
- `maps` → `react-native-maps` (Google Maps / Apple Maps, markers, offline)

---

## Skill Structure

Each skill follows this structure:

```
skills/<category>/
├── <SkillName>Metadata.ts      # Skill definition, triggers, parameters, API sources
├── <SkillName>Operations1.ts   # Core operations
├── <SkillName>Operations2.ts   # Additional operations
├── <SkillName>Operations3.ts   # Extended operations (if needed)
├── <SkillName>SkillEntry.ts    # Main skill class with execute()
└── index.ts                    # Category exports
```

### Skill Metadata Includes:
- **triggers**: Natural language phrases that invoke the skill
- **parameters**: JSON Schema with types, enums, descriptions
- **operations**: Available operations with descriptions
- **apiSources**: External APIs used (auth tier, rate limits, keyless vs keyed)
- **version/source/category**: Metadata for registry

### Skill Execution Flow:
```typescript
skill.execute(params, context) → 
  parse operation → 
  validate params → 
  call NativeBridge methods → 
  return SkillResult { title, summary, spokenNarrative, ok, record }
```
---

## Key Skills Enhanced with Native Modules

### 1. SoundCheckSkill → Full Native Audio
- **Speaker test**: Plays test tone via `expo-av` AudioPlayer
- **Microphone test**: Records via `expo-av` AudioRecorder with level monitoring
- **Volume level**: Reads system volume via `expo-audio-session`
- **Audio routing**: Shows available inputs/outputs

### 2. DeviceInfoSkill → Full Native Device Access
- **Device**: Model, brand, OS version, device ID, app version
- **Battery**: Level, charging status, health, technology
- **Storage**: Total/free/used via `expo-file-system`
- **Memory**: Total/available RAM
- **Network**: Type (WiFi/cellular), strength, IP, carrier via `netinfo`
- **Display**: Resolution, scale, orientation, density

### 3. LocationSkill → Full Native Maps/GPS
- **Current location**: High-accuracy GPS with reverse geocoding
- **Geocoding**: Address ↔ coordinates via `expo-location`
- **Maps**: Native Google Maps / Apple Maps via `react-native-maps`
- **Directions**: Destination geocoding + map markers
- **Nearby**: Category-based search with map display
- **Offline maps**: Download regions for offline use

### 4. AnatomySkill → 3D Technical Illustrations
- **Operations**: sources, examples, kit, workflow, verify, figure_plan, references, build
- **Output**: Standalone HTML with embedded SVG + optional WebGL shaders
- **3D mode**: Beta Three.js integration for interactive 3D
- **React output**: Optional React Three Fiber components

### 5. Modeling3DSkill → Interactive 3D Models
- **Primitives**: Box, sphere, cylinder, cone, torus, plane
- **Materials**: Standard, Physical, Basic, Phong, Toon
- **Lights**: Ambient, Directional, Point, Spot, Hemisphere, RectArea
- **Export**: GLTF, GLB, OBJ, STL, HTML, React
- **Animation**: Rotation, position, scale, morph targets

---

## Installation & Setup

```bash
# Install dependencies
npm install

# Install Expo modules (requires expo prebuild)
npx expo install expo-audio-session expo-av expo-device expo-location expo-battery expo-file-system expo-permissions expo-haptics react-native-maps three @react-three/fiber

# Prebuild native code
npx expo prebuild

# Download voice models
npm run install:models

# Bundle models for production
npm run bundle:models
```

## API Keys Required (Optional - for enhanced features)

| Skill | API | Free Tier | Setup |
|-------|-----|-----------|-------|
| Currency | ExchangeRate-API | 1,500/month | Get key at exchangerate-api.com |
| Crypto | CoinGecko | 50-500/min | Analyst API at coingecko.com |
| Stocks | Alpha Vantage | 5/min, 500/day | Support page at alphavantage.co |
| News | NewsAPI | 100/day | Register at newsapi.org |
| Maps | Google Maps | $200/month | Cloud Console → Maps SDK |

---

## Migration from Old Structure

**Old (flat):**
```
skills/
├── anatomy.ts
├── catalog.ts
├── weather_live.ts
├── web_research.ts
├── web_search.ts
└── registry.ts
```

**New (structured):**
```
skills/
├── core/types.ts              # Type definitions
├── api/ApiClient.ts           # Base API client with caching/rate-limiting
├── registry/
│   ├── SkillRegistry.ts       # Central skill registry
│   └── SkillLoader.ts         # Auto-registers all skills
├── weather/                   # Weather skill (keyless APIs)
├── system/                    # Time, SoundCheck, DeviceInfo
├── finance/                   # Currency, Crypto
├── development/               # Anatomy, 3D Modeling
├── location/                  # GPS, Maps, Geocoding
└── index.ts                   # Main exports
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