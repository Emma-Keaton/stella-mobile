/**
 * Stella Mobile — Skills Module Main Export
 */

// Core types
export * from './core/types';

// API clients
export { ApiClient, apiClients } from './api/ApiClient';

// Registry
export { SkillRegistry, skillRegistry } from './registry/SkillRegistry';
export { loadAllSkills, getLoadedSkills, getSkillNames } from './registry/SkillLoader';

// Weather skills
export { weatherSkill, weatherMetadata } from './weather';

// System skills
export { systemTimeSkill, systemTimeMetadata } from './system/SystemTimeSkill';
export { soundCheckSkill, soundCheckMetadata } from './system/SoundCheckSkill';
export { deviceInfoSkill } from './system/DeviceInfoSkillEntry';

// Finance skills
export { currencySkill, currencyMetadata } from './finance/CurrencySkillEntry';
export { cryptoSkill, cryptoMetadata } from './finance/CryptoSkillEntry';

// Re-export all skill types
export type { Skill, SkillMetadata, SkillResult, SkillContext, SkillManifest } from './core/types';
/**
 * Stella Mobile — Skills Module
 * Main entry point for the skill system
 */

export { SkillRegistry, skillRegistry } from './registry/SkillRegistry';
export { ApiClient, apiClients } from './api/ApiClient';
export * from './core/types';

// Re-export skills as they're created
export * from './weather';
export * from './system';
export * from './development';
export * from './research';
export * from './finance';
export * from './productivity';
export * from './media';
export * from './location';