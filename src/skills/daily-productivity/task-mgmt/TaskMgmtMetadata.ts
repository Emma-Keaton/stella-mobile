import { SkillMetadata } from '../../../core/types';
export const taskMgmtMetadata: SkillMetadata = {
  name: 'task_management', aliases: ['task_management', 'todo', 'task_list', 'productivity', 'daily_tasks'],
  description: 'Task management - create, prioritize, and organize daily tasks with Eisenhower matrix and time blocking.',
  triggers: ['task management', 'todo list', 'manage tasks', 'daily tasks', 'prioritize tasks', 'task list', 'eisenhower'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['create', 'prioritize', 'timeblock', 'template', 'sources'], default: 'create' }, tasks: { type: 'array', items: { type: 'string' }, description: 'List of tasks.' }, deadline: { type: 'string', description: 'Deadline or due date.' }, energyLevel: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Current energy level.' } }, required: [] },
  version: '1.0.0', category: 'daily_productivity', source: 'claude-skills', active: true, author: 'Stella', surface: 'mobile', notes: 'Daily productivity task management skill.',
};