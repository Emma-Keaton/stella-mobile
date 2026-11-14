import { SkillMetadata } from '../../../core/types';
export const sopMetadata: SkillMetadata = {
  name: 'sop', aliases: ['sop', 'standard_operating_procedure', 'process_doc', 'workflow_doc', 'procedure_documentation'],
  description: 'Standard Operating Procedure creation - step-by-step process documentation, workflow mapping, and training materials.',
  triggers: ['sop', 'standard operating procedure', 'process documentation', 'workflow documentation', 'procedure doc', 'process map'],
  parameters: { type: 'object', properties: { operation: { type: 'string', enum: ['create', 'review', 'template', 'sources'], default: 'create' }, processName: { type: 'string', description: 'Name of the process.' }, steps: { type: 'array', items: { type: 'string' }, description: 'Process steps.' }, owner: { type: 'string', description: 'Process owner.' }, frequency: { type: 'string', description: 'How often the process runs.' } }, required: [] },
  version: '1.0.0', category: 'business_operations', source: 'claude-skills', active: true, author: 'Stella', surface: 'both', notes: 'SOP creation skill.',
};