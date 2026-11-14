import { SkillMetadata } from '../../../core/types';
export const prdMetadata: SkillMetadata = {
  name: 'prd', aliases: ['prd', 'product_requirements', 'product_doc', 'spec', 'product_spec', 'requirements_doc'],
  description: 'Creates Product Requirement Documents (PRDs) with problem statement, goals, user stories, success metrics, and release criteria.',
  triggers: ['prd', 'product requirements', 'write prd', 'product spec', 'product document', 'requirements document', 'feature spec'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['create', 'review', 'template', 'sources'], default: 'create' }, title: { type: 'string', description: 'Product/feature name.' }, problem: { type: 'string', description: 'Problem statement.' }, goals: { type: 'array', items: { type: 'string' }, description: 'Goals and objectives.' }, audience: { type: 'string', description: 'Target users.' }, successMetrics: { type: 'array', items: { type: 'string' }, description: 'Success metrics.' }, timeline: { type: 'string', description: 'Release timeline.' } }, required: [] },
  version: '1.0.0', category: 'product', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'Product management skill for creating PRDs.',
};