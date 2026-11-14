/**
 * Stella Mobile — Location Operations Part 1
 * Current location, geocode, reverse geocode
 */

import { SkillResult, SkillContext } from '../core/types';
import { NativeBridge, NativeBridgeExt, NativeBridgeExt2 } from '../../native/bridges';

async function getCurrentLocationCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const location = await NativeBridge.location.getCurrentPosition({ enableHighAccuracy: true });
    return { latitude: location.latitude, longitude: location.longitude };
  } catch {
    return null;
  }
}

export async function getCurrentLocation(): Promise<any> {
  try {
    const permStatus = await NativeBridge.location.requestPermission('whenInUse');
    if (permStatus !== 'granted') {
      return { title: 'Location', summary: 'Location permission not granted', spokenNarrative: 'Please grant location permission', operation: 'current', ok: false };
    }

    const location = await NativeBridge.location.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
    const geocodeResults = await NativeBridge.location.reverseGeocode(location.latitude, location.longitude);
    const address = geocodeResults[0]?.formattedAddress || 'Address not available';

    const content = `Current Location:\n📍 ${address}\n📐 Lat: ${location.latitude.toFixed(6)}, Lon: ${location.longitude.toFixed(6)}\n🎯 Accuracy: ±${Math.round(location.accuracy)}m\n⏰ Updated: ${new Date(location.timestamp).toLocaleTimeString()}`;

    return { title: 'Current Location', summary: content, spokenNarrative: `You are at ${address}`, operation: 'current', ok: true, record: { location, address } };
  } catch (error) {
    return { title: 'Location', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Failed to get location', operation: 'current', ok: false };
  }
}

export async function geocodeAddress(address: string): Promise<any> {
  if (!address) {
    return { title: 'Geocode', summary: 'Address parameter required', spokenNarrative: 'Please provide an address', operation: 'geocode', ok: false };
  }

  try {
    const results = await NativeBridge.location.geocode(address);
    if (results.length === 0) {
      return { title: 'Geocode', summary: `No results for "${address}"`, spokenNarrative: `Could not find ${address}`, operation: 'geocode', ok: false };
    }

    const lines = results.slice(0, 5).map((r, i) => `${i + 1}. ${r.formattedAddress} (${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)})`).join('\n');
    const content = `Geocode results for "${address}":\n${lines}`;

    return { title: 'Geocode Results', summary: content, spokenNarrative: `Found ${results.length} results. Top: ${results[0].formattedAddress}`, operation: 'geocode', ok: true, record: { query: address, results } };
  } catch (error) {
    return { title: 'Geocode', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Geocoding failed', operation: 'geocode', ok: false };
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<any> {
  if (lat === undefined || lon === undefined) {
    return { title: 'Reverse Geocode', summary: 'Latitude and longitude required', spokenNarrative: 'Provide latitude and longitude', operation: 'reverse_geocode', ok: false };
  }

  try {
    const results = await NativeBridge.location.reverseGeocode(lat, lon);
    if (results.length === 0) {
      return { title: 'Reverse Geocode', summary: 'No address found', spokenNarrative: 'No address found', operation: 'reverse_geocode', ok: false };
    }

    const content = `Reverse Geocode:\n${results.slice(0, 3).map((r, i) => `${i + 1}. ${r.formattedAddress}`).join('\n')}`;
    return { title: 'Reverse Geocode', summary: content, spokenNarrative: `Location is ${results[0].formattedAddress}`, operation: 'reverse_geocode', ok: true, record: { latitude: lat, longitude: lon, results } };
  } catch (error) {
    return { title: 'Reverse Geocode', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Reverse geocoding failed', operation: 'reverse_geocode', ok: false };
  }
}