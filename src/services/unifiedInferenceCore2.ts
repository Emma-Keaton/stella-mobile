/**
 * Stella Mobile — Unified Inference Service Core (Part 2)
 * Cloud provider implementations
 */

import { apiClients } from '../skills/api/ApiClient'
import type { InferenceResult } from './unifiedInferenceTypes'

export class UnifiedInferenceServicePart2 {
  private async callCloudProvider(
    provider: string, 
    prompt: string, 
    model: string, 
    opts: any,
    apiKey: string
  ): Promise<InferenceResult> {
    const client = apiClients[provider]
    if (!client) throw new Error(`Unknown provider: ${provider}`)

    const systemPrompt = opts.systemPrompt || 'You are a helpful AI assistant.'
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]

    const body = {
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 1024,
      top_p: opts.top_p ?? 0.9,
      stream: false,
    }

    const endpoint = this.getEndpoint(provider)
    const headers = this.getHeaders(provider, apiKey)

    const response = await client.post(endpoint, body, { headers })
    return this.parseCloudResponse(provider, response, model)
  }

  private getEndpoint(provider: string): string {
    switch (provider) {
      case 'openai': return '/chat/completions'
      case 'anthropic': return '/messages'
      case 'google': return '/models/gemini-pro:generateContent'
      default: throw new Error(`Unknown provider: ${provider}`)
    }
  }

  private getHeaders(provider: string, apiKey: string): Record<string, string> {
    switch (provider) {
      case 'openai':
        return { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      case 'anthropic':
        return { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }
      case 'google':
        return { 'Content-Type': 'application/json' }
      default: return { 'Content-Type': 'application/json' }
    }
  }

  private parseCloudResponse(provider: string, response: any, model: string): any {
    switch (provider) {
      case 'openai':
        return { text: response.choices[0]?.message?.content || '', provider: 'openai', model, usage: response.usage }
      case 'anthropic':
        return { text: response.content[0]?.text || '', provider: 'anthropic', model, usage: response.usage }
      case 'google':
        return { text: response.candidates[0]?.content?.parts[0]?.text || '', provider: 'google', model, usage: response.usageMetadata }
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }
}