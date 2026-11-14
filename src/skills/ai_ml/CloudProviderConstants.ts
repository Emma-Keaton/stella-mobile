import providersData from './data/providers.json';
import models1 from './data/models1.json';
import models2 from './data/models2.json';
import models3 from './data/models3.json';
import billingData from './data/billing.json';
import sdkGuides1 from './data/sdk-guides1.json';
import sdkGuides2 from './data/sdk-guides2.json';
import sdkGuides3 from './data/sdk-guides3.json';

export interface ProviderModel {
  id: string; name: string; provider: string; description: string;
  contextWindow: number; maxOutput: number;
  pricing: { inputPerMillion: number; outputPerMillion: number; cacheWritePerMillion?: number; cacheReadPerMillion?: number; };
  capabilities: string[]; releaseDate: string; modalities: string[];
  speed: 'fast' | 'balanced' | 'slow'; intelligence: 'high' | 'medium' | 'low';
}

export interface ProviderInfo {
  id: string; name: string; description: string; website: string; apiDocs: string;
  sdkLanguages: string[]; supportsStreaming: boolean; supportsToolUse: boolean;
  supportsVision: boolean; supportsAudio: boolean; freeTier: boolean;
  pricingModel: 'per_token' | 'per_request' | 'subscription' | 'credits';
}

export interface BillingInfo {
  provider: string; pricingModel: string; freeTierDetails: string; paidTierDetails: string;
  billingUrl: string; usageTracking: string; costEstimation: string;
}

export interface SDKGuides {
  [provider: string]: {
    [language: string]: { installation: string; basic: string; streaming: string; tools: string; };
  };
}

export const PROVIDERS: ProviderInfo[] = providersData as unknown as ProviderInfo[];
export const MODELS: ProviderModel[] = [...models1, ...models2, ...models3] as unknown as ProviderModel[];
export const BILLING: Record<string, BillingInfo> = billingData as unknown as Record<string, BillingInfo>;
export const SDK_GUIDES: SDKGuides = { ...sdkGuides1, ...sdkGuides2, ...sdkGuides3 } as unknown as SDKGuides;

export const STREAMING_GUIDES: Record<string, string> = {
  anthropic: "**Anthropic Streaming** - Set `stream: true` in `messages.create()`. Handle events: `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_stop`. For tool use: also handle `tool_use` blocks.",
  google: "**Google Gemini Streaming** - Use `generateContentStream()` instead of `generateContent()`. Returns async iterable. Each chunk has `text()` method.",
  groq: "**Groq Streaming** - Set `stream: true` in `chat.completions.create()`. Returns async iterable (OpenAI-compatible). Extremely fast first token (~100ms).",
  openrouter: "**OpenRouter Streaming** - Same as OpenAI: `stream: true`. Routes to model's native streaming. Handles fallbacks automatically.",
  cline: "**Cline Streaming** - Handled internally by VS Code extension. Real-time token display in chat view. Progress indicators for tool execution.",
  opencode: "**OpenCode Streaming** - Zen mode: autonomous streaming with progress. Go CLI: streams by default. SDK: async iterators for custom UIs.",
  nvidia: "**NVIDIA NIM Streaming** - OpenAI-compatible: `stream: true`. Optimized for GPU inference. Low latency on NVIDIA hardware."
};

export const TOOL_USE_GUIDES: Record<string, string> = {
  anthropic: "**Anthropic Tool Use** - Define tools with `name`, `description`, `input_schema` (JSON Schema). Returns `tool_use` blocks. Execute and return `tool_result` with `tool_use_id`. Supports `tool_choice`.",
  google: "**Google Function Calling** - Define `functionDeclarations` in `tools`. Parameters use OpenAPI subset. Returns `functionCall`. Execute and return `functionResponse`.",
  groq: "**Groq Tool Use** - OpenAI-compatible `tools` array with `type: \"function\"`. Returns `tool_calls`. Execute and return with `tool_call_id`.",
  openrouter: "**OpenRouter Tool Use** - Passes tools to underlying model. Works with models supporting function calling. Use `openrouter/auto` for automatic routing.",
  cline: "**Cline Built-in Tools** - File ops: read, write, edit, list, glob. Terminal: execute commands. Browser: navigate, click, extract. Search: codebase, web, docs. LSP: go to definition, find refs. Git: diff, log, commit.",
  opencode: "**OpenCode Tools** - Zen: full autonomy with file, terminal, git, browser. Go: file ops, terminal, git, search, LSP. Custom tools via plugin system.",
  nvidia: "**NVIDIA NIM Function Calling** - OpenAI-compatible on supported models. Check model card for support. Optimized for NVIDIA GPU inference."
};