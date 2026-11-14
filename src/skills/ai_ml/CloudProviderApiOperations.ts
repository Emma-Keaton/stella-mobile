import { SkillOperationResult, SkillParameters } from '../core/types';
import { PROVIDERS, MODELS, BILLING, SDK_GUIDES, STREAMING_GUIDES, TOOL_USE_GUIDES, ProviderInfo, ProviderModel } from './CloudProviderConstants';
import { formatProvidersList, formatModelsList, formatAllModels, formatPricingComparison, formatSDKUsage, formatBillingInfo, formatAllBilling, formatRecommendations, formatMigrationGuide, formatCostOptimization } from './CloudProviderFormatters';

export class CloudProviderApiOperations {
  static async execute(params: SkillParameters): Promise<SkillOperationResult> {
    const operation = params.operation as string;
    const provider = params.provider as string;
    const language = params.language as string;
    const task = params.task as string;
    const budget = params.budget as string;

    try {
      switch (operation) {
        case 'list_providers': return { success: true, data: { providers: PROVIDERS }, narrative: formatProvidersList(PROVIDERS) };
        case 'get_provider_models': return this.getProviderModels(provider);
        case 'compare_pricing': return this.comparePricing(task);
        case 'get_sdk_usage': return this.getSDKUsage(provider, language);
        case 'get_streaming_guide': return this.getStreamingGuide(provider, language);
        case 'get_tool_use_guide': return this.getToolUseGuide(provider, language);
        case 'get_billing_info': return this.getBillingInfo(provider);
        case 'get_model_recommendations': return this.getModelRecommendations(task, budget);
        case 'get_migration_guide': return { success: true, data: { guide: 'Migration guide' }, narrative: formatMigrationGuide(provider, params.model as string) };
        case 'get_cost_optimization': return { success: true, data: { guide: 'Cost optimization guide' }, narrative: formatCostOptimization() };
        default: return { success: false, error: `Unknown operation: ${operation}`, narrative: 'Available: list_providers, get_provider_models, compare_pricing, get_sdk_usage, get_streaming_guide, get_tool_use_guide, get_billing_info, get_model_recommendations, get_migration_guide, get_cost_optimization' };
      }
    } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Unknown error', narrative: 'Error fetching cloud provider API info.' }; }
  }

  private static getProviderModels(providerId?: string): SkillOperationResult {
    if (providerId) {
      const models = MODELS.filter(m => m.provider === providerId);
      if (models.length === 0) return { success: false, error: `No models for provider: ${providerId}`, narrative: `Providers: ${PROVIDERS.map(p => p.id).join(', ')}` };
      return { success: true, data: { models }, narrative: formatModelsList(models, providerId, PROVIDERS) };
    }
    const grouped = MODELS.reduce((acc, m) => { if (!acc[m.provider]) acc[m.provider] = []; acc[m.provider].push(m); return acc; }, {} as Record<string, ProviderModel[]>);
    return { success: true, data: { models: grouped }, narrative: formatAllModels(grouped, PROVIDERS) };
  }

  private static comparePricing(task?: string): SkillOperationResult {
    const relevant = task ? MODELS.filter(m => m.capabilities.includes(task)) : MODELS;
    const comparison = relevant.filter(m => m.pricing.inputPerMillion > 0 || m.pricing.outputPerMillion > 0).sort((a, b) => (a.pricing.inputPerMillion + a.pricing.outputPerMillion) - (b.pricing.inputPerMillion + b.pricing.outputPerMillion)).map(m => ({ id: m.id, name: m.name, provider: m.provider, inputCost: m.pricing.inputPerMillion, outputCost: m.pricing.outputPerMillion, totalCostPer1M: m.pricing.inputPerMillion + m.pricing.outputPerMillion, contextWindow: m.contextWindow, speed: m.speed, intelligence: m.intelligence }));
    return { success: true, data: { comparison }, narrative: formatPricingComparison(comparison, task) };
  }
private static getSDKUsage(providerId?: string, language?: string): SkillOperationResult {
    const lang = language || 'typescript';
    const provider = providerId ? PROVIDERS.find(p => p.id === providerId) : PROVIDERS[0];
    if (!provider) return { success: false, error: `Provider not found: ${providerId}`, narrative: `Providers: ${PROVIDERS.map(p => p.id).join(', ')}` };
    const guides = this.getSDKGuides(provider.id, lang);
    return { success: true, data: { provider: provider.id, language: lang, guides }, narrative: formatSDKUsage(provider, lang, guides) };
  }

  private static getStreamingGuide(providerId?: string, language?: string): SkillOperationResult {
    const provider = providerId ? PROVIDERS.find(p => p.id === providerId) : PROVIDERS[0];
    if (!provider) return { success: false, error: `Provider not found: ${providerId}` };
    const guide = STREAMING_GUIDES[provider.id] || STREAMING_GUIDES.anthropic;
    return { success: true, data: { provider: provider.id, language: language || 'typescript', guide }, narrative: guide };
  }

  private static getToolUseGuide(providerId?: string, language?: string): SkillOperationResult {
    const provider = providerId ? PROVIDERS.find(p => p.id === providerId) : PROVIDERS[0];
    if (!provider) return { success: false, error: `Provider not found: ${providerId}` };
    const guide = TOOL_USE_GUIDES[provider.id] || TOOL_USE_GUIDES.anthropic;
    return { success: true, data: { provider: provider.id, language: language || 'typescript', guide }, narrative: guide };
  }

  private static getBillingInfo(providerId?: string): SkillOperationResult {
    if (providerId) {
      const provider = PROVIDERS.find(p => p.id === providerId);
      if (!provider) return { success: false, error: `Provider not found: ${providerId}` };
      return { success: true, data: { billing: BILLING[provider.id] }, narrative: formatBillingInfo(BILLING[provider.id]) };
    }
    const allBilling = PROVIDERS.map(p => BILLING[p.id]);
    return { success: true, data: { billing: allBilling }, narrative: formatAllBilling(allBilling) };
  }

  private static getModelRecommendations(task?: string, budget?: string): SkillOperationResult {
    let models = [...MODELS];
    if (task) models = models.filter(m => m.capabilities.includes(task));
    if (budget) {
      const budgetOrder = { free: 0, low: 1, medium: 2, high: 3, enterprise: 4 };
      const maxBudget = budgetOrder[budget as keyof typeof budgetOrder] ?? 4;
      models = models.filter(m => { const cost = m.pricing.inputPerMillion + m.pricing.outputPerMillion; if (budget === 'free') return cost === 0; if (budget === 'low') return cost <= 1; if (budget === 'medium') return cost <= 10; return true; });
    }
    const recommendations = models.sort((a, b) => { const aScore = (a.intelligence === 'high' ? 3 : a.intelligence === 'medium' ? 2 : 1) * (a.speed === 'fast' ? 1.2 : a.speed === 'balanced' ? 1 : 0.8); const bScore = (b.intelligence === 'high' ? 3 : b.intelligence === 'medium' ? 2 : 1) * (b.speed === 'fast' ? 1.2 : b.speed === 'balanced' ? 1 : 0.8); return bScore - aScore; }).slice(0, 5).map(m => ({ id: m.id, name: m.name, provider: m.provider, reason: this.getRecommendationReason(m, task, budget), pricing: m.pricing, speed: m.speed, intelligence: m.intelligence }));
    return { success: true, data: { recommendations }, narrative: formatRecommendations(recommendations, task, budget) };
  }

  private static getSDKGuides(providerId: string, language: string) {
    return SDK_GUIDES[providerId]?.[language] || SDK_GUIDES.anthropic?.typescript || {};
  }

  private static getRecommendationReason(model: ProviderModel, task?: string, budget?: string): string {
    const reasons = [];
    if (model.intelligence === 'high') reasons.push('top-tier intelligence');
    if (model.speed === 'fast') reasons.push('fast inference');
    if (model.pricing.inputPerMillion === 0) reasons.push('free/self-hosted');
    else if (model.pricing.inputPerMillion < 1) reasons.push('very low cost');
    else if (model.pricing.inputPerMillion < 5) reasons.push('cost-effective');
    if (task && model.capabilities.includes(task)) reasons.push(`strong at ${task}`);
    if (model.contextWindow > 100000) reasons.push('large context');
    return reasons.join(', ') || 'good all-around choice';
  }
}
}