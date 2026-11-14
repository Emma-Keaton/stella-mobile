/**
 * Stella Mobile — Outreach Skill
 * Automated cold outreach via email and social media using device control.
 * Works with all installed social media apps on the mobile device.
 * Supports template-based messaging, follow-up scheduling, and multi-channel outreach.
 */

import { SkillMetadata } from '../../core/types';

export const outreachMetadata: SkillMetadata = {
  name: 'outreach',
  aliases: ['outreach', 'cold_outreach', 'send_email', 'send_message', 'social_outreach', 'email_outreach', 'automated_outreach', 'device_outreach'],
  description: 'Automated cold outreach via email and social media. Sends personalized messages through the device email app, WhatsApp, Instagram, Facebook Messenger, and other installed social apps. Supports templates, follow-ups, and multi-channel campaigns.',
  triggers: [
    'outreach', 'cold outreach', 'send email', 'send message', 'social outreach',
    'email outreach', 'automated outreach', 'device outreach', 'outreach campaign',
    'send dm', 'direct message', 'cold email', 'mass message',
  ],
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'One of: email | sms | whatsapp | instagram | facebook | messenger | all | templates | schedule | sources. Defaults to email.',
        enum: ['email', 'sms', 'whatsapp', 'instagram', 'facebook', 'messenger', 'all', 'templates', 'schedule', 'sources'],
        default: 'email',
      },
      recipient: { type: 'string', description: 'Email address or phone number of the recipient.' },
      recipients: { type: 'array', items: { type: 'string' }, description: 'Multiple recipients for bulk outreach.' },
      subject: { type: 'string', description: 'Email subject line.' },
      message: { type: 'string', description: 'Outreach message body.' },
      template: { type: 'string', description: 'Template name to use (e.g., cold_email, intro, follow_up, partnership).' },
      templateVars: { type: 'object', description: 'Template variables (e.g., {name, company, website}).' },
      channel: { type: 'string', description: 'Outreach channel: email | sms | whatsapp | instagram | facebook | messenger.' },
      scheduleAt: { type: 'string', description: 'ISO timestamp for scheduled send.' },
      followUp: { type: 'boolean', description: 'Schedule a follow-up (default false).' },
      followUpDays: { type: 'number', description: 'Days until follow-up (default 3).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'social',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'mobile',
  requires: ['contacts', 'sms', 'phone', 'internet'],
  notes: 'Uses device intents to open email/social apps with pre-filled messages. Requires user confirmation before sending. For automated device control, accessibility service permission may be needed on Android.',
  apiSources: {
    device_email: { name: 'Device Email App', description: 'Opens the device email app with pre-filled message', url: '', docs: '', authTier: 'none', rateLimit: 'None', uses: ['email'] },
    whatsapp: { name: 'WhatsApp', description: 'Sends messages via WhatsApp (if installed)', url: 'https://whatsapp.com', docs: 'https://faq.whatsapp.com/', authTier: 'none', rateLimit: 'None', uses: ['whatsapp'] },
    instagram: { name: 'Instagram', description: 'Sends DMs via Instagram (if installed)', url: 'https://instagram.com', docs: '', authTier: 'none', rateLimit: 'None', uses: ['instagram'] },
    facebook: { name: 'Facebook Messenger', description: 'Sends messages via Messenger (if installed)', url: 'https://messenger.com', docs: '', authTier: 'none', rateLimit: 'None', uses: ['messenger'] },
    sms: { name: 'SMS', description: 'Sends SMS via device messaging app', url: '', docs: '', authTier: 'none', rateLimit: 'Carrier dependent', uses: ['sms'] },
  },
};