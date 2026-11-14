import { SkillMetadata } from '../core/types';

export const cloudProviderApiMetadata: SkillMetadata = {
  id: 'cloud_provider_api',
  name: 'Cloud AI Provider API Reference',
  version: '1.0.0',
  description: 'Unified reference for multiple cloud AI providers — Anthropic Claude, Google Gemini, Groq, OpenRouter, ClinePass/Cline billing, OpenCode, NVIDIA NIM. Covers model IDs, pricing, SDK usage, streaming, tool use, and billing.',
  category: 'ai_ml',
  tags: ['anthropic', 'claude', 'gemini', 'groq', 'openrouter', 'cline', 'opencode', 'nvidia', 'nim', 'llm', 'api', 'sdk', 'pricing', 'billing'],
  author: 'Stella Mobile (adapted from Anthropic skills)',
  license: 'MIT',
  homepage: 'https://github.com/anthropics/skills',
  repository: 'https://github.com/anthropics/skills',
  triggers: [
    'cloud ai provider',
    'anthropic api',
    'claude api',
    'gemini api',
    'google ai api',
    'groq api',
    'openrouter api',
    'clinepass billing',
    'cline usage billing',
    'opencode zen',
    'opencode go',
    'nvidia nim',
    'nvidia api',
    'llm pricing comparison',
    'model pricing',
    'ai sdk usage',
    'streaming llm',
    'tool use llm'
  ],
  supportedOperations: [
    'list_providers',
    'get_provider_models',
    'compare_pricing',
    'get_sdk_usage',
    'get_streaming_guide',
    'get_tool_use_guide',
    'get_billing_info',
    'get_model_recommendations',
    'get_migration_guide',
    'get_cost_optimization'
  ],
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: [
          'list_providers',
          'get_provider_models',
          'compare_pricing',
          'get_sdk_usage',
          'get_streaming_guide',
          'get_tool_use_guide',
          'get_billing_info',
          'get_model_recommendations',
          'get_migration_guide',
          'get_cost_optimization'
        ],
        description: 'The operation to perform'
      },
      provider: {
        type: 'string',
        enum: ['anthropic', 'google', 'groq', 'openrouter', 'cline', 'opencode', 'nvidia'],
        description: 'Specific provider to query'
      },
      model: {
        type: 'string',
        description: 'Specific model to query'
      },
      language: {
        type: 'string',
        enum: ['typescript', 'python', 'go', 'rust', 'curl'],
        description: 'Programming language for SDK examples'
      },
      task: {
        type: 'string',
        enum: ['coding', 'reasoning', 'chat', 'analysis', 'vision', 'embedding', 'audio'],
        description: 'Task type for model recommendations'
      },
      budget: {
        type: 'string',
        enum: ['free', 'low', 'medium', 'high', 'enterprise'],
        description: 'Budget tier for recommendations'
      }
    },
    required: ['operation']
  },
  returns: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'object' },
      error: { type: 'string' },
      narrative: { type: 'string' }
    }
  },
  apiSources: [
    { name: 'Anthropic API Docs', url: 'https://docs.anthropic.com', rateLimit: 'Varies by tier', requiresKey: true, keyName: 'ANTHROPIC_API_KEY' },
    { name: 'Google AI API Docs', url: 'https://ai.google.dev/docs', rateLimit: 'Varies by tier', requiresKey: true, keyName: 'GOOGLE_API_KEY' },
    { name: 'Groq API Docs', url: 'https://console.groq.com/docs', rateLimit: 'Varies by tier', requiresKey: true, keyName: 'GROQ_API_KEY' },
    { name: 'OpenRouter API Docs', url: 'https://openrouter.ai/docs', rateLimit: 'Varies by tier', requiresKey: true, keyName: 'OPENROUTER_API_KEY' },
    { name: 'Cline Documentation', url: 'https://cline.bot', rateLimit: 'N/A', requiresKey: true, keyName: 'CLINE_API_KEY' },
    { name: 'OpenCode Documentation', url: 'https://opencode.ai', rateLimit: 'N/A', requiresKey: false },
    { name: 'NVIDIA NIM API Docs', url: 'https://docs.nvidia.com/nim', rateLimit: 'Varies by tier', requiresKey: true, keyName: 'NVIDIA_API_KEY' }
  ],
  examples: [
    { description: 'List all supported providers', parameters: { operation: 'list_providers' } },
    { description: 'Get all models from Anthropic', parameters: { operation: 'get_provider_models', provider: 'anthropic' } },
    { description: 'Compare pricing across providers for coding tasks', parameters: { operation: 'compare_pricing', task: 'coding' } },
    { description: 'Get TypeScript SDK usage for Groq', parameters: { operation: 'get_sdk_usage', provider: 'groq', language: 'typescript' } },
    { description: 'Get Cline billing info', parameters: { operation: 'get_billing_info', provider: 'cline' } },
    { description: 'Get model recommendations for reasoning on low budget', parameters: { operation: 'get_model_recommendations', task: 'reasoning', budget: 'low' } }
  ],
  isEnabled: true,
  isExperimental: false,
  requiredPermissions: [],
  minAppVersion: '1.0.0'
};