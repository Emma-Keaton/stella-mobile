/**
 * Stella Mobile — Skill Registry
 * Central registry for managing and executing skills
 */

import { Skill, SkillMetadata, SkillResult, SkillContext, SkillManifest } from '../core/types';
import { EventEmitter } from 'events';

export class SkillRegistry extends EventEmitter {
  private skills: Map<string, Skill> = new Map();
  private skillMetadata: Map<string, SkillMetadata> = new Map();
  private initialized = false;

  register(skill: Skill): void {
    const name = skill.metadata.name;
    this.skills.set(name, skill);
    this.skillMetadata.set(name, skill.metadata);
    this.emit('registered', name);
  }

  unregister(name: string): boolean {
    const result = this.skills.delete(name);
    this.skillMetadata.delete(name);
    if (result) {
      this.emit('unregistered', name);
    }
    return result;
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  getMetadata(name: string): SkillMetadata | undefined {
    return this.skillMetadata.get(name);
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  getAllMetadata(): SkillMetadata[] {
    return Array.from(this.skillMetadata.values());
  }

  getNames(): string[] {
    return Array.from(this.skills.keys());
  }

  async execute(name: string, params: any, context: SkillContext): Promise<SkillResult> {
    const skill = this.skills.get(name);
    if (!skill) {
      return {
        title: 'Skill Not Found',
        summary: `Skill '${name}' is not registered`,
        spokenNarrative: `I don't have a skill called ${name}`,
        operation: 'execute',
        ok: false,
      };
    }

    try {
      this.emit('executing', name, params);
      const result = await skill.execute(params, context);
      this.emit('executed', name, result);
      return result;
    } catch (error) {
      const errorResult: SkillResult = {
        title: skill.metadata.name,
        summary: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        spokenNarrative: `Error running ${name}`,
        operation: 'execute',
        ok: false,
      };
      this.emit('error', name, error);
      return errorResult;
    }
  }

  findByTrigger(trigger: string): Skill[] {
    const normalized = trigger.toLowerCase();
    return this.getAll().filter(skill => 
      skill.metadata.triggers.some(t => t.toLowerCase().includes(normalized))
    );
  }

  findByCategory(category: string): Skill[] {
    return this.getAll().filter(skill => 
      skill.metadata.category.toLowerCase() === category.toLowerCase()
    );
  }

  search(query: string): Skill[] {
    const normalized = query.toLowerCase();
    return this.getAll().filter(skill => 
      skill.metadata.name.toLowerCase().includes(normalized) ||
      skill.metadata.description.toLowerCase().includes(normalized) ||
      skill.metadata.triggers.some(t => t.toLowerCase().includes(normalized)) ||
      skill.metadata.aliases.some(a => a.toLowerCase().includes(normalized))
    );
  }

  isRegistered(name: string): boolean {
    return this.skills.has(name);
  }

  getManifest(name: string): SkillManifest | undefined {
    const meta = this.skillMetadata.get(name);
    if (!meta) return undefined;
    return {
      name: meta.name,
      description: meta.description,
      category: meta.category,
      source: meta.source,
      version: meta.version,
    };
  }

  getAllManifests(): SkillManifest[] {
    return this.getAllMetadata().map(meta => ({
      name: meta.name,
      description: meta.description,
      category: meta.category,
      source: meta.source,
      version: meta.version,
    }));
  }
}

export const skillRegistry = new SkillRegistry();