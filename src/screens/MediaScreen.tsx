/**
 * Stella Mobile — Media Screen
 * Streaming interface for IPTV/watch channels, Sonarr TV sources, and FM radio.
 * Supports playback controls and external player handoff (VLC, etc.).
 */
import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native'
import { getTheme, type StellaThemeId } from '../theme/index'
import { mediaStreamService, type MediaSource, type MediaSourceType, type PlaybackSession } from '../services/media-stream'

type TabType = 'tv' | 'radio' | 'sonarr'

interface MediaScreenProps { onClose: () => void }

export default function MediaScreen({ onClose }: MediaScreenProps) {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [tab, setTab] = useState<TabType>('tv')
  const [sources, setSources] = useState<MediaSource[]>([])
  const [selectedSource, setSelectedSource] = useState<MediaSource | null>(null)
  const [session, setSession] = useState<PlaybackSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newSourceName, setNewSourceName] = useState('')
  const tokens = getTheme(themeId).tokens

  useEffect(() => {
    const init = async () => {
      await mediaStreamService.initialize()
      setSources(mediaStreamService.getSources())
  useEffect(() => { setSources(mediaStreamService.getSources()) }, [tab])
  const filteredSources = sources.filter((s) => { if (tab === 'tv') return s.type === 'iptv' if (tab === 'radio') return s.type === 'radio' if (tab === 'sonarr') return s.type === 'sonarr' return true })
  const handleSelectSource = useCallback((source: MediaSource) => { setSelectedSource(source) }, [])
  const handlePlay = useCallback(async () => { if (!selectedSource) return setLoading(true) try { const validation = await mediaStreamService.validateSource(selectedSource.url) if (!validation.ok) { Alert.alert('Stream Unavailable', validation.error || 'Cannot reach stream source') setLoading(false) return } await mediaStreamService.startSession(selectedSource.id) setSession(mediaStreamService.getCurrentSession()) } catch (e: any) { Alert.alert('Playback Error', e.message || 'Failed to start stream') } finally { setLoading(false) } }, [selectedSource])
  const handlePause = useCallback(async () => { await mediaStreamService.pauseSession() setSession(mediaStreamService.getCurrentSession()) }, [])
  const handleResume = useCallback(async () => { await mediaStreamService.resumeSession() setSession(mediaStreamService.getCurrentSession()) }, [])
  const handleStop = useCallback(async () => { await mediaStreamService.stopSession() setSession(mediaStreamService.getCurrentSession()) setSelectedSource(null) }, [])
      mediaStreamService.setSessionChangeHandler((s) => setSession(s))
      setSession(mediaStreamService.getCurrentSession())
    }
    init()
  }, [])
  const handleExternal = useCallback(async () => { if (!selectedSource) return setLoading(true) try { const result = await mediaStreamService.streamInExternalApp(selectedSource.id) if (!result.ok) { Alert.alert('External Player', result.error || 'Could not launch external player') } setSession(mediaStreamService.getCurrentSession()) } catch (e: any) { Alert.alert('External Player', e.message || 'External player failed') } finally { setLoading(false) } }, [selectedSource])
  const handleAddSource = useCallback(async () => { if (!newSourceUrl || !newSourceName) return setLoading(true) try { const validation = await mediaStreamService.validateSource(newSourceUrl) if (!validation.ok) { Alert.alert('Invalid Source', validation.error || 'Could not reach stream URL') setLoading(false) return } const type: MediaSourceType = tab === 'radio' ? 'radio' : tab === 'sonarr' ? 'sonarr' : 'iptv' await mediaStreamService.addSource({ name: newSourceName, type, url: newSourceUrl, enabled: true }) setSources(mediaStreamService.getSources()) setNewSourceUrl('') setNewSourceName('') } catch (e: any) { Alert.alert('Add Source', e.message || 'Failed to add source') } finally { setLoading(false) } }, [newSourceUrl, newSourceName, tab])
  const isPlaying = session?.status === 'playing'
  const isPaused = session?.status === 'paused'
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle="light" backgroundColor={tokens.bg} />
      <View style={{ padding: 16, backgroundColor: tokens.surface, borderBottomWidth: 1, borderColor: tokens.border }}>
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <Text style={{ color: tokens['text-secondary'], fontSize: 16 }}>✕ Close</Text>
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: tokens.surface }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {['tv', 'radio', 'sonarr'] as const.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: tab === t ? tokens.primary : tokens.border + '22', borderWidth: 1, borderColor: tab === t ? tokens.primary : 'transparent' }}>
              <Text style={{ color: tab === t ? '#ffffff' : tokens['text-primary'], fontSize: 13, fontWeight: '600' }}>{t === 'tv' ? 'Live TV (IPTV)' : t === 'radio' ? 'FM Radio' : 'Sonarr TV'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {tab === 'sonarr' && (
          <View style={{ marginBottom: 12, flexDirection: 'row', gap: 8 }}>
            <TextInput placeholder="Sonarr API URL" value={newSourceUrl} onChangeText={setNewSourceUrl} style={{ flex: 1, padding: 10, backgroundColor: tokens.border + '22', borderRadius: 8, color: tokens['text-primary'] }} />
            <TextInput placeholder="Library Name" value={newSourceName} onChangeText={setNewSourceName} style={{ flex: 1, padding: 10, backgroundColor: tokens.border + '22', borderRadius: 8, color: tokens['text-primary'] }} />
            <TouchableOpacity onPress={handleAddSource} disabled={loading}><Text style={{ color: tokens.primary, fontSize: 14, fontWeight: '600' }}>Add</Text></TouchableOpacity>
          </View>
        )}
        {(tab === 'tv' || tab === 'radio') && (
          <View style={{ marginBottom: 12, flexDirection: 'row', gap: 8 }}>
            <TextInput placeholder="Stream URL" value={newSourceUrl} onChangeText={setNewSourceUrl} style={{ flex: 1, padding: 10, backgroundColor: tokens.border + '22', borderRadius: 8, color: tokens['text-primary'] }} />
            <TextInput placeholder="Stream Name" value={newSourceName} onChangeText={setNewSourceName} style={{ flex: 1, padding: 10, backgroundColor: tokens.border + '22', borderRadius: 8, color: tokens['text-primary'] }} />
            <TouchableOpacity onPress={handleAddSource} disabled={loading}><Text style={{ color: tokens.primary, fontSize: 14, fontWeight: '600' }}>Add</Text></TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ flex: 1, padding: 16 }}>
        <FlatList data={filteredSources} keyExtractor={(item) => item.id} renderItem={({ item }) => {
          const isSelected = selectedSource?.id === item.id
          return (
            <TouchableOpacity key={item.id} onPress={() => handleSelectSource(item)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: isSelected ? tokens.primary + '15' : tokens.surface, borderWidth: 1, borderColor: isSelected ? tokens.primary : tokens.border, borderRadius: 10, marginBottom: 8 }}>
              <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: tokens.border + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 24 }}>{item.type === 'radio' ? '📻' : item.type === 'sonarr' ? '📺' : '📡'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: tokens['text-primary'], fontSize: 15, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: tokens['text-muted'], fontSize: 12 }}>{item.category || item.type.toUpperCase()} • {item.url}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {item.enabled ? (<Text style={{ color: tokens.success, fontSize: 12, fontWeight: '600' }}>✓</Text>) : (<Text style={{ color: tokens.error, fontSize: 12, fontWeight: '600' }}>✗</Text>)}
              </View>
            </TouchableOpacity>
          )
        }} />
      </View>
      {selectedSource && (
        <View style={{ padding: 16, backgroundColor: tokens.surface, borderTopWidth: 1, borderColor: tokens.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={{ color: tokens['text-primary'], fontSize: 18, fontWeight: '700' }}>{selectedSource.name}</Text>
              <Text style={{ color: tokens['text-secondary'], fontSize: 13 }}>{selectedSource.type.toUpperCase()} stream</Text>
            </View>
            <TouchableOpacity onPress={handleStop}><Text style={{ color: tokens.error, fontSize: 16 }}>⏹</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
            <TouchableOpacity onPress={isPlaying ? handlePause : handleResume} disabled={!isPlaying && !isPaused}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tokens.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 24 }}>{isPlaying || isPaused ? '⏸' : '▶'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExternal}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tokens.border + '22', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>📱</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 }}>
            <Text style={{ color: tokens['text-muted'], fontSize: 11 }}>{isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Ready'} • External: VLC / MX Player</Text>
          </View>
          {loading && (
            <View style={{ padding: 16, alignItems: 'center' }}><ActivityIndicator size="small" color={tokens.primary} /></View>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}