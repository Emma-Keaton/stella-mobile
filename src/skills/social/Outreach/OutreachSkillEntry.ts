/**
 * Stella Mobile — Outreach Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../../core/types';
import { outreachMetadata } from './OutreachMetadata';
import {
  sendEmailOperation,
  sendSmsOperation,
  sendWhatsAppOperation,
  sendInstagramOperation,
  sendFacebookOperation,
  bulkOutreachOperation,
  getTemplatesOperation,
  getSourcesOperation,
} from './OutreachOperations';

export const outreachSkill: Skill = {
  metadata: outreachMetadata,

  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'email').toLowerCase();

    try {
      switch (operation) {
        case 'email': return await sendEmailOperation(params, context);
        case 'sms': return await sendSmsOperation(params, context);
        case 'whatsapp': return await sendWhatsAppOperation(params, context);
        case 'instagram': return await sendInstagramOperation(params, context);
        case 'facebook':
        case 'messenger': return await sendFacebookOperation(params, context);
        case 'all': return await bulkOutreachOperation(params, context);
        case 'templates': return getTemplatesOperation();
        case 'sources': return getSourcesOperation();
        default:
          return {
            title: 'Outreach',
            summary: `Unknown operation '${operation}'. Available: email, sms, whatsapp, instagram, facebook, all, templates, sources`,
            spokenNarrative: `Unknown outreach operation ${operation}`,
            operation,
            ok: false,
          };
      }
    } catch (error: any) {
      return {
        title: 'Outreach',
        summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        spokenNarrative: 'Outreach error',
        operation,
        ok: false,
      };
    }
  },
};

export { outreachMetadata } from './OutreachMetadata';
export {
  sendEmailOperation,
  sendSmsOperation,
  sendWhatsAppOperation,
  sendInstagramOperation,
  sendFacebookOperation,
  bulkOutreachOperation,
  getTemplatesOperation,
  getSourcesOperation,
} from './OutreachOperations';