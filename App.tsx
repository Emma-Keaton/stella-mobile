/**
 * Stella Mobile — App.tsx
 * Root navigator with all Stella functionality.
 * Maps, Device, Media screens load as modals.
 */

import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, ScrollView,
  Modal, FlatList,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ChatScreen from './screens/ChatScreen'
import SettingsScreen from './screens/SettingsScreen'
import ModelsScreen from './screens/ModelsScreen'
import RouterScreen from './screens/RouterScreen'
import MapsScreen from './screens/MapsScreen'
import DeviceConnectScreen from './screens/DeviceConnectScreen'
import DeviceAssistantHUD from './components/device/DeviceAssistantHUD'
import Anatomy3DModal from './components/anatomy/Anatomy3DModal'
import { getTheme, type StellaThemeId } from './theme/index'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TABLET = SCREEN_WIDTH >= 600

const Drawer = createDrawerNavigator()
const Stack = createNativeStackNavigator()

function DrawerContent({
  themeId,
  setThemeId,
}: { themeId: StellaThemeId; setThemeId: (id: StellaThemeId) => void }) {
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


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />

      {/* Modal: Maps */}
      <Modal visible={showMaps} onRequestClose={() => setShowMaps(false)} transparent>
        <MapsScreen onClose={() => setShowMaps(false)} />
      </Modal>

      {/* Modal: Device Connect */}
      <Modal visible={showDevice} onRequestClose={() => setShowDevice(false)} transparent>
        <DeviceConnectScreen onClose={() => setShowDevice(false)} />
      </Modal>

      {/* Modal: Media */}
      <Modal visible={showMedia} onRequestClose={() => setShowMedia(false)} transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      </Modal>

      {/* Modal: Device Assistant HUD */}
      <Modal visible={showDeviceAssistant} onRequestClose={() => setShowDeviceAssistant(false)} transparent>
        <DeviceAssistantHUD
          visible={showDeviceAssistant}
          onClose={() => setShowDeviceAssistant(false)}
          onSendMessage={async (text: string, files?: string[]) => {
            setShowDeviceAssistant(false)
            // Send to chat - will be wired to ChatScreen via state
            console.log('Stella chat:', text, files)
          }}
          themeId={themeId}
        />
      </Modal>

      {/* Modal: Anatomy 3D */}
      <Modal visible={showAnatomyModal} onRequestClose={() => setShowAnatomyModal(false)} transparent>
        <Anatomy3DModal
          visible={showAnatomyModal}
          onClose={() => setShowAnatomyModal(false)}
          modelData={activeAnatomyModel}
          themeId={themeId}
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
  )
}

function RootStack() {
  return (
    <Drawer.Navigator
      initialRouteName="Chat"
      drawerContent={(props) => <DrawerContent themeId={props.themeId as StellaThemeId} setThemeId={props.setThemeId as any} />}
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
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [showMaps, setShowMaps] = useState(false)
  const [showDevice, setShowDevice] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [showDeviceAssistant, setShowDeviceAssistant] = useState(false)
  const [showAnatomyModal, setShowAnatomyModal] = useState(false)
  const [activeAnatomyModel, setActiveAnatomyModel] = useState<any>(null)
  const tokens = getTheme(themeId).tokens
