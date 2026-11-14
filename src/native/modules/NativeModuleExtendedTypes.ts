/**
 * Stella Mobile — Native Module Extended Types
 * Maps, Audio, Permissions, Haptics, Network
 */

// =============================================================================
// Maps (react-native-maps)
// =============================================================================

export interface MapsModule {
  initialize(apiKey?: string): Promise<void>;
  setMapStyle(styleJson: string): Promise<void>;
  animateToRegion(region: MapRegion, duration?: number): Promise<void>;
  animateToCoordinate(coordinate: Coordinate, zoom?: number): Promise<void>;
  getVisibleRegion(): Promise<MapRegion>;
  addMarker(marker: MapMarker): Promise<string>;
  removeMarker(markerId: string): Promise<void>;
  updateMarker(markerId: string, updates: Partial<MapMarker>): Promise<void>;
  addPolyline(polyline: MapPolyline): Promise<string>;
  addPolygon(polygon: MapPolygon): Promise<string>;
  showUserLocation(show: boolean): Promise<void>;
  followUserLocation(follow: boolean): Promise<void>;
  downloadOfflineRegion(region: MapRegion, name: string): Promise<OfflineDownloadResult>;
  getOfflineRegions(): Promise<OfflineRegion[]>;
  removeOfflineRegion(regionId: string): Promise<void>;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id?: string;
  coordinate: Coordinate;
  title?: string;
  description?: string;
  image?: string;
  anchor?: { x: number; y: number };
  calloutAnchor?: { x: number; y: number };
  flat?: boolean;
  rotation?: number;
  zIndex?: number;
}

export interface MapPolyline {
  coordinates: Coordinate[];
  strokeColor?: string;
  strokeWidth?: number;
  geodesic?: boolean;
}

export interface MapPolygon {
  coordinates: Coordinate[];
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface OfflineDownloadResult {
  regionId: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface OfflineRegion {
  regionId: string;
  name: string;
  region: MapRegion;
  status: 'downloaded' | 'downloading' | 'expired';
  size: number;
  expiresAt?: number;
}

// =============================================================================
// Audio Recording/Playback
// =============================================================================

export interface AudioRecorderModule {
  startRecording(options: RecordingOptions): Promise<string>;
  stopRecording(): Promise<RecordingResult>;
  pauseRecording(): Promise<void>;
  resumeRecording(): Promise<void>;
  getRecordingLevel(): Promise<number>;
}

export interface RecordingOptions {
  sampleRate?: number;
  channels?: number;
  bitsPerChannel?: number;
  format?: 'wav' | 'm4a' | 'caf' | 'aac';
  outputPath?: string;
  maxDuration?: number;
}

export interface RecordingResult {
  path: string;
  duration: number;
  size: number;
  sampleRate: number;
  channels: number;
}

export interface AudioPlayerModule {
  play(uri: string, options?: PlaybackOptions): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(position: number): Promise<void>;
  getDuration(): Promise<number>;
  getCurrentPosition(): Promise<number>;
  setVolume(level: number): Promise<void>;
  setRate(rate: number): Promise<void>;
  setLooping(looping: boolean): Promise<void>;
  addListener(event: 'finished' | 'error' | 'progress', callback: (data: any) => void): void;
  removeListeners(count: number): void;
}

export interface PlaybackOptions {
  volume?: number;
  rate?: number;
  looping?: boolean;
  startPosition?: number;
}

// =============================================================================
// Permissions
// =============================================================================

export interface PermissionsModule {
  check(permission: PermissionType): Promise<PermissionStatus>;
  request(permission: PermissionType): Promise<PermissionStatus>;
  requestMultiple(permissions: PermissionType[]): Promise<Record<PermissionType, PermissionStatus>>;
  openSettings(): Promise<void>;
  canOpenSettings(): Promise<boolean>;
}

export type PermissionType = 
  | 'camera'
  | 'microphone'
  | 'location'
  | 'location_when_in_use'
  | 'location_always'
  | 'photos'
  | 'contacts'
  | 'calendar'
  | 'reminders'
  | 'speech_recognition'
  | 'bluetooth'
  | 'notifications'
  | 'background_refresh';

// =============================================================================
// Haptics
// =============================================================================

export interface HapticsModule {
  trigger(type: HapticType): Promise<void>;
  selectionChanged(): Promise<void>;
  impactOccurred(style: 'light' | 'medium' | 'heavy'): Promise<void>;
  notificationOccurred(type: 'success' | 'warning' | 'error'): Promise<void>;
}

export type HapticType = 'selection' | 'impact_light' | 'impact_medium' | 'impact_heavy' | 'notification_success' | 'notification_warning' | 'notification_error';

// =============================================================================
// Network Info
// =============================================================================

export interface NetworkInfoModule {
  fetch(): Promise<NetworkState>;
  addListener(listener: (state: NetworkState) => void): () => void;
  configure(options: { reachabilityUrl?: string; reachabilityTest?: (response: Response) => boolean }): Promise<void>;
}

export interface NetworkState {
  type: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'wimax' | 'vpn' | 'other' | 'unknown' | 'none';
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isWifiEnabled: boolean;
  details?: {
    ssid?: string;
    bssid?: string;
    strength?: number;
    ipAddress?: string;
    subnet?: string;
    frequency?: number;
    cellularGeneration?: string;
    carrier?: string;
  };
}