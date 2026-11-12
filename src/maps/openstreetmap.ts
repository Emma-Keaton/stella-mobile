/**
 * Stella Mobile — OpenStreetMaps Integration
 * Map tile sources, location finding, and distance measurement.
 */

export class OpenStreetMap {
  static readonly DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  static readonly MAX_ZOOM = 19

  static getTileUrl(z: number, x: number, y: number): string {
    return this.DEFAULT_TILE_URL.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
  }

  static getAttribution(): string {
    return '© OpenStreetMap contributors'
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): { meters: number; km: number; bearing: number } {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360

    return { meters: distance, km: distance / 1000, bearing }
  }

  static calculateBounds(
    centerLat: number,
    centerLon: number,
    radiusKm: number
  ): { north: number; south: number; east: number; west: number } {
    const earthRadius = 6371
    const latRad = (centerLat * Math.PI) / 180
    const dLat = radiusKm / earthRadius
    const dLon = radiusKm / (earthRadius * Math.cos(latRad))

    return {
      north: ((centerLat * 180) / Math.PI + (dLat * 180) / Math.PI) % 180,
      south: ((centerLat * 180) / Math.PI - (dLat * 180) / Math.PI) % 180,
      east: ((centerLon * 180) / Math.PI + (dLon * 180) / Math.PI) % 180,
      west: ((centerLon * 180) / Math.PI - (dLon * 180) / Math.PI) % 180,
    }
  }
}
