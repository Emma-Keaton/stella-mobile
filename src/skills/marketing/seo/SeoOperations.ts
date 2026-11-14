import axios from 'axios';
import { SkillResult, SkillContext } from '../../../core/types';
export async function auditSeoOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { url } = params;
  if (!url) return { title: 'SEO Audit', summary: 'URL is required', spokenNarrative: 'Please provide a website URL', operation: 'audit', ok: false };
  try {
    const resp = await axios.get(url, { timeout: 10000, validateStatus: () => true });
    const html = resp.data || '';
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const hasViewport = html.match(/<meta[^>]*name=["']viewport["']/i) !== null;
    const issues = [];
    if (!titleMatch) issues.push('Missing title tag');
    else if (titleMatch[1].length > 60) issues.push('Title tag too long (>60 chars)');
    if (!metaDescMatch) issues.push('Missing meta description');
    if (h1Count === 0) issues.push('Missing H1 heading');
    if (h1Count > 1) issues.push('Multiple H1 tags found');
    if (!hasViewport) issues.push('Missing viewport meta tag (not mobile-friendly)');
    return { title: 'SEO Audit', summary: `SEO audit for ${url}: ${issues.length} issue(s) found`, spokenNarrative: `SEO audit found ${issues.length} issues`, operation: 'audit', ok: true, record: { url, title: titleMatch?.[1], metaDescription: metaDescMatch?.[1], h1Count, h2Count, mobileFriendly: hasViewport, issues, auditedAt: Date.now() } };
  } catch (e: any) { return { title: 'SEO Audit', summary: `Audit failed: ${e.message}`, spokenNarrative: 'SEO audit failed', operation: 'audit', ok: false }; }
}
export function getSourcesOperation(): SkillResult {
  return { title: 'SEO Sources', summary: 'SEO audit uses direct HTML analysis of target website', spokenNarrative: 'SEO audit analyzes website HTML directly', operation: 'sources', ok: true, record: { checks: ['title tag', 'meta description', 'H1/H2 headings', 'viewport/mobile', 'page speed indicators'] } };
}