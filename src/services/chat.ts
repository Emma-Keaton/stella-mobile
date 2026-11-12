/**
 * Stella Mobile — Chat Service
 *
 * Conversation orchestration: message CRUD, history, system prompt,
 * streaming coordination between UI and llama.rn inference.
 * Persists to WatermelonDB (via AsyncStorage fallback).
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  modelId?: string
  engine?: 'upstream' | 'mbuzai'
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  modelId?: string
}

const CONVERSATIONS_KEY = 'stella_conversations'
const ACTIVE_CONVERSATION_KEY = 'stella_active_conversation'

class ChatService {
  private conversations: Conversation[] = []
  private activeId: string | null = null
  private onMessageStream?: (token: string, isFinal: boolean) => void

  constructor() {
    this.loadConversations()
  }

  async loadConversations() {
    try {
      const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY)
      if (raw) this.conversations = JSON.parse(raw)
      const active = await AsyncStorage.getItem(ACTIVE_CONVERSATION_KEY)
      this.activeId = active ?? null
    } catch (e) {
      console.warn('[Chat] Failed to load conversations', e)
    }
  }

  async saveConversations() {
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(this.conversations))
    if (this.activeId) await AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, this.activeId)
  }

  getConversations(): Conversation[] {
    return this.conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  getActiveConversation(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeId)
  }

  setActiveConversation(id: string) {
    this.activeId = id
    AsyncStorage.setItem(ACTIVE_CONVERSATION_KEY, id)
  }

  createConversation(title = 'New Chat', modelId?: string): Conversation {
    const now = Date.now()
    const conv: Conversation = {
      id: `conv_${now}`,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
      modelId,
    }
    this.conversations.unshift(conv)
    this.activeId = conv.id
    this.saveConversations()
    return conv
  }

  addMessage(
    convId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    modelId?: string,
    engine?: 'upstream' | 'mbuzai',
  ): ChatMessage {
    const conv = this.conversations.find(c => c.id === convId)
    if (!conv) throw new Error(`Conversation ${convId} not found`)

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: Date.now(),
      modelId,
      engine,
    }
    conv.messages.push(msg)
    conv.updatedAt = Date.now()
    this.saveConversations()
    return msg
  }

  updateLastMessage(convId: string, content: string, isFinal: boolean) {
    const conv = this.conversations.find(c => c.id === convId)
    if (!conv) return
    const last = conv.messages[conv.messages.length - 1]
    if (last && last.role === 'assistant') {
      last.content = content
      conv.updatedAt = Date.now()
      if (isFinal) this.saveConversations()
    }
  }

  deleteConversation(id: string) {
    this.conversations = this.conversations.filter(c => c.id !== id)
    if (this.activeId === id) this.activeId = null
    this.saveConversations()
  }

  clearMessages(convId: string) {
    const conv = this.conversations.find(c => c.id === id)
    if (conv) {
      conv.messages = []
      conv.updatedAt = Date.now()
      this.saveConversations()
    }
  }

  setStreamHandler(handler: (token: string, isFinal: boolean) => void) {
    this.onMessageStream = handler
  }

  getStreamHandler() {
    return this.onMessageStream
  }
}

export const chat = new ChatService()
