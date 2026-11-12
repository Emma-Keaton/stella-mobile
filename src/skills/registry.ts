/**
 * Stella Mobile — Skill Registry
 * Registers, discovers, and executes all Stella skills.
 * Ported from the main Stella skill_loader.py.
 */

import { StellaSkill, SkillMetadata, SkillResult, SkillContext } from './base'

export class SkillRegistry {
  private skills: Map<string, StellaSkill> = new Map()
  private triggerIndex: Map<string, string[]> = new Map()

  register(skill: StellaSkill): void {
    this.skills.set(skill.metadata.id, skill)
    for (const trigger of skill.metadata.triggers) {
      const key = trigger.toLowerCase()
      if (!this.triggerIndex.has(key)) {
        this.triggerIndex.set(key, [])
      }
      this.triggerIndex.get(key)!.push(skill.metadata.id)
    }
  }

  getSkill(id: string): StellaSkill | undefined {
    return this.skills.get(id)
  }

  getAllSkills(): StellaSkill[] {
    return Array.from(this.skills.values())
  }

  getSkillMetadata(): SkillMetadata[] {
    return this.getAllSkills().map(s => s.metadata)
  }

  findByTrigger(trigger: string): StellaSkill[] {
    const lower = trigger.toLowerCase()
    const matchedIds = new Set<string>()
    for (const [key, ids] of this.triggerIndex) {
      if (lower.includes(key)) {
        for (const id of ids) matchedIds.add(id)
      }
    }
    return Array.from(matchedIds).map(id => this.skills.get(id)!).filter(Boolean)
  }

  async execute(skillId: string, operation: string, args: any, context?: SkillContext): Promise<SkillResult> {
    const skill = this.skills.get(skillId)
    if (!skill) {
      return {
        title: 'Skill Error',
        summary: `Skill not found: ${skillId}`,
        spoken_narrative: `Skill not found: ${skillId}`,
        ok: false,
        error: `Skill not found: ${skillId}`,
      }
    }
    if (!skill.canExecute(operation)) {
      return skill.unknownOperation(operation)
    }
    return skill.execute(args, context)
  }
}

export const skillRegistry = new SkillRegistry()
