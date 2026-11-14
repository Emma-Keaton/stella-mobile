/**
 * Stella Mobile — Location Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { locationMetadata } from './LocationMetadata';
import { getCurrentLocation, geocodeAddress, reverseGeocode } from './LocationOperations1';
import { showMap, getDirections } from './LocationOperations2';
import { findNearby, getSources } from './LocationOperations3';

export const locationSkill: Skill = {
  metadata: locationMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'current').toLowerCase();

    try {
      switch (operation) {
        case 'current': return await getCurrentLocation();
        case 'geocode': return await geocodeAddress(params.address);
        case 'reverse_geocode': return await reverseGeocode(params.latitude, params.longitude);
        case 'map': return await showMap(params);
        case 'directions': return await getDirections(params.destination, params.latitude, params.longitude);
        case 'nearby': return await findNearby(params);
        case 'sources': return getSources();
        default:
          return { title: 'Location', summary: `Unknown operation '${operation}'. Available: current, geocode, reverse_geocode, map, directions, nearby, sources`, spokenNarrative: `Unknown location operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: 'Location', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: 'Location service error', operation, ok: false };
    }
  },
};

export { locationMetadata } from './LocationMetadata';
export { getCurrentLocation, geocodeAddress, reverseGeocode } from './LocationOperations1';
export { showMap, getDirections } from './LocationOperations2';
export { findNearby, getSources } from './LocationOperations3';