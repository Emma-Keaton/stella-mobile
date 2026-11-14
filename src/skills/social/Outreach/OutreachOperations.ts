/**
 * Stella Mobile — Outreach Operations
 * Automated cold outreach via email and social media using device control.
 */

import { Linking, Platform } from 'react-native';
import { RNFS } from 'react-native-fs';
import { SkillResult, SkillContext } from '../../core/types';

export interface OutreachMessage {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'instagram' | 'facebook' | 'messenger';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  sentAt?: number;
  template?: string;
  followUpAt?: number;
}

const STORED_OUTREACH_KEY = 'stella_outreach_messages';

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  cold_email: {
    subject: 'Quick question about {{company}}',
    body: 'Hi {{name}},\n\nI noticed {{company}} doesn\'t have a website yet — I help local businesses get online quickly and affordably.\n\nWould you be open to a brief chat this week?\n\nBest,\nStella',
  },
  intro: {
    subject: 'Introduction: {{company}} + Stella',
    body: 'Hi {{name}},\n\nI\'m Stella, an AI assistant that helps local businesses with digital presence.\n\nI saw {{company}} in {{city}} and thought you might benefit from our services.\n\nBest regards,\nStella',
  },
  follow_up: {
    subject: 'Following up: {{company}} website',
    body: 'Hi {{name}},\n\nFollowing up on my previous message about getting {{company}} online.\n\nStill interested in exploring how we can help?\n\nBest,\nStella',
  },
  partnership: {
    subject: 'Partnership opportunity for {{company}}',
    body: 'Hi {{name}},\n\nI have a partnership opportunity that could help {{company}} reach more customers.\n\nCan we schedule a quick call?\n\nBest,\nStella',
  },
};

function renderTemplate(template: Record<string, string>, vars: any): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(template)) {
    let rendered = value;
    for (const [varName, varValue] of Object.entries(vars || {})) {
      rendered = rendered.replace(new RegExp(`{{${varName}}}`, 'g'), String(varValue));
    }
    result[key] = rendered;
  }
  return result;
}

async function loadStoredMessages(): Promise<OutreachMessage[]> {
  try {
    const content = await RNFS.readFile(`${RNFS.DocumentDirectoryPath}/${STORED_OUTREACH_KEY}`, 'utf8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveStoredMessages(messages: OutreachMessage[]): Promise<void> {
  await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${STORED_OUTREACH_KEY}`, JSON.stringify(messages, null, 2), 'utf8');
}

function buildMailtoUrl(recipient: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${recipient}?${params.toString()}`;
}

function buildSmsUrl(recipient: string, body: string): string {
  return `sms:${recipient}?body=${encodeURIComponent(body)}`;
}

function buildWhatsAppUrl(recipient: string, message: string): string {
  const cleanPhone = recipient.replace(/[^+\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function buildInstagramUrl(username: string, message: string): string {
  const cleanUsername = username.replace(/^@/, '').replace(/^https?:\/\/instagram\.com\//, '');
  return `https://instagram.com/${cleanUsername}/?message=${encodeURIComponent(message)}`;
}

function buildFacebookUrl(username: string, message: string): string {
  const cleanUsername = username.replace(/^@/, '').replace(/^https?:\/\/facebook\.com\//, '');
  return `https://m.me/${cleanUsername}?text=${encodeURIComponent(message)}`;
}

function buildMessengerUrl(username: string, message: string): string {
  return buildFacebookUrl(username, message);
}

export async function sendEmailOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { recipient, subject, message, template, templateVars } = params;

  if (!recipient) {
    return {
      title: 'Outreach',
      summary: 'Recipient email address is required',
      spokenNarrative: 'Please provide a recipient email address',
      operation: 'email',
      ok: false,
    };
  }

  let emailSubject = subject || '';
  let emailBody = message || '';

  if (template && DEFAULT_TEMPLATES[template]) {
    const rendered = renderTemplate(DEFAULT_TEMPLATES[template], templateVars);
    emailSubject = rendered.subject || emailSubject;
    emailBody = rendered.body || emailBody;
  }

  if (!emailBody) {
    return {
      title: 'Outreach',
      summary: 'Message body is required',
      spokenNarrative: 'Please provide a message',
      operation: 'email',
      ok: false,
    };
  }

  const url = buildMailtoUrl(recipient, emailSubject, emailBody);

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return {
        title: 'Outreach',
        summary: 'No email app available on this device',
        spokenNarrative: 'No email app found',
        operation: 'email',
        ok: false,
      };
    }

    await Linking.openURL(url);

    const msg: OutreachMessage = {
      id: `outreach-${Date.now()}`,
      channel: 'email',
      recipient,
      subject: emailSubject,
      message: emailBody,
      status: 'pending',
      template,
    };

    const existing = await loadStoredMessages();
    await saveStoredMessages([...existing, msg]);

    return {
      title: 'Email Outreach',
      summary: `Email draft opened for ${recipient}`,
      spokenNarrative: `Email draft opened for ${recipient}. Review and send from your email app.`,
      operation: 'email',
      ok: true,
      record: {
        channel: 'email',
        recipient,
        subject: emailSubject,
        url,
        note: 'Email app opened with pre-filled draft. User must confirm send.',
      },
    };
  } catch (error: any) {
    return {
      title: 'Outreach',
      summary: `Failed to open email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'Email outreach failed',
      operation: 'email',
      ok: false,
    };
  }
}

export async function sendSmsOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { recipient, message, template, templateVars } = params;

  if (!recipient) {
    return {
      title: 'Outreach',
      summary: 'Recipient phone number is required',
      spokenNarrative: 'Please provide a phone number',
      operation: 'sms',
      ok: false,
    };
  }

  let smsBody = message || '';
  if (template && DEFAULT_TEMPLATES[template]) {
    const rendered = renderTemplate(DEFAULT_TEMPLATES[template], templateVars);
    smsBody = rendered.body || smsBody;
  }

  if (!smsBody) {
    return {
      title: 'Outreach',
      summary: 'Message body is required',
      spokenNarrative: 'Please provide a message',
      operation: 'sms',
      ok: false,
    };
  }

  const url = buildSmsUrl(recipient, smsBody);

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return {
        title: 'Outreach',
        summary: 'SMS app not available on this device',
        spokenNarrative: 'No SMS app found',
        operation: 'sms',
        ok: false,
      };
    }

    await Linking.openURL(url);

    const msg: OutreachMessage = {
      id: `outreach-${Date.now()}`,
      channel: 'sms',
      recipient,
      message: smsBody,
      status: 'pending',
      template,
    };

    const existing = await loadStoredMessages();
    await saveStoredMessages([...existing, msg]);

    return {
      title: 'SMS Outreach',
      summary: `SMS draft opened for ${recipient}`,
      spokenNarrative: `SMS draft opened for ${recipient}. Review and send from your messaging app.`,
      operation: 'sms',
      ok: true,
      record: {
        channel: 'sms',
        recipient,
        message: smsBody,
        url,
        note: 'SMS app opened with pre-filled draft. User must confirm send.',
      },
    };
  } catch (error: any) {
    return {
      title: 'Outreach',
      summary: `Failed to open SMS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'SMS outreach failed',
      operation: 'sms',
      ok: false,
    };
  }
}

export async function sendWhatsAppOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { recipient, message, template, templateVars } = params;

  if (!recipient) {
    return {
      title: 'Outreach',
      summary: 'Recipient phone number is required for WhatsApp',
      spokenNarrative: 'Please provide a phone number',
      operation: 'whatsapp',
      ok: false,
    };
  }

  let waMessage = message || '';
  if (template && DEFAULT_TEMPLATES[template]) {
    const rendered = renderTemplate(DEFAULT_TEMPLATES[template], templateVars);
    waMessage = rendered.body || waMessage;
  }

  if (!waMessage) {
    return {
      title: 'Outreach',
      summary: 'Message body is required',
      spokenNarrative: 'Please provide a message',
      operation: 'whatsapp',
      ok: false,
    };
  }

  const url = buildWhatsAppUrl(recipient, waMessage);

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return {
        title: 'Outreach',
        summary: 'WhatsApp not installed on this device',
        spokenNarrative: 'WhatsApp not found',
        operation: 'whatsapp',
        ok: false,
      };
    }

    await Linking.openURL(url);

    const msg: OutreachMessage = {
      id: `outreach-${Date.now()}`,
      channel: 'whatsapp',
      recipient,
      message: waMessage,
      status: 'pending',
      template,
    };

    const existing = await loadStoredMessages();
    await saveStoredMessages([...existing, msg]);

    return {
      title: 'WhatsApp Outreach',
      summary: `WhatsApp chat opened for ${recipient}`,
      spokenNarrative: `WhatsApp chat opened for ${recipient}. Review and send from WhatsApp.`,
      operation: 'whatsapp',
      ok: true,
      record: {
        channel: 'whatsapp',
        recipient,
        message: waMessage,
        url,
        note: 'WhatsApp opened with pre-filled message. User must confirm send.',
      },
    };
  } catch (error: any) {
    return {
      title: 'Outreach',
      summary: `Failed to open WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'WhatsApp outreach failed',
      operation: 'whatsapp',
      ok: false,
    };
  }
}

export async function sendInstagramOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { recipient, message, template, templateVars } = params;

  if (!recipient) {
    return {
      title: 'Outreach',
      summary: 'Instagram username is required',
      spokenNarrative: 'Please provide an Instagram username',
      operation: 'instagram',
      ok: false,
    };
  }

  let igMessage = message || '';
  if (template && DEFAULT_TEMPLATES[template]) {
    const rendered = renderTemplate(DEFAULT_TEMPLATES[template], templateVars);
    igMessage = rendered.body || igMessage;
  }

  if (!igMessage) {
    return {
      title: 'Outreach',
      summary: 'Message body is required',
      spokenNarrative: 'Please provide a message',
      operation: 'instagram',
      ok: false,
    };
  }

  const url = buildInstagramUrl(recipient, igMessage);

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return {
        title: 'Outreach',
        summary: 'Instagram app not available on this device',
        spokenNarrative: 'Instagram not found',
        operation: 'instagram',
        ok: false,
      };
    }

    await Linking.openURL(url);

    const msg: OutreachMessage = {
      id: `outreach-${Date.now()}`,
      channel: 'instagram',
      recipient,
      message: igMessage,
      status: 'pending',
      template,
    };

    const existing = await loadStoredMessages();
    await saveStoredMessages([...existing, msg]);

    return {
      title: 'Instagram Outreach',
      summary: `Instagram profile opened for ${recipient}`,
      spokenNarrative: `Instagram profile opened for ${recipient}. Send a direct message from Instagram.`,
      operation: 'instagram',
      ok: true,
      record: {
        channel: 'instagram',
        recipient,
        message: igMessage,
        url,
        note: 'Instagram opened. User must send DM manually.',
      },
    };
  } catch (error: any) {
    return {
      title: 'Outreach',
      summary: `Failed to open Instagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'Instagram outreach failed',
      operation: 'instagram',
      ok: false,
    };
  }
}

export async function sendFacebookOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { recipient, message, template, templateVars } = params;

  if (!recipient) {
    return {
      title: 'Outreach',
      summary: 'Facebook username or page is required',
      spokenNarrative: 'Please provide a Facebook username',
      operation: 'facebook',
      ok: false,
    };
  }

  let fbMessage = message || '';
  if (template && DEFAULT_TEMPLATES[template]) {
    const rendered = renderTemplate(DEFAULT_TEMPLATES[template], templateVars);
    fbMessage = rendered.body || fbMessage;
  }

  if (!fbMessage) {
    return {
      title: 'Outreach',
      summary: 'Message body is required',
      spokenNarrative: 'Please provide a message',
      operation: 'facebook',
      ok: false,
    };
  }

  const url = buildFacebookUrl(recipient, fbMessage);

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return {
        title: 'Outreach',
        summary: 'Facebook Messenger not available on this device',
        spokenNarrative: 'Messenger not found',
        operation: 'facebook',
        ok: false,
      };
    }

    await Linking.openURL(url);

    const msg: OutreachMessage = {
      id: `outreach-${Date.now()}`,
      channel: 'messenger',
      recipient,
      message: fbMessage,
      status: 'pending',
      template,
    };

    const existing = await loadStoredMessages();
    await saveStoredMessages([...existing, msg]);

    return {
      title: 'Facebook Outreach',
      summary: `Messenger chat opened for ${recipient}`,
      spokenNarrative: `Messenger chat opened for ${recipient}. Review and send from Messenger.`,
      operation: 'facebook',
      ok: true,
      record: {
        channel: 'messenger',
        recipient,
        message: fbMessage,
        url,
        note: 'Messenger opened with pre-filled message. User must confirm send.',
      },
    };
  } catch (error: any) {
    return {
      title: 'Outreach',
      summary: `Failed to open Messenger: ${error instanceof Error ? error.message : 'Unknown error'}`,
      spokenNarrative: 'Facebook outreach failed',
      operation: 'facebook',
      ok: false,
    };
  }
}

export async function bulkOutreachOperation(params: any, context: SkillContext): Promise<SkillResult> {
  const { recipients = [], channel = 'email', subject, message, template, templateVars } = params;

  if (!recipients || recipients.length === 0) {
    return {
      title: 'Outreach',
      summary: 'No recipients provided',
      spokenNarrative: 'Please provide recipients',
      operation: 'all',
      ok: false,
    };
  }

  const results: any[] = [];
  let successCount = 0;

  for (const recipient of recipients) {
    try {
      let result: SkillResult;
      switch (channel) {
        case 'email':
          result = await sendEmailOperation({ recipient, subject, message, template, templateVars }, context);
          break;
        case 'sms':
          result = await sendSmsOperation({ recipient, message, template, templateVars }, context);
          break;
        case 'whatsapp':
          result = await sendWhatsAppOperation({ recipient, message, template, templateVars }, context);
          break;
        case 'instagram':
          result = await sendInstagramOperation({ recipient, message, template, templateVars }, context);
          break;
        case 'facebook':
        case 'messenger':
          result = await sendFacebookOperation({ recipient, message, template, templateVars }, context);
          break;
        default:
          result = await sendEmailOperation({ recipient, subject, message, template, templateVars }, context);
      }

      if (result.ok) successCount++;
      results.push({ recipient, ok: result.ok, summary: result.summary });
    } catch (e) {
      results.push({ recipient, ok: false, error: e instanceof Error ? e.message : 'Unknown error' });
    }
  }

  return {
    title: 'Bulk Outreach',
    summary: `Bulk ${channel} outreach: ${successCount}/${recipients.length} messages opened`,
    spokenNarrative: `Bulk outreach complete. ${successCount} of ${recipients.length} messages ready to send.`,
    operation: 'all',
    ok: successCount > 0,
    record: {
      channel,
      total: recipients.length,
      successCount,
      results,
    },
  };
}

export function getTemplatesOperation(): SkillResult {
  const templateList = Object.entries(DEFAULT_TEMPLATES).map(([key, tmpl]) => ({
    key,
    subject: tmpl.subject,
    preview: tmpl.body.substring(0, 80) + '...',
  }));

  return {
    title: 'Outreach Templates',
    summary: `Available templates: ${templateList.map(t => t.key).join(', ')}`,
    spokenNarrative: `Available outreach templates: ${templateList.map(t => t.key).join(', ')}`,
    operation: 'templates',
    ok: true,
    record: { templates: templateList },
  };
}

export function getSourcesOperation(): SkillResult {
  return {
    title: 'Outreach Sources',
    summary: 'Outreach uses device intents to open email, SMS, WhatsApp, Instagram, and Facebook Messenger apps with pre-filled messages.',
    spokenNarrative: 'Outreach uses device apps for email, SMS, WhatsApp, Instagram, and Messenger',
    operation: 'sources',
    ok: true,
    record: {
      channels: ['email', 'sms', 'whatsapp', 'instagram', 'facebook', 'messenger'],
      methods: ['device_intents', 'pre_filled_messages', 'templates'],
      note: 'User must confirm each send. No automated sending without explicit permission.',
    },
  };
}