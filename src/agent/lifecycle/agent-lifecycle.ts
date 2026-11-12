/**
 * Stella Mobile — Agent Lifecycle
 * Dr Zero orchestrator, graph engineering, loop cycle, child agent spawn.
 * Wired to Skill Registry so the agent can call skills (including Termux OSINT/security).
 */

import { skillRegistry } from '../../skills/registry'
import { SkillResult } from '../../skills/base'

export type AgentStatus = 'idle' | 'running' | 'planning' | 'executing' | 'verifying' | 'completed' | 'failed' | 'paused'

export interface AgentTask {
  id: string
  goal: string
  status: AgentStatus
  plan: AgentStep[]
  currentStep: number
  results: AgentStepResult[]
  errors: string[]
  startTime: number
  endTime?: number
  parentId?: string
  childAgents: string[]
  metadata: Record<string, any>
}

export interface AgentStep {
  id: string
  tool: string
  args: Record<string, any>
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  result?: any
  error?: string
  honesty: 'done' | 'unverified' | 'failed' | 'ask' | 'started'
}

export interface AgentStepResult {
  stepId: string
  ok: boolean
  output: any
  honesty: string
  verified: boolean
}

export interface ChildAgent {
  id: string
  parentId: string
  goal: string
  status: AgentStatus
  spawnedAt: number
  completedAt?: number
  result?: any
}

export class AgentLifecycle {
  private tasks: Map<string, AgentTask> = new Map()
  private childAgents: Map<string, ChildAgent> = new Map()
  private activeTaskId: string | null = null
  private maxLoopIterations = 10
  private verificationEnabled = true

  onTaskStatusChange?: (task: AgentTask) => void
  onChildSpawned?: (child: ChildAgent) => void
  onStepCompleted?: (taskId: string, step: AgentStep, result: AgentStepResult) => void  createTask(goal: string, parentId?: string): AgentTask {
    const id = \gent_\_\\
    const task: AgentTask = {
      id,
      goal,
      status: 'idle',
      plan: [],
      currentStep: 0,
      results: [],
      errors: [],
      startTime: Date.now(),
      childAgents: [],
      parentId,
      metadata: {},
    }
    this.tasks.set(id, task)
    return task
  }

  async runTask(taskId: string): Promise<AgentTask> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error(\Task \ not found\)

    this.activeTaskId = taskId
    task.status = 'running'
    task.startTime = Date.now()
    this.notifyTaskChange(task)

    task.status = 'planning'
    this.notifyTaskChange(task)
    task.plan = await this.generatePlan(task.goal)
    task.status = 'running'
    this.notifyTaskChange(task)

    let iteration = 0
    while (task.currentStep < task.plan.length && iteration < this.maxLoopIterations) {
      iteration++
      const step = task.plan[task.currentStep]

      task.status = 'executing'
      this.notifyTaskChange(task)
      const result = await this.executeStep(step, task)

      if (this.verificationEnabled) {
        task.status = 'verifying'
        this.notifyTaskChange(task)
        const verdict = await this.verifyStep(task.goal, step, result)
        result.verified = verdict.ok
        if (!verdict.ok && result.honesty !== 'failed') {
          step.error = verdict.reasons?.join('; ') || 'Verification failed'
          step.status = 'failed'
          task.errors.push(\Step \: \\)
          const retryResult = await this.executeStep(step, task)
          result.output = retryResult.output
          result.honesty = retryResult.honesty
          result.verified = await this.verifyStep(task.goal, step, retryResult)
        }
      }

      step.status = result.ok ? 'completed' : 'failed'
      step.result = result.output
      step.honesty = result.honesty
      task.results.push(result)

      if (result.ok) {
        task.currentStep++
      } else {
        task.errors.push(\Step \: \\)
        task.currentStep++
      }

      this.onStepCompleted?.(taskId, step, result)
      this.notifyTaskChange(task)
    }

    task.status = task.currentStep >= task.plan.length ? 'completed' : 'failed'
    task.endTime = Date.now()
    this.notifyTaskChange(task)
    this.activeTaskId = null
    return task
  }
  private async generatePlan(goal: string): Promise<AgentStep[]> {
    const steps: AgentStep[] = []
    const lower = goal.toLowerCase()

    steps.push({
      id: \step_0\,
      tool: 'understand',
      args: { goal },
      description: 'Analyze the goal and determine required capabilities',
      status: 'pending',
      honesty: 'done',
    })

    if (lower.includes('search') || lower.includes('web') || lower.includes('lookup')) {
      steps.push({
        id: \step_1\,
        tool: 'web_search',
        args: { query: goal },
        description: 'Search the web for relevant information',
        status: 'pending',
        honesty: 'done',
      })
    }

    if (lower.includes('file') || lower.includes('write') || lower.includes('read') || lower.includes('create')) {
      steps.push({
        id: \step_2\,
        tool: 'file_operation',
        args: { goal },
        description: 'Perform file operations as needed',
        status: 'pending',
        honesty: 'done',
      })
    }

    if (lower.includes('whois') || lower.includes('dns') || lower.includes('subdomain') || lower.includes('port') || lower.includes('ssl') || lower.includes('social') || lower.includes('email') || lower.includes('phone') || lower.includes('ip') || lower.includes('github') || lower.includes('shodan') || lower.includes('censys') || lower.includes('nmap') || lower.includes('sql') || lower.includes('xss') || lower.includes('wordpress') || lower.includes('wayback') || lower.includes('metadata') || lower.includes('header')) {
      steps.push({
        id: \step_sec\,
        tool: 'security_scan',
        args: { goal },
        description: 'Run security/OSINT reconnaissance',
        status: 'pending',
        honesty: 'done',
      })
    }

    steps.push({
      id: \step_final\,
      tool: 'synthesize',
      args: { goal },
      description: 'Synthesize final answer from all step results',
      status: 'pending',
      honesty: 'done',
    })

    return steps
  }

  private async executeStep(step: AgentStep, task: AgentTask): Promise<AgentStepResult> {
    step.status = 'running'
    try {
      const output = await this.routeTool(step.tool, step.args)
      return { stepId: step.id, ok: true, output, honesty: 'done', verified: false }
    } catch (e: any) {
      return { stepId: step.id, ok: false, output: { error: e.message }, honesty: 'failed', verified: false }
    }
  }
  private async routeTool(tool: string, args: Record<string, any>): Promise<any> {
    // First check if it's a registered skill (including Termux OSINT/security skills)
    const skill = skillRegistry.getSkill(tool)
    if (skill) {
      try {
        const result = await skill.execute(args)
        return { tool: skill.metadata.id, result: result.record || result.summary, ok: result.ok }
      } catch (e: any) {
        return { tool, error: e.message, ok: false }
      }
    }

    switch (tool) {
      case 'understand':
        return { analysis: 'Goal understood: ' + args.goal, capabilities: ['chat', 'tools'] }
      case 'web_search':
        return { results: [], query: args.query }
      case 'file_operation':
        return { operation: 'completed', details: args.goal }
      case 'synthesize':
        return { answer: 'Synthesized response for: ' + args.goal }
      case 'security_scan':
        return { scanType: 'security_osint', target: args.goal, results: [] }
      default:
        return { tool, args, result: 'executed' }
    }
  }

  private async verifyStep(goal: string, step: AgentStep, result: AgentStepResult): Promise<{ ok: boolean; reasons?: string[] }> {
    const reasons: string[] = []
    if (!result.ok) {
      reasons.push('Step ' + step.id + ' returned error: ' + (result.output?.error || 'unknown'))
    }
    if (step.tool === 'understand' && !result.output?.analysis) {
      reasons.push('Understanding step produced no analysis')
    }
    if (step.tool === 'synthesize' && !result.output?.answer) {
      reasons.push('Synthesis step produced no answer')
    }
    return { ok: reasons.length === 0, reasons: reasons.length > 0 ? reasons : undefined }
  }

  spawnChildAgent(parentTaskId: string, goal: string): ChildAgent {
    const parent = this.tasks.get(parentTaskId)
    if (!parent) throw new Error('Parent task ' + parentTaskId + ' not found')

    const id = 'child_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    const child: ChildAgent = {
      id,
      parentId: parentTaskId,
      goal,
      status: 'idle',
      spawnedAt: Date.now(),
    }

    this.childAgents.set(id, child)
    parent.childAgents.push(id)
    this.notifyTaskChange(parent)
    this.onChildSpawned?.(child)

    this.runChildAgent(child.id)
    return child
  }

  private async runChildAgent(childId: string): Promise<void> {
    const child = this.childAgents.get(childId)
    if (!child) return

    child.status = 'running'
    try {
      const subTask = this.createTask(child.goal, child.parentId)
      await this.runTask(subTask.id)
      child.status = subTask.status === 'completed' ? 'completed' : 'failed'
      child.result = { taskId: subTask.id, results: subTask.results }
      child.completedAt = Date.now()
    } catch (e: any) {
      child.status = 'failed'
      child.completedAt = Date.now()
    }
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId)
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
  }

  getChildAgents(parentId?: string): ChildAgent[] {
    return Array.from(this.childAgents.values()).filter(c => parentId ? c.parentId === parentId : true)
  }

  getActiveTask(): AgentTask | undefined {
    return this.activeTaskId ? this.tasks.get(this.activeTaskId) : undefined
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false
    task.status = 'failed'
    task.endTime = Date.now()
    task.errors.push('Task cancelled by user')
    this.notifyTaskChange(task)
    return true
  }

  private notifyTaskChange(task: AgentTask): void {
    this.onTaskStatusChange?.(task)
  }
}

export const agentLifecycle = new AgentLifecycle()
