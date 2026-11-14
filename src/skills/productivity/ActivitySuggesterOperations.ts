/**
 * Stella Mobile — Activity Suggester Operations
 */

import { SkillResult, SkillContext } from '../core/types';
import { apiClients } from '../../api/ApiClient';

export async function suggestActivity(params: any, context: SkillContext): Promise<SkillResult> {
  const activityType = params.type;
  const url = activityType 
    ? `https://www.boredapi.com/api/activity?type=${encodeURIComponent(activityType)}`
    : 'https://www.boredapi.com/api/activity';

  try {
    const data = await apiClients.boredapi.get<any>(url.replace('https://www.boredapi.com/api/activity', ''), 
      activityType ? { type: activityType } : {});
    
    const content = `Activity: ${data.activity}\nType: ${data.type}\nParticipants: ${data.participants}\nPrice: ${data.price}/1.0\nAccessibility: ${data.accessibility}/1.0\nLink: https://www.boredapi.com/api/activity?key=${data.key}`;

    return { 
      title: 'Activity Suggestion', 
      summary: content, 
      spokenNarrative: `How about: ${data.activity}? It's a ${data.type} activity for ${data.participants} participant${data.participants !== 1 ? 's' : ''}.`, 
      operation: 'suggest', 
      ok: true, 
      record: { activity: data.activity, type: data.type, participants: data.participants, price: data.price, accessibility: data.accessibility, key: data.key } 
    };
  } catch (error) {
    return { 
      title: 'Activity Suggestion', 
      summary: `Error: ${error instanceof Error ? error.message : 'Failed to fetch activity'}`, 
      spokenNarrative: 'Failed to get activity suggestion', 
      operation: 'suggest', 
      ok: false 
    };
  }
}

export function getSources(): any {
  return { 
    title: 'Activity Sources', 
    summary: 'Activity suggestions powered by the Bored API (boredapi.com). No API key required.', 
    spokenNarrative: 'Activity suggestions from Bored API, free and keyless', 
    operation: 'sources', 
    ok: true, 
    record: { sources: ['boredapi.com'], content: 'Activity suggestions powered by the Bored API (boredapi.com). No API key required.' } 
  };
}