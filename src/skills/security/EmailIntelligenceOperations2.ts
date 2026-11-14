/**
 * Stella Mobile — Email Intelligence Operations Part 2
 * Verification, breach checking, OSINT
 */

import { SkillResult, SkillContext } from '../core/types';
import { apiClients } from '../../api/ApiClient';

export async function verifyEmail(params: any, context: SkillContext): Promise<any> {
  const { email } = params;
  
  if (!email || !email.includes('@')) {
    return { title: 'Email Verifier', summary: 'Valid email address is required', spokenNarrative: 'Please provide a valid email address', operation: 'verify', ok: false };
  }

  const results: any = { email, checks: {} };
  let verified = false;

  // AbstractAPI
  const abstractKey = context.settings?.abstractApiKey;
  if (abstractKey) {
    try {
      const client = apiClients.abstractapi;
      const response = await client.get('/email-validation', { email, api_key: abstractKey });
      if (response) {
        results.checks.abstract = {
          valid: response.deliverability === 'DELIVERABLE',
          quality: response.quality_score,
          disposable: response.is_disposable,
          free: response.is_free,
          role: response.is_role,
          catchAll: response.is_catchall,
          mxFound: response.mx_found,
          smtpCheck: response.smtp_check,
        };
        verified = true;
      }
    } catch (e) {}
  }

  // Hunter.io verification
  const hunterKey = context.settings?.hunterIoApiKey;
  if (hunterKey) {
    try {
      const client = apiClients.hunter_io;
      const response = await client.get('/email-verifier', { email, api_key: hunterKey });
      if (response.data) {
        results.checks.hunter = {
          status: response.data.status,
          score: response.data.score,
          disposable: response.data.disposable,
          webmail: response.data.webmail,
          mxRecords: response.data.mx_records,
          smtpCheck: response.data.smtp_check,
        };
        verified = true;
      }
    } catch (e) {}
  }

  if (!verified) {
    return { 
      title: 'Email Verifier', 
      summary: `No verification data for ${email}.\n\nAdd API keys:\n- AbstractAPI (abstractapi.com/email-verification)\n- Hunter.io (hunter.io)`, 
      spokenNarrative: 'No verification data available', 
      operation: 'verify', 
      ok: false 
    };
  }

  const isValid = Object.values(results.checks).some((check: any) => check.valid || check.status === 'valid');
  
  return { 
    title: 'Email Verified', 
    summary: `${email} is ${isValid ? '✅ VALID' : '❌ INVALID'}\n${Object.entries(results.checks).map(([source, check]: any) => 
      `${source}: ${check.valid || check.status === 'valid' ? '✅' : '❌'} (${check.status || check.quality || 'N/A'})`
    ).join('\n')}`, 
    spokenNarrative: `${email} is ${isValid ? 'valid' : 'invalid'}`, 
    operation: 'verify', 
    ok: true, 
    record: results 
  };
}

export async function checkBreach(params: any, context: SkillContext): Promise<any> {
  const { email } = params;
  
  if (!email || !email.includes('@')) {
    return { title: 'Breach Check', summary: 'Valid email address is required', spokenNarrative: 'Please provide a valid email address', operation: 'breach', ok: false };
  }

  const results: any = { email, breaches: [], pastes: [] };
  let checked = false;

  // HaveIBeenPwned
  const hibpKey = context.settings?.hibpApiKey;
  if (hibpKey) {
    try {
      const crypto = await import('expo-crypto');
      const hash = await crypto.digestStringAsync(
        crypto.CryptoDigestAlgorithm.SHA1,
        email.trim().toLowerCase(),
        { encoding: crypto.CryptoEncoding.HEX }
      );
      
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);
      
      const client = apiClients.haveibeenpwned;
      const response = await client.get(`/range/${prefix}`, { api_key: hibpKey });
      
      if (response) {
        const lines = response.split('\n');
        for (const line of lines) {
          const [suffixHash, count] = line.split(':');
          if (suffixHash.toLowerCase() === suffix.toLowerCase()) {
            results.breaches.push({ source: 'HaveIBeenPwned', count: parseInt(count) });
            checked = true;
          }
        }
      }
      
      // Check pastes
      const pasteResponse = await client.get(`/pasteaccount/${email}`, { api_key: hibpKey });
      if (pasteResponse && pasteResponse.length > 0) {
        results.pastes = pasteResponse.map((p: any) => ({
          source: p.Source,
          title: p.Title,
          date: p.Date,
          emailCount: p.EmailCount,
        }));
      }
      checked = true;
    } catch (e) {}
  }

  if (!checked) {
    return { 
      title: 'Breach Check', 
      summary: `Breach check requires HaveIBeenPwned API key.\n\nAdd key in Settings:\n- HaveIBeenPwned (haveibeenpwned.com/API/Key)`, 
      spokenNarrative: 'Breach check requires API key', 
      operation: 'breach', 
      ok: false 
    };
  }

  const totalBreaches = results.breaches.reduce((sum: number, b: any) => sum + (b.count || 0), 0);
  
  return { 
    title: 'Breach Check', 
    summary: totalBreaches > 0 
      ? `⚠️ ${email} found in ${results.breaches.length} breach(es), ${totalBreaches} total accounts!\n${results.breaches.map((b: any) => `${b.source}: ${b.count} accounts`).join('\n')}` 
      : `✅ ${email} not found in known breaches.`,
    spokenNarrative: totalBreaches > 0 ? `Email found in ${results.breaches.length} breaches` : 'No breaches found',
    operation: 'breach', 
    ok: true, 
    record: results 
  };
}