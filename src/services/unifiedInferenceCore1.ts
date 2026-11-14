/**
 * Stella Mobile — Unified Inference Service Core (Part 1)
 */

import { NativeModules } from 'react-native'
import { apiClients } from '../skills/api/ApiClient'
import type { Engine, CloudProvider, ModelProvider, InferenceResult } from './unifiedInferenceTypes'

const { LlamaRn } = NativeModules

if (!LlamaRn) {
  console.warn('[Inference] llama.rn native module not found')
}

class UnifiedInferenceService {
  private localInference: any = null
  private cloudApiKeys: Map<CloudProvider, string> = new Map()

  constructor() {
    if (LlamaRn) this.initLocalInference()
  }

  private initLocalInference(): void {
    this.localInference = {
      loadedModel: null, contextId: null,
      async loadModel(modelPath: string, engine: Engine): Promise<boolean> {
        if (!LlamaRn) throw new Error('llama.rn not available')
        await this.unloadModel()
        try {
          const result = await LlamaRn.loadModel({ modelPath, engine, ctxSize: 4096, nThreads: 4 })
          this.loadedModel = { path: modelPath, engine }
          this.contextId = result.contextId
          return true
        } catch (e) { console.error('Load failed', e); return false }
      },
      async generate(prompt: string, engine: Engine, opts: any = {}): Promise<string> {
        if (!LlamaRn) throw new Error('llama.rn not available')
        try {
          const result = await LlamaRn.generate({ prompt, engine, temperature: opts.temperature??0.7, topP: opts.top_p??0.9, topK: opts.top_k??40, maxTokens: opts.max_tokens??512, seed: opts.seed })
          return result.text
        } catch (e) { console.error('Gen failed', e); throw e }
      },
      async stream(prompt: string, engine: Engine, onToken: any, opts: any = {}): Promise<void> {
        if (!LlamaRn) throw new Error('llama.rn not available')
        try {
          await LlamaRn.streamTokens({ prompt, engine, temperature: opts.temperature??0.7, topP: opts.top_p??0.9, topK: opts.top_k??40, maxTokens: opts.max_tokens??512, onToken: (t:string, f:boolean)=>onToken(t,f) })
        } catch (e) { console.error('Stream failed', e); throw e }
      },
      async unloadModel(): Promise<void> {
        if (!LlamaRn) return
        if (this.contextId !== null) {
          try { await LlamaRn.unloadModel({ contextId: this.contextId }) } catch (e) { console.warn('Unload warn', e) }
          this.contextId = null; this.loadedModel = null
        }
      },
      getLoadedModel() { return this.loadedModel },
      isLoaded() { return this.loadedModel !== null },
    }
  }

  setCloudApiKey(provider: string, key: string): void { this.cloudApiKeys.set(provider, key) }
  getCloudApiKey(provider: string): string | undefined { return this.cloudApiKeys.get(provider) }
  hasCloudApiKey(provider: string): boolean { return this.cloudApiKeys.has(provider) }

  selectProvider(requestedProvider: string, taskComplexity = 'medium'): string {
    if (requestedProvider !== 'auto') {
      if (requestedProvider !== 'local' && !this.hasCloudApiKey(requestedProvider)) {
        console.warn(`No API key for ${requestedProvider}, using local`)
        return 'local'
      }
      return requestedProvider
    }
    if (taskComplexity === 'complex' || taskComplexity === 'medium') {
      if (this.hasCloudApiKey('anthropic')) return 'anthropic'
      if (this.hasCloudApiKey('openai')) return 'openai'
      if (this.hasCloudApiKey('google')) return 'google'
    }
    return 'local'
  }

  async generate(prompt: string, provider: string = 'auto', opts: any = {}): Promise<any> {
    const selectedProvider = this.selectProvider(provider, opts.taskComplexity || 'medium')
    const model = opts.model || this.getDefaultModel(selectedProvider)
    console.log(`[Inference] ${selectedProvider} (${model})`)

    if (selectedProvider === 'local') {
      if (!this.localInference) throw new Error('Local inference unavailable')
      const engine = opts.engine || 'upstream'
      const text = await this.localInference.generate(prompt, engine, { temperature: opts.temperature??0.7, top_p: opts.top_p??0.9, top_k: opts.top_k??40, max_tokens: opts.max_tokens??512, seed: opts.seed })
      return { text, provider: 'local', model: 'local-llama' }
    }
    const apiKey = this.getCloudApiKey(selectedProvider)
    if (!apiKey) throw new Error(`No API key for ${selectedProvider}`)
    return this.callCloudProvider(selectedProvider, prompt, model, opts, apiKey)
  }

  private getDefaultModel(provider: string): string {
    switch (provider) {
      case 'openai': return 'gpt-4-turbo-preview'
      case 'anthropic': return 'claude-3-opus-20240229'
      case 'google': return 'gemini-pro'
      default: return 'gpt-4-turbo-preview'
    }
  }