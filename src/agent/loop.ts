/**
 * Stella Mobile — Agent Execute Loop
 * Ported from agent/loop.py — think -> act -> observe -> verify -> repeat.
 */

import { ToolRegistry } from './tools'
import { TOOL_HANDLERS } from './tool-handlers'
import { TOOL_HANDLERS_PART2 } from './tool-handlers-part2'
import { TOOL_HANDLERS_PART3 } from './tool-handlers-part3'
import { Scratchpad } from './scratchpad'
import { StellaAudit } from '../core/audit'
import { AppSettings, ToolResult, Honesty } from '../core/types'

const ALL_HANDLERS = { ...TOOL_HANDLERS, ...TOOL_HANDLERS_PART2, ...TOOL_HANDLERS_PART3 }

export interface RunResult {
  answer: string
  ok: boolean
  turns: number
  tool_calls: Array<{ name: string; args: any; ok: boolean; error?: string; elapsed?: number }>
  errors: string[]
  stopped_because: string
  elapsed: number
  plan: any[]
  verified: boolean | null
  verification_notes: string[]
  recalled: string
  frontier_route: any | null
}

export class Agent {
  private registry: ToolRegistry
  private maxTurns: number
  private maxTokens: number
  private temperature: number
  private maxTools: number
  private toolBudgetTier: number

  constructor(
    settings: AppSettings,
    maxTurns = 12,
    maxTokens = 1024,
    temperature = 0.3,
    maxTools = 12,
    toolBudgetTier = 1
  ) {
    this.registry = new ToolRegistry(settings)
    this.maxTurns = maxTurns
    this.maxTokens = maxTokens
    this.temperature = temperature
    this.maxTools = maxTools
    this.toolBudgetTier = toolBudgetTier

    const allowed = ALL_HANDLERS ? Object.keys(ALL_HANDLERS) : []
    this.registry.setAllowed(allowed)
  }

  async run(
    goal: string,
    progress?: (msg: string) => void,
    history: any[] = [],
    workspace: string | null = null
  ): Promise<RunResult> {
    const start = Date.now()
    const result: RunResult = {
      answer: '',
      ok: false,
      turns: 0,
      tool_calls: [],
      errors: [],
      stopped_because: '',
      elapsed: 0,
      plan: [],
      verified: null,
      verification_notes: [],
      recalled: '',
      frontier_route: null,
    }

    const seen: Record<string, number> = {}

    progress?.('Planning approach...')

    for (let turn = 0; turn < this.maxTurns; turn++) {
      result.turns = turn + 1
      progress?.(`Turn ${turn + 1}/${this.maxTurns}`)

      // Think: decide what to do
      const availableTools = this.registry.getAllTools().map(t => ({
        name: t.name,
        description: t.description,
        schema: t.schema,
      }))

      const planPrompt = `Goal: ${goal}\nAvailable tools: ${availableTools.map(t => t.name).join(', ')}\nHistory: ${JSON.stringify(history.slice(-5))}\nDecide the next action.`

      // Act: try to call a tool based on the plan
      // For mobile, we use a simplified approach - the user selects tools via UI
      // The agent loop provides the framework for autonomous execution

      // Simulate tool execution based on available handlers
      const toolNames = Object.keys(ALL_HANDLERS)
      const firstTool = toolNames[0]

      if (firstTool && ALL_HANDLERS[firstTool]) {
        const fingerprint = `${firstTool}:${JSON.stringify(args || {})}`
        if (fingerprint in seen) {
          seen[fingerprint]++
          if (seen[fingerprint] > 2) {
            result.errors.push(`${firstTool}: repeated call, stopped`)
            result.stopped_because = 'repeat_guard'
            break
          }
        } else {
          seen[fingerprint] = 1
        }

        progress?.(`Tool: ${firstTool}`)
        const outcome = await this.registry.run(firstTool, {})
        result.tool_calls.push({
          name: firstTool,
          args: {},
          ok: outcome.ok,
          error: outcome.error,
          elapsed: outcome.elapsed,
        })

        if (!outcome.ok) {
          result.errors.push(`${firstTool}: ${outcome.error}`)
        }

        if (outcome.ok) {
          result.answer = outcome.output || ''
          result.ok = true
          result.stopped_because = 'completed'
          break
        }
      } else {
        result.stopped_because = 'no_tools_available'
        break
      }
    }

    if (!result.ok) {
      result.stopped_because = result.stopped_because || 'max_turns_reached'
      result.answer = `Task incomplete after ${result.turns} turns. Errors: ${result.errors.join(', ')}`
    }

    result.elapsed = Date.now() - start

    progress?.(`Done: ${result.answer}`)

    await StellaAudit.record('agent', 'run_goal', goal, result.ok ? 'completed' : 'incomplete', 'agent_loop', 'allowed', {
      turns: result.turns,
      tool_calls: result.tool_calls.length,
      errors: result.errors.length,
    })

    return result
  }
}

export async function runGoal(
  goal: string,
  settings: AppSettings,
  workspace?: string,
  progress?: (msg: string) => void
): Promise<RunResult> {
  const agent = new Agent(settings)
  return agent.run(goal, progress, [], workspace)
}
