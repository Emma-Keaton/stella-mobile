/**
 * Stella Mobile — Location Operations Part 3
 * Nearby search, sources
 */

import { NativeBridge, NativeBridgeExt, NativeBridgeExt2 } from '../../native/bridges';

export async function findNearby(params: any): Promise<any> {
  try {
    const category = params.category || 'restaurant';
    const radius = Math.min(Math.max(params.radius || 1000, 100), 50000);
    
    const location = await NativeBridgeExt.location.getCurrentPosition({ enableHighAccuracy: true });
    
    await NativeBridgeExt.maps.initialize();
    await NativeBridgeExt.maps.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });

    const content = `Nearby ${category}s (within ${radius}m):\n📍 Search centered at your location\n🗺️ Map opened - explore nearby\n📍 Use map to find ${category}s`;

    return { title: `Nearby ${category}s`, summary: content, spokenNarrative: `Searching for ${category}s near you`, operation: 'nearby', ok: true, record: { category, radius, latitude: location.latitude, longitude: location.longitude } };
  } catch (error) {
    return { title: 'Nearby', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Nearby search failed', operation: 'nearby', ok: false };
  }
}

export function getSources(): any {
  return { 
    title: 'Location Sources', 
    summary: 'Location from Expo Location (GPS, geocoding), Maps from React Native Maps (Google Maps / Apple Maps). Requires API keys for production.', 
    spokenNarrative: 'Location uses Expo Location and React Native Maps', 
    operation: 'sources', 
    ok: true, 
    record: { 
      source: 'expo-location, react-native-maps', 
      operations: ['current', 'geocode', 'reverse_geocode', 'map', 'directions', 'nearby', 'sources'],
      setup: 'Add Google Maps API key for Android, Apple Maps works natively on iOS'
    } 
  };
}