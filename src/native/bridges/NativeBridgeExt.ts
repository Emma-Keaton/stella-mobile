/**
 * Stella Mobile — Native Module Accessors Extended (Part 1)
 * Maps, Audio Recorder, Audio Player
 */

import { NativeModules, NativeEventEmitter } from 'react-native';
import type { 
  MapsModule,
  AudioRecorderModule,
  AudioPlayerModule,
} from '../modules/NativeModuleExtendedTypes';

// Get native modules
const {
  MapsManager,
  AudioRecorderManager,
  AudioPlayerManager,
} = NativeModules;

// Typed module accessors
export const nativeModulesExt = {
  maps: MapsManager as MapsModule | null,
  audioRecorder: AudioRecorderManager as AudioRecorderModule | null,
  audioPlayer: AudioPlayerManager as AudioPlayerModule | null,
};

// Event emitters
export const nativeEventsExt = {
  audioRecorder: nativeModulesExt.audioRecorder ? new NativeEventEmitter(nativeModulesExt.audioRecorder as any) : null,
  audioPlayer: nativeModulesExt.audioPlayer ? new NativeEventEmitter(nativeModulesExt.audioPlayer as any) : null,
};

// Extended NativeBridge - Maps, Audio
export const NativeBridgeExt = {
  // Maps
  maps: {
    async initialize(apiKey?: string) {
      if (!nativeModulesExt.maps) return { ok: false, error: 'Maps not available' };
      return nativeModulesExt.maps.initialize(apiKey);
    },
    async animateToRegion(region: any, duration?: number) {
      if (!nativeModulesExt.maps) return { ok: false };
      return nativeModulesExt.maps.animateToRegion(region, duration);
    },
    async addMarker(marker: any) {
      if (!nativeModulesExt.maps) return '';
      return nativeModulesExt.maps.addMarker(marker);
    },
    async removeMarker(markerId: string) {
      if (!nativeModulesExt.maps) return { ok: false };
      return nativeModulesExt.maps.removeMarker(markerId);
    },
    async showUserLocation(show: boolean) {
      if (!nativeModulesExt.maps) return { ok: false };
      return nativeModulesExt.maps.showUserLocation(show);
    },
    async followUserLocation(follow: boolean) {
      if (!nativeModulesExt.maps) return { ok: false };
      return nativeModulesExt.maps.followUserLocation(follow);
    },
    async getVisibleRegion() {
      if (!nativeModulesExt.maps) return null;
      return nativeModulesExt.maps.getVisibleRegion();
    },
    async downloadOfflineRegion(region: any, name: string) {
      if (!nativeModulesExt.maps) return { ok: false };
      return nativeModulesExt.maps.downloadOfflineRegion(region, name);
    },
    async getOfflineRegions() {
      if (!nativeModulesExt.maps) return [];
      return nativeModulesExt.maps.getOfflineRegions();
    },
  },

  // Audio Recorder
  audioRecorder: {
    async startRecording(options?: any) {
      if (!nativeModulesExt.audioRecorder) return { ok: false, error: 'AudioRecorder not available' };
      return nativeModulesExt.audioRecorder.startRecording(options);
    },
    async stopRecording() {
      if (!nativeModulesExt.audioRecorder) return { ok: false, error: 'AudioRecorder not available' };
      return nativeModulesExt.audioRecorder.stopRecording();
    },
    async pauseRecording() {
      if (!nativeModulesExt.audioRecorder) return { ok: false };
      return nativeModulesExt.audioRecorder.pauseRecording();
    },
    async resumeRecording() {
      if (!nativeModulesExt.audioRecorder) return { ok: false };
      return nativeModulesExt.audioRecorder.resumeRecording();
    },
    async getRecordingLevel() {
      if (!nativeModulesExt.audioRecorder) return 0;
      return nativeModulesExt.audioRecorder.getRecordingLevel();
    },
  },

  // Audio Player
  audioPlayer: {
    async play(uri: string, options?: any) {
      if (!nativeModulesExt.audioPlayer) return { ok: false, error: 'AudioPlayer not available' };
      return nativeModulesExt.audioPlayer.play(uri, options);
    },
    async pause() {
      if (!nativeModulesExt.audioPlayer) return { ok: false };
      return nativeModulesExt.audioPlayer.pause();
    },
    async stop() {
      if (!nativeModulesExt.audioPlayer) return { ok: false };
      return nativeModulesExt.audioPlayer.stop();
    },
    async seek(position: number) {
      if (!nativeModulesExt.audioPlayer) return { ok: false };
      return nativeModulesExt.audioPlayer.seek(position);
    },
    async getDuration() {
      if (!nativeModulesExt.audioPlayer) return 0;
      return nativeModulesExt.audioPlayer.getDuration();
    },
    async getCurrentPosition() {
      if (!nativeModulesExt.audioPlayer) return 0;
      return nativeModulesExt.audioPlayer.getCurrentPosition();
    },
    async setVolume(level: number) {
      if (!nativeModulesExt.audioPlayer) return { ok: false };
      return nativeModulesExt.audioPlayer.setVolume(level);
    },
    async setRate(rate: number) {
      if (!nativeModulesExt.audioPlayer) return { ok: false };
      return nativeModulesExt.audioPlayer.setRate(rate);
    },
    async setLooping(looping: boolean) {
      if (!nativeModulesExt.audioPlayer) return { ok: false };
      return nativeModulesExt.audioPlayer.setLooping(looping);
    },
  },
};