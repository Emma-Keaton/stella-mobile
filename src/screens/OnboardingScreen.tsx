/**
 * Stella Mobile — Onboarding Screen
 * Mobile + tablet responsive with permission granting ("Grant All").
 */

import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Switch, Dimensions, Alert, ActivityIndicator, FlatList,
} from 'react-native'

import { getTheme, type StellaThemeId, IS_TABLET } from '../theme/index'
import { DEFAULT_SETTINGS, DEFAULT_VOICE_CONFIG, type PermissionType, SupportedLanguage, SUPPORTED_LANGUAGES } from '../core/types'
import { StellaStorage } from '../core/storage'
import { modelDownloader } from '../services/model-downloader'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TAB = IS_TABLET(SCREEN_WIDTH)

const STEPS = ['welcome', 'theme', 'engine', 'models', 'downloads', 'voice', 'device', 'permissions', 'complete'] as const

const ALL_PERMISSIONS: PermissionType[] = [
  'microphone', 'camera', 'location', 'storage', 'notification',
  'contacts', 'sms', 'phone', 'external_storage', 'wifi', 'bluetooth', 'activity_recognition',
]

const PERMISSION_LABELS: Record<PermissionType, string> = {
  microphone: 'Microphone',
  camera: 'Camera',
  location: 'Location',
  storage: 'Storage',
  notification: 'Notifications',
  contacts: 'Contacts',
  sms: 'SMS',
  phone: 'Phone',
  external_storage: 'External Storage',
  wifi: 'Wi-Fi',
  bluetooth: 'Bluetooth',
  activity_recognition: 'Activity Recognition',
}

export default function OnboardingScreen() {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [step, setStep] = useState<typeof STEPS[number]>('welcome')
  const [engine, setEngine] = useState<'upstream' | 'mbuzai'>('upstream')
  const [modelFolder, setModelFolder] = useState('')
  const [downloadDest, setDownloadDest] = useState('')
  const [deviceConnect, setDeviceConnect] = useState(false)
  const [deviceName, setDeviceName] = useState('Stella Mobile')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [deviceSize, setDeviceSize] = useState<'phone' | 'tablet_small' | 'tablet_large'>('phone')
  
  // Voice onboarding state
  const [voiceLanguage, setVoiceLanguage] = useState<SupportedLanguage>('en')
  const [voiceTargetLanguage, setVoiceTargetLanguage] = useState<SupportedLanguage>('es')
  const [voiceModelDownloading, setVoiceModelDownloading] = useState(false)
  const [voiceModelProgress, setVoiceModelProgress] = useState<{ stage: string; percent: number } | null>(null)
  const [voiceModelsDownloaded, setVoiceModelsDownloaded] = useState(false)

  const [permissions, setPermissions] = useState<Record<PermissionType, boolean>>(
    ALL_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p]: false }), {})
  )
  const [grantingAll, setGrantingAll] = useState(false)

  const tokens = getTheme(themeId).tokens
  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const themes: StellaThemeId[] = ['void', 'oled', 'light', 'solar']

  const goNext = useCallback(() => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }, [step])

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }, [step])

  const togglePermission = (p: PermissionType) => {
    setPermissions((prev) => ({ ...prev, [p]: !prev[p] }))
  }

  const grantAll = async () => {
    setGrantingAll(true)
    try {
      const allGranted: Record<PermissionType, boolean> = {}
      ALL_PERMISSIONS.forEach((p) => { allGranted[p] = true })
      setPermissions(allGranted)
    } catch (e) {
      Alert.alert('Permission Error', 'Failed to grant all permissions.')
    } finally {
      setGrantingAll(false)
    }
  }

  const denyAll = () => {
    const allDenied: Record<PermissionType, boolean> = {}
    ALL_PERMISSIONS.forEach((p) => { allDenied[p] = false })
    setPermissions(allDenied)
  }

  const finish = useCallback(async () => {
    setLoading(true)
    try {
      const settings = { ...DEFAULT_SETTINGS, theme: themeId, local_only: true, default_engine: engine }
      settings.device.device_connect_enabled = deviceConnect
      settings.device.device_name = deviceName
      settings.device.device_size = deviceSize
      settings.permissions = permissions
      settings.voice = DEFAULT_VOICE_CONFIG
      settings.media.download_destinations = downloadDest ? [{
        id: 'dest_1', name: 'Primary Downloads', path: downloadDest, default: true,
      }] : []
      settings.media.model_folders = modelFolder ? [{
        id: 'folder_1', name: 'Stella Models', path: modelFolder, type: 'local', watch: true, models: [],
      }] : []

      await StellaStorage.saveSettings(settings)
      await StellaStorage.setItem('stella_onboarding_v1', {
        completed: true,
        theme_selected: themeId,
        engine_selected: engine,
        model_folder_selected: modelFolder,
        download_destination_selected: downloadDest,
        device_connect_enabled: deviceConnect,
        permissions_granted: Object.entries(permissions).filter(([_, v]) => v).map(([k]) => k),
      })
    } catch (e: any) {
      Alert.alert('Setup failed', e.message)
    } finally {
      setLoading(false)
    }
  }, [themeId, engine, modelFolder, downloadDest, deviceConnect, deviceName, deviceSize, permissions])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />
      <ScrollView
        contentContainerStyle={{ padding: IS_TAB ? 40 : 20, backgroundColor: tokens.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: IS_TAB ? 40 : 24 }}>
          <View style={{
            width: IS_TAB ? 60 : 44, height: IS_TAB ? 60 : 44,
            borderRadius: IS_TAB ? 30 : 22,
            backgroundColor: tokens.primary,
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ color: tokens['on-primary'], fontSize: IS_TAB ? 28 : 20, fontWeight: '700' }}>
              S
            </Text>
          </View>
          <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 28 : 20, fontWeight: '700', marginTop: 12 }}>
            Stella
          </Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: IS_TAB ? 14 : 12, marginTop: 4 }}>
            Local AI Assistant — Onboarding
          </Text>
        </View>

        <View style={{ marginBottom: IS_TAB ? 30 : 20, width: '100%' }}>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 6, alignSelf: 'flex-start' }}>
            Step {stepIndex + 1} of {STEPS.length}
          </Text>
          <View style={{ height: 6, backgroundColor: tokens.border, borderRadius: 3, overflow: 'hidden', width: '100%' }}>
            <View style={{ height: '100%', width: `${progress}%`, backgroundColor: tokens.primary }} />
          </View>
          <Text style={{ color: tokens['text-muted'], fontSize: 10, marginTop: 4, alignSelf: 'flex-start' }}>
            {STEPS[stepIndex].replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        {step === 'welcome' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Welcome to Stella
            </Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: IS_TAB ? 15 : 14, lineHeight: IS_TAB ? 24 : 22 }}>
              Stella runs entirely on your device.
            </Text>
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: tokens['text-muted'], fontSize: 12, marginBottom: 6 }}>Your name (optional)</Text>
              <TextInput
                placeholder="e.g. Alex"
                value={username}
                onChangeText={setUsername}
                style={{
                  backgroundColor: tokens.surface, color: tokens['text-primary'],
                  padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border,
                  fontSize: IS_TAB ? 16 : 14,
                }}
              />
            </View>
          </View>
        )}
        {step === 'theme' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Choose Theme
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {themes.map((t) => {
                const th = getTheme(t)
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setThemeId(t)}
                    style={{
                      width: IS_TAB ? 140 : 110, height: IS_TAB ? 100 : 80,
                      borderRadius: 12,
                      backgroundColor: th.tokens.bg,
                      borderWidth: 2,
                      borderColor: themeId === t ? th.primary : th.border,
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: th.primary, marginBottom: 6 }} />
                    <Text style={{ color: th.primary, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                      {th.name}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}
        {step === 'engine' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Local Inference Engine
            </Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13, marginBottom: 16 }}>
              Select the default engine for local GGUF model inference.
              Upstream = general models � mbuzai = K2/sensitive models
            </Text>
            {[['upstream', 'Upstream (llama.cpp)'], ['mbuzai', 'mbuzai (fork)']] as const}.map(([id, label]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setEngine(id)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 14, borderRadius: 10,
                  backgroundColor: engine === id ? tokens.primary : tokens.surface,
                  borderWidth: 1,
                  borderColor: engine === id ? tokens.primary : tokens.border,
                  marginBottom: 8,
                }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 12,
                  backgroundColor: engine === id ? tokens['on-primary'] : 'transparent',
                  borderWidth: engine === id ? 0 : 1, borderColor: tokens.border,
                  justifyContent: 'center', alignItems: 'center' }}>
                  {engine === id && <Text style={{ color: tokens['on-primary'], fontSize: 10, fontWeight: 'bold' }}>?</Text>}
                </View>
                <Text style={{ color: engine === id ? tokens['on-primary'] : tokens['text-primary'], fontSize: 14 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 'models' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Model Folders
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
          </View>
        )}
        {step === 'downloads' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Download Destination
            </Text>
            <View style={{ backgroundColor: tokens.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: tokens.border, marginBottom: 12 }}>
              <TextInput
                placeholder="/storage/emulated/0/Stella/downloads"
                value={downloadDest}
                onChangeText={setDownloadDest}
                style={{
                  backgroundColor: 'transparent', color: tokens['text-primary'],
                  padding: 12, borderRadius: 6, fontSize: IS_TAB ? 15 : 13,
                }}
              />
            </View>
          </View>
        )}
        {step === 'device' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Device Size
            </Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13, marginBottom: 16 }}>
              Select your device type for optimal UI layout.
            </Text>
            {[
              ['phone', 'Phone'],
              ['tablet_small', 'Tablet (Small)'],
              ['tablet_large', 'Tablet (Large)'],
            ] as const}.map(([id, label]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setDeviceSize(id)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 12, borderRadius: 10,
                  backgroundColor: deviceSize === id ? tokens.primary : tokens.surface,
                  borderWidth: 1,
                  borderColor: deviceSize === id ? tokens.primary : tokens.border,
                  marginBottom: 8,
                }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 12,
                  backgroundColor: deviceSize === id ? tokens['on-primary'] : 'transparent',
                  borderWidth: deviceSize === id ? 0 : 1, borderColor: tokens.border,
                  justifyContent: 'center', alignItems: 'center' }}>
                  {deviceSize === id && <Text style={{ color: tokens['on-primary'], fontSize: 10, fontWeight: 'bold' }}>?</Text>}
                </View>
                <Text style={{ color: deviceSize === id ? tokens['on-primary'] : tokens['text-primary'], fontSize: 14 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 'permissions' && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 22 : 18, fontWeight: '600', marginBottom: 12 }}>
              Permissions
            </Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 13, marginBottom: 16 }}>
              Grant permissions for Stella to access device features.
              Microphone and storage are required for voice and models.
            </Text>
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity
                onPress={grantAll}
                disabled={grantingAll}
                style={{
                  paddingVertical: 14, borderRadius: 10,
                  backgroundColor: grantingAll ? tokens.border : tokens.primary,
                  alignItems: 'center', width: '100%',
                }}
              >
                <Text style={{ color: grantingAll ? tokens['text-muted'] : tokens['on-primary'], fontSize: 14, fontWeight: '600' }}>
                  {grantingAll ? 'Granting All�' : 'Grant All Permissions'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={denyAll}
                style={{
                  paddingVertical: 10, borderRadius: 8,
                  backgroundColor: tokens.border + '22', alignItems: 'center', marginTop: 8,
                }}
              >
                <Text style={{ color: tokens['text-muted'], fontSize: 12 }}>Deny All</Text>
              </TouchableOpacity>
            </View>
            <View style={{ maxHeight: IS_TAB ? 300 : 200, backgroundColor: tokens.surface, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, overflow: 'hidden' }}>
              <FlatList
                data={ALL_PERMISSIONS}
                renderItem={({ item }) => {
                  const granted = permissions[item]
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => togglePermission(item)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
                        backgroundColor: granted ? tokens.primary + '11' : 'transparent',
                        borderBottomWidth: 1, borderBottomColor: tokens.border,
                      }}
                    >
                      <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 12,
                        backgroundColor: granted ? tokens.primary : tokens.surface,
                        borderWidth: 1, borderColor: granted ? tokens.primary : tokens.border,
                        justifyContent: 'center', alignItems: 'center' }}>
                        {granted && <Text style={{ color: tokens['on-primary'], fontSize: 10, fontWeight: 'bold' }}>?</Text>}
                      </View>
                      <Text style={{ color: tokens['text-primary'], flex: 1, fontSize: 13 }}>
                        {PERMISSION_LABELS[item]}
                      </Text>
                    </TouchableOpacity>
                  )
                }}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: IS_TAB ? 280 : 180 }}
              />
            </View>
          </View>
        )}
        {step === 'complete' && (
          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <View style={{
              width: IS_TAB ? 70 : 50, height: IS_TAB ? 70 : 50,
              borderRadius: IS_TAB ? 35 : 25,
              backgroundColor: tokens.success,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ color: tokens['on-success'], fontSize: IS_TAB ? 32 : 24, fontWeight: 'bold' }}>?</Text>
            </View>
            <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 20 : 16, fontWeight: '600' }}>
              Setup Complete
            </Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: IS_TAB ? 14 : 12, marginTop: 6, textAlign: 'center' }}>
              Stella is ready to run locally on your device.
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          {stepIndex > 0 && (
            <TouchableOpacity
              onPress={goBack}
              style={{
                flex: 1, paddingVertical: 14, borderRadius: 10,
                backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: tokens['text-primary'], fontSize: 14 }}>Back</Text>
            </TouchableOpacity>
          )}
          {step === 'complete' ? (
            <TouchableOpacity
              onPress={finish}
              disabled={loading}
              style={{
                flex: 2, paddingVertical: 14, borderRadius: 10,
                backgroundColor: loading ? tokens.border : tokens.primary,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: loading ? tokens['text-muted'] : tokens['on-primary'], fontSize: 14, fontWeight: '600' }}>
                {loading ? 'Finishing�' : 'Finish Setup'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={goNext}
              style={{
                flex: 2, paddingVertical: 14, borderRadius: 10,
                backgroundColor: tokens.primary, alignItems: 'center',
              }}
            >
              <Text style={{ color: tokens['on-primary'], fontSize: 14, fontWeight: '600' }}>
                {stepIndex === STEPS.length - 2 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
