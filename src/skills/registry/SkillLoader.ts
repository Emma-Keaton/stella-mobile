/**
 * Stella Mobile — Skill Loader
 * Auto-registers all skills from the skills modules
 */

import { skillRegistry } from './SkillRegistry'
import { Skill } from '../core/types'

// Import all skills — Core
import { weatherSkill } from '../weather'
import { systemTimeSkill, soundCheckSkill, deviceInfoSkill, internetSpeedTestSkill } from '../system'
import { currencySkill, cryptoSkill } from '../finance'
import { anatomySkill, modeling3dSkill } from '../development'
import { locationSkill } from '../location'
import { activitySuggesterSkill, habitTrackerSkill, writingSkill } from '../productivity'
import { spaceFactsSkill, webSearchSkill, leadFinderSkill } from '../research'
import { outreachSkill } from '../social'
import { gifSearchSkill, mediaStreamSkill } from '../media'
import { emailIntelligenceSkill } from '../security/EmailIntelligenceSkillEntry'
import { nmapSkill } from '../security/nmap'
import { dracnmapSkill } from '../security/dracnmap'
import { xerosploitSkill } from '../security/xerosploit'
import { redHawkSkill } from '../security/red_hawk'
import { reconSpiderSkill } from '../security/reconspider'
import { infogaSkill } from '../security/infoga'
import { reconDogSkill } from '../security/recondog'
import { strikerSkill } from '../security/striker'
import { rang3rSkill } from '../security/rang3r'
import { breacherSkill } from '../security/breacher'

// Import AI/ML skills (NEW — cloud provider APIs)
import { cloudProviderApiSkillEntry } from '../ai_ml'

// Import Engineering skills (NEW — linked with coding/development)
import { codeReviewSkill } from '../engineering/code-review'
import { architectureSkill } from '../engineering/architecture'

// Import Marketing skills (NEW — linked with outreach & email intelligence)
import { seoSkill } from '../marketing/seo'
import { copywritingSkill } from '../marketing/copywriting'

// Import Product skills (NEW)
import { prdSkill } from '../product/prd'
import { userStoriesSkill } from '../product/user-stories'
import { roadmapSkill } from '../product/roadmap'

// Import Compliance skills (NEW)
import { gdprSkill } from '../compliance/gdpr'
import { soc2Skill } from '../compliance/soc2'
import { riskSkill } from '../compliance/risk'

// Import C-Level Advisory skills (NEW)
import { ceoSkill } from '../c-level/ceo'
import { cfoSkill } from '../c-level/cfo'
import { ctoSkill } from '../c-level/cto'

// Import Research skills (NEW — linked with lead finder & web search)
import { marketResearchSkill } from '../research/market-research'
import { competitiveAnalysisSkill } from '../research/competitive-analysis'

// Import Business Operations skills (NEW)
import { sopSkill } from '../business-operations/sop'
import { okrSkill } from '../business-operations/okr'

// Import Commercial & Finance skills (NEW — linked with finance)
import { dcfSkill } from '../commercial-finance/dcf'
import { saasMetricsSkill } from '../commercial-finance/saas-metrics'
import { pricingSkill } from '../commercial-finance/pricing'

// Import Daily Productivity skills (NEW)
import { taskMgmtSkill } from '../daily-productivity/task-mgmt'
import { meetingPrepSkill } from '../daily-productivity/meeting-prep'
import { emailTriageSkill } from '../daily-productivity/email-triage'

const allSkills: Skill[] = [
  // Core
  weatherSkill,
  systemTimeSkill,
  soundCheckSkill,
  deviceInfoSkill,
  internetSpeedTestSkill,
  currencySkill,
  cryptoSkill,
  anatomySkill,
  modeling3dSkill,
  locationSkill,
  activitySuggesterSkill,
  habitTrackerSkill,
  writingSkill,
  spaceFactsSkill,
  webSearchSkill,
  leadFinderSkill,
  outreachSkill,
  gifSearchSkill,
  mediaStreamSkill,
  emailIntelligenceSkill,
  nmapSkill,
  dracnmapSkill,
  xerosploitSkill,
  redHawkSkill,
  reconSpiderSkill,
  infogaSkill,
  reconDogSkill,
  strikerSkill,
  rang3rSkill,
  breacherSkill,

  // AI/ML (NEW)
  cloudProviderApiSkillEntry,

  // Engineering (NEW)
  codeReviewSkill,
  architectureSkill,

  // Marketing (NEW)
  seoSkill,
  copywritingSkill,

  // Product (NEW)
  prdSkill,
  userStoriesSkill,
  roadmapSkill,

  // Compliance (NEW)
  gdprSkill,
  soc2Skill,
  riskSkill,

  // C-Level Advisory (NEW)
  ceoSkill,
  cfoSkill,
  ctoSkill,

  // Research (NEW)
  marketResearchSkill,
  competitiveAnalysisSkill,

  // Business Operations (NEW)
  sopSkill,
  okrSkill,

  // Commercial & Finance (NEW)
  dcfSkill,
  saasMetricsSkill,
  pricingSkill,

  // Daily Productivity (NEW)
  taskMgmtSkill,
  meetingPrepSkill,
  emailTriageSkill,
]

export function loadAllSkills(): void {
  allSkills.forEach(skill => {
    if (!skillRegistry.isRegistered(skill.metadata.name)) {
      skillRegistry.register(skill)
      console.log(`[SkillLoader] Registered skill: ${skill.metadata.name}`)
    }
  })
  console.log(`[SkillLoader] Loaded ${allSkills.length} skills`)
}

export function getLoadedSkills(): Skill[] {
  return allSkills
}

export function getSkillNames(): string[] {
  return allSkills.map(s => s.metadata.name)
}