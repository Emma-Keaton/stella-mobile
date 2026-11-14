/**
 * Stella Mobile — Writing Skill
 * Helps with various writing tasks: essays, emails, creative writing, editing, summarization
 * Supports both local LLM (llama.rn) and cloud LLMs (OpenAI, Anthropic, Google)
 */

import { SkillMetadata } from '../core/types';

export type ModelProvider = 'local' | 'openai' | 'anthropic' | 'google' | 'auto';

export const writingMetadata: SkillMetadata = {
  name: 'writing',
  aliases: ['writing', 'writer', 'essay', 'email_writer', 'creative_writing', 'editor', 'proofreader', 'summarize', 'rewrite'],
  description: 'Writing assistant for essays, emails, creative writing, editing, proofreading, summarization, and rewriting. Supports both local LLM (llama.rn) and cloud LLMs (OpenAI, Anthropic, Google). Auto-selects best model based on task complexity.',
  triggers: ['write', 'writing', 'essay', 'email', 'creative writing', 'edit', 'proofread', 'summarize', 'rewrite', 'rephrase', 'improve writing'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: generate | edit | summarize | rewrite | proofread | brainstorm | outline | sources. Defaults to generate.',
        enum: ['generate', 'edit', 'summarize', 'rewrite', 'proofread', 'brainstorm', 'outline', 'sources']
      },
      topic: { type: 'string', description: 'Topic or prompt for writing.' },
      text: { type: 'string', description: 'Existing text to edit/summarize/rewrite/proofread.' },
      format: { type: 'string', description: 'Format: essay, email, story, poem, article, script, bullet_points, social_media.', enum: ['essay', 'email', 'story', 'poem', 'article', 'script', 'bullet_points', 'social_media'] },
      tone: { type: 'string', description: 'Tone: professional, casual, friendly, formal, persuasive, humorous, academic, creative.', enum: ['professional', 'casual', 'friendly', 'formal', 'persuasive', 'humorous', 'academic', 'creative'] },
      length: { type: 'string', description: 'Length: short, medium, long, or word count.', enum: ['short', 'medium', 'long'] },
      audience: { type: 'string', description: 'Target audience.' },
      keyPoints: { type: 'array', description: 'Key points to include (for generate/outline).', items: { type: 'string' } },
      model: { type: 'string', description: 'Model provider: local, openai, anthropic, google, or auto. Defaults to auto.', enum: ['local', 'openai', 'anthropic', 'google', 'auto'] },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'productivity',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  notes: 'Supports local LLM (llama.rn) for privacy/offline and cloud LLMs (OpenAI GPT-4, Anthropic Claude, Google Gemini) for complex tasks. Auto mode selects best model based on task complexity and availability.',
};