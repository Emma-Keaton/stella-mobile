/**
 * Stella Mobile — Agent Planner
 * Ported from agent/planner.py — breaks goals into steps using available tools.
 */

export interface PlanStep {
  step: number
  tool: string
  description: string
  parameters: any
  critical?: boolean
  status: 'pending' | 'doing' | 'done' | 'failed'
}

export interface Plan {
  goal: string
  steps: PlanStep[]
}

export class Planner {
  static createPlan(goal: string, availableTools: string[]): Plan {
    const steps: PlanStep[] = []

    const lower = goal.toLowerCase()

    if (lower.includes('search') || lower.includes('find') || lower.includes('look up')) {
      steps.push({
        step: 1,
        tool: 'web_search',
        description: `Search for: ${goal}`,
        parameters: { query: goal },
        critical: true,
        status: 'pending',
      })
    } else if (lower.includes('download') || lower.includes('fetch')) {
      steps.push({
        step: 1,
        tool: 'media_download',
        description: `Download media for: ${goal}`,
        parameters: { url: '', filename: '', type: 'document' },
        critical: true,
        status: 'pending',
      })
    } else if (lower.includes('write') || lower.includes('create file')) {
      steps.push({
        step: 1,
        tool: 'file_controller',
        description: `Write file for: ${goal}`,
        parameters: { action: 'write', path: '', content: '' },
        critical: true,
        status: 'pending',
      })
    } else if (lower.includes('map') || lower.includes('location') || lower.includes('distance')) {
      steps.push({
        step: 1,
        tool: 'map_view',
        description: `Show map for: ${goal}`,
        parameters: { lat: 0, lon: 0, zoom: 15 },
        critical: true,
        status: 'pending',
      })
    } else if (lower.includes('anatomy') || lower.includes('3d') || lower.includes('figure')) {
      steps.push({
        step: 1,
        tool: 'anatomy',
        description: `Build anatomy figure: ${goal}`,
        parameters: { operation: 'build', concept: goal, size: 'Figure', theme: 'dark', width: 600, height: 600 },
        critical: true,
        status: 'pending',
      })
    } else if (lower.includes('open app') || lower.includes('launch')) {
      steps.push({
        step: 1,
        tool: 'open_app',
        description: `Open app: ${goal}`,
        parameters: { app_name: '', package_name: '' },
        critical: true,
        status: 'pending',
      })
    } else {
      steps.push({
        step: 1,
        tool: 'web_search',
        description: `Search for: ${goal}`,
        parameters: { query: goal },
        critical: true,
        status: 'pending',
      })
    }

    return { goal, steps }
  }

  static replan(
    goal: string,
    completedSteps: PlanStep[],
    failedStep: PlanStep,
    error: string
  ): Plan {
    const remaining = goal
    return {
      goal,
      steps: [
        {
          step: 1,
          tool: 'web_search',
          description: `Revised: Search for ${goal} after error: ${error}`,
          parameters: { query: goal },
          critical: true,
          status: 'pending',
        },
      ],
    }
  }

  static toToolCalls(plan: Plan): Array<{ name: string; args: any }> {
    return plan.steps.map(s => ({ name: s.tool, args: s.parameters }))
  }
}
