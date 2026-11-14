/**
 * Stella Mobile — Writing Skill Operations Part 2
 * Rewrite, proofread, brainstorm, outline, sources
 */

import { SkillResult, SkillContext } from '../core/types';
import { inference } from '../../services/inference';

const WRITING_PROMPTS = {
  rewrite: (params: any) => {
    const { text, tone = 'professional', format = 'essay' } = params;
    return `Rewrite the following text as a ${format} in a ${tone} tone. Keep the core message but change the structure and wording:\n\n${text}`;
  },
  proofread: (params: any) => {
    const { text } = params;
    return `Proofread the following text for grammar, spelling, punctuation, and style errors. Return the corrected text with a list of changes made:\n\n${text}`;
  },
  brainstorm: (params: any) => {
    const { topic, count = 5 } = params;
    return `Brainstorm ${count} creative ideas or angles for "${topic}". Provide a brief description for each idea.`;
  },
  outline: (params: any) => {
    const { topic, format = 'essay', sections = 5 } = params;
    return `Create a detailed outline for a ${format} about "${topic}" with approximately ${sections} main sections. Include sub-points for each section.`;
  },
};

export async function rewriteText(params: any, context: SkillContext): Promise<any> {
  if (!params.text) return { title: 'Writing', summary: 'Text to rewrite is required', spokenNarrative: 'Please provide text to rewrite', operation: 'rewrite', ok: false };
  const prompt = `Rewrite the following text as a ${params.format || 'essay'} in a ${params.tone || 'professional'} tone. Keep the core message but change the structure and wording:\n\n${params.text}`;
  try {
    const result = await inference.generate(prompt, 'upstream', { temperature: 0.7, max_tokens: 1024 });
    return { title: 'Text Rewritten', summary: result, spokenNarrative: 'Text rewritten', operation: 'rewrite', ok: true, record: { rewritten: result } };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Rewrite failed'}`, spokenNarrative: 'Failed to rewrite', operation: 'rewrite', ok: false };
  }
}

export async function proofreadText(params: any, context: SkillContext): Promise<any> {
  if (!params.text) return { title: 'Writing', summary: 'Text to proofread is required', spokenNarrative: 'Please provide text to proofread', operation: 'proofread', ok: false };
  const prompt = `Proofread the following text for grammar, spelling, punctuation, and style errors. Return the corrected text with a list of changes made:\n\n${params.text}`;
  try {
    const result = await inference.generate(prompt, 'upstream', { temperature: 0.2, max_tokens: 1024 });
    return { title: 'Proofreading Complete', summary: result, spokenNarrative: 'Proofreading complete', operation: 'proofread', ok: true, record: { corrected: result } };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Proofreading failed'}`, spokenNarrative: 'Failed to proofread', operation: 'proofread', ok: false };
  }
}

export async function brainstormIdeas(params: any, context: SkillContext): Promise<any> {
  if (!params.topic) return { title: 'Writing', summary: 'Topic for brainstorming is required', spokenNarrative: 'Please provide a topic', operation: 'brainstorm', ok: false };
  const prompt = `Brainstorm ${params.count || 5} creative ideas or angles for "${params.topic}". Provide a brief description for each idea.`;
  try {
    const result = await inference.generate(prompt, 'upstream', { temperature: 0.8, max_tokens: 1024 });
    return { title: 'Brainstorm Results', summary: result, spokenNarrative: 'Here are some ideas', operation: 'brainstorm', ok: true, record: { ideas: result } };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Brainstorm failed'}`, spokenNarrative: 'Failed to brainstorm', operation: 'brainstorm', ok: false };
  }
}

export async function createOutline(params: any, context: SkillContext): Promise<any> {
  if (!params.topic) return { title: 'Writing', summary: 'Topic for outline is required', spokenNarrative: 'Please provide a topic', operation: 'outline', ok: false };
  const prompt = `Create a detailed outline for a ${params.format || 'essay'} about "${params.topic}" with approximately ${params.sections || 5} main sections. Include sub-points for each section.`;
  try {
    const result = await inference.generate(prompt, 'upstream', { temperature: 0.5, max_tokens: 1024 });
    return { title: 'Outline Created', summary: result, spokenNarrative: 'Here is your outline', operation: 'outline', ok: true, record: { outline: result } };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Outline failed'}`, spokenNarrative: 'Failed to create outline', operation: 'outline', ok: false };
  }
}

export function getSources(): any {
  return { 
    title: 'Writing Sources', 
    summary: 'Writing assistance powered by local LLM (llama.rn). No external API required. Supports multiple formats, tones, and languages.', 
    spokenNarrative: 'Writing powered by local AI model', 
    operation: 'sources', 
    ok: true, 
    record: { source: 'Local LLM (llama.rn)', operations: ['generate', 'edit', 'summarize', 'rewrite', 'proofread', 'brainstorm', 'outline', 'sources'] } 
  };
}