/**
 * Stella Mobile — Model Router Screen
 * Shows dual-model routing status: upstream vs mbuzai engine availability,
 * routing decisions, and sensitivity enforcement.
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../theme/index'
import { modelRouter } from '../services/model-router'

export default function RouterScreen() {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [upstreamReady, setUpstreamReady] = useState(false)
  const [mbuzaiReady, setMbuzaiReady] = useState(false)

  const tokens = getTheme(themeId).tokens
  const catalog = modelRouter.getCatalog()

  useEffect(() => {
    // Simulate engine readiness — in production this comes from llama.rn native module
    setUpstreamReady(true)
    setMbuzaiReady(true)
    modelRouter.setEngineReady('upstream', true)
    modelRouter.setEngineReady('mbuzai', true)
  }, [])

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
          </Text>
          {[
            { id: 'upstream', label: 'Upstream (llama.cpp)', ready: upstreamReady },
            { id: 'mbuzai', label: 'mbuzai (fork)', ready: mbuzaiReady },
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
              <Text style={{ color: tokens['text-primary'], fontSize: 15, flex: 1 }}>{eng.label}</Text>
              <Text style={{ color: eng.ready ? tokens.success : tokens.error, fontSize: 13, fontWeight: '600' }}>
                {eng.ready ? 'Ready' : 'Offline'}
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
