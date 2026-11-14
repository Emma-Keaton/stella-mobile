/**
 * Stella Mobile — Lead Finder Skill
 * Ported from LeadFinder (Mikirucci/LeadFinder) - Local lead generation for freelancers and agencies.
 * Scrapes Google Maps for local businesses, identifies those without websites,
 * and enriches leads with email + social profiles from their websites.
 * No API key required — uses web scraping and mobile device capabilities.
 */

import { SkillMetadata } from '../core/types';

export const leadFinderMetadata: SkillMetadata = {
  name: 'lead_finder',
  aliases: ['lead_finder', 'find_leads', 'lead_scraper', 'business_leads', 'local_leads', 'google_maps_leads', 'scout_leads'],
  description: 'Scan and scout for local business leads from Google Maps. Finds businesses by category and city, identifies those without websites (prime outreach targets), and enriches with email addresses and social media profiles. No API key required.',
  triggers: [
    'find leads', 'lead finder', 'scout leads', 'business leads', 'local leads',
    'google maps leads', 'scrape leads', 'find businesses', 'lead scan',
    'business scout', 'no website businesses', 'cold outreach leads',
  ],
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'One of: scan | enrich | export | sources. Defaults to scan.',
        enum: ['scan', 'enrich', 'export', 'sources'],
        default: 'scan',
      },
      cities: {
        type: 'array',
        items: { type: 'string' },
        description: 'Cities to search (e.g., ["London", "Manchester", "Rome"]).',
      },
      categories: {
        type: 'array',
        items: { type: 'string' },
        description: 'Business categories (e.g., ["restaurant", "gym", "dentist", "plumber"]).',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of leads to return (default 25, max 500).',
        default: 25,
      },
      noWebsiteOnly: {
        type: 'boolean',
        description: 'Filter to only businesses without a website (prime outreach targets). Default true.',
        default: true,
      },
      withPhoneOnly: {
        type: 'boolean',
        description: 'Filter to only businesses with a phone number. Default false.',
        default: false,
      },
      enrichEmails: {
        type: 'boolean',
        description: 'Enrich leads with email addresses from their websites. Default true.',
        default: true,
      },
      exportFormat: {
        type: 'string',
        description: 'Export format: csv | json. Default csv.',
        enum: ['csv', 'json'],
        default: 'csv',
      },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'research',
  source: 'leadfinder',
  active: true,
  author: 'Stella',
  surface: 'mobile',
  requires: ['contacts', 'storage', 'internet'],
  notes: 'Based on LeadFinder (Mikirucci/LeadFinder). Scrapes Google Maps publicly visible business data. Respects robots.txt and rate limits.',
  apiSources: {
    googleMaps: {
      name: 'Google Maps',
      description: 'Public business listings scraped from Google Maps (no API key)',
      url: 'https://www.google.com/maps',
      docs: 'https://support.google.com/maps',
      authTier: 'keyless',
      rateLimit: 'Respectful scraping - 1 request per 2-3 seconds',
      uses: ['scan'],
    },
    duckduckgo: {
      name: 'DuckDuckGo HTML',
      description: 'Free web search for business website discovery and email enrichment',
      url: 'https://html.duckduckgo.com/html/',
      docs: 'https://duckduckgo.com/',
      authTier: 'keyless',
      rateLimit: 'Respectful scraping',
      uses: ['enrich'],
    },
  },
};