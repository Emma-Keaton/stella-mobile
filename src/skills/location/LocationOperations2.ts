/**
 * Stella Mobile — Location Operations Part 2
 * Map, directions, nearby, sources
 */

import { NativeBridge, NativeBridgeExt, NativeBridgeExt2 } from '../../native/bridges';

async function getCurrentLocationCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const location = await NativeBridgeExt.location.getCurrentPosition({ enableHighAccuracy: true });
    return { latitude: location.latitude, longitude: location.longitude };
  } catch {
    return null;
  }
}

export async function showMap(params: any): Promise<any> {
  try {
    const lat = params.latitude || 0;
    const lon = params.longitude || 0;
    const zoom = params.zoom || 15;
    const mapType = params.mapType || 'standard';

    await NativeBridgeExt.maps.initialize();
    await NativeBridgeExt.maps.animateToRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01 * (20 - zoom),
      longitudeDelta: 0.01 * (20 - zoom),
    });

    await NativeBridgeExt.maps.addMarker({
      coordinate: { latitude: lat, longitude: lon },
      title: 'Center',
      description: 'Map center',
    });

    await NativeBridgeExt.maps.showUserLocation(true);

    const content = `Map displayed:\n📍 Center: ${lat.toFixed(6)}, ${lon.toFixed(6)}\n🔍 Zoom: ${zoom}\n🗺️ Type: ${mapType}\n✅ User location shown`;

    return { title: 'Map', summary: content, spokenNarrative: `Map centered at ${lat}, ${lon} zoom ${zoom}`, operation: 'map', ok: true, record: { latitude: lat, longitude: lon, zoom, mapType } };
  } catch (error) {
    return { title: 'Map', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Failed to show map', operation: 'map', ok: false };
  }
}

async function getCurrentLocationCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const location = await NativeBridgeExt.location.getCurrentPosition({ enableHighAccuracy: true });
    return { latitude: location.latitude, longitude: location.longitude };
  } catch {
    return null;
  }
}

export async function getDirections(destination: string, originLat?: number, originLon?: number): Promise<any> {
  if (!destination) {
    return { title: 'Directions', summary: 'Destination required', spokenNarrative: 'Please provide a destination', operation: 'directions', ok: false };
  }

  try {
    const destResults = await NativeBridgeExt.location.geocode(destination);
    if (destResults.length === 0) {
      return { title: 'Directions', summary: `Could not find: ${destination}`, spokenNarrative: `Could not find ${destination}`, operation: 'directions', ok: false };
    }

    const dest = destResults[0];
    const origin = (originLat !== undefined && originLon !== undefined) 
      ? { latitude: originLat, longitude: originLon }
      : await getCurrentLocationCoords();

    await NativeBridgeExt.maps.initialize();
    await NativeBridgeExt.maps.animateToRegion({
      latitude: dest.latitude,
      longitude: dest.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });

    await NativeBridgeExt.maps.addMarker({
      coordinate: { latitude: dest.latitude, longitude: dest.longitude },
      title: destination,
      description: 'Destination',
    });

    if (origin) {
      await NativeBridgeExt.maps.addMarker({
        coordinate: { latitude: origin.latitude, longitude: origin.longitude },
        title: 'Your Location',
        description: 'Starting point',
      });
    }

    const content = `Directions to ${destination}:\n📍 Destination: ${dest.formattedAddress}\n🗺️ Map opened with route\n📐 Distance: Calculate via map`;

    return { title: 'Directions', summary: content, spokenNarrative: `Directions to ${destination}. Opening map.`, operation: 'directions', ok: true, record: { destination, origin, destLat: dest.latitude, destLon: dest.longitude } };
  } catch (error) {
    return { title: 'Directions', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Failed to get directions', operation: 'directions', ok: false };
  }
}