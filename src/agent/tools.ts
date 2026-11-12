/**
 * Stella Mobile — Agent Tool Registry
 * Ported from agent/tools.py — tool surface with safety, permissions, honesty.
 */

import RNFS from 'react-native-fs'
import { AppSettings, ToolDefinition, ToolResult, Honesty } from '../core/types'

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map()
  private allowed: Set<string> = new Set()
  private settings: AppSettings

  constructor(settings: AppSettings) {
    this.settings = settings
    this.registerCoreTools()
  }

  private registerTool(def: ToolDefinition): void {
    this.tools.set(def.name, def)
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name)
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  setAllowed(toolNames: string[]): void {
    this.allowed = new Set(toolNames)
  }

  isAllowed(name: string): boolean {
    return this.allowed.has(name)
  }

  async checkPolicy(name: string, destructive: boolean): Promise<{ allowed: boolean; reason?: string }> {
    const tool = this.tools.get(name)
    if (!tool) return { allowed: false, reason: 'Unknown tool' }
    return {
      allowed: true,
      reason: destructive && !this.settings.security.encryption_enabled ? 'Encryption required' : undefined,
    }
  }

  async auditCall(
    toolName: string,
    target: string,
    activity: string,
    rule: string,
    ok: boolean,
    reason?: string
  ): Promise<void> {
    const { StellaAudit } = require('../core/audit')
    await StellaAudit.record('agent', toolName, target, ok ? 'permitted' : 'refused', activity, rule, { reason })
  }

  async run(name: string, args: any): Promise<ToolResult> {
    const tool = this.tools.get(name)
    if (!tool) {
      return { ok: false, error: `Unknown tool: ${name}`, honesty: Honesty.FAILED }
    }
    if (!this.isAllowed(name)) {
      return { ok: false, error: `Tool not allowed: ${name}`, honesty: Honesty.ASK }
    }
    const policy = await this.checkPolicy(name, tool.destructive)
    if (!policy.allowed) {
      await this.auditCall(name, args?.target || '-', 'policy', policy.reason || 'denied', false, policy.reason)
      return { ok: false, error: policy.reason || 'Policy denied', honesty: Honesty.ASK }
    }
    const start = Date.now()
    try {
      const result = await tool.handler(args)
      const elapsed = Date.now() - start
      await this.auditCall(name, args?.target || '-', 'execute', 'allowed', result.ok, result.error)
      return { ...result, elapsed: result.elapsed ?? elapsed }
    } catch (e: any) {
      const elapsed = Date.now() - start
      await this.auditCall(name, args?.target || '-', 'execute', 'error', false, e.message)
      return { ok: false, error: e.message, honesty: Honesty.FAILED, elapsed }
    }
  }
}

let globalRegistry: ToolRegistry | null = null

export function getToolRegistry(settings: AppSettings): ToolRegistry {
  if (!globalRegistry) {
    globalRegistry = new ToolRegistry(settings)
  }
  return globalRegistry
}
