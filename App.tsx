/**
 * Stella Mobile â€” App.tsx
 * Root navigator with all Stella functionality.
 * Maps, Device, Media screens load as modals.
 */

import React, { useState, useCallback, useEffect, createContext, useContext } from 'react'
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, ScrollView,
  Modal, FlatList,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ChatScreen from './src/screens/ChatScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import ModelsScreen from './src/screens/ModelsScreen'
import RouterScreen from './src/screens/RouterScreen'
import MapsScreen from './src/screens/MapsScreen'
import DeviceConnectScreen from './src/screens/DeviceConnectScreen'
import DeviceAssistantHUD from './src/components/device/DeviceAssistantHUD'
import Anatomy3DModal from './src/components/anatomy/Anatomy3DModal'
import MediaScreen from './src/screens/MediaScreen'
import { getTheme, type StellaThemeId } from './src/theme/index'
import { StellaStorage } from './src/core/storage'
import { DEFAULT_SETTINGS, type AppSettings } from './src/core/types'
import { chat } from './src/services/chat'
import { voiceService } from './src/services/voice'
import { modelRouter } from './src/services/model-router'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TABLET = SCREEN_WIDTH >= 600

const Drawer = createDrawerNavigator()
const Stack = createNativeStackNavigator()

interface AppContextType {
  themeId: StellaThemeId
  setThemeId: (id: StellaThemeId) => void
  settings: AppSettings | null
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  showMedia: boolean
  setShowMedia: (v: boolean) => void
  showMaps: boolean
  setShowMaps: (v: boolean) => void
  showDevice: boolean
  setShowDevice: (v: boolean) => void
  showDeviceAssistant: boolean
  setShowDeviceAssistant: (v: boolean) => void
  showAnatomyModal: boolean
  setShowAnatomyModal: (v: boolean) => void
  activeAnatomyModel: any
  setActiveAnatomyModel: (model: any) => void
  sendDeviceAssistantMessage: (text: string, files?: string[]) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function DrawerContent() {
  const { themeId, setThemeId } = useApp()
  const tokens = getTheme(themeId).tokens
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.surface, width: IS_TABLET ? 320 : '80%' }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 20 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 20, fontWeight: '700' }}>Stella</Text>
          <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginTop: 4 }}>Local AI Assistant</Text>
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 14, fontWeight: '600', marginBottom: 10 }}>Theme</Text>
          {(['void', 'oled', 'light', 'solar'] as const).map((t) => {
            const th = getTheme(t)
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setThemeId(t)}
                style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
                  backgroundColor: themeId === t ? th.primary : 'transparent', borderRadius: 8,
                }}
              >
                <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: th.primary, marginRight: 10 }} />
                <Text style={{ color: themeId === t ? th['on-primary'] : th['text-primary'], fontSize: 14 }}>{th.name}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: tokens['text-primary'], fontSize: 14, fontWeight: '600', marginBottom: 10 }}>Features</Text>
          {['Chat', 'Models', 'Router', 'Maps', 'Device Connect', 'Media', 'Settings'].map((label, i) => (
            <TouchableOpacity key={label} style={{ paddingVertical: 12, borderRadius: 8, backgroundColor: tokens.border + '22', marginBottom: 4 }}>
              <Text style={{ color: tokens['text-primary'], fontSize: 14 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


function AppProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showMedia, setShowMedia] = useState(false)
  const [showMaps, setShowMaps] = useState(false)
  const [showDevice, setShowDevice] = useState(false)
  const [showDeviceAssistant, setShowDeviceAssistant] = useState(false)
  const [showAnatomyModal, setShowAnatomyModal] = useState(false)
  const [activeAnatomyModel, setActiveAnatomyModel] = useState<any>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await StellaStorage.getSettings()
        setSettings(saved || DEFAULT_SETTINGS)
      } catch (e) {
        console.error('[App] Failed to load settings', e)
        setSettings(DEFAULT_SETTINGS)
      }
    }
    loadSettings()
  }, [])

  const sendDeviceAssistantMessage = useCallback(async (text: string, files?: string[]) => {
    try {
      setShowDeviceAssistant(false)
      if (!text.trim() && (!files || files.length === 0)) return

      let conversationId = activeConversationId
      if (!conversationId) {
        const created = chat.createConversation('Device Assistant Chat')
        conversationId = created.id
        setActiveConversationId(conversationId)
      }

      const selectedModel = settings?.default_engine === 'mbuzai'
        ? modelRouter.getCatalog().find((m) => m.engine === 'mbuzai')?.id
        : modelRouter.getCatalog().find((m) => m.engine === 'upstream')?.id

      if (selectedModel) {
        chat.addMessage(conversationId, 'user', text, selectedModel, settings?.default_engine || 'upstream')
        if (files && files.length > 0) {
          chat.addMessage(conversationId, 'user', `[${files.length} file(s) attached]`, selectedModel, settings?.default_engine || 'upstream')
        }
      }

      setActiveConversationId(conversationId)
    } catch (e: any) {
      console.error('[App] Device Assistant message failed', e)
      Alert.alert('Device Assistant', e.message || 'Failed to send message')
    }
  }, [activeConversationId, settings])

  const value: AppContextType = {
    themeId,
    setThemeId,
    settings,
    activeConversationId,
    setActiveConversationId,
    showMedia,
    setShowMedia,
    showMaps,
    setShowMaps,
    showDevice,
    setShowDevice,
    showDeviceAssistant,
    setShowDeviceAssistant,
    showAnatomyModal,
    setShowAnatomyModal,
    activeAnatomyModel,
    setActiveAnatomyModel,
    sendDeviceAssistantMessage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function RootStack() {
  const { themeId } = useApp()
  const tokens = getTheme(themeId).tokens

  return (
    <Drawer.Navigator
      initialRouteName="Chat"
      drawerContent={() => <DrawerContent />}
      screenOptions={{
        drawerWidth: IS_TABLET ? 320 : '80%',
        drawerType: 'front',
        swipeEnabled: !IS_TABLET,
      }}
    >
      <Drawer.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Drawer.Screen name="Models" component={ModelsScreen} options={{ title: 'Models' }} />
      <Drawer.Screen name="Router" component={RouterScreen} options={{ title: 'Router' }} />
    </Drawer.Navigator>
  )
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light" />

        <Modal
          transparent
          visible={useApp().showMedia}
          onRequestClose={() => useApp().setShowMedia(false)}
        >
          <MediaScreen onClose={() => useApp().setShowMedia(false)} />
        </Modal>

        <Modal
          transparent
          visible={useApp().showMaps}
          onRequestClose={() => useApp().setShowMaps(false)}
        >
          <MapsScreen onClose={() => useApp().setShowMaps(false)} />
        </Modal>

        <Modal
          transparent
          visible={useApp().showDevice}
          onRequestClose={() => useApp().setShowDevice(false)}
        >
          <DeviceConnectScreen onClose={() => useApp().setShowDevice(false)} />
        </Modal>

        <Modal
          transparent
          visible={useApp().showDeviceAssistant}
          onRequestClose={() => useApp().setShowDeviceAssistant(false)}
        >
          <DeviceAssistantHUD
            visible={useApp().showDeviceAssistant}
            onClose={() => useApp().setShowDeviceAssistant(false)}
            onSendMessage={useApp().sendDeviceAssistantMessage}
            themeId={useApp().themeId}
          />
        </Modal>

        <Modal
          transparent
          visible={useApp().showAnatomyModal}
          onRequestClose={() => useApp().setShowAnatomyModal(false)}
        >
          <Anatomy3DModal
            visible={useApp().showAnatomyModal}
            onClose={() => useApp().setShowAnatomyModal(false)}
            modelData={useApp().activeAnatomyModel}
            themeId={useApp().themeId}
          />
        </Modal>

        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: IS_TABLET ? false : true,
            }}
          >
            <Stack.Screen name="Root" component={RootStack} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Models" component={ModelsScreen} />
            <Stack.Screen name="Router" component={RouterScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AppProvider>
  )
}
