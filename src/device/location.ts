/**
 * Stella Mobile — Location Finding
 * Get device location and address information.
 */

import Geolocation from '@react-native-community/geolocation'

export interface LocationResult {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  heading?: number
  speed?: number
  timestamp: number
  address?: string
}

export class LocationFinder {
  static async getCurrentLocation(options: { accuracy?: 'high' | 'balanced' | 'low' } = {}): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          })
        },
        (err) => reject(err),
        {
          enableHighAccuracy: options.accuracy === 'high',
          timeout: 15000,
          maximumAge: 10000,
        }
      )
    })
  }

  static async watchLocation(callback: (pos: LocationResult) => void): Promise<number> {
    return Geolocation.watchPosition(
      (pos) => callback({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      }),
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
  }

  static async clearWatch(watchId: number): Promise<void> {
    Geolocation.clearWatch(watchId)
  }
}
