/**
 * Stella Mobile — Skill Loader
 * Auto-registers all skills from the skills modules
 */

import { skillRegistry } from './SkillRegistry';
import { Skill } from '../core/types';

// Import all skills
import { weatherSkill } from '../weather';
import { systemTimeSkill, soundCheckSkill, deviceInfoSkill } from '../system';
import { currencySkill, cryptoSkill } from '../finance';

const allSkills: Skill[] = [
  weatherSkill,
  systemTimeSkill,
  soundCheckSkill,
  deviceInfoSkill,
  currencySkill,
  cryptoSkill,
];

export function loadAllSkills(): void {
  allSkills.forEach(skill => {
    if (!skillRegistry.isRegistered(skill.metadata.name)) {
      skillRegistry.register(skill);
      console.log(`[SkillLoader] Registered skill: ${skill.metadata.name}`);
    }
  });
  console.log(`[SkillLoader] Loaded ${allSkills.length} skills`);
}

export function getLoadedSkills(): Skill[] {
  return allSkills;
}

export function getSkillNames(): string[] {
  return allSkills.map(s => s.metadata.name);
}