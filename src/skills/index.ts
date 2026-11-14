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
export { marketResearchSkill, marketResearchMetadata } from './research/market-research';
export { competitiveAnalysisSkill, competitiveAnalysisMetadata } from './research/competitive-analysis';

// Social skills
export { outreachSkill, outreachMetadata } from './social/Outreach';

// Security skills
export { emailIntelligenceSkill, emailIntelligenceMetadata } from './security/EmailIntelligenceSkillEntry';

// Engineering skills (NEW — linked with coding/development)
export { codeReviewSkill, codeReviewMetadata } from './engineering/code-review';
export { architectureSkill, architectureMetadata } from './engineering/architecture';

// Marketing skills (NEW — linked with outreach & email intelligence)
export { seoSkill, seoMetadata } from './marketing/seo';
export { copywritingSkill, copywritingMetadata } from './marketing/copywriting';

// Product skills (NEW)
export { prdSkill, prdMetadata } from './product/prd';
export { userStoriesSkill, userStoriesMetadata } from './product/user-stories';
export { roadmapSkill, roadmapMetadata } from './product/roadmap';

// Compliance skills (NEW)
export { gdprSkill, gdprMetadata } from './compliance/gdpr';
export { soc2Skill, soc2Metadata } from './compliance/soc2';
export { riskSkill, riskMetadata } from './compliance/risk';

// C-Level Advisory skills (NEW)
export { ceoSkill, ceoMetadata } from './c-level/ceo';
export { cfoSkill, cfoMetadata } from './c-level/cfo';
export { ctoSkill, ctoMetadata } from './c-level/cto';

// Business Operations skills (NEW)
export { sopSkill, sopMetadata } from './business-operations/sop';
export { okrSkill, okrMetadata } from './business-operations/okr';

// Commercial & Finance skills (NEW — linked with finance)
export { dcfSkill, dcfMetadata } from './commercial-finance/dcf';
export { saasMetricsSkill, saasMetricsMetadata } from './commercial-finance/saas-metrics';
export { pricingSkill, pricingMetadata } from './commercial-finance/pricing';

// Daily Productivity skills (NEW)
export { taskMgmtSkill, taskMgmtMetadata } from './daily-productivity/task-mgmt';
export { meetingPrepSkill, meetingPrepMetadata } from './daily-productivity/meeting-prep';
export { emailTriageSkill, emailTriageMetadata } from './daily-productivity/email-triage';

// Re-export all skill types
export type { Skill, SkillMetadata, SkillResult, SkillContext, SkillManifest } from './core/types';