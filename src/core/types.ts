/**
 * Stella Mobile — Core Type Definitions
 * Ported from Stella core types, adapted for React Native mobile.
 */

export type Engine = 'upstream' | 'mbuzai'
export type Sensitivity = 'public' | 'sensitive' | 'private'
export type Honesty = 'done' | 'unverified' | 'failed' | 'ask' | 'started'
export type ThemeId = 'void' | 'oled' | 'light' | 'solar'
export type DevicePlatform = 'android' | 'ios'

export type DeviceSize = 'phone' | 'tablet_small' | 'tablet_large'

export type PermissionType =
  | 'microphone'
  | 'camera'
  | 'location'
  | 'storage'
  | 'notification'
  | 'contacts'
  | 'sms'
  | 'phone'
  | 'external_storage'
  | 'wifi'
  | 'bluetooth'
  | 'activity_recognition'

export interface PermissionState {
  granted: boolean
  shouldShowRationale: boolean
  permanentlyDenied: boolean
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh'
export type AgentLanguageMode = 'translate_only' | 'speak_in_language' | 'mixed'

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  whisperCode: string      // Whisper language code
  ttsCode: string          // TTS voice code
  flag: string             // Emoji flag
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', whisperCode: 'en', ttsCode: 'en-US', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', whisperCode: 'es', ttsCode: 'es-ES', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', whisperCode: 'fr', ttsCode: 'fr-FR', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', whisperCode: 'de', ttsCode: 'de-DE', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', whisperCode: 'zh', ttsCode: 'zh-CN', flag: '🇨🇳' },
]

export interface VoiceConfig {
  enabled: boolean
  language: SupportedLanguage           // User's primary language
  targetLanguage: SupportedLanguage     // Language to translate to/learn
  agentLanguageMode: AgentLanguageMode  // How agent responds
  voice: string                         // TTS voice identifier
  pitch: number
  rate: number
  ttsEngine: 'onnx' | 'os' | 'auto'     // On-device neural, OS built-in, or auto
  sttEngine: 'executorch' | 'whisper_rn' | 'os' | 'auto'  // On-device Whisper, whisper.cpp, OS, or auto
  continuousListening: boolean          // VAD-enabled continuous mode
  vadSensitivity: number                // 0.0-1.0 VAD threshold
  autoTranslate: boolean                // Auto-transcribe + translate
  modelDownloadPath: string             // Path to downloaded models
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  enabled: true,
  language: 'en',
  targetLanguage: 'es',
  agentLanguageMode: 'translate_only',
  voice: 'female',
  pitch: 1.0,
  rate: 1.0,
  ttsEngine: 'auto',
  sttEngine: 'auto',
  continuousListening: false,
  vadSensitivity: 0.5,
  autoTranslate: true,
  modelDownloadPath: '',
}

export interface ModelCatalogEntry {
  id: string
  name: string
  path: string
  engine: Engine
  sensitivity: Sensitivity
  allow_cross_engine: boolean
  size_mb: number
  downloaded: boolean
  download_url?: string
}

export interface RouteDecision {
  modelId: string
  engine: Engine
  reason: string
  allowed: boolean
  fallback?: Engine
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  modelId?: string
  engine?: Engine
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  modelId?: string
}

export interface ToolResult {
  ok: boolean
  output?: string
  error?: string
  data?: any
  honesty: Honesty
  elapsed?: number
}

export interface ToolSchema {
  type: 'object'
  properties: Record<string, any>
  required: string[]
}

export interface ToolDefinition {
  name: string
  description: string
  schema: ToolSchema
  requires: string[]
  destructive: boolean
  handler: (args: any) => Promise<ToolResult>
}

export interface ProviderConfig {
  provider: string
  api_key: string
  base_url?: string
  model?: string
  headers?: Record<string, string>
  params?: Record<string, any>
  fallback?: string[]
  enabled: boolean
  priority: number
}

export interface AppSettings {
  version: number
  theme: ThemeId
  local_only: boolean
  default_engine: Engine
  routing: Record<string, string>
  providers: ProviderConfig[]
  k2: {
    server_version: string
    model_version: string
    runtimes: Engine[]
    default_runtime: Engine
    port: number
  }
  workspace: {
    history_enabled: boolean
    max_entries: number
  }
  media: {
    download_path: string
    upload_path: string
    max_file_size_mb: number
  }
  device: {
    allow_external_apps: boolean
    allow_network_control: boolean
    allow_location: boolean
    device_size: DeviceSize
  }
  permissions: Record<PermissionType, boolean>
  voice: VoiceConfig
  maps: {
    provider: 'openstreetmap'
    tile_url: string
    max_zoom: number
  }
  security: {
    encryption_enabled: boolean
    audit_enabled: boolean
    biometric_unlock: boolean
  }
}

export interface AuditEntry {
  ts: string
  actor: string
  tool: string
  target: string
  result: string
  activity?: string
  rule?: string
  extra?: any
}

export interface WorkspaceHistoryEntry {
  id: string
  type: 'chat' | 'agent' | 'skill' | 'media' | 'map' | 'device'
  title: string
  description: string
  timestamp: number
  data: any
}

export interface SkillDefinition {
  id: string
  name: string
  description: string
  version: string
  author: string
  triggers: string[]
  parameters: any
  operations: string[]
  handler: (args: any) => Promise<any>
  requires_auth: boolean
  destructive: boolean
}

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  heading?: number
  speed?: number
  timestamp: number
  address?: string
}

export interface MapTile {
  x: number
  y: number
  z: number
  url: string
}

export interface DistanceMeasurement {
  from: LocationData
  to: LocationData
  distance_meters: number
  distance_km: number
  bearing: number
}

export interface MediaFile {
  id: string
  name: string
  path: string
  uri: string
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
  size: number
  mime_type: string
  created_at: number
  downloaded: boolean
  upload_status: 'pending' | 'uploading' | 'completed' | 'failed'
}

export interface AppProcess {
  package_name: string
  app_name: string
  version: string
  is_running: boolean
  can_launch: boolean
}

export interface NetworkInterface {
  name: string
  type: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth'
  connected: boolean
  ip_address?: string
  ssid?: string
  signal_strength?: number
}

export interface DeviceConnectPeer {
  id: string
  name: string
  type: 'mobile' | 'pc' | 'tablet'
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux'
  endpoint: string          // ws:// or http:// URL
  pairing_code: string
  qr_data: string
  connected: boolean
  paired_at?: number
  last_seen?: number
  capabilities: string[]    // 'chat', 'models', 'media', 'device_control', 'maps'
  role: 'host' | 'client' | 'peer'
}

export interface DeviceConnectSession {
  id: string
  peer: DeviceConnectPeer
  status: 'pending' | 'pairing' | 'connected' | 'disconnected' | 'error'
  created_at: number
  connected_at?: number
  transport: 'qr' | 'pairing_code' | 'url_endpoint' | 'local_discovery'
}

export interface ModelFolder {
  id: string
  name: string
  path: string
  type: 'local' | 'download' | 'import'
  watch: boolean
  models: ModelInfo[]
}

export interface ModelInfo {
  id: string
  name: string
  filename: string
  path: string
  size_mb: number
  quant: string
  architecture: string
  engine: 'upstream' | 'mbuzai'
  active: boolean
  downloaded: boolean
}

export interface DownloadDestination {
  id: string
  name: string
  path: string
  default: boolean
  space_available_mb?: number
}

export interface OnboardingState {
  completed: boolean
  username?: string
  theme_selected?: ThemeId
  engine_selected?: Engine
  model_folder_selected?: string
  download_destination_selected?: string
  device_connect_enabled?: boolean
  permissions_granted: string[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  theme: 'void',
  local_only: true,
  default_engine: 'upstream',
  routing: {
    chat: 'auto',
    agent: 'auto',
    voice: 'auto',
  },
  providers: [],
  k2: {
    server_version: '0.9B',
    model_version: 'Q4_K_M',
    runtimes: ['upstream', 'mbuzai'],
    default_runtime: 'upstream',
    port: 11435,
  },
  workspace: {
    history_enabled: true,
    max_entries: 1000,
  },
  media: {
    download_path: '',
    upload_path: '',
    max_file_size_mb: 500,
    download_destinations: [],
    model_folders: [],
  },
  device: {
    allow_external_apps: false,
    allow_network_control: false,
    allow_location: false,
    device_connect_enabled: false,
    paired_peers: [],
    device_id: '',
    device_name: 'Stella Mobile',
    device_size: 'phone',
  },
  permissions: {
    microphone: false,
    camera: false,
    location: false,
    storage: false,
    notification: false,
    contacts: false,
    sms: false,
    phone: false,
    external_storage: false,
    wifi: false,
    bluetooth: false,
    activity_recognition: false,
  },
  voice: DEFAULT_VOICE_CONFIG,
  maps: {
    provider: 'openstreetmap',
    tile_url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    max_zoom: 19,
  },
  security: {
    encryption_enabled: true,
    audit_enabled: true,
    biometric_unlock: false,
  },
}

export const DEFAULT_ONBOARDING: OnboardingState = {
  completed: false,
  permissions_granted: [],
}

export const STELLA_VERSION = '1.0.0'
