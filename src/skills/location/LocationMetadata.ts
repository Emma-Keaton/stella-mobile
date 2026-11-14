/**
 * Stella Mobile — Location Skill Metadata
 */

import { SkillMetadata } from '../core/types';

export const locationMetadata: SkillMetadata = {
  name: 'location',
  aliases: ['location', 'maps', 'gps', 'navigation', 'geocoding', 'where_am_i', 'directions', 'nearby'],
  description: 'Get current location, geocode addresses, show maps, find nearby places, and get directions using native location and maps APIs.',
  triggers: ['location', 'where am i', 'my location', 'gps', 'maps', 'map', 'directions', 'navigate', 'geocode', 'address', 'nearby', 'places'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: current | geocode | reverse_geocode | map | directions | nearby | sources.', enum: ['current', 'geocode', 'reverse_geocode', 'map', 'directions', 'nearby', 'sources'] },
      address: { type: 'string', description: 'Address to geocode.' },
      latitude: { type: 'number', description: 'Latitude for reverse geocode or map center.' },
      longitude: { type: 'number', description: 'Longitude for reverse geocode or map center.' },
      destination: { type: 'string', description: 'Destination address for directions.' },
      category: { type: 'string', description: 'Place category for nearby search.' },
      radius: { type: 'number', description: 'Search radius in meters (default 1000, max 50000).' },
      mapType: { type: 'string', description: 'Map type: standard | satellite | hybrid | terrain.', enum: ['standard', 'satellite', 'hybrid', 'terrain'] },
      zoom: { type: 'number', description: 'Map zoom level (1-20, default 15).' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'location',
  source: 'stella',
  active: true,
  author: 'Stella',
  surface: 'both',
  apiSources: {
    expo_location: { name: 'Expo Location', description: 'Native geolocation and geocoding', url: 'https://docs.expo.dev/versions/latest/sdk/location/', authTier: 'keyless', rateLimit: 'Platform dependent', uses: ['current', 'geocode', 'reverse_geocode', 'background'] },
    react_native_maps: { name: 'React Native Maps', description: 'Native map views (Google Maps / Apple Maps)', url: 'https://github.com/react-native-maps/react-native-maps', authTier: 'api_key', rateLimit: 'Platform dependent', uses: ['map', 'directions', 'nearby'] },
  },
};