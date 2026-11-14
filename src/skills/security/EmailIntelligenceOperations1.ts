/**
 * Stella Mobile — Email Intelligence Operations Part 1
 * Enrichment
 */

import { SkillResult, SkillContext } from '../core/types';
import { apiClients } from '../../api/ApiClient';

export async function enrichEmail(params: any, context: SkillContext): Promise<any> {
  const { email, includeSocial = true, includeCompany = true } = params;
  
  if (!email || !email.includes('@')) {
    return { title: 'Email Intelligence', summary: 'Valid email address is required', spokenNarrative: 'Please provide a valid email address', operation: 'enrich', ok: false };
  }

  const results: any = { email };
  let enriched = false;

  // Hunter.io enrichment
  const hunterKey = context.settings?.hunterIoApiKey;
  if (hunterKey) {
    try {
      const client = apiClients.hunter_io;
      const response = await client.get('/email-finder', {
        domain: email.split('@')[1],
        first_name: email.split('@')[0].split('.')[0],
        last_name: email.split('@')[0].split('.')[1] || '',
        api_key: hunterKey,
      });
      
      if (response.data) {
        results.hunter = {
          email: response.data.email,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          position: response.data.position,
          department: response.data.department,
          linkedin: response.data.linkedin,
          twitter: response.data.twitter,
          phoneNumber: response.data.phone_number,
          confidence: response.data.confidence,
        };
        enriched = true;
      }
    } catch (e) {}
  }

  // Clearbit enrichment
  const clearbitKey = context.settings?.clearbitApiKey;
  if (clearbitKey && includeCompany) {
    try {
      const client = apiClients.clearbit;
      const response = await client.get('/combined/find', {
        email,
        api_key: clearbitKey,
      });
      
      if (response.person || response.company) {
        results.clearbit = {
          person: response.person ? {
            name: response.person.name?.fullName,
            bio: response.person.bio,
            location: response.person.location,
            linkedin: response.person.linkedin?.handle,
            twitter: response.person.twitter?.handle,
            github: response.person.github?.handle,
            avatar: response.person.avatar,
          } : null,
          company: response.company ? {
            name: response.company.name,
            domain: response.company.domain,
            description: response.company.description,
            employees: response.company.metrics?.employees,
            funding: response.company.funding?.totalRaised,
            category: response.company.category?.industry,
          } : null,
        };
        enriched = true;
      }
    } catch (e) {}
  }

  // EmailRep.io OSINT
  try {
    const response = await apiClients.emailrep.get(`/${email}`);
    if (response) {
      results.emailrep = {
        reputation: response.reputation,
        suspicious: response.suspicious,
        references: response.references,
        details: response.details,
        sources: response.sources,
      };
      enriched = true;
    }
  } catch (e) {}

  // Gravatar
  try {
    const crypto = await import('expo-crypto');
    const hash = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.MD5,
      email.trim().toLowerCase(),
      { encoding: crypto.CryptoEncoding.HEX }
    );
    results.gravatar = {
      avatarUrl: `https://www.gravatar.com/avatar/${hash}?d=404`,
      profileUrl: `https://www.gravatar.com/${hash}`,
    };
    enriched = true;
  } catch (e) {}

  if (!enriched) {
    return { 
      title: 'Email Intelligence', 
      summary: `No enrichment data found for ${email}.\n\nAdd API keys in Settings:\n- Hunter.io (hunter.io)\n- Clearbit (clearbit.com)\n- EmailRep.io (free, no key needed)`, 
      spokenNarrative: 'No enrichment data found', 
      operation: 'enrich', 
      ok: false 
    };
  }

  return { 
    title: 'Email Enriched', 
    summary: `Enriched data for ${email}`, 
    spokenNarrative: `Enriched email data for ${email}`, 
    operation: 'enrich', 
    ok: true, 
    record: results 
  };
}

/**
 * LeadFinder-derived website scraping for email discovery
 * Scrapes business websites for email addresses and social profiles (Instagram, Facebook)
 * No API key required
 */

const EI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const EI_SKIP_EMAILS = [
  'noreply', 'no-reply', 'example', '@w3.org', '@schema.org',
  '@sentry', '@google', '@facebook', 'wordpress', '@jquery',
];

const EI_SKIP_SOCIAL = {
  'sharer', 'share', 'intent', 'dialog', 'plugins', 'pages',
  'groups', 'events', 'watch', 'hashtag', 'explore', 'reel',
  'p', 'tv', 'stories',
};

async function eiFetchHtml(url: string, timeout = 10000): Promise<string> {
  try {
    const axios = (await import('axios')).default;
    const resp = await axios.get(url, {
      headers: EI_HEADERS,
      timeout,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    return resp.data || '';
  } catch (e) {
    return '';
  }
}

function eiExtractEmail(html: string): string {
  const emails = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  for (const email of emails) {
    const lower = email.toLowerCase();
    if (!EI_SKIP_EMAILS.some(p => lower.includes(p))) {
      return email;
    }
  }
  return '';
}

function eiExtractInstagram(html: string): string {
  const match = html.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})(?:[/?"]|$)/);
  if (match) {
    const username = match[1];
    if (!EI_SKIP_SOCIAL.has(username.toLowerCase())) {
      return username;
    }
  }
  return '';
}

function eiExtractFacebook(html: string): string {
  const match = html.match(/facebook\.com\/([a-zA-Z0-9_.]{1,60})(?:[/?"]|$)/);
  if (match) {
    const slug = match[1];
    if (!EI_SKIP_SOCIAL.has(slug.toLowerCase())) {
      return slug;
    }
  }
  return '';
}

export async function extractWebsiteEmails(params: any, context: SkillContext): Promise<any> {
  const { website } = params;

  if (!website) {
    return {
      title: 'Email Intelligence',
      summary: 'Website URL is required',
      spokenNarrative: 'Please provide a website URL',
      operation: 'extract_website',
      ok: false,
    };
  }

  const normalizedUrl = website.startsWith('http') ? website : `https://${website}`;
  const html = await eiFetchHtml(normalizedUrl);

  if (!html) {
    return {
      title: 'Email Intelligence',
      summary: `Could not fetch ${normalizedUrl}`,
      spokenNarrative: 'Could not fetch the website',
      operation: 'extract_website',
      ok: false,
    };
  }

  const email = eiExtractEmail(html);
  const instagram = eiExtractInstagram(html);
  const facebook = eiExtractFacebook(html);

  const found = [];
  if (email) found.push(`email: ${email}`);
  if (instagram) found.push(`Instagram: ${instagram}`);
  if (facebook) found.push(`Facebook: ${facebook}`);

  return {
    title: 'Website Email Extraction',
    summary: found.length > 0
      ? `Found on ${normalizedUrl}: ${found.join(', ')}`
      : `No emails or social profiles found on ${normalizedUrl}`,
    spokenNarrative: found.length > 0
      ? `Found ${found.length} contact items on ${normalizedUrl}`
      : `No contact information found`,
    operation: 'extract_website',
    ok: found.length > 0,
    record: {
      website: normalizedUrl,
      email,
      instagram,
      facebook,
      emails: email ? [email] : [],
      socialProfiles: { instagram, facebook },
      scrapedAt: Date.now(),
    },
  };
}

export async function domainEmailSearch(params: any, context: SkillContext): Promise<any> {
  const { domain } = params;

  if (!domain) {
    return {
      title: 'Email Intelligence',
      summary: 'Domain is required',
      spokenNarrative: 'Please provide a domain to search',
      operation: 'domain_search',
      ok: false,
    };
  }

  const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const query = `"@${normalizedDomain}" email contact`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}&kl=us-en`;

  const html = await eiFetchHtml(url);
  if (!html) {
    return {
      title: 'Email Intelligence',
      summary: `Could not search for emails on ${normalizedDomain}`,
      spokenNarrative: 'Search failed',
      operation: 'domain_search',
      ok: false,
    };
  }

  const emails: string[] = [];
  const emailMatches = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  for (const email of emailMatches) {
    const lower = email.toLowerCase();
    if (
      lower.includes(`@${normalizedDomain}`) ||
      lower.includes(normalizedDomain.replace('.', '\\.'))
    ) {
      if (!EI_SKIP_EMAILS.some(p => lower.includes(p))) {
        emails.push(email);
      }
    }
  }

  const contactPages = [
    `https://${normalizedDomain}/contact`,
    `https://${normalizedDomain}/contact-us`,
    `https://${normalizedDomain}/about`,
    `https://${normalizedDomain}/about-us`,
  ];

  const discoveredEmails: string[] = [...emails];
  for (const page of contactPages) {
    try {
      const pageHtml = await eiFetchHtml(page, 8000);
      const pageEmail = eiExtractEmail(pageHtml);
      if (pageEmail && !discoveredEmails.includes(pageEmail)) {
        discoveredEmails.push(pageEmail);
      }
    } catch {
      // Skip failed pages
    }
  }

  return {
    title: 'Domain Email Search',
    summary: discoveredEmails.length > 0
      ? `Found ${discoveredEmails.length} email address(es) for ${normalizedDomain}`
      : `No email addresses found for ${normalizedDomain}`,
    spokenNarrative: discoveredEmails.length > 0
      ? `Found ${discoveredEmails.length} email addresses for ${normalizedDomain}`
      : `No email addresses found`,
    operation: 'domain_search',
    ok: discoveredEmails.length > 0,
    record: {
      domain: normalizedDomain,
      emails: discoveredEmails,
      count: discoveredEmails.length,
      source: 'duckduckgo_html',
      scrapedAt: Date.now(),
    },
  };
}