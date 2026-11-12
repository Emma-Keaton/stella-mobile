/**
 * Stella Mobile — Cloud AI Providers (Part 1)
 * Configures cloud LLM providers, tests API keys, populates models.
 */

export interface CloudProviderConfig {
  id: string
  name: string
  baseUrl: string
  authHeader: string
  authPrefix: string
  modelsEndpoint: string
  testEndpoint: string
  requiresKey: boolean
  defaultModels: string[]
  capabilities: string[]
}

export interface ProviderCredential {
  providerId: string
  apiKey: string
  tested: boolean
  authorized: boolean
  authorizedModels: string[]
  lastTested?: number
  testError?: string
}

export interface ProviderTestResult {
  ok: boolean
  authorized: boolean
  models: string[]
  error?: string
  message: string
}

export const CLOUD_PROVIDERS: CloudProviderConfig[] = [
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion', 'vision'] },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion'] },
  { id: 'nvidia', name: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion', 'vision'] },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion', 'embedding', 'vision'] },
  { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', authHeader: 'x-api-key', authPrefix: '', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion', 'vision'] },
  { id: 'google', name: 'Google (Gemini)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', authHeader: 'x-goog-api-key', authPrefix: '', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion', 'vision'] },
  { id: 'cline', name: 'Cline', baseUrl: 'https://api.cline.app/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion'] },
  { id: 'cline_pass', name: 'Cline Pass', baseUrl: 'https://cline-pass.api.cline.app/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion'] },

export class CloudProviderManager {
  private credentials: Map<string, ProviderCredential> = new Map()
  private providers: Map<string, CloudProviderConfig> = new Map()

  constructor() {
    for (const p of CLOUD_PROVIDERS) {
      this.providers.set(p.id, p)
      this.credentials.set(p.id, {
        providerId: p.id,
        apiKey: '',
        tested: false,
        authorized: false,
        authorizedModels: [],
      })
    }
  }

  getProviders(): CloudProviderConfig[] {
    return Array.from(this.providers.values())
  }

  getProvider(id: string): CloudProviderConfig | undefined {
    return this.providers.get(id)
  }

  getCredential(id: string): ProviderCredential | undefined {
    return this.credentials.get(id)
  }

  getAllCredentials(): ProviderCredential[] {
    return Array.from(this.credentials.values())
  }

  setApiKey(providerId: string, apiKey: string): void {
    const cred = this.credentials.get(providerId)
    if (cred) {
      cred.apiKey = apiKey
      cred.tested = false
      cred.authorized = false
      cred.authorizedModels = []
      cred.testError = undefined
      cred.lastTested = undefined
      this.credentials.set(providerId, cred)
    }
  }

  async testConnection(providerId: string): Promise<ProviderTestResult> {
    const provider = this.providers.get(providerId)
    const cred = this.credentials.get(providerId)
    if (!provider || !cred) {
      return { ok: false, authorized: false, models: [], error: 'Provider not found', message: 'Provider not configured.' }
    }

    if (!provider.requiresKey || cred.apiKey.trim()) {
      try {
        const result = await this.fetchModels(provider, cred.apiKey)
        cred.tested = true
        cred.lastTested = Date.now()

        if (result.ok) {
          cred.authorized = true
          cred.authorizedModels = result.models
          cred.testError = undefined
          this.credentials.set(providerId, cred)
          return {
            ok: true,
            authorized: true,
            models: result.models,
            message: `Connection successful. ${result.models.length} model(s) authorized.`,
          }
        } else {
          cred.authorized = false
          cred.authorizedModels = []
          cred.testError = result.error
          this.credentials.set(providerId, cred)
          return {
            ok: false,
            authorized: false,
            models: [],
            error: result.error,
            message: result.error || 'Connection test failed.',
          }
        }
      } catch (e: any) {
        cred.tested = true
        cred.lastTested = Date.now()
        cred.authorized = false
        cred.authorizedModels = []
        cred.testError = e.message
        this.credentials.set(providerId, cred)
        return {
          ok: false,
          authorized: false,
          models: [],
          error: e.message,
          message: `Connection failed: ${e.message}`,
        }
      }
    } else {
      return {
        ok: false,
        authorized: false,
        models: [],
        error: 'No API key provided',
        message: 'Please enter an API key before testing.',
      }
    }
  }

  private async fetchModels(provider: CloudProviderConfig, apiKey: string): Promise<ProviderTestResult> {
    const headers: Record<string, string> = {}
    if (provider.authPrefix) {
      headers[provider.authHeader] = `${provider.authPrefix}${apiKey}`
    } else {
      headers[provider.authHeader] = apiKey
    }
    headers['Content-Type'] = 'application/json'

    try {
      const resp = await fetch(`${provider.baseUrl}${provider.modelsEndpoint}`, { headers })
      if (!resp.ok) {
        let errorMsg = `HTTP ${resp.status}`
        try {
          const body = await resp.text()
          errorMsg = body || errorMsg
        } catch {}
        return { ok: false, authorized: false, models: [], error: errorMsg, message: `Provider returned ${resp.status}` }
      }

      const data = await resp.json()
      const models: string[] = []

      if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (item.id) models.push(item.id)
        }
      } else if (data.data && Array.isArray(data.data) && data.data[0]?.type === 'model') {
        for (const item of data.data) {
          if (item.id) models.push(item.id)
        }
      } else if (data.models && Array.isArray(data.models)) {
        for (const item of data.models) {
          if (item.name) models.push(item.name.replace('models/', ''))
        }
      }

      return { ok: true, authorized: true, models, message: 'Models fetched successfully.' }
    } catch (e: any) {
      return { ok: false, authorized: false, models: [], error: e.message, message: 'Failed to fetch models.' }
    }
  }

  getAuthorizedModels(providerId: string): string[] {
    const cred = this.credentials.get(providerId)
    return cred?.authorizedModels ?? []
  }

  isAuthorized(providerId: string): boolean {
    const cred = this.credentials.get(providerId)
    return cred?.authorized ?? false
  }
}

export const cloudProviderManager = new CloudProviderManager()

  { id: 'opencode_zen', name: 'OpenCode Zen', baseUrl: 'https://api.opencode.dev/zen/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion'] },
  { id: 'opencode_go', name: 'OpenCode Go', baseUrl: 'https://api.opencode.dev/go/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion'] },
  { id: 'nararouter', name: 'Nararouter', baseUrl: 'https://api.nararouter.com/v1', authHeader: 'Authorization', authPrefix: 'Bearer ', modelsEndpoint: '/models', testEndpoint: '/models', requiresKey: true, defaultModels: [], capabilities: ['chat', 'completion'] },
]
