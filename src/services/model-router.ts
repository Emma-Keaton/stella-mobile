/**
 * Stella Mobile — Dual-Model Router
 *
 * Routes local model inference to the correct llama.rn engine based on
 * model ARCHITECTURE (not sensitivity):
 *   - Normal LLM (llama, qwen, etc.) → upstream engine
 *   - K2 architecture models → mbuzai fork engine
 *
 * Mirrors core/server.py logic (upstream port 11434, K2/mbuzai port 11435).
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

export type Engine = 'upstream' | 'mbuzai'
export type ModelArchitecture = 'llama' | 'k2-horizon' | 'qwen' | 'other'

export interface ModelCatalogEntry {
  id: string
  name: string
  path: string           // local file path to GGUF
  engine: Engine          // preferred engine
  architecture: ModelArchitecture  // model architecture family
  sensitivity: 'public' | 'sensitive' | 'private'
  allow_cross_engine: boolean
  size_mb: number
  downloaded: boolean
  download_url?: string
}

export interface RouteDecision {
  modelId: string
  engine: Engine
  reason: string
  allowed: boolean
  fallback?: Engine
}

const DEFAULT_CATALOG: ModelCatalogEntry[] = [
  {
    id: 'llama-3.2-3b-upstream',
    name: 'Llama 3.2 3B (Upstream)',
    path: '',
    engine: 'upstream',
    architecture: 'llama',
    sensitivity: 'public',
    allow_cross_engine: false,
    size_mb: 2000,
    downloaded: false,
  },
  {
    id: 'k2-horizon-mbuzai',
    name: 'K2-Horizon (mbuzai)',
    path: '',
    engine: 'mbuzai',
    architecture: 'k2-horizon',
    sensitivity: 'private',
    allow_cross_engine: false,
    size_mb: 7000,
    downloaded: false,
  },
]

class ModelRouter {
  private catalog: ModelCatalogEntry[] = []
  private upstreamReady = false
  private mbuzaiReady = false

  constructor() {
    this.loadCatalog()
  }

  async loadCatalog() {
    try {
      const raw = await AsyncStorage.getItem('stella_model_catalog')
      if (raw) {
        this.catalog = JSON.parse(raw)
      } else {
        this.catalog = [...DEFAULT_CATALOG]
        await this.saveCatalog()
      }
    } catch (e) {
      console.warn('[ModelRouter] Failed to load catalog, using defaults', e)
      this.catalog = [...DEFAULT_CATALOG]
    }
  }

  async saveCatalog() {
    await AsyncStorage.setItem('stella_model_catalog', JSON.stringify(this.catalog))
  }

  getCatalog(): ModelCatalogEntry[] {
    return this.catalog
  }

  getModel(modelId: string): ModelCatalogEntry | undefined {
    return this.catalog.find(m => m.id === modelId)
  }

  setEngineReady(engine: Engine, ready: boolean) {
    if (engine === 'upstream') this.upstreamReady = ready
    else this.mbuzaiReady = ready
  }

  /**
   * Route a model request to the correct engine based on ARCHITECTURE:
   *   - Normal LLM (llama, qwen, etc.) → upstream
   *   - K2 architecture → mbuzai fork
   */
  route(modelId: string): RouteDecision {
    const model = this.getModel(modelId)
    if (!model) {
      return {
        modelId,
        engine: 'upstream',
        reason: 'model not found in catalog',
        allowed: false,
      }
    }

    const engineAvailable = model.engine === 'upstream' ? this.upstreamReady : this.mbuzaiReady

    // Determine target engine based on ARCHITECTURE:
    //   Normal LLM → upstream
    //   K2-horizon → mbuzai
    let engine: Engine = model.engine
    let reason = `routed to ${model.engine} engine (${model.architecture})`

    if (model.architecture === 'k2-horizon') {
      engine = 'mbuzai'
      reason = `K2-horizon architecture → mbuzai fork engine`
    } else {
      engine = 'upstream'
      reason = `Normal LLM architecture (${model.architecture}) → upstream engine`
    }

    let allowed = true
    let fallback: Engine | undefined

    // If the required engine isn't available, try cross-engine fallback
    if (!engineAvailable) {
      if (model.allow_cross_engine) {
        const other: Engine = engine === 'upstream' ? 'mbuzai' : 'upstream'
        const otherReady = other === 'upstream' ? this.upstreamReady : this.mbuzaiReady
        if (otherReady) {
          engine = other
          fallback = model.engine
          reason = `${model.engine} unavailable, using cross-engine fallback to ${other}`
        } else {
          allowed = false
          reason = `neither ${model.engine} nor ${other} engine is available`
        }
      } else {
        allowed = false
        reason = `${model.engine} engine unavailable and cross-engine disabled for ${model.architecture} model`
      }
    }

    return {
      modelId,
      engine,
      reason,
      allowed,
      fallback,
    }
  }

  /**
   * Classify a model's architecture based on its filename/path and name.
   */
  classifyArchitecture(path: string, name: string): ModelArchitecture {
    const lower = (path + ' ' + name).toLowerCase()
    if (lower.includes('k2') || lower.includes('horizon') || lower.includes('mbuzai')) {
      return 'k2-horizon'
    }
    if (lower.includes('qwen')) {
      return 'qwen'
    }
    if (lower.includes('llama')) {
      return 'llama'
    }
    return 'other'
  }

  /**
   * Auto-assign engine based on architecture:
   *   - K2-horizon → mbuzai
   *   - Everything else → upstream
   */
  assignEngine(architecture: ModelArchitecture): Engine {
    return architecture === 'k2-horizon' ? 'mbuzai' : 'upstream'
  }
}

export const modelRouter = new ModelRouter()