/**
 * Stella Mobile — Media Stream Skill
 * Lists, adds, validates, and plays IPTV/watch, Sonarr, and FM radio streams.
 * Supports external player handoff (VLC, MX Player, etc.).
 */

import { Skill, SkillResult, SkillContext, SkillMetadata } from '../core/types';
import { mediaStreamService, type MediaSourceType } from '../../services/media-stream';

export const mediaStreamMetadata: SkillMetadata = {
  name: 'media_streams',
  aliases: ['media_streams', 'media', 'stream', 'iptv', 'radio', 'sonarr', 'vlc'],
  description: 'List, add, validate, and play media streams (IPTV, FM radio, Sonarr TV). Supports external player handoff.',
  triggers: ['media streams', 'iptv', 'radio stream', 'sonarr', 'play stream', 'watch tv', 'vlc', 'external player'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: list | add | validate | play | pause | stop | external | sources. Defaults to list.', required: false, default: 'list' },
      sourceId: { type: 'string', description: 'ID of the media source to act on.', required: false },
      name: { type: 'string', description: 'Name for a new media source.', required: false },
      url: { type: 'string', description: 'Stream URL (M3U, HLS, or direct stream) for a new source.', required: false },
      type: { type: 'string', description: 'Source type: iptv | radio | sonarr. Defaults to iptv.', required: false, default: 'iptv' },
      external: { type: 'boolean', description: 'Launch in external player (VLC, etc.). Defaults to false.', required: false, default: false },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'media',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
};

export const mediaStreamSkill: Skill = {
  metadata: mediaStreamMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'list').toLowerCase();

    try {
      switch (operation) {
        case 'list': {
          const sources = mediaStreamService.getSources();
          return {
            title: 'Media Streams',
            summary: `${sources.length} media source(s) available.`,
            spokenNarrative: `You have ${sources.length} media sources configured.`,
            operation: 'list',
            ok: true,
            record: { sources, count: sources.length },
          };
        }

        case 'sources': {
          const sources = mediaStreamService.getSources();
          return {
            title: 'Media Sources',
            summary: sources.map((s) => `• ${s.name} (${s.type.toUpperCase()}): ${s.url}`).join('\n'),
            spokenNarrative: `Available sources: ${sources.map((s) => s.name).join(', ')}`,
            operation: 'sources',
            ok: true,
            record: { sources, count: sources.length },
          };
        }

        case 'add': {
          if (!params.name || !params.url) {
            return {
              title: 'Add Media Source',
              summary: 'Missing required parameters: name and url.',
              spokenNarrative: 'Please provide a name and stream URL.',
              operation: 'add',
              ok: false,
            };
          }

          const validation = await mediaStreamService.validateSource(params.url);
          if (!validation.ok) {
            return {
              title: 'Add Media Source',
              summary: `Invalid stream URL: ${validation.error}`,
              spokenNarrative: 'Could not reach the stream URL.',
              operation: 'add',
              ok: false,
            };
          }

          const sourceType = (params.type || 'iptv') as MediaSourceType;
          const id = await mediaStreamService.addSource({
            name: params.name,
            type: sourceType,
            url: params.url,
            enabled: true,
          });

          return {
            title: 'Add Media Source',
            summary: `Added "${params.name}" (${sourceType}).`,
            spokenNarrative: `Added ${params.name} media source.`,
        case 'play': {
          if (!params.sourceId) {
            return {
              title: 'Play Stream',
              summary: 'Missing required parameter: sourceId.',
              spokenNarrative: 'Please provide a source ID to play.',
              operation: 'play',
              ok: false,
            };
          }

          const source = mediaStreamService.getSource(params.sourceId);
          if (!source) {
            return {
              title: 'Play Stream',
              summary: `Source "${params.sourceId}" not found.`,
              spokenNarrative: 'Media source not found.',
              operation: 'play',
              ok: false,
            };
          }

          const validation = await mediaStreamService.validateSource(source.url);
          if (!validation.ok) {
            return {
              title: 'Play Stream',
              summary: `Stream unavailable: ${validation.error}`,
              spokenNarrative: 'Cannot reach the stream source.',
              operation: 'play',
              ok: false,
            };
          }

          const external = params.external === true;
          if (external) {
            const result = await mediaStreamService.streamInExternalApp(params.sourceId);
            return {
              title: 'Play Stream (External)',
              summary: result.ok ? `Launched "${source.name}" in external player.` : `External player failed: ${result.error}`,
              spokenNarrative: result.ok ? 'Streaming in external player.' : 'External player launch failed.',
              operation: 'play',
              ok: result.ok,
              record: { sourceId: params.sourceId, sourceName: source.name, external: true },
            };
          }

          await mediaStreamService.startSession(params.sourceId, false);
          const session = mediaStreamService.getCurrentSession();
          return {
            title: 'Play Stream',
            summary: `Playing "${source.name}".`,
            spokenNarrative: `Now playing ${source.name}.`,
            operation: 'play',
            ok: true,
            record: { sourceId: params.sourceId, sourceName: source.name, session },
          };
        }

        case 'pause': {
          await mediaStreamService.pauseSession();
          const session = mediaStreamService.getCurrentSession();
          return {
            title: 'Pause Stream',
            summary: 'Playback paused.',
            spokenNarrative: 'Playback paused.',
            operation: 'pause',
            ok: true,
            record: { session },
          };
        }

        case 'resume': {
          await mediaStreamService.resumeSession();
          const session = mediaStreamService.getCurrentSession();
          return {
            title: 'Resume Stream',
            summary: 'Playback resumed.',
            spokenNarrative: 'Playback resumed.',
            operation: 'resume',
            ok: true,
            record: { session },
          };
        }

        case 'stop': {
          await mediaStreamService.stopSession();
          return {
            title: 'Stop Stream',
            summary: 'Playback stopped.',
            spokenNarrative: 'Playback stopped.',
            operation: 'stop',
            ok: true,
            record: { session: null },
          };
        }

        case 'external': {
          if (!params.sourceId) {
            return {
              title: 'External Player',
              summary: 'Missing required parameter: sourceId.',
              spokenNarrative: 'Please provide a source ID.',
              operation: 'external',
              ok: false,
            };
          }

          const result = await mediaStreamService.streamInExternalApp(params.sourceId);
          const source = mediaStreamService.getSource(params.sourceId);
          return {
            title: 'External Player',
            summary: result.ok ? `Launched "${source?.name}" in VLC/external player.` : `Failed: ${result.error}`,
            spokenNarrative: result.ok ? 'Streaming in external player.' : 'External player launch failed.',
            operation: 'external',
            ok: result.ok,
            record: { sourceId: params.sourceId, external: true },
          };
        }

        default:
          return {
            title: 'Media Streams',
            summary: `Unknown operation '${operation}'. Available: list, sources, add, validate, play, pause, resume, stop, external.`,
            spokenNarrative: `Unknown media operation ${operation}.`,
            operation,
            ok: false,
          };
      }
    } catch (error: any) {
      return {
        title: 'Media Streams',
        summary: `Error: ${error.message || 'Unknown error'}`,
        spokenNarrative: 'Media stream error.',
        operation,
        ok: false,
      };
    }
  },
};
            operation: 'add',
            ok: true,
            record: { id, name: params.name, type: sourceType, url: params.url },
          };
        }

        case 'validate': {
          if (!params.url) {
            return {
              title: 'Validate Stream',
              summary: 'Missing required parameter: url.',
              spokenNarrative: 'Please provide a stream URL to validate.',
              operation: 'validate',
              ok: false,
            };
          }

          const validation = await mediaStreamService.validateSource(params.url);
          return {
            title: 'Validate Stream',
            summary: validation.ok ? 'Stream URL is reachable.' : `Stream validation failed: ${validation.error}`,
            spokenNarrative: validation.ok ? 'Stream is reachable.' : 'Stream validation failed.',
            operation: 'validate',
            ok: validation.ok,
            record: { url: params.url, ...validation },
          };
        }