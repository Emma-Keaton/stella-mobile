/**
 * Stella Mobile — Map Tracking
 * Track movement and location history on maps.
 */

import { LocationFinder } from '../device/location'

export interface TrackPoint {
  id: string
  latitude: number
  longitude: number
  timestamp: number
  accuracy: number
}

export class MapTracker {
  private track: TrackPoint[] = []
  private watchId: number | null = null

  startTracking(callback?: (point: TrackPoint) => void): number {
    this.watchId = LocationFinder.watchLocation((pos) => {
      const point: TrackPoint = {
        id: `track_${Date.now()}`,
        latitude: pos.latitude,
        longitude: pos.longitude,
        timestamp: pos.timestamp,
        accuracy: pos.accuracy,
      }
      this.track.push(point)
      callback?.(point)
    })
    return this.watchId
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      LocationFinder.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  getTrack(): TrackPoint[] {
    return [...this.track]
  }

  clearTrack(): void {
    this.track = []
  }

  getTotalDistance(): { meters: number; km: number } {
    let total = 0
    for (let i = 1; i < this.track.length; i++) {
      const p1 = this.track[i - 1]
      const p2 = this.track[i]
      const d = this.haversine(p1.latitude, p1.longitude, p2.latitude, p2.longitude)
      total += d
    }
    return { meters: total, km: total / 1000 }
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}

export const mapTracker = new MapTracker()
