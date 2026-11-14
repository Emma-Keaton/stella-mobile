import { SkillMetadata, SkillEntry, SkillParameters, SkillOperationResult } from '../core/types';
import { cloudProviderApiMetadata } from './CloudProviderApiMetadata';
import { CloudProviderApiOperations } from './CloudProviderApiOperations';

export class CloudProviderApiSkillEntry implements SkillEntry {
  metadata = cloudProviderApiMetadata;

  async execute(params: SkillParameters): Promise<SkillOperationResult> {
    return CloudProviderApiOperations.execute(params);
  }

  getMetadata(): SkillMetadata {
    return this.metadata;
  }

  validateParams(params: SkillParameters): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!params.operation) {
      errors.push('Operation is required');
    }
    const validOperations = [
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
    ];
    if (params.operation && !validOperations.includes(params.operation as string)) {
      errors.push(`Invalid operation. Must be one of: ${validOperations.join(', ')}`);
    }
    return { valid: errors.length === 0, errors };
  }
}

export const cloudProviderApiSkillEntry = new CloudProviderApiSkillEntry();