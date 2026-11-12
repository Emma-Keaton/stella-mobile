/**
 * Stella Mobile — Device Assistant HUD (Part 1)
 * Heads-up display that appears when Stella is activated via wake word or gesture.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar,
  Dimensions, Animated, KeyboardAvoidingView, PermissionsAndroid, Platform,
} from 'react-native'

import { getTheme, type StellaThemeId } from '../../theme/index'
import { deviceAssistantService } from '../../device/assistant/DeviceAssistantService'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface DeviceAssistantHUDProps {
  visible: boolean
  onClose: () => void
  onSendMessage: (text: string, files?: string[]) => Promise<void>
  themeId: StellaThemeId
}

export default function DeviceAssistantHUD({
  visible,
  onClose,
  onSendMessage,
  themeId,
}: DeviceAssistantHUDProps) {
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle')
  const animation = useRef(new Animated.Value(0)).current

  const tokens = getTheme(themeId)

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
      deviceAssistantService.wakeUp()
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false)
      setStatus('idle')
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setIsListening(true)
          setStatus('listening')
        }
      } catch {}
    }
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text.trim() && attachedFiles.length === 0) return

    setStatus('processing')
    await onSendMessage(text, attachedFiles.length > 0 ? attachedFiles : undefined)
    setInputText('')
    setAttachedFiles([])
    setStatus('idle')
  }

  const attachFile = () => {
    Alert.alert('File Attachment', 'File attachment would open file picker here', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => setAttachedFiles([...attachedFiles, 'attachment_' + Date.now()]) },
    ])
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <StatusBar barStyle="light" backgroundColor={tokens.bg} />
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: tokens.bg,
          opacity: animation,
        }}
      >
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isListening ? tokens.primary : tokens.success,
              marginRight: 8,
            }}
            />
            <Text style={{ color: tokens['text-primary'], fontSize: 16, fontWeight: '600' }}>
              Stella Assistant
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: tokens['text-secondary'], fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>

          {/* Status Indicator */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: tokens.border + '11',
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: status === 'speaking' ? tokens.primary :
              status === 'listening' ? tokens.secondary : tokens.success,
            marginRight: 8,
          }}
          />
          <Text style={{ color: tokens['text-secondary'], fontSize: 12 }}>
            {status === 'listening' ? 'Listening...' :
              status === 'speaking' ? 'Stella is speaking...' :
              status === 'processing' ? 'Processing...' :
              'Ready - Say "Hey Stella" or tap mic'}
          </Text>
        </View>

        {/* Conversation Area */}
        <View style={{ flex: 1, padding: 16 }}>
          {/* Wake word hint */}
          <View style={{
            alignItems: 'center',
            marginBottom: 16,
            padding: 12,
            backgroundColor: tokens.border + '22',
            borderRadius: 12,
          }}>
            <Text style={{ color: tokens['text-muted'], fontSize: 12, textAlign: 'center' }}>
              Say "Hey Stella" or tap the microphone to activate
            </Text>
          </View>

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 6 }}>
                Attached Files:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {attachedFiles.map((file, idx) => (
                  <View key={idx} style={{
                    backgroundColor: tokens.surface,
                    borderWidth: 1,
                    borderColor: tokens.border,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 6,
                    marginBottom: 6,
                  }}>
                    <Text style={{ color: tokens.primary, fontSize: 10 }}>
                      {file}
                    </Text>
                    <TouchableOpacity onPress={() => removeAttachedFile(idx)} style={{ marginLeft: 4 }}>
                      <Text style={{ color: tokens.error, fontSize: 10 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* Input Area */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: tokens.surface,
                  color: tokens['text-primary'],
                  padding: 14,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: tokens.border,
                  fontSize: 15,
                  minHeight: 52,
                  textAlignVertical: 'center',
                }}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message or attach a file..."
                placeholderTextColor={tokens['text-muted']}
                onSubmitEditing={handleSend}
                editable={!isListening && !isSpeaking}
              />
              <TouchableOpacity
                onPress={attachFile}
                disabled={isListening || isSpeaking}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: tokens.border + '22',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: (isListening || isSpeaking) ? 0.5 : 1,
                }}
              >
                <Text style={{ color: tokens.primary, fontSize: 20 }}>??</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleListening}
                disabled={isSpeaking}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: isListening ? tokens.error : tokens.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: tokens['on-primary'], fontSize: 20 }}>
                  {isListening ? '??' : '???'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSend}
                disabled={streaming || !inputText.trim() || isListening || isSpeaking}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: (!streaming && inputText.trim()) ? tokens.primary : tokens['text-muted'],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: tokens['on-primary'], fontSize: 20 }}>?</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}
