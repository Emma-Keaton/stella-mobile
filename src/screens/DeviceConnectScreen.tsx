/**
 * Stella Mobile — Device Connect Screen (Part 1)
 * Device mesh connections: QR scanning, pairing codes, URL endpoints.
 */

import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Dimensions, Alert,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../theme/index'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TAB = SCREEN_WIDTH >= 600

export default function DeviceConnectScreen({ onClose }: { onClose?: () => void } = {}) {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [mode, setMode] = useState<'host' | 'join'>('host')
  const [pairingCode, setPairingCode] = useState('')
  const [qrData, setQrData] = useState('')
  const [endpoint, setEndpoint] = useState('')

  const startHosting = useCallback(async () => {
    setLoading(true)
    try {
      setStatus('hosting')
      setPeers([])
    } catch (e: any) {
      setStatus('error')
      Alert.alert('Host Error', e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const joinViaPairingCode = useCallback(async () => {
    if (!pairingCode.trim()) {
      Alert.alert('Error', 'Please enter a pairing code')
      return
    }
    setLoading(true)
    try {
      setStatus('pairing')
      setPeers([{ id: 'peer_1', name: 'Remote Stella', connected: true }])
      setStatus('connected')
    } catch (e: any) {
      setStatus('error')
      Alert.alert('Join Error', e.message)
    } finally {
      setLoading(false)
    }
  }, [pairingCode])

  const joinViaUrl = useCallback(async () => {
    if (!endpoint.trim()) {
      Alert.alert('Error', 'Please enter a URL endpoint')
      return
    }
    setLoading(true)
    try {
      setStatus('pairing')
      setPeers([{ id: 'peer_1', name: 'Remote Stella (PC)', connected: true }])
      setStatus('connected')
    } catch (e: any) {
      setStatus('error')
      Alert.alert('Join Error', e.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  const stopHosting = useCallback(() => {
    setStatus('idle')
    setPeers([])
  }, [])

  const disconnectPeer = useCallback((id: string) => {
    setPeers(peers.filter(p => p.id !== id))
    if (peers.length <= 1) setStatus('idle')
  }, [peers])

  const statusColor = () => {
    switch (status) {
      case 'connected': return tokens.success

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />
      <ScrollView
        contentContainerStyle={{ padding: 20, backgroundColor: tokens.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ color: tokens['text-primary'], fontSize: 22, fontWeight: '700' }}>Device Connect</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 14, marginTop: 4 }}>
              Device mesh — mobile-to-mobile & mobile-to-PC
            </Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: tokens.primary, fontSize: 16, fontWeight: '600' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: tokens.surface, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, marginBottom: 20, overflow: 'hidden' }}>
          {[['host', 'Host'], ['join', 'Join']] as const}.map(([id, label]) => (
            <TouchableOpacity
              key={id}
              onPress={() => setMode(id)}
              style={{
                flex: 1, paddingVertical: 12,
                backgroundColor: mode === id ? tokens.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: mode === id ? tokens['on-primary'] : tokens['text-primary'], fontWeight: '600' }}>
                {label}
              </Text>
            </TouchableOpacity>

        {mode === 'host' && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Host Mode</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 12 }}>
              Other devices can connect to you via QR code or pairing code.
            </Text>
            <View style={{ backgroundColor: tokens.surface, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: tokens.border, alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 150, height: 150, borderWidth: 2, borderColor: tokens.primary, borderRadius: 10, marginBottom: 10 }} />
              <Text style={{ color: tokens.primary, fontSize: 20, fontWeight: 'bold' }}>{qrData.substring(0, 8)}…</Text>
              <Text style={{ color: tokens['text-secondary'], fontSize: 11, marginTop: 6 }}>
                Pairing Code: {pairingCode || 'Generating…'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={status === 'hosting' ? stopHosting : startHosting}
              disabled={loading}
              style={{
                paddingVertical: 14, borderRadius: 8,
                backgroundColor: status === 'hosting' ? tokens.error : tokens.primary,
                alignItems: 'center', width: '100%',
              }}
            >
              <Text style={{ color: tokens['on-primary'], fontWeight: '600' }}>
                {status === 'hosting' ? 'Stop Hosting' : 'Start Hosting'}
              </Text>
            </TouchableOpacity>
            {status === 'hosting' && (
              <Text style={{ color: tokens['text-secondary'], fontSize: 11, marginTop: 8, textAlign: 'center' }}>
                Waiting for peers to connect…
              </Text>
            )}
          </View>

        {mode === 'join' && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Join Mode</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 12 }}>
              Connect to another Stella instance.
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: tokens['text-primary'], fontSize: 13, marginBottom: 6 }}>Pairing Code</Text>
              <TextInput
                placeholder="ABCD12"
                value={pairingCode}
                onChangeText={setPairingCode}
                style={{
                  backgroundColor: tokens.surface, color: tokens['text-primary'],
                  padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border,
                  fontSize: IS_TAB ? 15 : 13,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={joinViaPairingCode}
              disabled={loading || !pairingCode.trim()}
              style={{
                paddingVertical: 12, borderRadius: 8,
                backgroundColor: tokens.primary, alignItems: 'center', marginBottom: 12,
              }}
            >
              <Text style={{ color: tokens['on-primary'], fontWeight: '600' }}>Join via Pairing Code</Text>
            </TouchableOpacity>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: tokens['text-primary'], fontSize: 13, marginBottom: 6 }}>URL Endpoint</Text>
              <TextInput
                placeholder="ws://192.168.1.50:8765"
                value={endpoint}
                onChangeText={setEndpoint}
                style={{
                  backgroundColor: tokens.surface, color: tokens['text-primary'],
                  padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border,
                  fontSize: IS_TAB ? 15 : 13,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={joinViaUrl}
              disabled={loading || !endpoint.trim()}
              style={{
                paddingVertical: 12, borderRadius: 8,
                backgroundColor: tokens.secondary, alignItems: 'center',
              }}

        {peers.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Connected Peers</Text>
            {peers.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                  backgroundColor: tokens.surface, borderRadius: 8,
                  borderWidth: 1, borderColor: tokens.border, marginBottom: 6,
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.connected ? tokens.success : tokens.error, marginRight: 12 }} />
                <Text style={{ color: tokens['text-primary'], flex: 1, fontSize: 14 }}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => disconnectPeer(item.id)}
                  style={{ padding: 6 }}
                >
                  <Text style={{ color: tokens.error, fontSize: 12 }}>Disconnect</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ backgroundColor: tokens.border + '11', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: tokens.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor(), marginRight: 8 }} />
            <Text style={{ color: tokens['text-primary'], fontSize: 13, fontWeight: '600' }}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          <Text style={{ color: tokens['text-secondary'], fontSize: 11 }}>
            {status === 'connected' ? 'Device mesh is active. Peers can exchange chat, models, media, and device control.' :
              status === 'hosting' ? 'Your device is discoverable. Share the QR code or pairing code with other Stella instances.' :
              'Ready to host or join a device connection.'}
          </Text>
        </View>

        <View style={{ marginBottom: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

            >
              <Text style={{ color: tokens['on-secondary'], fontWeight: '600' }}>Join via URL Endpoint</Text>
            </TouchableOpacity>
          </View>
        )}

        )}

          ))}
        </View>

      case 'hosting': return tokens.secondary
      case 'pairing': return tokens.warning
      case 'error': return tokens.error
      default: return tokens['text-muted']
    }
  }

  const [status, setStatus] = useState<'idle' | 'hosting' | 'pairing' | 'connected' | 'error'>('idle')
  const [peers, setPeers] = useState<Array<{ id: string; name: string; connected: boolean }>>([])
  const [loading, setLoading] = useState(false)

  const tokens = getTheme(themeId).tokens
