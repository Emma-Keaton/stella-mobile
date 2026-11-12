/**
 * Stella Mobile — Chat Screen (Complete)
 * Mobile + tablet responsive chat UI with streaming, voice-to-voice, agent lifecycle.
 * Uses on-device VoiceService for STT/TTS/VAD/Translation/Conversation Loop.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, StatusBar, Dimensions, ActivityIndicator, Alert, FlatList,
  Modal,
} from 'react-native'
// import Voice from '@react-native-voice/voice'  // Replaced by VoiceService
// import Speech from 'expo-speech'  // Replaced by VoiceService

import { getTheme, CHAT_BUBBLE_MAX_WIDTH, IS_TABLET, type StellaThemeId } from '../theme/index'
import { modelRouter } from '../services/model-router'
import { inference } from '../services/inference'
import { chat } from '../services/chat'
import { agentLifecycle } from '../agent/lifecycle/agent-lifecycle'
import { friendlyError } from '../core/errors'
import { voiceService } from '../services/voice'
import { VoiceStatus, ConversationLoopOptions } from '../services/voice'
import { StellaStorage } from '../core/storage'
import { DEFAULT_SETTINGS } from '../core/types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const IS_TAB = IS_TABLET(SCREEN_WIDTH)
const IS_TABLET_LARGE = IS_TAB && SCREEN_WIDTH >= 800

export default function ChatScreen() {
  const [themeId, setThemeId] = useState<StellaThemeId>('void')
  const [conversation, setConversation] = useState<any>(null)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<string>('')
  const [agentTasks, setAgentTasks] = useState<any[]>([])
  const [agentMode, setAgentMode] = useState(false)
  
  // Voice state (using VoiceService)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceListening, setVoiceListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [conversationLoopActive, setConversationLoopActive] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null)
  const [transcriptionText, setTranscriptionText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [vadActive, setVadActive] = useState(false)
  
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const tokens = getTheme(themeId).tokens

  // Initialize VoiceService on mount
  useEffect(() => {
    const initVoice = async () => {
      try {
        const settings = await StellaStorage.getSettings()
        const voiceConfig = settings?.voice || DEFAULT_SETTINGS.voice
        await voiceService.initialize(voiceConfig)
        setVoiceStatus(voiceService.getStatus())
      } catch (e) {
        console.error('[ChatScreen] Voice service init failed', e)
      }
    }
    initVoice()
    
    return () => {
      voiceService.destroy().catch(() => {})
    }
  }, [])

  // Update voice status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setVoiceStatus(voiceService.getStatus())
      setVoiceListening(voiceService.getStatus().listening)
      setSpeaking(voiceService.getStatus().speaking)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const toggleVoice = async () => {
    if (conversationLoopActive) {
      await stopConversationLoop()
    } else {
      await startConversationLoop()
    }
  }

  const startConversationLoop = async () => {
    try {
      setConversationLoopActive(true)
      setVoiceEnabled(true)
      
      const options: ConversationLoopOptions = {
        onUserSpeech: (text, isFinal, translated) => {
          setTranscriptionText(text)
          if (translated) setTranslatedText(translated)
          if (isFinal) {
            // Send the transcribed text as a message
            handleVoiceMessage(text, translated)
          }
        },
        onAgentResponse: (text, audioChunk) => {
          // Agent response will be handled by the streaming logic
          console.log('[ChatScreen] Agent response:', text)
        },
        onTurnChange: (turn) => {
          console.log('[ChatScreen] Turn changed to:', turn)
        },
        onError: (error) => {
          console.error('[ChatScreen] Conversation loop error:', error)
          Alert.alert('Voice Error', error.message)
          setConversationLoopActive(false)
        },
        onVADChange: (isSpeaking) => {
          setVadActive(isSpeaking)
        },
      }
      
      await voiceService.startConversationLoop(options)
    } catch (e) {
      console.error('[ChatScreen] Failed to start conversation loop', e)
      Alert.alert('Error', 'Failed to start voice conversation')
      setConversationLoopActive(false)
    }
  }

  const stopConversationLoop = async () => {
    try {
      await voiceService.stopConversationLoop()
      setConversationLoopActive(false)
      setVoiceEnabled(false)
      setTranscriptionText('')
      setTranslatedText('')
      setVadActive(false)
    } catch (e) {
      console.error('[ChatScreen] Failed to stop conversation loop', e)
    }
  }

  const handleVoiceMessage = async (text: string, translatedText?: string) => {
    if (!text.trim()) return
    
    const messageText = translatedText || text
    setInput(messageText)
    await handleSend()
  }

  // Old toggleVoice function removed - replaced by conversation loop
  // const toggleVoice = async () => { ... }
  // const speakText = async (text: string) => { ... }
  // const stopSpeaking = () => { ... }

  useEffect(() => {
    const active = chat.getActiveConversation()
    if (active) {
      setConversation(active)
      setSelectedModel(active.modelId ?? null)
      if (active.modelId) {
        const decision = modelRouter.route(active.modelId)
        setRouteInfo(decision.reason)
      }
    } else {
      const created = chat.createConversation('New Chat')
      setConversation(created)
    }

    agentLifecycle.onTaskStatusChange = (task) => {
      setAgentTasks((prev) => {
        const existing = prev.find((t) => t.id === task.id)
        if (existing) return prev.map((t) => (t.id === task.id ? task : t))
        return [...prev, task]
      })
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming) return
    if (!selectedModel) {
      Alert.alert('Model Required', 'Please select a model first.')
      return
    }

    const decision = modelRouter.route(selectedModel)
    if (!decision.allowed) {
      Alert.alert('Routing Error', decision.reason)
      return
    }
    setRouteInfo(decision.reason)

    const userMsg = chat.addMessage(conversation.id, 'user', input, selectedModel, decision.engine)
    setConversation(chat.getActiveConversation())
    setInput('')

    if (agentMode) {
      const task = agentLifecycle.createTask(input)
      try {
        await agentLifecycle.runTask(task.id)
        const finalResult = agentLifecycle.getTask(task.id)
        const answer = finalResult?.results
          .map((r: any) => r.output?.answer || r.output)
          .join('\n')
        chat.addMessage(conversation.id, 'assistant', answer || 'Task completed.', selectedModel, decision.engine)
        setConversation(chat.getActiveConversation())
        await speakText(answer || 'Task completed.')
      } catch (e: any) {
        const err = friendlyError(e, { category: 'engine', recoverable: true })
        chat.addMessage(conversation.id, 'assistant', err.userMessage, selectedModel, decision.engine)
        setConversation(chat.getActiveConversation())
        await speakText(err.userMessage)
      }
    } else {
      setStreaming(true)
      let fullContent = ''
      chat.addMessage(conversation.id, 'assistant', '', selectedModel, decision.engine)
      setConversation(chat.getActiveConversation())

      try {
        await inference.stream(
          input,
          decision.engine,
          (token, isFinal) => {
            fullContent += token
            chat.updateLastMessage(conversation.id, fullContent, isFinal)
            setConversation(chat.getActiveConversation())
            if (isFinal) {
              setStreaming(false)
              if (voiceEnabled && fullContent.trim()) {
                speakText(fullContent)
              }
            }
          },
          { temperature: 0.7, max_tokens: 1024 },
        )
      } catch (e: any) {
        const err = friendlyError(e, { category: 'engine', recoverable: true })
        chat.addMessage(conversation.id, 'assistant', err.userMessage, selectedModel, decision.engine)
        setConversation(chat.getActiveConversation())
        setStreaming(false)
        await speakText(err.userMessage)
      }
    }
  }, [input, streaming, selectedModel, conversation, agentMode, voiceEnabled])

  const runAgentTask = useCallback((goal: string) => {
    const task = agentLifecycle.createTask(goal)
    agentLifecycle.runTask(task.id).then(() => {
      setAgentTasks((prev) => [...prev, agentLifecycle.getTask(task.id)!])
    })
    return task.id
  }, [])

  const spawnChildAgent = useCallback((parentTaskId: string, goal: string) => {
    const child = agentLifecycle.spawnChildAgent(parentTaskId, goal)
    Alert.alert('Child Agent Spawned', `Child agent ${child.id} started for: ${goal}`)
    return child.id
  }, [])

  const bubbleStyle = {
    maxWidth: IS_TAB_LARGE ? SCREEN_WIDTH * 0.4 : IS_TAB ? SCREEN_WIDTH * 0.6 : SCREEN_WIDTH * 0.85,
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar barStyle={themeId === 'light' ? 'dark' : 'light'} backgroundColor={tokens.bg} />

      {/* Workspace Sidebar (tablet only) */}
      {IS_TAB && workspaceOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: Math.min(SCREEN_WIDTH * 0.4, 400), backgroundColor: tokens.surface, borderRightWidth: 1, borderRightColor: tokens.border, zIndex: 100 }}>
          <View style={{ padding: 16, paddingTop: 60 }}>
            <Text style={{ color: tokens['text-primary'], fontSize: 18, fontWeight: '700' }}>Workspace</Text>
            <Text style={{ color: tokens['text-secondary'], fontSize: 12, marginBottom: 16 }}>
              Conversations & History
            </Text>
            <FlatList
              data={chat.getConversations ? chat.getConversations() : []}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setConversation(item)
                    setSelectedModel(item.modelId ?? null)
                    setWorkspaceOpen(false)
                  }}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: tokens.border }}
                >
                  <Text style={{ color: tokens['text-primary'], fontSize: 14 }}>{item.title || 'Untitled'}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}

      <View style={{ flex: 1, paddingLeft: IS_TAB && workspaceOpen ? Math.min(SCREEN_WIDTH * 0.4, 400) : 0 }}>
        <View style={{ padding: IS_TAB ? 24 : 16, paddingBottom: 8, backgroundColor: tokens.bg }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ color: tokens['text-primary'], fontSize: IS_TAB ? 20 : 18, fontWeight: '700' }}>
                Stella Chat
              </Text>
              <Text style={{ color: tokens['text-secondary'], fontSize: 12 }}>
                {agentMode ? 'Agent Mode (Dr Zero)' : 'Chat Mode'} • {routeInfo}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {IS_TAB && (
                <TouchableOpacity
                  onPress={() => setWorkspaceOpen(!workspaceOpen)}
                  style={{ padding: 8, borderRadius: 8, backgroundColor: tokens.surface }}
                >
                  <Text style={{ color: tokens.primary, fontSize: 16 }}>📋</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setAgentMode(!agentMode)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: agentMode ? tokens.primary : tokens.surface,
                  borderWidth: 1, borderColor: agentMode ? tokens.primary : tokens.border,
                }}
              >
                <Text style={{ color: agentMode ? tokens['on-primary'] : tokens['text-primary'], fontWeight: '600', fontSize: 12 }}>
                  {agentMode ? 'Agent: ON' : 'Agent: OFF'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleVoice}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: conversationLoopActive ? tokens.error : (voiceListening ? tokens.warning : tokens.surface),
                  borderWidth: 1, borderColor: conversationLoopActive ? tokens.error : (voiceListening ? tokens.warning : tokens.border),
                }}
              >
                <Text style={{ color: conversationLoopActive ? tokens['on-error'] : (voiceListening ? tokens['on-warning'] : tokens['text-primary']), fontWeight: '600', fontSize: 12 }}>
                  {conversationLoopActive ? '🔴 Live Conversation' : voiceListening ? '🎙️ Listening...' : '🎙️ Voice'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setVoiceEnabled(!voiceEnabled)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: voiceEnabled ? tokens.primary : tokens.surface,
                  borderWidth: 1, borderColor: voiceEnabled ? tokens.primary : tokens.border,
                }}
              >
                <Text style={{ color: voiceEnabled ? tokens['on-primary'] : tokens['text-primary'], fontWeight: '600', fontSize: 12 }}>
                  {voiceEnabled ? '🔊 TTS: ON' : '🔇 TTS: OFF'}
                </Text>
              </TouchableOpacity>
              {speaking && (
                <TouchableOpacity onPress={stopSpeaking} style={{ padding: 8 }}>
                  <Text style={{ color: tokens.error, fontSize: 16 }}>⏹️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginBottom: 16 }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {conversation?.messages?.map((msg: any) => {
              const isUser = msg.role === 'user'
              const isStella = msg.role === 'assistant'
              if (!isUser && !isStella) return null
              return (
                <View key={msg.id} style={{ marginVertical: 6, alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                  <View
                    style={{
                      maxWidth: bubbleStyle.maxWidth,
                      padding: 12,
                      borderRadius: 16,
                      backgroundColor: isUser ? tokens['bubble-user'] : tokens['bubble-stella'],
                      borderWidth: 1,
                      borderColor: tokens.border,
                      ...(isUser && { marginLeft: 'auto' }),
                    }}
                  >
                    <Text
                      style={{
                        color: isUser ? tokens['bubble-user-text'] : tokens['bubble-stella-text'],
                        fontSize: IS_TAB ? 16 : 15,
                        lineHeight: IS_TAB ? 24 : 22,
                      }}
                    >
                      {msg.content}
                    </Text>
                    <Text style={{ color: tokens['text-muted'], fontSize: 10, marginTop: 6, alignSelf: 'flex-end' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.engine ?  �  : ''}
                    </Text>
                  </View>
                </View>
              )
            })}
{/* Live Transcription Display */}
            {conversationLoopActive && (transcriptionText || translatedText) && (
              <View style={{ marginVertical: 8, padding: 12, borderRadius: 12, backgroundColor: tokens.border + '22', borderWidth: 1, borderColor: tokens.primary }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ 
                    width: 8, height: 8, borderRadius: 4, 
                    backgroundColor: vadActive ? tokens.primary : tokens['text-muted'],
                    marginRight: 8,
                  }} />
                  <Text style={{ color: tokens['text-secondary'], fontSize: 11, fontWeight: '600' }}>
                    {vadActive ? 'Listening...' : 'Processing...'}
                  </Text>
                </View>
                {transcriptionText && (
                  <Text style={{ color: tokens['text-primary'], fontSize: 14, marginBottom: 4 }}>
                    {transcriptionText}
                  </Text>
                )}
                {translatedText && translatedText !== transcriptionText && (
                  <Text style={{ color: tokens.primary, fontSize: 13, fontStyle: 'italic' }}>
                    {'-> ' + translatedText}
                  </Text>
                )}
              </View>
            )}
            {streaming && (
              <View style={{ marginVertical: 6, alignSelf: 'flex-start' }}>
                <View style={{ padding: 12, borderRadius: 16, backgroundColor: tokens['bubble-stella'], borderWidth: 1, borderColor: tokens.border }}>
                  <ActivityIndicator size="small" color={tokens.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: tokens['bubble-stella-text'], fontSize: 15 }}>Stella is typing�</Text>
                </View>
              </View>
            )}
            {speaking && (
              <View style={{ marginVertical: 6, alignSelf: 'flex-start' }}>
                <View style={{ padding: 12, borderRadius: 16, backgroundColor: tokens.secondary, borderWidth: 1, borderColor: tokens.secondary }}>
                  <ActivityIndicator size="small" color={tokens['on-secondary']} style={{ marginRight: 8 }} />
                  <Text style={{ color: tokens['on-secondary'], fontSize: 15 }}>Stella is speaking�</Text>
                </View>
              </View>
            )}
          </ScrollView>
          {/* Agent Tasks Panel */}
          {agentMode && agentTasks.length > 0 && (
            <View style={{ marginBottom: 16, backgroundColor: tokens.surface, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, overflow: 'hidden' }}>
              <Text style={{ color: tokens['text-primary'], fontSize: 14, fontWeight: '600', padding: 12, backgroundColor: tokens.border + '22' }}>
                Agent Tasks
              </Text>
              <FlatList
                data={agentTasks}
                renderItem={({ item }) => (
                  <View style={{ padding: 10, borderBottomWidth: 1, borderColor: tokens.border }}>
                    <Text style={{ color: tokens['text-primary'], fontSize: 13, fontWeight: '600' }}>{item.goal}</Text>
                    <Text style={{ color: tokens['text-secondary'], fontSize: 11 }}>{item.status} � {item.results.length} steps</Text>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 150 }}
              />
            </View>
          )}
          {/* Input */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 8 }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: tokens.surface,
                color: tokens['text-primary'],
                padding: 14,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: tokens.border,
                fontSize: IS_TAB ? 16 : 15,
                minHeight: 52,
                textAlignVertical: 'center',
              }}
              value={input}
              onChangeText={setInput}
              placeholder="Message Stella�"
              placeholderTextColor={tokens['text-muted']}
              onSubmitEditing={handleSend}
              editable={!streaming}
            />
            <TouchableOpacity
              onPress={toggleDeviceAssistant}
              disabled={streaming}
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: showDeviceAssistant ? tokens.primary : tokens.surface,
                justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: tokens.border,
              }}
            >
              <Text style={{ color: showDeviceAssistant ? tokens['on-primary'] : tokens['text-primary'], fontSize: 20 }}>
                🤖
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleVoice}
              disabled={streaming}
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: voiceListening ? tokens.error : (streaming ? tokens.border : tokens.primary),
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ color: voiceListening ? tokens['on-error'] : tokens['on-primary'], fontSize: 20 }}>
                {voiceListening ? '⏹️' : '🎤'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              disabled={streaming || !input.trim()}
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: (!streaming && input.trim()) ? tokens.primary : tokens['text-muted'],
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ color: tokens['on-primary'], fontSize: 20 }}>↑</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  )
}

const toggleDeviceAssistant = () => {
  // Will be wired to App.tsx device assistant state
  console.log('Toggle Device Assistant')
}
