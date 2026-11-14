/**
 * Stella Mobile — Model Router Screen
 * Shows dual-model routing status: upstream vs mbuzai engine availability,
 * routing decisions, and sensitivity enforcement.
 * Queries llama.rn native module for real engine status.
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { NativeModules, Platform } from 'react-native'

import { getTheme, type StellaThemeId } from '../theme/index'
import { modelRouter } from '../services/model-router'
import { inference } from '../services/inference'

const { LlamaRn } = NativeModules

export default function RouterScreen() {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [upstreamReady, setUpstreamReady] = useState(false)
  const [mbuzaiReady, setMbuzaiReady] = useState(false)
  const [checkingEngines, setCheckingEngines] = useState(true)
  const [engineDetails, setEngineDetails] = useState<{
    upstream?: { runtime: string; contextSize: number; threads: number }
    mbuzai?: { runtime: string; contextSize: number; threads: number }
  }>({})

  const tokens = getTheme(themeId).tokens
  const catalog = modelRouter.getCatalog()

  useEffect(() => {
    checkEngineReadiness()
  }, [])

  const checkEngineReadiness = async () => {
    setCheckingEngines(true)
    try {
      if (!LlamaRn) {
        console.warn('[RouterScreen] llama.rn native module not available')
        setCheckingEngines(false)
        return
      }

      // Query upstream engine status
      let upstreamStatus: any = null
      let mbuzaiStatus: any = null

      try {
        upstreamStatus = await LlamaRn.getEngineStatus?.('upstream')
      } catch (e) {
        console.log('[RouterScreen] Upstream engine not initialized')
      }

      try {
        mbuzaiStatus = await LlamaRn.getEngineStatus?.('mbuzai')
      } catch (e) {
        console.log('[RouterScreen] mbuzai engine not initialized')
      }

      const upstreamIsReady = !!upstreamStatus
      const mbuzaiIsReady = !!mbuzaiStatus

      setUpstreamReady(upstreamIsReady)
      setMbuzaiReady(mbuzaiIsReady)
      modelRouter.setEngineReady('upstream', upstreamIsReady)
      modelRouter.setEngineReady('mbuzai', mbuzaiIsReady)

      // Store detailed engine info for display
      setEngineDetails({
        upstream: upstreamStatus ? {
          runtime: upstreamStatus.runtime || 'llama.cpp',
          contextSize: upstreamStatus.contextSize || 0,
          threads: upstreamStatus.threads || 0,
        } : undefined,
        mbuzai: mbuzaiStatus ? {
          runtime: mbuzaiStatus.runtime || 'llama.cpp (mbuzai)',
          contextSize: mbuzaiStatus.contextSize || 0,
          threads: mbuzaiStatus.threads || 0,
        } : undefined,
      })
    } catch (e) {
      console.error('[RouterScreen] Failed to check engine readiness:', e)
    } finally {
      setCheckingEngines(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />
      <ScrollView
        contentContainerStyle={{ padding: 20, backgroundColor: tokens.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 22, fontWeight: '700' }}>Model Router</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 14, marginTop: 4 }}>
            Dual-model routing status
          </Text>
        </View>

        {/* Engine Status */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Inference Engines
            {checkingEngines && (
              <ActivityIndicator size="small" color={tokens['text-secondary']} style={{ marginLeft: 8 }} />
            )}
          </Text>
          {[
            { id: 'upstream', label: 'Upstream (llama.cpp)', ready: upstreamReady, details: engineDetails.upstream },
            { id: 'mbuzai', label: 'mbuzai (fork)', ready: mbuzaiReady, details: engineDetails.mbuzai },
          ].map((eng) => (
            <TouchableOpacity
              key={eng.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: tokens.surface,
                borderWidth: 1,
                borderColor: tokens.border,
              }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: eng.ready ? tokens.success : tokens.error, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: tokens['text-primary'], fontSize: 15 }}>{eng.label}</Text>
                {eng.details && (
                  <Text style={{ color: tokens['text-secondary'], fontSize: 11, marginTop: 2 }}>
                    {eng.details.runtime} · ctx:{eng.details.contextSize} · {eng.details.threads} threads
                  </Text>
                )}
              </View>
              <Text style={{ color: eng.ready ? tokens.success : tokens.error, fontSize: 13, fontWeight: '600' }}>
                {checkingEngines ? 'Checking…' : eng.ready ? 'Ready' : 'Offline'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Routing Rules */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Routing Rules
          </Text>
          <View style={{ backgroundColor: tokens.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: tokens.border }}>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13, marginBottom: 10 }}>{'•'} Public models → upstream engine</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13, marginBottom: 10 }}>{'•'} Sensitive/private models → mbuzai engine</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13, marginBottom: 10 }}>{'•'} Cross-engine only if allow_cross_engine=true</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13 }}>{'•'} Fallback surfaces error if engine unavailable</Text>
          </View>
        </View>

        {/* Model Routing Table */}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Model → Engine Assignments
          </Text>
          {catalog.map((m: any) => (
            <TouchableOpacity
              key={m.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: tokens.border,
              }}
            >
              <Text style={{ color: tokens['text-primary'], fontSize: 14, flex: 1 }}>{m.name}</Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: tokens.border + '22' }}>
                <Text style={{ color: tokens['text-muted'], fontSize: 10, fontWeight: '600' }}>{m.engine}</Text>
              </View>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: sensColor(m.sensitivity) + '22' }}>
                <Text style={{ color: sensColor(m.sensitivity), fontSize: 10, fontWeight: '600' }}>{m.sensitivity}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function sensColor(s: string) {
  if (s === 'private') return '#FF6B6B'
  if (s === 'sensitive') return '#FFB300'
  return '#00E5A3'
}
