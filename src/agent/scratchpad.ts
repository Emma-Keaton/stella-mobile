/**
 * Stella Mobile — Agent Scratchpad
 * Ported from agent/scratchpad.py — working plan for the current task.
 */

import * as Crypto from 'expo-crypto'

const PLAN_KEY = 'stella_scratchpad_plan_v1'

interface PlanState {
  steps: Array<{
    step: number
    tool: string
    description: string
    parameters: any
    status: 'pending' | 'doing' | 'done' | 'failed'
    critical?: boolean
    result?: any
    error?: string
  }>
  note: string
  updated: number
}

let currentPlan: PlanState = { steps: [], note: '', updated: 0 }

export class Scratchpad {
  static getPlan(): PlanState {
    return JSON.parse(JSON.stringify(currentPlan))
  }

  static writePlan(steps: any[], note = ''): { ok: boolean; output?: string; error?: string; data?: any } {
    const normalised = steps.map((raw, idx) => {
      if (typeof raw === 'string') {
        return { step: idx + 1, tool: raw, description: raw, parameters: {}, status: 'pending' as const }
      }
      return {
        step: raw.step ?? idx + 1,
        tool: raw.tool || 'unknown',
        description: raw.description || raw.step || raw.task || raw.text || '',
        parameters: raw.parameters ?? {},
        status: ['pending', 'doing', 'done', 'failed'].includes(raw.status) ? raw.status : 'pending',
        critical: raw.critical ?? false,
      }
    })

    if (normalised.length === 0) {
      return { ok: false, error: 'no usable steps in plan' }
    }

    currentPlan = {
      steps: normalised,
      note,
      updated: Date.now(),
    }

    this.persist().catch(() => {
      // persist is best-effort
    })

    const done = normalised.filter(s => s.status === 'done').length
    return {
      ok: true,
      output: `plan updated (${done}/${normalised.length} done)`,
      data: { steps: normalised.length, done },
    }
  }

  static async persist(): Promise<void> {
    try {
      await globalThis.__stella_storage__.setItem(PLAN_KEY, currentPlan)
    } catch {
      // persist is best-effort
    }
  }

  static async load(): Promise<void> {
    try {
      const saved = await globalThis.__stella_storage__.getItem<any>(PLAN_KEY)
      if (saved) currentPlan = saved
    } catch {
      // ignore load errors
    }
  }

  static progressLine(): string {
    const steps = currentPlan.steps
    if (!steps.length) return 'no plan yet'
    const done = steps.filter(s => s.status === 'done').length
    const active =
      steps.find(s => s.status === 'doing')?.step ??
      steps.find(s => s.status === 'pending')?.step ??
      ''
    return `${done}/${steps.length} done - current: ${active}`
  }

  static reset(): void {
    currentPlan = { steps: [], note: '', updated: 0 }
  }

  static markStep(stepNumber: number, status: 'doing' | 'done' | 'failed', result?: any, error?: string): void {
    const step = currentPlan.steps.find(s => s.step === stepNumber)
    if (step) {
      step.status = status
      if (result !== undefined) step.result = result
      if (error) step.error = error
      currentPlan.updated = Date.now()
      this.persist().catch(() => {})
    }
  }
}
