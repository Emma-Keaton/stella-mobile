/**
 * Stella Mobile — Email Intelligence Skill
 * Comprehensive email intelligence: enrichment, verification, OSINT, breach checking
 * Combines enrichment, verification, OSINT, and breach checking
 */

import { SkillMetadata } from '../core/types';

export const emailIntelligenceMetadata: SkillMetadata = {
  name: 'email_intelligence',
  aliases: ['email_intelligence', 'email_enricher', 'email_osint', 'email_lookup', 'email_verification', 'email_breach', 'email_profile', 'whois_email'],
  description: 'Comprehensive email intelligence: enrich emails with social/company data, verify deliverability, check for breaches, and perform OSINT. Combines Hunter.io, Clearbit, AbstractAPI, HaveIBeenPwned, and more.',
  triggers: ['enrich email', 'email enrichment', 'lookup email', 'verify email', 'email profile', 'email osint', 'check email breach', 'who is this email', 'email investigation'],
  parameters: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        description: 'One of: enrich | verify | breach | osint | full | extract_website | domain_search | sources. Defaults to full.',
        enum: ['enrich', 'verify', 'breach', 'osint', 'full', 'extract_website', 'domain_search', 'sources']
      },
      email: { type: 'string', description: 'Email address to analyze.' },
      domain: { type: 'string', description: 'Domain to search for email addresses.' },
      website: { type: 'string', description: 'Website URL to scrape for emails and social profiles.' },
      includeSocial: { type: 'boolean', description: 'Include social profiles (default true).' },
      includeCompany: { type: 'boolean', description: 'Include company info (default true).' },
      includeBreach: { type: 'boolean', description: 'Check breach databases (default true).' },
      deepScan: { type: 'boolean', description: 'Deep OSINT scan (default false).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'security',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  notes: 'Combines multiple APIs for comprehensive email intelligence. Now includes LeadFinder-derived website scraping for email discovery and social profile extraction (no API key required for website scraping).',
  apiSources: {
    hunter_io: { name: 'Hunter.io', description: 'Email finder, verifier, enrichment', url: 'https://api.hunter.io/v2', docs: 'https://hunter.io/api-documentation', authTier: 'api_key', rateLimit: 'Free: 25/month', uses: ['enrich', 'verify', 'domain'] },
    clearbit: { name: 'Clearbit', description: 'Person and company enrichment', url: 'https://person.clearbit.com/v2', docs: 'https://clearbit.com/docs', authTier: 'api_key', rateLimit: 'Free tier available', uses: ['enrich'] },
    abstractapi: { name: 'AbstractAPI', description: 'Email validation', url: 'https://api.abstractapi.com/v1', docs: 'https://www.abstractapi.com/', authTier: 'api_key', rateLimit: 'Free tier available', uses: ['verify'] },
    haveibeenpwned: { name: 'HaveIBeenPwned', description: 'Breach database', url: 'https://haveibeenpwned.com/api/v3', docs: 'https://haveibeenpwned.com/API/v3', authTier: 'api_key', rateLimit: 'Requires key', uses: ['breach'] },
    emailrep: { name: 'EmailRep.io', description: 'Email reputation and OSINT', url: 'https://emailrep.io', docs: 'https://emailrep.io/docs', authTier: 'keyless', rateLimit: 'Generous free tier', uses: ['osint', 'reputation'] },
    gravatar: { name: 'Gravatar', description: 'Avatar and profile lookup', url: 'https://www.gravatar.com', docs: 'https://en.gravatar.com/site/implement/', authTier: 'keyless', rateLimit: 'No strict limit', uses: ['osint', 'avatar'] },
    website_scraping: { name: 'Website Scraping (LeadFinder)', description: 'Scrape business websites for email addresses and social profiles (Instagram, Facebook). No API key required.', url: '', docs: 'https://github.com/Mikirucci/LeadFinder', authTier: 'keyless', rateLimit: 'Respectful scraping', uses: ['extract_website', 'domain_search'] },
  },
};