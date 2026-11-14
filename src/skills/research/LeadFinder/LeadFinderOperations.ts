/**
 * Stella Mobile — Lead Finder Operations
 * Core logic for scanning local business leads, enriching with email/social,
 * and exporting results. Ported from LeadFinder (Mikirucci/LeadFinder).
 */

import axios from 'axios';
import { RNFS } from 'react-native-fs';
import { SkillResult, SkillContext } from '../../core/types';

export interface Lead {
  id: string;
  name: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  hasWebsite: boolean;
  hasPhone: boolean;
  source: string;
  scrapedAt: number;
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const SKIP_EMAIL_PATTERNS = [
  'noreply', 'no-reply', 'example', '@w3.org', '@schema.org',
  '@sentry', '@google', '@facebook', 'wordpress', '@jquery',
];

const SKIP_SOCIAL_USERNAMES = {
  'sharer', 'share', 'intent', 'dialog', 'plugins', 'pages',
  'groups', 'events', 'watch', 'hashtag', 'explore', 'reel',
  'p', 'tv', 'stories',
};

async function fetchHtml(url: string, timeout = 10000): Promise<string> {
  try {
    const resp = await axios.get(url, {
      headers: HEADERS,
      timeout,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    return resp.data || '';
  } catch (e) {
    return '';
  }
}

function extractEmail(html: string): string {
  const emails = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  for (const email of emails) {
    const lower = email.toLowerCase();
    if (!SKIP_EMAIL_PATTERNS.some(p => lower.includes(p))) {
      return email;
    }
  }
  return '';
}

function extractInstagram(html: string): string {
  const match = html.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})(?:[/?"]|$)/);
  if (match) {
    const username = match[1];
    if (!SKIP_SOCIAL_USERNAMES.has(username.toLowerCase())) {
      return username;
    }
  }
  return '';
}

function extractFacebook(html: string): string {
  const match = html.match(/facebook\.com\/([a-zA-Z0-9_.]{1,60})(?:[/?"]|$)/);
  if (match) {
    const slug = match[1];
    if (!SKIP_SOCIAL_USERNAMES.has(slug.toLowerCase())) {
      return slug;
    }
  }
  return '';
}

async function enrichLead(lead: Lead): Promise<Lead> {
  const website = lead.website;
  if (!website) return lead;

  const html = await fetchHtml(website);
  if (!html) return lead;

  if (!lead.email) {
    lead.email = extractEmail(html);
  }
  if (!lead.instagram) {
    lead.instagram = extractInstagram(html);
  }
  if (!lead.facebook) {
    lead.facebook = extractFacebook(html);
  }

  return lead;
}

function generateLeadId(): string {
  return `lead-${Math.random().toString(36).substring(2, 10)}`;
}

async function scanLeads(params: any): Promise<Lead[]> {
  const { cities = [], categories = [], limit = 25, noWebsiteOnly = true, withPhoneOnly = false, enrichEmails = true } = params;

  if (!cities || cities.length === 0) {
    throw new Error('At least one city is required');
  }
  if (!categories || categories.length === 0) {
    throw new Error('At least one category is required');
  }

  const leads: Lead[] = [];
  const maxPerCombo = Math.max(1, Math.floor(limit / (cities.length * categories.length)));

  for (const city of cities) {
    for (const category of categories) {
      if (leads.length >= limit) break;

      try {
        const comboLeads = await searchGoogleMapsViaDuckDuckGo(category, city, maxPerCombo);
        for (const lead of comboLeads) {
          if (leads.length >= limit) break;

          if (noWebsiteOnly && lead.hasWebsite) continue;
          if (withPhoneOnly && !lead.hasPhone) continue;

          if (enrichEmails && lead.website) {
            try {
              await enrichLead(lead);
            } catch (e) {
              // Enrichment failure is non-fatal
            }
          }

          leads.push(lead);
        }
      } catch (e) {
        console.error(`[LeadFinder] Error scanning ${category} in ${city}:`, e);
      }
    }
  }

  return leads.slice(0, limit);
}

async function searchGoogleMapsViaDuckDuckGo(
  category: string,
  city: string,
  limit: number
): Promise<Lead[]> {
  const query = `"${category}" "${city}" site:google.com/maps OR "google.com/maps" phone address`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}&kl=us-en`;

  const html = await fetchHtml(url);
  if (!html) return [];

  const resultBlocks = html.match(/<div class="result results_links.*?<\/div>\s*<\/div>/gs) || [];
  const leads: Lead[] = [];

  for (const block of resultBlocks.slice(0, limit)) {
    try {
      const titleMatch = block.match(/<a rel="nofollow" class="result__a"[^>]*>(.*?)<\/a>/s);
      const urlMatch = block.match(/<a rel="nofollow" class="result__a"[^>]*href="([^"]+)"/);
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>(.*?)<\/a>/s);

      if (!titleMatch || !urlMatch) continue;

      let name = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      let websiteUrl = urlMatch[1];
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

      if (websiteUrl.startsWith('//duckduckgo.com/l/?')) {
        const uddgMatch = websiteUrl.match(/uddg=([^&]+)/);
        if (uddgMatch) {
          websiteUrl = decodeURIComponent(uddgMatch[1]);
        }
      }

      const phoneMatch = snippet.match(/(\+?\d[\d\s\-\(\)]{7,}\d)/);
      const phone = phoneMatch ? phoneMatch[1].trim() : '';

      const isMapsListing = websiteUrl.includes('google.com/maps') || websiteUrl.includes('maps.google.com');

      leads.push({
        id: generateLeadId(),
        name: name || 'Unknown Business',
        category,
        city,
        address: '',
        phone,
        website: isMapsListing ? '' : websiteUrl,
        email: '',
        instagram: '',
        facebook: '',
        hasWebsite: !isMapsListing && websiteUrl.length > 0,
        hasPhone: phone.length > 0,
        source: 'google_maps_duckduckgo',
        scrapedAt: Date.now(),
      });
    } catch (e) {
      // Skip malformed results
    }
  }

  return leads;
}

function leadsToCsv(leads: Lead[]): string {
  const headers = ['id', 'name', 'category', 'city', 'address', 'phone', 'website', 'email', 'instagram', 'facebook', 'has_website', 'has_phone', 'source', 'scraped_at'];
  const rows = leads.map(l => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    l.category,
    l.city,
    `"${(l.address || '').replace(/"/g, '""')}"`,
    l.phone || '',
    l.website || '',
    l.email || '',
    l.instagram || '',
    l.facebook || '',
    l.hasWebsite ? 'yes' : 'no',
    l.hasPhone ? 'yes' : 'no',
    l.source,
    l.scrapedAt,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function leadsToJson(leads: Lead[]): string {
  return JSON.stringify(leads, null, 2);
}

async function saveLeadsToFile(leads: Lead[], format: 'csv' | 'json'): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `stella_leads_${timestamp}.${format}`;
  const content = format === 'csv' ? leadsToCsv(leads) : leadsToJson(leads);
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;

  try {
    await RNFS.writeFile(path, content, 'utf8');
    return path;
  } catch (e) {
    throw new Error(`Failed to save leads file: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export async function scanLeadsOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const leads = await scanLeads(params);

    const noWebsiteCount = leads.filter(l => !l.hasWebsite).length;
    const withEmailCount = leads.filter(l => l.email).length;
    const withSocialCount = leads.filter(l => l.instagram || l.facebook).length;

    const summary = `Found ${leads.length} leads${params.noWebsiteOnly ? ' without websites' : ''}. ${noWebsiteCount} no-website targets, ${withEmailCount} with emails, ${withSocialCount} with social profiles.`;

    return {
      title: 'Lead Finder — Scan Results',
      summary,
      spokenNarrative: `Found ${leads.length} business leads. ${noWebsiteCount} have no website, ${withEmailCount} have email addresses found.`,
      operation: 'scan',
      ok: true,
      record: {
        leads,
        count: leads.length,
        noWebsiteCount,
        withEmailCount,
        withSocialCount,
        cities: params.cities,
        categories: params.categories,
      },
    };
  } catch (error: any) {
    return {
      title: 'Lead Finder',
      summary: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'Lead scan failed',
      operation: 'scan',
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function enrichLeadsOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const { leads = [], enrichEmails = true } = params;

    if (!Array.isArray(leads) || leads.length === 0) {
      return {
        title: 'Lead Enricher',
        summary: 'No leads provided to enrich',
        spokenNarrative: 'No leads to enrich',
        operation: 'enrich',
        ok: false,
      };
    }

    const enriched: Lead[] = [];
    for (const lead of leads) {
      try {
        if (enrichEmails && lead.website) {
          await enrichLead(lead as Lead);
        }
        enriched.push(lead as Lead);
      } catch (e) {
        enriched.push(lead as Lead);
      }
    }

    const withEmail = enriched.filter(l => l.email).length;
    const withSocial = enriched.filter(l => l.instagram || l.facebook).length;

    return {
      title: 'Lead Enricher',
      summary: `Enriched ${enriched.length} leads: ${withEmail} with emails, ${withSocial} with social profiles`,
      spokenNarrative: `Enriched ${enriched.length} leads. ${withEmail} now have email addresses.`,
      operation: 'enrich',
      ok: true,
      record: { leads: enriched, count: enriched.length, withEmail, withSocial },
    };
  } catch (error: any) {
    return {
      title: 'Lead Enricher',
      summary: `Enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'Lead enrichment failed',
      operation: 'enrich',
      ok: false,
    };
  }
}

export async function exportLeadsOperation(params: any, context: SkillContext): Promise<SkillResult> {
  try {
    const { leads = [], exportFormat = 'csv' } = params;

    if (!Array.isArray(leads) || leads.length === 0) {
      return {
        title: 'Lead Exporter',
        summary: 'No leads to export',
        spokenNarrative: 'No leads to export',
        operation: 'export',
        ok: false,
      };
    }

    const filePath = await saveLeadsToFile(leads as Lead[], exportFormat);

    return {
      title: 'Lead Exporter',
      summary: `Exported ${leads.length} leads to ${exportFormat.toUpperCase()}: ${filePath}`,
      spokenNarrative: `Exported ${leads.length} leads to ${exportFormat.toUpperCase()}`,
      operation: 'export',
      ok: true,
      record: { filePath, count: leads.length, format: exportFormat },
    };
  } catch (error: any) {
    return {
      title: 'Lead Exporter',
      summary: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'Export failed',
      operation: 'export',
      ok: false,
    };
  }
}

export function getSourcesOperation(): SkillResult {
  return {
    title: 'Lead Finder Sources',
    summary: 'Lead Finder uses Google Maps public listings (via DuckDuckGo HTML, no API key) and website scraping for email + social enrichment.',
    spokenNarrative: 'Lead Finder uses Google Maps and website scraping to find business leads',
    operation: 'sources',
    ok: true,
    record: {
      sources: ['Google Maps (public listings)', 'DuckDuckGo HTML search', 'Website email/social scraping'],
      operations: ['scan', 'enrich', 'export', 'sources'],
      note: 'No API key required. Scrapes publicly visible business data only.',
    },
  };
}