/**
 * Stella Mobile — Skill Base Class
 * Base class for all Stella skills, ported from the main Stella skill system.
 */

export interface SkillMetadata {
  id: string
  name: string
  description: string
  category: string
  version: string
  source: string
  triggers: string[]
  parameters: any
  operations: string[]
  example_prompt?: string
  requires_auth: boolean
  destructive: boolean
  active: boolean
}

export interface SkillResult {
  title: string
  summary: string
  spoken_narrative: string
  ok: boolean
  operation?: string
  record?: any
  error?: string
}

export interface SkillContext {
  userId?: string
  sessionId?: string
  permissions: string[]
  location?: { lat: number; lon: number }
}

export abstract class StellaSkill {
  abstract metadata: SkillMetadata

  abstract execute(args: any, context?: SkillContext): Promise<SkillResult>

  protected ok(result: any, operation?: string): SkillResult {
    return {
      title: this.metadata.name,
      summary: typeof result === 'string' ? result : (result?.summary || 'Operation completed'),
      spoken_narrative: typeof result === 'string' ? result : (result?.spoken_narrative || 'Operation completed'),
      ok: true,
      operation,
      record: result,
    }
  }

  protected fail(error: string, operation?: string): SkillResult {
    return {
      title: this.metadata.name,
      summary: error,
      spoken_narrative: error,
      ok: false,
      operation,
      error,
    }
  }

  protected unknownOperation(operation: string): SkillResult {
    return this.fail(
      `Unknown operation '${operation}'. Available: ${this.metadata.operations.join(', ')}`,
      operation
    )
  }

  matchesTrigger(trigger: string): boolean {
    const lower = trigger.toLowerCase()
    return this.metadata.triggers.some(t => lower.includes(t.toLowerCase()))
  }

  canExecute(operation: string): boolean {
    return this.metadata.operations.includes(operation) || this.metadata.operations.length === 0
  }
}
