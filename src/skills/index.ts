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
export { internetSpeedTestSkill, internetSpeedTestMetadata } from './system/InternetSpeedTestSkillEntry';

// Finance skills
export { currencySkill, currencyMetadata } from './finance/CurrencySkillEntry';
export { cryptoSkill, cryptoMetadata } from './finance/CryptoSkillEntry';

// Development skills
export { anatomySkill, anatomyMetadata } from './development/AnatomySkillEntry';
export { modeling3dSkill, modeling3dMetadata } from './development/Modeling3DSkillEntry';

// Location skills
export { locationSkill, locationMetadata } from './location/LocationSkillEntry';

// Media skills
export { gifSearchSkill, gifSearchMetadata } from './media/GifSearchSkillEntry';
export { mediaStreamSkill, mediaStreamMetadata } from './media';

// Productivity skills
export { activitySuggesterSkill, activitySuggesterMetadata } from './productivity/ActivitySuggesterSkillEntry';
export { habitTrackerSkill, habitTrackerMetadata } from './productivity/HabitTrackerSkillEntry';
export { writingSkill, writingMetadata } from './productivity/WritingSkillEntry';

// Research skills
export { spaceFactsSkill, spaceFactsMetadata } from './research/SpaceFactsSkillEntry';
export { webSearchSkill, webSearchMetadata } from './research/WebSearchSkillEntry';
export { leadFinderSkill, leadFinderMetadata } from './research/LeadFinder';

// Social skills
export { outreachSkill, outreachMetadata } from './social/Outreach';

// Security skills
export { emailIntelligenceSkill, emailIntelligenceMetadata } from './security/EmailIntelligenceSkillEntry';

// Re-export all skill types
export type { Skill, SkillMetadata, SkillResult, SkillContext, SkillManifest } from './core/types';