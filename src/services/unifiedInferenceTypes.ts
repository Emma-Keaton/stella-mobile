/**
 * Stella Mobile — Unified Inference Service (Types & Config)
 * Supports both local (llama.rn) and cloud (OpenAI, Anthropic, Google) LLMs
 */

import { NativeModules } from 'react-native'

const { LlamaRn } = NativeModules

if (!LlamaRn) {
  console.warn('[Inference] llama.rn native module not found — install llama.rn and rebuild native')
}

export type Engine = 'upstream' | 'mbuzai'
export type CloudProvider = 'openai' | 'anthropic' | 'google'
export type ModelProvider = 'local' | 'openai' | 'anthropic' | 'google' | 'auto'

export interface InferenceOptions {
  temperature?: number
  top_p?: number
  top_k?: number
  max_tokens?: number
  seed?: number
  model?: string
  systemPrompt?: string
  engine?: Engine
  taskComplexity?: 'simple' | 'medium' | 'complex'
}

export interface StreamCallback {
  (token: string, isFinal: boolean): void
}

export interface InferenceResult {
  text: string
  provider: ModelProvider
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type ModelProvider = 'local' | 'openai' | 'anthropic' | 'google' | 'auto'