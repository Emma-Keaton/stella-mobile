/**
 * Stella Mobile — Unified Inference Service Export
 * Main entry point combining local and cloud inference
 */

import { UnifiedInferenceServicePart2 } from './unifiedInferenceCore2'
import { NativeModules } from 'react-native'

const { LlamaRn } = NativeModules

// Merge the classes
class UnifiedInferenceService extends UnifiedInferenceServicePart2 {
  constructor() {
    super()
    if (LlamaRn) this.initLocalInference()
  }

  private initLocalInference(): void {
    this.localInference = {
      loadedModel: null, contextId: null,
      async loadModel(modelPath: string, engine: any): Promise<boolean> {
        if (!LlamaRn) throw new Error('llama.rn not available')
        await this.unloadModel()
        try {
          const result = await LlamaRn.loadModel({ modelPath, engine, ctxSize: 4096, nThreads: 4 })
          this.loadedModel = { path: modelPath, engine }
          this.contextId = result.contextId
          return true
        } catch (e) { console.error('Load failed', e); return false }
      },
      async generate(prompt: string, engine: any, opts: any = {}): Promise<string> {
        if (!LlamaRn) throw new Error('llama.rn not available')
        try {
          const result = await LlamaRn.generate({ prompt, engine, temperature: opts.temperature??0.7, topP: opts.top_p??0.9, topK: opts.top_k??40, maxTokens: opts.max_tokens??512, seed: opts.seed })
          return result.text
        } catch (e) { console.error('Gen failed', e); throw e }
      },
      async stream(prompt: string, engine: any, onToken: any, opts: any = {}): Promise<void> {
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
}

export const unifiedInference = new UnifiedInferenceServicePart2()
export { unifiedInference as inference }
export { LlamaRn } from 'react-native'
export type { Engine } from './unifiedInferenceTypes'