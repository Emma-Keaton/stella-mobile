/**
 * Stella Mobile — Code Review Skill
 * Engineering category. Reviews code for quality, bugs, security, and best practices.
 * Based on claude-skills engineering/pattern.
 */

import { SkillMetadata } from '../../core/types';

export const codeReviewMetadata: SkillMetadata = {
  name: 'code_review',
  aliases: ['code_review', 'review_code', 'code_audit', 'pr_review', 'pull_request_review', 'code_quality'],
  description: 'Reviews source code for bugs, security issues, performance problems, and best practice violations. Supports multiple languages and provides actionable fix suggestions.',
  triggers: [
    'review code', 'code review', 'audit code', 'review pull request', 'pr review',
    'code quality check', 'find bugs', 'security review', 'code inspection',
  ],
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'One of: review | security | performance | style | all. Defaults to all.',
        enum: ['review', 'security', 'performance', 'style', 'all'],
        default: 'all',
      },
      code: { type: 'string', description: 'Source code to review.' },
      filePath: { type: 'string', description: 'Path to the file to review.' },
      language: { type: 'string', description: 'Programming language (typescript, javascript, python, kotlin, swift, etc.).' },
      severity: { type: 'string', description: 'Minimum severity: low | medium | high | critical. Defaults to medium.', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
      includeFixes: { type: 'boolean', description: 'Include suggested fixes (default true).', default: true },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'engineering',
  source: 'claude-skills',
  active: true,
  author: 'Stella',
  surface: 'both',
  requires: ['storage', 'internet'],
  notes: 'Engineering skill for code quality assurance. Reviews code inline and provides severity-rated findings with suggested fixes.',
};