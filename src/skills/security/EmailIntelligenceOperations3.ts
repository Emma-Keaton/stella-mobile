/**
 * Stella Mobile — Email Intelligence Operations Part 3
 * OSINT, full scan, sources
 */

import { SkillResult, SkillContext } from '../core/types';
import { apiClients } from '../../api/ApiClient';

export async function osintScan(params: any, context: SkillContext): Promise<any> {
  const { email, deepScan = false } = params;
  
  if (!email || !email.includes('@')) {
    return { title: 'Email OSINT', summary: 'Valid email address is required', spokenNarrative: 'Please provide a valid email address', operation: 'osint', ok: false };
  }

  const results: any = { email, intelligence: {} };
  let found = false;

  // EmailRep.io - comprehensive reputation
  try {
    const response = await apiClients.emailrep.get(`/${email}`);
    if (response) {
      results.intelligence.emailrep = {
        reputation: response.reputation,
        suspicious: response.suspicious,
        references: response.references,
        firstSeen: response.first_seen,
        lastSeen: response.last_seen,
        blacklisted: response.blacklisted,
        credentialsLeaked: response.credentials_leaked,
        dataBreach: response.data_breach,
        details: response.details,
        sources: response.sources,
      };
      found = true;
    }
  } catch (e) {}

  // Social profile search via hunter.io
  const hunterKey = context.settings?.hunterIoApiKey;
  if (hunterKey) {
    try {
      const client = apiClients.hunter_io;
      const domain = email.split('@')[1];
      const response = await client.get('/domain-search', {
        domain,
        api_key: hunterKey,
        limit: 10,
      });
      
      if (response.data?.emails) {
        const userEmails = response.data.emails.filter((e: any) => 
          e.value.toLowerCase() === email.toLowerCase()
        );
        if (userEmails.length > 0) {
          results.intelligence.hunter = userEmails[0];
          found = true;
        }
      }
    } catch (e) {}
  }

  // Deep scan: try to find associated accounts
  if (deepScan) {
    // Check for GitHub account
    try {
      const username = email.split('@')[0];
      const ghResponse = await apiClients.github.get(`/users/${username}`);
      if (ghResponse) {
        results.intelligence.github = {
          login: ghResponse.login,
          name: ghResponse.name,
          bio: ghResponse.bio,
          location: ghResponse.location,
          blog: ghResponse.blog,
          twitter: ghResponse.twitter_username,
          publicRepos: ghResponse.public_repos,
          followers: ghResponse.followers,
          createdAt: ghResponse.created_at,
        };
        found = true;
      }
    } catch (e) {}
  }

  if (!found) {
    return { 
      title: 'Email OSINT', 
      summary: `Limited OSINT data for ${email}.\n\nFor deeper intelligence, add API keys:\n- EmailRep.io (free)\n- Hunter.io (hunter.io)\n- GitHub (github.com/settings/tokens)`, 
      spokenNarrative: 'Limited OSINT data available', 
      operation: 'osint', 
      ok: false 
    };
  }

  return { 
    title: 'Email OSINT Scan', 
    summary: `OSINT intelligence for ${email}`, 
    spokenNarrative: `OSINT scan complete for ${email}`, 
    operation: 'osint', 
    ok: true, 
    record: results 
  };
}

export async function fullScan(params: any, context: SkillContext): Promise<any> {
  const { email } = params;
  
  if (!email || !email.includes('@')) {
    return { title: 'Email Intelligence', summary: 'Valid email address is required', spokenNarrative: 'Please provide a valid email address', operation: 'full', ok: false };
  }

  // Run all operations in parallel
  const [enrich, verify, breach, osint] = await Promise.allSettled([
    enrichEmail({ email, ...params }, context),
    verifyEmail({ email }, context),
    checkBreach({ email }, context),
    osintScan({ email, deepScan: params.deepScan }, context),
  ]);

  const results = {
    email,
    enrichment: enrich.status === 'fulfilled' ? enrich.value.record : null,
    verification: verify.status === 'fulfilled' ? verify.value.record : null,
    breaches: breach.status === 'fulfilled' ? breach.value.record : null,
    osint: osint.status === 'fulfilled' ? osint.value.record : null,
  };

  const hasBreach = results.breaches?.breaches?.length > 0;
  const isValid = results.verification?.checks ? 
    Object.values(results.verification.checks).some((c: any) => c.valid || c.status === 'valid') : false;

  const summary = `
Email: ${email}
Verification: ${isValid ? '✅ VALID' : '❌ INVALID'}
Breaches: ${hasBreach ? '⚠️ FOUND' : '✅ CLEAN'}
Enrichment: ${results.enrichment ? '✅ COMPLETE' : '❌ NONE'}
OSINT: ${results.osint ? '✅ COMPLETE' : '❌ NONE'}
  `.trim();

  return { 
    title: 'Full Email Intelligence', 
    summary, 
    spokenNarrative: `Full intelligence scan for ${email}. ${isValid ? 'Valid' : 'Invalid'} email, ${hasBreach ? 'breaches found' : 'no breaches'}.`, 
    operation: 'full', 
    ok: true, 
    record: results 
  };
}

export function getSources(): any {
  return { 
    title: 'Email Intelligence Sources', 
    summary: 'Comprehensive email intelligence from: Hunter.io (enrichment/verification), Clearbit (company/person), AbstractAPI (validation), EmailRep.io (reputation/OSINT), HaveIBeenPwned (breaches), Gravatar (avatar), GitHub (profiles). Requires API keys for full functionality.', 
    spokenNarrative: 'Email intelligence uses multiple free and paid APIs', 
    operation: 'sources', 
    ok: true, 
    record: { 
      source: 'Hunter.io, Clearbit, AbstractAPI, EmailRep.io, HaveIBeenPwned, Gravatar, GitHub', 
      operations: ['enrich', 'verify', 'breach', 'osint', 'full', 'sources'],
      note: 'EmailRep.io is free/keyless. Others require API keys for full functionality.'
    } 
  };
}