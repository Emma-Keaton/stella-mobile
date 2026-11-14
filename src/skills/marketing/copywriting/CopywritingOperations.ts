import { SkillResult, SkillContext } from '../../../core/types';
import { webSearchSkill } from '../../research/WebSearchSkillEntry';

const FRAMEWORKS: Record<string, (p: any) => { headline: string; body: string; cta: string }> = {
  AIDA: (p) => ({
    headline: `Discover ${p.product} — Built for ${p.audience}`,
    body: `Attention: ${p.audience} are struggling with ${p.offer || 'inefficiency'}. Interest: ${p.product} changes that. Desire: Get results in days, not weeks. Action: Start today.`,
    cta: 'Get started now',
  }),
  PAS: (p) => ({
    headline: `Stop struggling with ${p.offer || 'the problem'}`,
    body: `Problem: ${p.audience} face ${p.offer || 'daily challenges'}. Agitate: This costs you time and money every day. Solution: ${p.product} solves it.`,
    cta: 'Learn more',
  }),
  BAB: (p) => ({
    headline: `Transform ${p.audience} results with ${p.product}`,
    body: `Before: Struggling with ${p.offer || 'manual processes'}. After: Streamlined with ${p.product}. Bridge: See how ${p.product} gets you there.`,
    cta: 'See the difference',
  }),
  FFF: (p) => ({
    headline: `${p.product}: Fast, Simple, Effective`,
    body: `Feature: ${p.product} does the work. Advantage: Built specifically for ${p.audience}. Benefit: More time, less stress, better results.`,
    cta: 'Try it free',
  }),
};

export async function writeAdCopyOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { product, audience, offer, tone = 'professional', framework = 'AIDA' } = params;
  if (!product || !audience) {
    return { title: 'Copywriting', summary: 'Product and audience are required', spokenNarrative: 'Please provide product and audience', operation: 'ad', ok: false };
  }
  const copy = FRAMEWORKS[framework]({ product, audience, offer, tone });
  return {
    title: 'Ad Copy',
    summary: `${framework} framework ad copy for ${product}`,
    spokenNarrative: `Wrote ${framework} ad copy for ${product}`,
    operation: 'ad',
    ok: true,
    record: { framework, headline: copy.headline, body: copy.body, cta: copy.cta, tone, product, audience, offer },
  };
}

export async function writeEmailCopyOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { product, audience, offer, tone = 'professional' } = params;
  if (!product || !audience) {
    return { title: 'Copywriting', summary: 'Product and audience are required', spokenNarrative: 'Please provide product and audience', operation: 'email', ok: false };
  }
  const subject = `${product} for ${audience} — ${offer || 'New Offer'}`;
  const body = `Hi,\n\nI wanted to introduce ${product}, built specifically for ${audience}. ${offer || ''}\n\nWould you be open to learning more?\n\nBest regards,\nStella`;
  return {
    title: 'Email Copy',
    summary: `Outreach email for ${product} targeting ${audience}`,
    spokenNarrative: `Wrote email copy for ${product}`,
    operation: 'email',
    ok: true,
    record: { subject, body, tone, product, audience, offer },
  };
}

export async function writeLandingCopyOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { product, audience, offer, tone = 'professional' } = params;
  if (!product || !audience) {
    return { title: 'Copywriting', summary: 'Product and audience are required', spokenNarrative: 'Please provide product and audience', operation: 'landing', ok: false };
  }
  const headline = `${product} — The smarter way for ${audience}`;
  const subhead = `${offer || 'Get better results faster'} with ${product}.`;
  const body = `Built for ${audience} who need ${offer || 'better outcomes'}. ${product} delivers results without the complexity.\n\nJoin thousands of ${audience} already using ${product}.`;
  return {
    title: 'Landing Page Copy',
    summary: `Landing page copy for ${product}`,
    spokenNarrative: `Wrote landing page copy for ${product}`,
    operation: 'landing',
    ok: true,
    record: { headline, subhead, body, tone, product, audience, offer },
  };
}

export async function writeSocialCopyOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { product, audience, offer, tone = 'casual' } = params;
  if (!product || !audience) {
    return { title: 'Copywriting', summary: 'Product and audience are required', spokenNarrative: 'Please provide product and audience', operation: 'social', ok: false };
  }
  const post = `${product} is changing the game for ${audience}. ${offer || ''} 🚀\n\n#${product.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')}`;
  return {
    title: 'Social Media Copy',
    summary: `Social media post for ${product}`,
    spokenNarrative: `Wrote social media copy for ${product}`,
    operation: 'social',
    ok: true,
    record: { post, tone, product, audience, offer },
  };
}

export function getSourcesOperation(): SkillResult {
  return {
    title: 'Copywriting Sources',
    summary: 'Copywriting uses proven frameworks: AIDA, PAS, BAB, FFF',
    spokenNarrative: 'Copywriting uses proven marketing frameworks',
    operation: 'sources',
    ok: true,
    record: { frameworks: Object.keys(FRAMEWORKS), channels: ['ad', 'email', 'landing', 'social'], tones: ['professional', 'casual', 'urgent', 'friendly', 'luxury'] },
  };
}