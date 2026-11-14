/**
 * Stella Mobile — Skill Loader
 * Auto-registers all skills from the skills modules
 */

import { skillRegistry } from './SkillRegistry'
import { Skill } from '../core/types'

// Import all skills
import { weatherSkill } from '../weather'
import { systemTimeSkill, soundCheckSkill, deviceInfoSkill, internetSpeedTestSkill } from '../system'
import { currencySkill, cryptoSkill } from '../finance'
import { anatomySkill, modeling3dSkill } from '../development'
import { locationSkill } from '../location'
import { activitySuggesterSkill, habitTrackerSkill, writingSkill } from '../productivity'
import { spaceFactsSkill, webSearchSkill, leadFinderSkill } from '../research'
import { outreachSkill } from '../social'
import { gifSearchSkill, mediaStreamSkill } from '../media'
import { emailIntelligenceSkill } from '../security'

const allSkills: Skill[] = [
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