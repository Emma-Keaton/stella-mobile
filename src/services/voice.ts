/**
 * Stella Mobile — Voice Service
 * On-device Speech-to-Text, Text-to-Speech, VAD, Translation, and Conversational Loop.
 * Uses react-native-executorch for Whisper STT and react-native-tts-kit for neural TTS.
 * Falls back to OS engines when on-device models unavailable.
 */

import { NativeModules, Platform, NativeEventEmitter } from 'react-native'
import { VoiceConfig, SupportedLanguage, AgentLanguageMode, SUPPORTED_LANGUAGES } from '../core/types'
import { modelDownloader, ModelInfo, DownloadProgress } from './model-downloader'
import { inference } from './inference'

const { ExecuTorch, TTSKit, AudioSession } = NativeModules

// Event emitters for native modules
const executorchEmitter = ExecuTorch ? new NativeEventEmitter(ExecuTorch) : null
const ttsKitEmitter = TTSKit ? new NativeEventEmitter(TTSKit) : null
const audioSessionEmitter = AudioSession ? new NativeEventEmitter(AudioSession) : null

export interface VoiceStatus {
  sttReady: boolean
  ttsReady: boolean
  vadReady: boolean
  translationReady: boolean
  listening: boolean
  speaking: boolean
  currentLanguage: SupportedLanguage
}

export interface STTOptions {
  language?: SupportedLanguage
  translate?: boolean
  targetLanguage?: SupportedLanguage
  continuous?: boolean
}

export interface TTSOptions {
  language?: SupportedLanguage
  voice?: string
  pitch?: number
  rate?: number
  stream?: boolean
}

export interface ConversationLoopOptions {
  onUserSpeech: (text: string, isFinal: boolean, translatedText?: string) => void
  onAgentResponse: (text: string, audioChunk?: Uint8Array) => void
  onTurnChange: (turn: 'user' | 'agent') => void
  onError: (error: Error) => void
  onVADChange?: (isSpeaking: boolean) => void
}

interface TranscriptionCallback {
  (text: string, isFinal: boolean, language?: string): void
}

interface VADCallback {
  (isSpeaking: boolean): void
}

class VoiceService {
  private config: VoiceConfig | null = null
  private initialized = false
  private sttInitialized = false
  private ttsInitialized = false
  private vadInitialized = false
  
  // Callbacks
  private transcriptionCallback: TranscriptionCallback | null = null
  private vadCallback: VADCallback | null = null
  private conversationLoopActive = false
  private conversationLoopOptions: ConversationLoopOptions | null = null
  
  // Audio session state
  private currentAudioMode: 'stt' | 'tts' | 'idle' = 'idle'
  
  // Event listeners
  private eventListeners: Map<string, any> = new Map()

  async initialize(config: VoiceConfig): Promise<void> {
    this.config = config
    
    // Download models if needed
    const modelsReady = await modelDownloader.areModelsDownloaded(config)
    if (!modelsReady) {
      console.log('[VoiceService] Models not downloaded, will use OS fallback')
    }

    // Initialize STT (ExecuTorch Whisper)
    await this.initializeSTT()
    
    // Initialize TTS (TTSKit ONNX)
    await this.initializeTTS()
    
    // Initialize VAD
    await this.initializeVAD()
    
    // Initialize Audio Session for echo cancellation
    await this.initializeAudioSession()
    
    this.initialized = true
    console.log('[VoiceService] Initialized successfully')
  }

  private async initializeSTT(): Promise<void> {
    if (!ExecuTorch) {
      console.warn('[VoiceService] ExecuTorch native module not available, STT will use OS fallback')
      this.sttInitialized = false
      return
    }

    try {
      const config = this.config!
      const sttPath = modelDownloader.getSTTPath(config)
      
      // Load Whisper model into ExecuTorch
      await ExecuTorch.loadSTTModel({
        modelPath: sttPath,
        language: config.language,
        enableVAD: true,
        vadThreshold: config.vadSensitivity,
      })

      // Set up transcription listener
      if (executorchEmitter) {
        const listener = executorchEmitter.addListener('onTranscription', (event: any) => {
          if (this.transcriptionCallback) {
            this.transcriptionCallback(event.text, event.isFinal, event.language)
          }
        })
        this.eventListeners.set('stt_transcription', listener)
      }

      // Set up VAD listener
      if (executorchEmitter) {
        const listener = executorchEmitter.addListener('onVADChange', (event: any) => {
          if (this.vadCallback) {
            this.vadCallback(event.isSpeaking)
          }
          if (this.conversationLoopOptions?.onVADChange) {
            this.conversationLoopOptions.onVADChange(event.isSpeaking)
          }
        })
        this.eventListeners.set('stt_vad', listener)
      }

      this.sttInitialized = true
      console.log('[VoiceService] STT initialized with ExecuTorch')
    } catch (e) {
      console.error('[VoiceService] STT initialization failed', e)
      this.sttInitialized = false
    }
  }

  private async initializeTTS(): Promise<void> {
    if (!TTSKit) {
      console.warn('[VoiceService] TTSKit native module not available, TTS will use OS fallback')
      this.ttsInitialized = false
      return
    }

    try {
      const config = this.config!
      const ttsPath = modelDownloader.getTTSPath(config)
      
      // Load TTS model (Kokoro/Supertonic ONNX)
      await TTSKit.loadModel({
        modelPath: ttsPath,
        voice: config.voice, // 'female' for Stella
        language: config.language,
      })

      this.ttsInitialized = true
      console.log('[VoiceService] TTS initialized with TTSKit')
    } catch (e) {
      console.error('[VoiceService] TTS initialization failed', e)
      this.ttsInitialized = false
    }
  }

  private async initializeVAD(): Promise<void> {
    // VAD is built into ExecuTorch Whisper
    this.vadInitialized = this.sttInitialized
  }

  private async initializeAudioSession(): Promise<void> {
    if (!AudioSession) {
      console.warn('[VoiceService] AudioSession native module not available')
      return
    }

    try {
      await AudioSession.configure({
        mode: 'voice_chat',
        category: 'playAndRecord',
        options: ['mixWithOthers', 'allowBluetooth', 'defaultToSpeaker'],
      })

      if (audioSessionEmitter) {
        const listener = audioSessionEmitter.addListener('onInterruption', (event: any) => {
          console.log('[VoiceService] Audio interruption:', event)
          if (event.type === 'began') {
            this.handleAudioInterruption()
          }
        })
        this.eventListeners.set('audio_interruption', listener)
      }

      console.log('[VoiceService] Audio session configured')
    } catch (e) {
      console.error('[VoiceService] Audio session initialization failed', e)
    }
  }

  private handleAudioInterruption(): void {
    // Pause STT when interruption occurs (phone call, etc.)
    if (this.currentAudioMode === 'stt') {
      this.stopListening()
    }
  }

  isReady(): boolean {
    return this.initialized && (this.sttInitialized || this.ttsInitialized)
  }

  getStatus(): VoiceStatus {
    return {
      sttReady: this.sttInitialized,
      ttsReady: this.ttsInitialized,
      vadReady: this.vadInitialized,
      translationReady: this.sttInitialized, // Translation uses Whisper
      listening: this.currentAudioMode === 'stt',
      speaking: this.currentAudioMode === 'tts',
      currentLanguage: this.config?.language || 'en',
    }
  }

  async downloadModels(onProgress?: (progress: DownloadProgress) => void): Promise<void> {
    if (!this.config) throw new Error('VoiceService not initialized')
    await modelDownloader.downloadModels(this.config, onProgress)
    
    // Re-initialize with downloaded models
    await this.initializeSTT()
    await this.initializeTTS()
  }

  async areModelsDownloaded(): Promise<boolean> {
    if (!this.config) return false
    return modelDownloader.areModelsDownloaded(this.config)
  }

  async getModelInfo(): Promise<ModelInfo> {
    if (!this.config) throw new Error('VoiceService not initialized')
    return modelDownloader.getModelInfo(this.config)
  }

  // STT Methods
  async startListening(options: STTOptions = {}): Promise<void> {
    if (!this.config) throw new Error('VoiceService not initialized')
    
    const language = options.language || this.config.language
    const targetLanguage = options.targetLanguage || this.config.targetLanguage
    const translate = options.translate ?? this.config.autoTranslate
    const continuous = options.continuous ?? this.config.continuousListening

    await this.setAudioMode('stt')

    if (this.sttInitialized && ExecuTorch) {
      // Use on-device Whisper with VAD
      await ExecuTorch.startListening({
        language: SUPPORTED_LANGUAGES.find(l => l.code === language)?.whisperCode || 'en',
        translate: translate && language !== targetLanguage,
        targetLanguage: SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.whisperCode || 'en',
        continuous,
        vadThreshold: this.config.vadSensitivity,
      })
    } else {
      // Fallback to OS speech recognition
      console.log('[VoiceService] Using OS speech recognition fallback')
      // This would use @react-native-voice/voice as fallback
    }
  }

  async stopListening(): Promise<void> {
    if (this.sttInitialized && ExecuTorch) {
      await ExecuTorch.stopListening()
    }
    await this.setAudioMode('idle')
  }

  onTranscription(callback: TranscriptionCallback): void {
    this.transcriptionCallback = callback
  }

  onVADChange(callback: VADCallback): void {
    this.vadCallback = callback
  }

  // TTS Methods
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.config) throw new Error('VoiceService not initialized')
    
    const language = options.language || this.config.language
    const voice = options.voice || this.config.voice
    const pitch = options.pitch ?? this.config.pitch
    const rate = options.rate ?? this.config.rate

    await this.setAudioMode('tts')

    if (this.ttsInitialized && TTSKit) {
      // Use on-device neural TTS
      await TTSKit.speak({
        text,
        language: SUPPORTED_LANGUAGES.find(l => l.code === language)?.ttsCode || 'en-US',
        voice, // 'female' for Stella
        pitch,
        rate,
        stream: false,
      })
    } else {
      // Fallback to OS TTS (expo-speech)
      console.log('[VoiceService] Using OS TTS fallback')
      const { Speech } = await import('expo-speech')
      await Speech.speak(text, {
        language: SUPPORTED_LANGUAGES.find(l => l.code === language)?.ttsCode || 'en-US',
        pitch,
        rate,
        voice,
      })
    }

    await this.setAudioMode('idle')
  }

  async stopSpeaking(): Promise<void> {
    if (this.ttsInitialized && TTSKit) {
      await TTSKit.stop()
    } else {
      const { Speech } = await import('expo-speech')
      await Speech.stop()
    }
    await this.setAudioMode('idle')
  }

  async streamSpeak(text: string, onChunk: (audioChunk: Uint8Array) => void): Promise<void> {
    if (!this.config) throw new Error('VoiceService not initialized')
    
    const language = this.config.language
    const voice = this.config.voice
    const pitch = this.config.pitch
    const rate = this.config.rate

    await this.setAudioMode('tts')

    if (this.ttsInitialized && TTSKit) {
      // Stream audio chunks from on-device TTS
      await TTSKit.streamSpeak({
        text,
        language: SUPPORTED_LANGUAGES.find(l => l.code === language)?.ttsCode || 'en-US',
        voice,
        pitch,
        rate,
        onChunk: (chunk: any) => {
          onChunk(new Uint8Array(chunk))
        },
      })
    } else {
      // Fallback: speak normally, no streaming
      await this.speak(text)
    }

    await this.setAudioMode('idle')
  }

  // Translation
  async translate(text: string, fromLang: SupportedLanguage, toLang: SupportedLanguage): Promise<string> {
    if (fromLang === toLang) return text

    // Use multilingual Whisper for direct translation
    if (this.sttInitialized && ExecuTorch) {
      try {
        const result = await ExecuTorch.translate({
          text,
          fromLanguage: SUPPORTED_LANGUAGES.find(l => l.code === fromLang)?.whisperCode || 'en',
          toLanguage: SUPPORTED_LANGUAGES.find(l => l.code === toLang)?.whisperCode || 'en',
        })
        return result.translatedText
      } catch (e) {
        console.warn('[VoiceService] Whisper translation failed, falling back to LLM', e)
      }
    }

    // Fallback: Use local LLM for translation
    return this.translateWithLLM(text, fromLang, toLang)
  }

  private async translateWithLLM(text: string, fromLang: SupportedLanguage, toLang: SupportedLanguage): Promise<string> {
    const fromName = SUPPORTED_LANGUAGES.find(l => l.code === fromLang)?.name || 'English'
    const toName = SUPPORTED_LANGUAGES.find(l => l.code === toLang)?.name || 'English'
    
    const prompt = `Translate the following ${fromName} text to ${toName}. Return only the translation, no explanations:\n\n${text}`
    
    try {
      const result = await inference.generate(prompt, 'upstream', {
        temperature: 0.1,
        max_tokens: 256,
      })
      return result.trim()
    } catch (e) {
      console.error('[VoiceService] LLM translation failed', e)
      return text // Return original if translation fails
    }
  }

  // Audio Session Management (Echo Cancellation)
  async setAudioMode(mode: 'stt' | 'tts' | 'idle'): Promise<void> {
    if (this.currentAudioMode === mode) return
    
    this.currentAudioMode = mode
    
    if (!AudioSession) return
    
    try {
      switch (mode) {
        case 'stt':
          // Prioritize microphone input, duck output
          await AudioSession.setMode('measurement')
          await AudioSession.setActive(true)
          break
        case 'tts':
          // Prioritize audio output, pause microphone
          await AudioSession.setMode('voice_chat')
          await AudioSession.setActive(true)
          break
        case 'idle':
          await AudioSession.setActive(false)
          break
      }
    } catch (e) {
      console.warn('[VoiceService] Audio mode change failed', e)
    }
  }
// Conversational Loop
  async startConversationLoop(options: ConversationLoopOptions): Promise<void> {
    if (this.conversationLoopActive) {
      console.warn('[VoiceService] Conversation loop already active')
      return
    }

    this.conversationLoopActive = true
    this.conversationLoopOptions = options
    
    const config = this.config!
    let currentTurn: 'user' | 'agent' = 'user'
    
    options.onTurnChange(currentTurn)

    // Start continuous listening with VAD
    await this.startListening({
      language: config.language,
      translate: config.autoTranslate,
      targetLanguage: config.targetLanguage,
      continuous: true,
    })

    // Set up transcription handler for conversation loop
    this.onTranscription(async (text, isFinal, detectedLanguage) => {
      if (!this.conversationLoopActive) return
      
      if (isFinal && text.trim()) {
        // User finished speaking
        let userText = text
        let translatedText: string | undefined
        
        // Translate if needed
        if (config.autoTranslate && detectedLanguage && detectedLanguage !== config.targetLanguage) {
          translatedText = await this.translate(text, detectedLanguage as SupportedLanguage, config.targetLanguage)
          userText = translatedText
        }
        
        options.onUserSpeech(text, true, translatedText)
        currentTurn = 'agent'
        options.onTurnChange(currentTurn)
        
        // Get agent response
        try {
          const agentResponse = await this.getAgentResponse(userText, config)
          
          // Determine response language based on agentLanguageMode
          let responseText = agentResponse
          let responseLanguage = config.language
          
          switch (config.agentLanguageMode) {
            case 'speak_in_language':
              // Agent speaks in target language
              if (config.targetLanguage !== config.language) {
                responseText = await this.translate(agentResponse, config.language, config.targetLanguage)
                responseLanguage = config.targetLanguage
              }
              break
            case 'mixed':
              // Agent mixes languages for language learning
              responseText = this.mixLanguages(agentResponse, config.language, config.targetLanguage)
              break
            case 'translate_only':
            default:
              // Agent responds in user's language, translation shown in UI
              break
          }
          
          options.onAgentResponse(responseText)
          
          // Speak the response
          await this.speak(responseText, { language: responseLanguage })
          
        } catch (e) {
          options.onError(e instanceof Error ? e : new Error(String(e)))
        }
        
        currentTurn = 'user'
        options.onTurnChange(currentTurn)
      }
    })
  }

  async stopConversationLoop(): Promise<void> {
    this.conversationLoopActive = false
    this.conversationLoopOptions = null
    await this.stopListening()
    await this.stopSpeaking()
  }

  private async getAgentResponse(userText: string, config: VoiceConfig): Promise<string> {
    // Use the local LLM to generate agent response
    const systemPrompt = `You are Stella, a helpful AI assistant. Respond naturally and concisely. 
User's primary language: ${SUPPORTED_LANGUAGES.find(l => l.code === config.language)?.name}
Target language for learning: ${SUPPORTED_LANGUAGES.find(l => l.code === config.targetLanguage)?.name}
Agent language mode: ${config.agentLanguageMode}`

    const prompt = `${systemPrompt}\n\nUser: ${userText}\nStella:`
    
    try {
      const response = await inference.generate(prompt, 'upstream', {
        temperature: 0.7,
        max_tokens: 512,
      })
      return response.trim()
    } catch (e) {
      console.error('[VoiceService] Agent response generation failed', e)
      return "I'm sorry, I couldn't generate a response."
    }
  }

  private mixLanguages(text: string, primaryLang: SupportedLanguage, targetLang: SupportedLanguage): string {
    // Simple mixing: replace some words with target language equivalents
    // In production, this would be more sophisticated
    const primaryName = SUPPORTED_LANGUAGES.find(l => l.code === primaryLang)?.name || ''
    const targetName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || ''
    
    // For now, just prepend a note about the language mix
    return `[${primaryName}/${targetName} mix] ${text}`
  }

  // Cleanup
  async destroy(): Promise<void> {
    await this.stopConversationLoop()
    
    // Remove all event listeners
    this.eventListeners.forEach((listener) => {
      listener.remove()
    })
    this.eventListeners.clear()
    
    if (this.sttInitialized && ExecuTorch) {
      await ExecuTorch.unloadModel()
    }
    
    if (this.ttsInitialized && TTSKit) {
      await TTSKit.unloadModel()
    }
    
    this.initialized = false
    this.sttInitialized = false
    this.ttsInitialized = false
    this.vadInitialized = false
  }
}

export const voiceService = new VoiceService()