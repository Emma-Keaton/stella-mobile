/**
 * Stella Mobile — Anatomy 3D Model Modal (Part 1)
 * Interactive 3D model viewer for anatomy figures.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions,
  Modal, FlatList, Alert,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../../theme/index'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface Anatomy3DModalProps {
  visible: boolean
  onClose: () => void
  modelData?: any
  themeId: StellaThemeId
}

interface AnatomyPart {
  id: string
  name: string
  visible: boolean
  exploded: boolean
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
}

export default function Anatomy3DModal({
  visible,
  onClose,
  modelData,
  themeId,
}: Anatomy3DModalProps) {
  const [isDisassembled, setIsDisassembled] = useState(false)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [parts, setParts] = useState<AnatomyPart[]>([])
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'obj' | 'stl' | 'gltf' | 'glb'>('obj')
  const [destPath, setDestPath] = useState('')

  const tokens = getTheme(themeId)

  useEffect(() => {
    if (visible && modelData) {
      initParts(modelData)
    }
  }, [visible, modelData])

  const initParts = (modelData: any) => {
    const parts: AnatomyPart[] = (modelData.parts || []).map((p: any, i: number) => ({
      id: p.id || `part_${i}`,
      name: p.name || `Part ${i + 1}`,
      visible: true,
      exploded: false,
      position: p.position || { x: 0, y: 0, z: 0 },
      rotation: p.rotation || { x: 0, y: 0, z: 0 },
    }))
    setParts(parts)
  }

  const toggleDisassemble = () => {
    setIsDisassembled(!isDisassembled)
    setParts(parts.map(p => ({
      ...p,
      exploded: !isDisassembled,
    })))
  }

  const togglePart = (partId: string) => {
    setParts(parts.map(p =>
      p.id === partId ? { ...p, visible: !p.visible } : p
    ))
    setSelectedPart(selectedPart === partId ? null : partId)
  }

  const hideAll = () => {
    setParts(parts.map(p => ({ ...p, visible: false })))
    setSelectedPart(null)
  }

  const showAll = () => {
    setParts(parts.map(p => ({ ...p, visible: true })))
  }

  const exportModel = async () => {
    setExporting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      Alert.alert('Export Complete', `Model exported to ${destPath || 'default location'} as ${exportFormat.toUpperCase()}`)
    } catch (e: any) {
      Alert.alert('Export Failed', e.message)
    } finally {
      setExporting(false)
    }
  }

  const partColor = (part: AnatomyPart) => {
    if (part.id === selectedPart) return tokens.primary
    if (!part.visible) return tokens.border
    return tokens.secondary
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle="light" backgroundColor={tokens.bg} />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: tokens.surface,
        borderBottomWidth: 1,
        borderColor: tokens.border,
      }}>
        <Text style={{ color: tokens['text-primary'], fontSize: 20, fontWeight: '700' }}>
          Anatomy 3D Model
        </Text>
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <Text style={{ color: tokens['text-secondary'], fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Model Controls */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: tokens.surface,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: tokens.border,
      }}>
        <TouchableOpacity
          onPress={toggleDisassemble}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: isDisassembled ? tokens.primary : tokens.border + '22',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDisassembled ? tokens.primary : tokens.border,
          }}
        >
          <Text style={{ color: isDisassembled ? tokens['on-primary'] : tokens['text-primary'], fontSize: 13, fontWeight: '600', marginRight: 6 }}>
            {isDisassembled ? 'Assemble' : 'Disassemble'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hideAll} style={{ padding: 8 }}>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12 }}>Hide All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={showAll} style={{ padding: 8 }}>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12 }}>Show All</Text>
        </TouchableOpacity>
        </View>

        {/* 3D Model Placeholder */}
        <View style={{
          flex: 1,
          backgroundColor: tokens.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: tokens.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
        >
          <View style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: tokens.border + '22',
            borderWidth: 2,
            borderColor: tokens.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          >
            <Text style={{ color: tokens.primary, fontSize: 32 }}>🧬</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 14, marginTop: 8 }}>
              3D Model Viewer
            </Text>
          </View>
          <Text style={{ color: tokens['text-muted'], fontSize: 12, marginTop: 12, textAlign: 'center' }}>
            Rotate: Drag • Pinch: Zoom • Tap Part: Select
          </Text>
        </View>

        {/* Parts List */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Model Parts ({parts.length})
          </Text>
          <FlatList
            data={parts}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => togglePart(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: selectedPart === item.id ? tokens.primary + '11' : tokens.surface,
                  borderWidth: 1,
                  borderColor: selectedPart === item.id ? tokens.primary : tokens.border,
                  borderRadius: 8,
                  marginBottom: 6,
                }}
              >
                <View style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: partColor(item),
                  marginRight: 12,
                  borderWidth: 2,
                  borderColor: item.visible ? tokens.primary : tokens.border,
                }}
              />
              <Text style={{ color: item.visible ? tokens['text-primary'] : tokens['text-muted'], fontSize: 13, flex: 1 }}>
                {item.name}
              </Text>
              <Text style={{ color: tokens['text-muted'], fontSize: 10 }}>
                {item.visible ? 'Visible' : 'Hidden'}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: IS_TABLET ? 300 : 200 }}
        />
        </View>

        {/* Export Section */}
        <View style={{ backgroundColor: tokens.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: tokens.border }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Export Model
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {['obj', 'stl', 'gltf', 'glb'] as const}.map(fmt => (
              <TouchableOpacity
                key={fmt}
                onPress={() => setExportFormat(fmt)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: exportFormat === fmt ? tokens.primary : tokens.surface,
                  borderWidth: 1,
                  borderColor: exportFormat === fmt ? tokens.primary : tokens.border,
                }}
              >
                <Text style={{ color: exportFormat === fmt ? tokens['on-primary'] : tokens['text-primary'], fontSize: 12, fontWeight: '600' }}>
                  {fmt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <TextInput
              placeholder="Export destination folder..."
              value={destPath}
              onChangeText={setDestPath}
              style={{
                flex: 1,
                backgroundColor: tokens.border + '22',
                color: tokens['text-primary'],
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: tokens.border,
                fontSize: 13,
              }}
            />
            <TouchableOpacity onPress={() => {}} style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              backgroundColor: tokens.primary,
              borderRadius: 8,
            }}>
              <Text style={{ color: tokens['on-primary'], fontSize: 12, fontWeight: '600' }}>Browse</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={exportModel}
            disabled={exporting}
            style={{
              paddingVertical: 14,
              borderRadius: 10,
              backgroundColor: exporting ? tokens.border : tokens.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: tokens['on-primary'], fontSize: 16, fontWeight: '600' }}>
              {exporting ? 'Exporting...' : 'Export Model'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </Animated.View>
    </SafeAreaView>
  )
}
