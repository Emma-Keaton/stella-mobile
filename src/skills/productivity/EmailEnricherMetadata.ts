/**
 * Stella Mobile — Email Enricher Skill
 * Enrich email addresses with social profiles, company info, and verification
 */

import { SkillMetadata } from '../core/types';

export const emailEnricherMetadata: SkillMetadata = {
  name: 'email_enricher',
  aliases: ['email_enricher', 'enrich_email', 'email_lookup', 'email_verification', 'email_profile'],
  description: 'Enrich email addresses with social profiles, company information, job titles, and verification status. Uses multiple free and paid APIs.',
  triggers: ['enrich email', 'email enrichment', 'lookup email', 'verify email', 'email profile', 'who is this email'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: enrich | verify | sources. Defaults to enrich.',
        enum: ['enrich', 'verify', 'sources']
      },
      email: { type: 'string', description: 'Email address to enrich/verify.' },
      includeSocial: { type: 'boolean', description: 'Include social profiles (default true).' },
      includeCompany: { type: 'boolean', description: 'Include company info (default true).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'productivity',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    hunter_io: { name: 'Hunter.io', description: 'Email finder and verifier', url: 'https://api.hunter.io/v2', docs: 'https://hunter.io/api-documentation', authTier: 'api_key', rateLimit: 'Free tier: 25/month', uses: ['enrich', 'verify'] },
    clearbit: { name: 'Clearbit', description: 'Company and person enrichment', url: 'https://person.clearbit.com/v2', docs: 'https://clearbit.com/docs', authTier: 'api_key', rateLimit: 'Free tier available', uses: ['enrich'] },
    abstractapi: { name: 'AbstractAPI', description: 'Email validation and enrichment', url: 'https://api.abstractapi.com/v1', docs: 'https://www.abstractapi.com/', authTier: 'api_key', rateLimit: 'Free tier available', uses: ['verify'] },
  },
};