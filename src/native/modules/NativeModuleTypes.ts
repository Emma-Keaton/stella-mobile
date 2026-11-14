/**
 * Stella Mobile — Native Module Types
 * All type definitions for native modules
 */

// =============================================================================
// Audio Session & Volume Control
// =============================================================================

export interface AudioSessionModule {
  configure(config: AudioSessionConfig): Promise<void>;
  setMode(mode: AudioMode): Promise<void>;
  setActive(active: boolean): Promise<void>;
  setCategory(category: AudioCategory, options?: AudioCategoryOptions): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(level: number): Promise<void>;
  getMaxVolume(): Promise<number>;
  getAvailableInputs(): Promise<AudioPort[]>;
  getAvailableOutputs(): Promise<AudioPort[]>;
  setPreferredInput(portId: string): Promise<void>;
  setPreferredOutput(portId: string): Promise<void>;
  addListener(eventName: 'interruption', listener: (event: AudioInterruptionEvent) => void): void;
  removeListeners(count: number): void;
}

export interface AudioSessionConfig {
  mode: AudioMode;
  category: AudioCategory;
  options: AudioCategoryOptions;
}

export type AudioMode = 'voice_chat' | 'measurement' | 'movie_playback' | 'video_recording' | 'default';
export type AudioCategory = 'playback' | 'record' | 'play_and_record' | 'ambient' | 'solo_ambient';
export type AudioCategoryOptions = string[];

export interface AudioPort {
  portId: string;
  portName: string;
  portType: 'builtInMic' | 'headsetMic' | 'bluetoothMic' | 'builtInSpeaker' | 'headphones' | 'bluetoothA2DP' | 'hdmi' | 'airplay';
  isSelected: boolean;
}

export interface AudioInterruptionEvent {
  type: 'began' | 'ended';
  reason: 'phoneCall' | 'alarm' | 'otherAudio' | 'unknown';
  shouldResume: boolean;
}

// =============================================================================
// Device Info
// =============================================================================

export interface DeviceInfoModule {
  getDeviceId(): Promise<string>;
  getDeviceName(): Promise<string>;
  getSystemName(): Promise<string>;
  getSystemVersion(): Promise<string>;
  getModel(): Promise<string>;
  getBrand(): Promise<string>;
  getManufacturer(): Promise<string>;
  getUniqueId(): Promise<string>;
  getAppVersion(): Promise<string>;
  getBuildNumber(): Promise<string>;
  getBundleId(): Promise<string>;
  getScreenWidth(): Promise<number>;
  getScreenHeight(): Promise<number>;
  getPixelRatio(): Promise<number>;
  getFontScale(): Promise<number>;
  hasNotch(): Promise<boolean>;
  getBatteryLevel(): Promise<number>;
  isBatteryCharging(): Promise<boolean>;
  getBatteryHealth(): Promise<string>;
  getTotalDiskCapacity(): Promise<number>;
  getFreeDiskStorage(): Promise<number>;
  getTotalMemory(): Promise<number>;
  getAvailableMemory(): Promise<number>;
  getIpAddress(): Promise<string>;
  getMacAddress(): Promise<string>;
  isAirplaneMode(): Promise<boolean>;
  hasCamera(): Promise<boolean>;
  hasFlashlight(): Promise<boolean>;
  hasAccelerometer(): Promise<boolean>;
  hasGyroscope(): Promise<boolean>;
  getDeviceLocale(): Promise<string>;
  getDeviceCountry(): Promise<string>;
  getTimezone(): Promise<string>;
  hasPermission(permission: string): Promise<boolean>;
  requestPermission(permission: string): Promise<boolean>;
}

// =============================================================================
// Location & Geolocation
// =============================================================================

export interface LocationModule {
  getCurrentPosition(options?: LocationOptions): Promise<LocationResult>;
  watchPosition(callback: (location: LocationResult) => void, options?: LocationOptions): Promise<number>;
  clearWatch(watchId: number): Promise<void>;
  geocode(address: string): Promise<GeocodeResult[]>;
  reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult[]>;
  requestPermission(type: 'whenInUse' | 'always'): Promise<PermissionStatus>;
  checkPermission(type: 'whenInUse' | 'always'): Promise<PermissionStatus>;
  startBackgroundUpdates(options: BackgroundLocationOptions): Promise<void>;
  stopBackgroundUpdates(): Promise<void>;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  useSignificantChanges?: boolean;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
}

export type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'undetermined';

export interface BackgroundLocationOptions {
  distanceFilter?: number;
  desiredAccuracy?: number;
  pausesUpdatesAutomatically?: boolean;
  activityType?: 'automotive' | 'fitness' | 'other';
}