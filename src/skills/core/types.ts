/**
 * Stella Mobile — Core Skill Types
 * Type definitions for the skill system
 */

export interface SkillParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: any;
  enum?: string[];
}

export interface SkillParameters {
  type: 'object';
  properties: Record<string, SkillParameter>;
  required: string[];
}

export interface SkillMetadata {
  name: string;
  aliases: string[];
  description: string;
  triggers: string[];
  parameters: SkillParameters;
  version: string;
  category: string;
  source: string;
  active: boolean;
  author?: string;
  surface?: 'mobile' | 'desktop' | 'both';
  requires?: string[];
  optionalDependencies?: string[];
  notes?: string;
  apiSources?: Record<string, ApiSource>;
}

export interface ApiSource {
  name: string;
  description: string;
  url: string;
  docs: string;
  authTier: 'keyless' | 'api_key' | 'oauth' | 'custom';
  rateLimit: string;
  uses: string[];
}

export interface SkillResult {
  title: string;
  summary: string;
  spokenNarrative: string;
  operation: string;
  ok: boolean;
  record?: any;
  skill?: string;
}

export interface SkillOperation {
  operation: string;
  ok: boolean;
  value?: any;
  error?: string;
}

export interface SkillContext {
  userId?: string;
  deviceId?: string;
  locale?: string;
  timezone?: string;
  permissions?: string[];
  settings?: Record<string, any>;
}

export type SkillExecuteFn = (params: any, context: SkillContext) => Promise<SkillResult>;

export interface Skill {
  metadata: SkillMetadata;
  execute: SkillExecuteFn;
}

export interface SkillManifest {
  name: string;
  description: string;
  category: string;
  source: string;
  version: string;
}

export interface TestCase {
  name: string;
  params: any;
  expected?: any;
  shouldPass: boolean;
}

export interface SkillTestSuite {
  skill: string;
  tests: TestCase[];
}