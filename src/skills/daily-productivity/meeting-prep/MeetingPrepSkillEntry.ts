import { Skill, SkillContext } from '../../../core/types';
import { meetingPrepMetadata } from './MeetingPrepMetadata';
import { createAgendaOperation, getTalkingPointsOperation, getSourcesOperation } from './MeetingPrepOperations';
export const meetingPrepSkill: Skill = {
  metadata: meetingPrepMetadata,
  async execute(params: any, context: SkillContext): Promise<any> {
    const operation = (params.operation || 'agenda').toLowerCase();
    try {
      switch (operation) {
        case 'agenda': return await createAgendaOperation(params, context);
        case 'talking_points': return getTalkingPointsOperation();
        case 'sources': return getSourcesOperation();
        default: return { title: 'Meeting Prep', summary: `Unknown operation '${operation}'`, spokenNarrative: `Unknown meeting prep operation ${operation}`, operation, ok: false };
      }
    } catch (e: any) { return { title: 'Meeting Prep', summary: `Error: ${e.message}`, spokenNarrative: 'Meeting prep error', operation, ok: false }; }
  },
};
export { meetingPrepMetadata } from './MeetingPrepMetadata';
export { createAgendaOperation, getTalkingPointsOperation, getSourcesOperation } from './MeetingPrepOperations';