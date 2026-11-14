import { ProviderInfo, ProviderModel, BillingInfo } from './CloudProviderModels';

export function formatProvidersList(providers: ProviderInfo[]): string {
  let narrative = '**Supported Cloud AI Providers:**\n\n';
  for (const p of providers) { narrative += `**${p.name}** (\`${p.id}\`)\n- ${p.description}\n- SDKs: ${p.sdkLanguages.join(', ')}\n- Streaming: ${p.supportsStreaming ? '✓' : '✗'} | Tool Use: ${p.supportsToolUse ? '✓' : '✗'} | Vision: ${p.supportsVision ? '✓' : '✗'} | Audio: ${p.supportsAudio ? '✓' : '✗'}\n- Free Tier: ${p.freeTier ? 'Yes' : 'No'} | Pricing: ${p.pricingModel}\n- Docs: ${p.apiDocs}\n\n`; }
  return narrative;
}

export function formatModelsList(models: ProviderModel[], providerId: string, providers: ProviderInfo[]): string {
  let narrative = `**Models from ${providers.find(p => p.id === providerId)?.name || providerId}:**\n\n`;
  for (const m of models) { narrative += `**${m.name}** (\`${m.id}\`)\n- ${m.description}\n- Context: ${m.contextWindow.toLocaleString()} | Max Output: ${m.maxOutput.toLocaleString()}\n`; if (m.pricing.inputPerMillion > 0) { narrative += `- Pricing: $${m.pricing.inputPerMillion}/M in, $${m.pricing.outputPerMillion}/M out`; if (m.pricing.cacheReadPerMillion) narrative += ` | Cache: $${m.pricing.cacheReadPerMillion}/M read`; narrative += '\n'; } else { narrative += `- Pricing: Free / Self-hosted / Subscription\n`; } narrative += `- Capabilities: ${m.capabilities.join(', ')}\n- Speed: ${m.speed} | Intelligence: ${m.intelligence}\n\n`; }
  return narrative;
}

export function formatAllModels(grouped: Record<string, ProviderModel[]>, providers: ProviderInfo[]): string {
  let narrative = '**All Available Models by Provider:**\n\n';
  for (const [provider, models] of Object.entries(grouped)) { narrative += `### ${providers.find(p => p.id === provider)?.name || provider}\n`; for (const m of models) { narrative += `- **${m.name}** (\`${m.id}\`) - $${m.pricing.inputPerMillion}/M in, $${m.pricing.outputPerMillion}/M out - ${m.speed}/${m.intelligence}\n`; } narrative += '\n'; }
  return narrative;
}

export function formatPricingComparison(comparison: any[], task?: string): string {
  let narrative = `**Pricing Comparison${task ? ` for ${task}` : ''} (per 1M tokens):**\n\n| Model | Provider | Input | Output | Total | Context | Speed | IQ |\n|-------|----------|-------|--------|-------|---------|-------|----|\n`;
  for (const m of comparison.slice(0, 15)) { narrative += `| ${m.name} | ${m.provider} | $${m.inputCost} | $${m.outputCost} | $${m.totalCostPer1M.toFixed(2)} | ${(m.contextWindow/1000).toFixed(0)}k | ${m.speed} | ${m.intelligence} |\n`; }
  narrative += '\n*Free/self-hosted models excluded. Use get_model_recommendations for those.*';
  return narrative;
}
export function formatSDKUsage(provider: ProviderInfo, language: string, guides: any): string {
  let narrative = `**${provider.name} SDK Usage (${language})**\n\n**Installation:**\n\`\`\`bash\n${guides.installation}\n\`\`\`\n\n**Basic Usage:**\n\`\`\`${language}\n${guides.basic}\n\`\`\`\n`;
  if (guides.streaming) { narrative += `\n**Streaming:**\n\`\`\`${language}\n${guides.streaming}\n\`\`\`\n`; }
  if (guides.tools) { narrative += `\n**Tool Use:**\n\`\`\`${language}\n${guides.tools}\n\`\`\`\n`; }
  return narrative;
}

export function formatBillingInfo(billing: BillingInfo): string {
  return `**${billing.provider.toUpperCase()} Billing**\n\n**Model:** ${billing.pricingModel}\n**Free Tier:** ${billing.freeTierDetails}\n**Paid:** ${billing.paidTierDetails}\n**Dashboard:** ${billing.billingUrl}\n**Tracking:** ${billing.usageTracking}\n**Estimation:** ${billing.costEstimation}`;
}

export function formatAllBilling(allBilling: BillingInfo[]): string {
  let narrative = '**Billing Comparison:**\n\n';
  for (const b of allBilling) { narrative += `### ${b.provider.toUpperCase()}\n- Model: ${b.pricingModel}\n- Free: ${b.freeTierDetails.split('.')[0]}\n- Dashboard: ${b.billingUrl}\n\n`; }
  return narrative;
}

export function formatRecommendations(recommendations: any[], task?: string, budget?: string): string {
  let narrative = `**Recommendations${task ? ` for ${task}` : ''}${budget ? ` (${budget} budget)` : ''}:**\n\n`;
  for (let i = 0; i < recommendations.length; i++) { const r = recommendations[i]; narrative += `${i + 1}. **${r.name}** (\`${r.id}\`) - ${r.provider}\n   *Why:* ${r.reason}\n`; if (r.pricing.inputPerMillion > 0) { narrative += `   *Cost:* $${r.pricing.inputPerMillion}/M in, $${r.pricing.outputPerMillion}/M out\n`; } else { narrative += `   *Cost:* Free / Self-hosted\n`; } narrative += `   *Speed:* ${r.speed} | *IQ:* ${r.intelligence}\n\n`; }
  return narrative;
}

export function formatMigrationGuide(fromProvider?: string, model?: string): string {
  return `**Migration Guide${fromProvider ? ` from ${fromProvider}` : ''}${model ? ` (${model})` : ''}**

**General Steps:**
1. Inventory current usage (models, prompts, tools, params)
2. Map capabilities to target provider
3. Test prompts with eval suite
4. Adjust params (temp, max_tokens, tool schemas differ)
5. Monitor costs (pricing models differ)
6. Gradual rollout with fallback

**Provider Notes:**
- **Anthropic→Others:** Tool schemas differ (JSON Schema vs OpenAPI). System prompts move to user message. Caching only on Anthropic. Computer use only on Claude 3.5 Sonnet.
- **Google→Others:** Multimodal native (audio/video). Context caching 75% discount. Best free tier.
- **Groq→Others:** 10-50x faster for same models. Limited to open models. No vision/audio.
- **OpenRouter→Direct:** Remove routing logic. Handle model-specific params. Update auth (single→multi key). Loss of auto-fallbacks.
- **Cline→Direct:** Cline is an agent, not model provider. Extract prompts/tools. Re-implement agent loop. Consider OpenCode for open-source.
- **OpenCode:** Self-host = $0 marginal. Zen Cloud for managed.
- **NVIDIA NIM:** Deploy containers on K8s. Use NGC registry. Enterprise support available.`;
}

export function formatCostOptimization(): string {
  return `**Cross-Provider Cost Optimization**

**Levers (Highest Impact First):**

1. **Model Selection** - Biggest lever
   - Free/self-hosted: OpenCode, Ollama, local NIM
   - Ultra-cheap: Groq 8B ($0.05/M), Gemini Flash ($0.075/M)
   - Cost-effective: Groq 70B ($0.59/M), Gemini Pro ($1.25/M)
   - Premium: Claude Sonnet ($3/M), GPT-4o ($5/M)

2. **Caching**
   - Anthropic: 90% read discount, 25% write premium
   - Google: 75% discount on cached context
   - Use for: system prompts, few-shot, documents, tools

3. **Routing & Fallbacks**
   - OpenRouter auto-router optimizes cost/quality
   - Custom: Haiku for simple → Sonnet for complex
   - Cache responses for repeated queries

4. **Token Efficiency**
   - Set appropriate \`max_tokens\`
   - Use \`thinking\` budget only when needed
   - Compress prompts

5. **Batching**
   - Anthropic: 50% discount for batch API
   - OpenRouter: batch endpoints
   - Schedule non-urgent off-peak

6. **Infrastructure**
   - Self-host on cheaper GPUs
   - Quantization (4-bit vs 8-bit vs FP16)
   - vLLM/TGI for throughput

**Provider Tips:**
- Anthropic: Cache everything. Haiku for classification. Batch for evals.
- Google: Context caching for RAG. Free tier for dev. Flash for volume.
- Groq: Use for latency-critical. 70B steal at $0.59/M.
- OpenRouter: Auto-router. Monitor per-model costs.
- Cline: Local models (Ollama) free. ClinePass for cloud.
- OpenCode: Self-host = $0 marginal. Zen Cloud managed.
- NVIDIA: Reserved instances for steady. Spot for burst.

**Cost Formula:** \`Total = Σ(Input×$in + Output×$out + Cache×$cache) + Infra\`

**Monitoring:** Track $/1K requests by model/task. Alerts at 50/80/100%. Quarterly eval.`;
}