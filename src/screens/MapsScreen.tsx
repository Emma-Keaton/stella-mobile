/**
 * Stella Mobile — Maps Screen
 * OpenStreetMaps integration, location tracking, distance measurement.
 */

import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Dimensions, Alert, ActivityIndicator,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../theme/index'
import { OpenStreetMap } from '../maps/openstreetmap'
import { mapTracker } from '../maps/tracking'
import { LocationFinder } from '../device/location'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TAB = SCREEN_WIDTH >= 600

export default function MapsScreen({ onClose }: { onClose?: () => void } = {}) {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [tracking, setTracking] = useState(false)
  const [distance, setDistance] = useState<string>('')
  const [fromLat, setFromLat] = useState('')
  const [fromLon, setFromLon] = useState('')
  const [toLat, setToLat] = useState('')
  const [toLon, setToLon] = useState('')
  const [loading, setLoading] = useState(false)

  const tokens = getTheme(themeId).tokens

  const getCurrentLocation = useCallback(async () => {
    setLoading(true)
    try {
      const pos = await LocationFinder.getCurrentLocation({ accuracy: 'high' })
      setLocation({ lat: pos.latitude, lon: pos.longitude })
    } catch (e: any) {
      Alert.alert('Location Error', e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleTracking = useCallback(() => {
    if (tracking) {
      mapTracker.stopTracking()
      setTracking(false)
    } else {
      mapTracker.startTracking((p) => {
        setLocation({ lat: p.latitude, lon: p.longitude })
      })
      setTracking(true)
    }
  }, [tracking])

  const measureDistance = useCallback(() => {
    const fLat = parseFloat(fromLat)
    const fLon = parseFloat(fromLon)
    const tLat = parseFloat(toLat)
    const tLon = parseFloat(toLon)
    if (isNaN(fLat) || isNaN(fLon) || isNaN(tLat) || isNaN(tLon)) {
      Alert.alert('Invalid Input', 'Please enter valid coordinates')
      return
    }
    const result = OpenStreetMap.calculateDistance(fLat, fLon, tLat, tLon)
    setDistance(`${result.km.toFixed(2)} km (${result.meters.toFixed(0)} m), bearing ${result.bearing.toFixed(0)}°`)
  }, [fromLat, fromLon, toLat, toLon])


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: tokens.bg }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ color: tokens['text-primary'], fontSize: 22, fontWeight: '700' }}>Maps & Location</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 14, marginTop: 4 }}>
              OpenStreetMaps • Tracking • Distance Measurement
            </Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: tokens.primary, fontSize: 16, fontWeight: '600' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Current Location</Text>
          <TouchableOpacity
            onPress={getCurrentLocation}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
              borderRadius: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
            }}
          >
            {loading ? <ActivityIndicator size="small" color={tokens.primary} style={{ marginRight: 8 }} /> : <Text style={{ color: tokens.primary, fontSize: 14, fontWeight: '500', marginRight: 8 }}>📍</Text>}
            <Text style={{ color: tokens['text-primary'], flex: 1 }}>Get Current Location</Text>
            {location && <Text style={{ color: tokens['text-secondary'], fontSize: 12 }}>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Location Tracking</Text>
          <TouchableOpacity
            onPress={toggleTracking}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
              borderRadius: 10, backgroundColor: tracking ? tokens.primary : tokens.surface,
              borderWidth: 1, borderColor: tracking ? tokens.primary : tokens.border,
            }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tracking ? tokens.success : tokens['text-muted'], marginRight: 12 }} />
            <Text style={{ color: tracking ? tokens['on-primary'] : tokens['text-primary'], fontWeight: '500' }}>
              {tracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
            <Text style={{ color: tracking ? tokens['on-primary'] : tokens['text-secondary'], fontSize: 12, marginLeft: 'auto' }}>
              {mapTracker.getTrack().length} points
            </Text>
          </TouchableOpacity>
          {tracking && <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginTop: 4 }}>
            Total distance: {mapTracker.getTotalDistance().km.toFixed(2)} km
          </Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

