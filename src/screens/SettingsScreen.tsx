/**
 * Stella Mobile â€” Settings Screen
 * Theme, engine, model folders, download destination, device connect,
 * AI LLM configurations, device assistant, voice settings.
 */

import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Switch, SafeAreaView, StatusBar,
  TextInput, Alert, Dimensions, ActivityIndicator, FlatList,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../theme/index'
import { StellaStorage } from '../core/storage'
import { DEFAULT_SETTINGS, type AppSettings, SupportedLanguage, AgentLanguageMode, SUPPORTED_LANGUAGES } from '../core/types'
import { cloudProviderManager, CLOUD_PROVIDERS, type ProviderTestResult } from '../ai/cloud-providers'
import { voiceService } from '../services/voice'
import { modelDownloader } from '../services/model-downloader'
import { Dropdown } from '../components/Dropdown'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TAB = SCREEN_WIDTH >= 600

export default function SettingsScreen() {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [localOnly, setLocalOnly] = useState(true)
  const [defaultEngine, setDefaultEngine] = useState<'upstream' | 'mbuzai'>('upstream')
  const [deviceConnectEnabled, setDeviceConnectEnabled] = useState(false)
  const [deviceName, setDeviceName] = useState('Stella Mobile')
  const [downloadPath, setDownloadPath] = useState('')
  const [modelFolder, setModelFolder] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error' | 'unauthorized'>>({})
  const [authorizedModels, setAuthorizedModels] = useState<Record<string, string[]>>({})
  const [deviceAssistantEnabled, setDeviceAssistantEnabled] = useState(false)
  const [deviceAssistantWakeWord, setDeviceAssistantWakeWord] = useState('Hey Stella')
  const [deviceAssistantAutoStart, setDeviceAssistantAutoStart] = useState(false)

  const tokens = getTheme(themeId).tokens
  const themes: StellaThemeId[] = ['void', 'oled', 'light', 'solar']

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await StellaStorage.getSettings()
      if (settings) {
        setThemeId(settings.theme)
        setLocalOnly(settings.local_only ?? true)
        setDefaultEngine(settings.default_engine)
        setDeviceConnectEnabled(settings.device.device_connect_enabled)
        setDeviceName(settings.device.device_name)
        setDownloadPath(settings.media.download_path)
        setModelFolder(settings.media.model_folders?.[0]?.path ?? '')
        setDeviceAssistantEnabled(settings.device.device_assistant_enabled ?? false)
        setDeviceAssistantWakeWord(settings.device.device_assistant_wake_word || 'Hey Stella')
        setDeviceAssistantAutoStart(settings.device.device_assistant_auto_start ?? false)
      }
    } catch {}
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const settings: AppSettings = { ...DEFAULT_SETTINGS }
      settings.theme = themeId
      settings.local_only = localOnly
      settings.default_engine = defaultEngine
      settings.device.device_connect_enabled = deviceConnectEnabled
      settings.device.device_name = deviceName
      settings.device.device_assistant_enabled = deviceAssistantEnabled
      settings.device.device_assistant_wake_word = deviceAssistantWakeWord
      settings.device.device_assistant_auto_start = deviceAssistantAutoStart
      settings.media.download_path = downloadPath
      settings.media.model_folders = modelFolder ? [{
        id: 'folder_1', name: 'Stella Models', path: modelFolder, type: 'local', watch: true, models: [],
      }] : []

      settings.providers = Object.entries(apiKeys).map(([providerId, apiKey]) => ({
        providerId,
        apiKey,
        authorized: cloudProviderManager.isAuthorized(providerId),
        authorizedModels: cloudProviderManager.getAuthorizedModels(providerId),
      }))

      await StellaStorage.saveSettings(settings)
      Alert.alert('Settings Saved', 'Your configuration has been saved.')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const testApiKey = async (providerId: string) => {
    setTestStatus((prev) => ({ ...prev, [providerId]: 'testing' }))
    cloudProviderManager.setApiKey(providerId, apiKeys[providerId] || '')
    const result = await cloudProviderManager.testConnection(providerId)
    if (result.ok) {
      setTestStatus((prev) => ({ ...prev, [providerId]: 'success' }))
      setAuthorizedModels((prev) => ({ ...prev, [providerId]: result.models }))
    } else if (result.error?.includes('401') || result.error?.includes('403')) {
      setTestStatus((prev) => ({ ...prev, [providerId]: 'unauthorized' }))
    } else {
      setTestStatus((prev) => ({ ...prev, [providerId]: 'error' }))
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />
      <ScrollView
        contentContainerStyle={{ padding: 20, backgroundColor: tokens.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 22, fontWeight: '700' }}>Settings</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 14, marginTop: 4 }}>
            Configure Stella Mobile
          </Text>
        </View>

        {/* Theme */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Theme</Text>
          {themes.map((t) => {
            const th = getTheme(t)
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setThemeId(t)}
                style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: themeId === t ? th.primary : th.surface,
                  borderWidth: 1, borderColor: themeId === t ? th.primary : th.border,
                }}
              >
                <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: th.primary, marginRight: 12 }} />
                <Text style={{ color: themeId === t ? th['on-primary'] : th['text-primary'], fontWeight: '500' }}>
                  {th.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Default Engine */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Default Inference Engine</Text>
          {['upstream', 'mbuzai'] as const.map((eng) => {
            const label = eng === 'upstream' ? 'Upstream (llama.cpp)' : 'mbuzai (fork)'
            return (
              <TouchableOpacity
                key={eng}
                onPress={() => setDefaultEngine(eng)}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 10,
                  backgroundColor: defaultEngine === eng ? tokens.primary : tokens.surface,
                  borderWidth: 1, borderColor: defaultEngine === eng ? tokens.primary : tokens.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: defaultEngine === eng ? tokens['on-primary'] : tokens['text-primary'], fontWeight: '500' }}>
                  {label}
                </Text>
              </TouchableOpacity>
            )}
        </View>
        </View>

        {/* AI LLM Configurations */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>AI LLM Configurations</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 12 }}>
            Configure cloud providers and local LLM. Enter API keys, test authorization,
            and select from authorized models.
          </Text>
          {CLOUD_PROVIDERS.map((provider) => {
            const status = testStatus[provider.id] || 'idle'
            const models = authorizedModels[provider.id] || []
            const statusColor = status === 'success' ? tokens.success : status === 'error' || status === 'unauthorized' ? tokens.error : tokens.border
            return (
              <View key={provider.id} style={{ marginBottom: 14, padding: 14, backgroundColor: tokens.surface, borderRadius: 10, borderWidth: 1, borderColor: tokens.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: tokens['text-primary'], fontWeight: '600' }}>{provider.name}</Text>
                  <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
                    {status === 'testing' ? 'Testing...' : status === 'success' ? 'Authorized' : status === 'unauthorized' ? 'Unauthorized' : status === 'error' ? 'Error' : 'Not tested'}
                  </Text>
                </View>
                <TextInput
                  placeholder="API Key"
                  value={apiKeys[provider.id] || ''}
                  onChangeText={(v) => setApiKeys((prev) => ({ ...prev, [provider.id]: v }))}
                  secureTextEntry
                  style={{
                    backgroundColor: 'transparent', color: tokens['text-primary'],
                    padding: 10, borderRadius: 6, borderWidth: 1, borderColor: tokens.border,
                    fontSize: IS_TAB ? 14 : 12, marginBottom: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={() => testApiKey(provider.id)}
                  disabled={status === 'testing'}
                  style={{
                    paddingVertical: 10, borderRadius: 8,
                    backgroundColor: tokens.primary, alignItems: 'center', width: '100%',
                  }}
                >
                  <Text style={{ color: tokens['on-primary'], fontWeight: '600', fontSize: 13 }}>
                    {status === 'testing' ? 'Testing...' : 'Test & Authorize'}
                  </Text>
                </TouchableOpacity>
                {models.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: tokens['text-secondary'], fontSize: 11, marginBottom: 6 }}>
                      Authorized Models ({models.length}):
                    </Text>
                    <FlatList
                      data={models}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{
                            paddingVertical: 6, borderBottomWidth: 1, borderColor: tokens.border,
                          }}
                        >
                          <Text style={{ color: tokens['text-primary'], fontSize: 12 }}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item) => item}
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 100 }}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        {/* Model Folders */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Model Folders (Local Imports)</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 8 }}>
            Point Stella at folders containing your local GGUF models. Models are imported
            from your download hub — none are bundled with the app.
          </Text>
          <View style={{ backgroundColor: tokens.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: tokens.border, marginBottom: 12 }}>
            <TextInput
              placeholder="/storage/emulated/0/Stella/models"
              value={modelFolder}
              onChangeText={setModelFolder}
              style={{
                backgroundColor: 'transparent', color: tokens['text-primary'],
                padding: 12, borderRadius: 6, fontSize: IS_TAB ? 15 : 13,
              }}
            />
          </View>
          <TouchableOpacity onPress={() => {}} style={{
            paddingVertical: 12, borderRadius: 8, backgroundColor: tokens.border + '22', alignItems: 'center',
          }}>
            <Text style={{ color: tokens.primary, fontSize: 13, fontWeight: '500' }}>Browse…</Text>
          </TouchableOpacity>
        </View>

        {/* Download Destination */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Download Destination</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 8 }}>
            Where downloaded media and models are stored on this device.
          </Text>
          <View style={{ backgroundColor: tokens.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: tokens.border, marginBottom: 12 }}>
            <TextInput
              placeholder="/storage/emulated/0/Stella/downloads"
              value={downloadPath}
              onChangeText={setDownloadPath}
              style={{
                backgroundColor: 'transparent', color: tokens['text-primary'],
                padding: 12, borderRadius: 6, fontSize: IS_TAB ? 15 : 13,
              }}
            />
          </View>
        </View>

        {/* Device Connect */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Device Connect</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 12 }}>
            Connect to other Stella instances (mobile-to-mobile or mobile-to-PC).
          </Text>
          <TouchableOpacity
            onPress={() => setDeviceConnectEnabled(!deviceConnectEnabled)}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
              borderRadius: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
            }}
          >
            <Switch value={deviceConnectEnabled} onValueChange={setDeviceConnectEnabled}
              trackColor={{ false: tokens.border, true: tokens.primary }} />
            <Text style={{ color: tokens['text-primary'], marginLeft: 12, flex: 1 }}>
              Enable device mesh connections
            </Text>
          </TouchableOpacity>
          {deviceConnectEnabled && (
            <View style={{ backgroundColor: tokens.border + '11', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: tokens.border, marginTop: 8 }}>
              <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 6 }}>Device Name</Text>
              <TextInput
                placeholder="Stella Mobile"
                value={deviceName}
                onChangeText={setDeviceName}
                style={{
                  backgroundColor: 'transparent', color: tokens['text-primary'],
                  padding: 10, borderRadius: 6, fontSize: IS_TAB ? 15 : 13,
                }}
              />
            </View>
          )}
        </View>

        {/* Device Assistant */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Device Assistant</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 12 }}>
            Connect Stella to other devices and enable hands-free voice control.
          </Text>
          <TouchableOpacity
            onPress={() => setDeviceAssistantEnabled(!deviceAssistantEnabled)}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
              borderRadius: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
            }}
          >
            <Switch value={deviceAssistantEnabled} onValueChange={setDeviceAssistantEnabled}
              trackColor={{ false: tokens.border, true: tokens.primary }} />
            <Text style={{ color: tokens['text-primary'], marginLeft: 12, flex: 1 }}>
              Enable Device Assistant (Wake Word)
            </Text>
          </TouchableOpacity>
          {deviceAssistantEnabled && (
            <View style={{ backgroundColor: tokens.border + '11', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: tokens.border, marginTop: 8 }}>
              <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 6 }}>Wake Word</Text>
              <TextInput
                placeholder="Hey Stella"
                value={deviceAssistantWakeWord}
                onChangeText={setDeviceAssistantWakeWord}
                style={{
                  backgroundColor: 'transparent', color: tokens['text-primary'],
                  padding: 10, borderRadius: 6, fontSize: IS_TAB ? 15 : 13,
                }}
              />
            </View>
          )}
        </View>

        {/* Local Only */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setLocalOnly(!localOnly)}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
              borderRadius: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
            }}
          >
            <Switch value={localOnly} onValueChange={setLocalOnly}
              trackColor={{ false: tokens.border, true: tokens.primary }} />
            <Text style={{ color: tokens['text-primary'], marginLeft: 12, flex: 1 }}>
              Local-only mode (no cloud)
            </Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 12 }}>{localOnly ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={saveSettings}
          disabled={loading}
          style={{
            marginTop: 30, paddingVertical: 16, borderRadius: 12,
            backgroundColor: loading ? tokens.border : tokens.primary,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: loading ? tokens['text-muted'] : tokens['on-primary'], fontSize: 15, fontWeight: '600' }}>
            {loading ? 'Saving…' : 'Save Settings'}
          </Text>
        </TouchableOpacity>

        <View style={{ marginBottom: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
