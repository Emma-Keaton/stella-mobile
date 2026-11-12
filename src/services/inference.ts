/**
 * Stella Mobile — llama.rn Inference Service
 *
 * Wraps the llama.rn native module for both upstream and mbuzai engines.
 * Provides load/generate/stream/unload per engine. All inference runs
 * fully on-device — no Python, no server, no network required.
 */

import { NativeModules, Platform } from 'react-native'

const { LlamaRn } = NativeModules

if (!LlamaRn) {
  console.warn('[Inference] llama.rn native module not found — install llama.rn and rebuild native')
}

export type Engine = 'upstream' | 'mbuzai'

export interface InferenceOptions {
  temperature?: number
  top_p?: number
  top_k?: number
  max_tokens?: number
  seed?: number
}

export interface StreamCallback {
  (token: string, isFinal: boolean): void
}

class InferenceService {
  private loadedModel: { path: string; engine: Engine } | null = null
  private contextId: number | null = null

  /**
   * Load a GGUF model into the specified engine's llama.rn context.
   */
  async loadModel(modelPath: string, engine: Engine): Promise<boolean> {
    if (!LlamaRn) {
      throw new Error('llama.rn native module not available')
    }

    // Unload any existing model first
    await this.unloadModel()

    try {
      const result = await LlamaRn.loadModel({
        modelPath,
        engine,
        ctxSize: 4096,
        nThreads: 4,
      })

      this.loadedModel = { path: modelPath, engine }
      this.contextId = result.contextId
      console.log(`[Inference] Loaded ${engine} model: ${modelPath} (ctx=${this.contextId})`)
      return true
    } catch (e) {
      console.error(`[Inference] Failed to load ${engine} model`, e)
      return false
    }
  }

  /**
   * Generate a completion (non-streaming).
   */
  async generate(prompt: string, engine: Engine, opts: InferenceOptions = {}): Promise<string> {
    if (!LlamaRn) throw new Error('llama.rn native module not available')

    try {
      const result = await LlamaRn.generate({
        prompt,
        engine,
        temperature: opts.temperature ?? 0.7,
        topP: opts.top_p ?? 0.9,
        topK: opts.top_k ?? 40,
        maxTokens: opts.max_tokens ?? 512,
        seed: opts.seed,
      })
      return result.text
    } catch (e) {
      console.error(`[Inference] Generate failed on ${engine}`, e)
      throw e
    }
  }

  /**
   * Stream tokens via callback.
   */
  async stream(
    prompt: string,
    engine: Engine,
    onToken: StreamCallback,
    opts: InferenceOptions = {},
  ): Promise<void> {
    if (!LlamaRn) throw new Error('llama.rn native module not available')

    try {
      await LlamaRn.streamTokens({
        prompt,
        engine,
        temperature: opts.temperature ?? 0.7,
        topP: opts.top_p ?? 0.9,
        topK: opts.top_k ?? 40,
        maxTokens: opts.max_tokens ?? 512,
        onToken: (token: string, isFinal: boolean) => {
          onToken(token, isFinal)
        },
      })
    } catch (e) {
      console.error(`[Inference] Stream failed on ${engine}`, e)
      throw e
    }
  }

  /**
   * Unload the current model from the engine context.
   */
  async unloadModel(): Promise<void> {
    if (!LlamaRn) return
    if (this.contextId !== null) {
      try {
        await LlamaRn.unloadModel({ contextId: this.contextId })
      } catch (e) {
        console.warn('[Inference] unloadModel warning', e)
      }
      this.contextId = null
      this.loadedModel = null
    }
  }

  getLoadedModel() {
    return this.loadedModel
  }

  isLoaded() {
    return this.loadedModel !== null
  }
}

export const inference = new InferenceService()
