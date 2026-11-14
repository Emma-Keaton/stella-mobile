/**
 * Stella Mobile — Writing Skill Operations Part 1
 * Generate, edit, summarize with local/cloud model support
 */

import { SkillResult, SkillContext } from '../core/types';
import { unifiedInference } from '../../services/unifiedInference';

const WRITING_PROMPTS = {
  generate: (params: any) => {
    const { topic, format = 'essay', tone = 'professional', length = 'medium', audience = 'general', keyPoints = [] } = params;
    const points = keyPoints.length ? `\nKey points to cover:\n${keyPoints.map((p: string) => `- ${p}`).join('\n')}` : '';
    return `Write a ${length} ${format} about "${topic}" for a ${audience} audience in a ${tone} tone.${points}\n\nWrite in clear, well-structured prose.`;
  },
  edit: (params: any) => {
    const { text, tone = 'professional', audience = 'general' } = params;
    return `Edit and improve the following text for a ${audience} audience in a ${tone} tone. Fix grammar, improve clarity, enhance flow, and strengthen the message:\n\n${text}\n\nReturn the improved version with changes highlighted.`;
  },
  summarize: (params: any) => {
    const { text, length = 'medium' } = params;
    return `Summarize the following text in a ${length} summary. Capture the main points, key arguments, and conclusions:\n\n${text}`;
  },
};

function getTaskComplexity(operation: string): 'simple' | 'medium' | 'complex' {
  switch (operation) {
    case 'proofread':
    case 'summarize':
    case 'edit':
      return 'simple'
    case 'generate':
    case 'rewrite':
    case 'outline':
      return 'medium'
    case 'brainstorm':
      return 'complex'
    default:
      return 'medium'
  }
}

export async function generateText(params: any, context: SkillContext): Promise<any> {
  const prompt = `Write a ${params.length || 'medium'} ${params.format || 'essay'} about "${params.topic}" for a ${params.audience || 'general'} audience in a ${params.tone || 'professional'} tone.${params.keyPoints?.length ? `\nKey points:\n${params.keyPoints.map((p: string) => `- ${p}`).join('\n')}` : ''}\n\nWrite in clear, well-structured prose.`;
  
  const provider = params.model || 'auto'
  const complexity = getTaskComplexity('generate')
  
  try {
    const result = await unifiedInference.generate(prompt, provider, { 
      temperature: 0.7, 
      max_tokens: 1024,
      taskComplexity: complexity 
    });
    return { 
      title: 'Writing Generated', 
      summary: result.text, 
      spokenNarrative: `Here's your ${params.format || 'essay'} about ${params.topic}`, 
      operation: 'generate', 
      ok: true, 
      record: { content: result.text, format: params.format, tone: params.tone, provider: result.provider, model: result.model } 
    };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Generation failed'}`, spokenNarrative: 'Failed to generate text', operation: 'generate', ok: false };
  }
}

export async function editText(params: any, context: SkillContext): Promise<any> {
  if (!params.text) return { title: 'Writing', summary: 'Text to edit is required', spokenNarrative: 'Please provide text to edit', operation: 'edit', ok: false };
  const prompt = `Edit and improve the following text for a ${params.audience || 'general'} audience in a ${params.tone || 'professional'} tone. Fix grammar, improve clarity, enhance flow, and strengthen the message:\n\n${params.text}\n\nReturn the improved version with changes highlighted.`;
  
  const provider = params.model || 'auto'
  
  try {
    const result = await unifiedInference.generate(prompt, provider, { 
      temperature: 0.3, 
      max_tokens: 1024,
      taskComplexity: 'simple'
    });
    return { title: 'Text Edited', summary: result.text, spokenNarrative: 'Text edited and improved', operation: 'edit', ok: true, record: { edited: result.text, provider: result.provider, model: result.model } };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Edit failed'}`, spokenNarrative: 'Failed to edit text', operation: 'edit', ok: false };
  }
}

export async function summarizeText(params: any, context: SkillContext): Promise<any> {
  if (!params.text) return { title: 'Writing', summary: 'Text to summarize is required', spokenNarrative: 'Please provide text to summarize', operation: 'summarize', ok: false };
  const prompt = `Summarize the following text in a ${params.length || 'medium'} summary. Capture the main points, key arguments, and conclusions:\n\n${params.text}`;
  
  const provider = params.model || 'auto'
  
  try {
    const result = await unifiedInference.generate(prompt, provider, { 
      temperature: 0.3, 
      max_tokens: 512,
      taskComplexity: 'simple'
    });
    return { title: 'Summary', summary: result.text, spokenNarrative: 'Here is the summary', operation: 'summarize', ok: true, record: { summary: result.text, provider: result.provider, model: result.model } };
  } catch (error) {
    return { title: 'Writing', summary: `Error: ${error instanceof Error ? error.message : 'Summarization failed'}`, spokenNarrative: 'Failed to summarize', operation: 'summarize', ok: false };
  }
}