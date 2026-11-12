/**
 * Stella Mobile — Models Screen
 * Model catalog with engine tags, sensitivity labels, download status.
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../theme/index'
import { modelRouter, type ModelCatalogEntry } from '../services/model-router'
import { Alert } from 'react-native'

export default function ModelsScreen() {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const tokens = getTheme(themeId).tokens
  const catalog = modelRouter.getCatalog()

  const engineLabel = (e: 'upstream' | 'mbuzai') => (e === 'upstream' ? 'Upstream' : 'mbuzai')
  const engineColor = (e: 'upstream' | 'mbuzai') =>
    e === 'upstream' ? tokens.secondary : tokens.tertiary
  const sensColor = (s: string) => {
    if (s === 'private') return tokens.error
    if (s === 'sensitive') return tokens.warning
    return tokens.success
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />
      <ScrollView
        contentContainerStyle={{ padding: 20, backgroundColor: tokens.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 22, fontWeight: '700' }}>Models</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 14, marginTop: 4 }}>
            Select a model for local inference
          </Text>
        </View>

        {catalog.map((m: ModelCatalogEntry) => {
          const isSelected = selectedId === m.id
          const decision = modelRouter.route(m.id)
          return (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedId(m.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                backgroundColor: isSelected ? tokens.primary : tokens.surface,
                borderWidth: 1,
                borderColor: isSelected ? tokens.primary : tokens.border,
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: isSelected ? tokens['on-primary'] : tokens['text-primary'], fontWeight: '600', fontSize: 15 }}>
                  {m.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: engineColor(m.engine) + '22' }}>
                    <Text style={{ color: engineColor(m.engine), fontSize: 10, fontWeight: '600' }}>{engineLabel(m.engine)}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: sensColor(m.sensitivity) + '22' }}>
                    <Text style={{ color: sensColor(m.sensitivity), fontSize: 10, fontWeight: '600' }}>{m.sensitivity}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: tokens.border + '22' }}>
                    <Text style={{ color: tokens['text-muted'], fontSize: 10 }}>{m.downloaded ? 'Ready' : 'Download'}</Text>
                  </View>
                </View>
                <Text style={{ color: tokens['text-muted'], fontSize: 12, marginTop: 4 }}>
                  {decision.reason}
                </Text>
              </View>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isSelected ? tokens['on-primary'] : tokens.surface, borderWidth: 1, borderColor: isSelected ? tokens['on-primary'] : tokens.border, justifyContent: 'center', alignItems: 'center' }}>
                {isSelected ? (
                  <Text style={{ color: tokens['on-primary'], fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                ) : (
                  <Text style={{ color: tokens['text-muted'], fontSize: 12 }}>○</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          {catalog.map((m: ModelCatalogEntry) => {
            if (m.architecture === 'k2-horizon') {
              return (
                <TouchableOpacity
                  key={m.id + '-3d'}
                  onPress={() => {
                    setActiveAnatomyModel(m)
                    setShowAnatomyModal(true)
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: tokens.secondary + '22',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: tokens.secondary,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: tokens.secondary, fontWeight: '600' }}>[3D]</Text>
                  <Text style={{ color: tokens['text-primary'], fontSize: 14, flex: 1 }}>
                    3D View: {m.name}
                  </Text>
                </TouchableOpacity>
              )
            }
          })}

        <View style={{ marginTop: 30, paddingHorizontal: 10, alignItems: 'center' }}>
          <Text style={{ color: tokens['text-muted'], fontSize: 12, textAlign: 'center' }}>
            Sensitive/private models require the mbuzai engine. Public models use upstream.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
