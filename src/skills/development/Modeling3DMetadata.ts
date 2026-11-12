/**
 * Stella Mobile — 3D Modeling Skill Metadata
 * Based on Anatomy kit's 3D mode (beta) - Three.js integration
 */

import { SkillMetadata } from '../core/types';

export const modeling3dMetadata: SkillMetadata = {
  name: 'modeling_3d',
  aliases: ['modeling_3d', '3d_modeling', 'three_d_modeling', '3d_model', 'three_d_model', 'cad', '3d_cad', 'webgl_model', 'interactive_3d', 'three_js'],
  description: '3D Modeling: Create interactive 3D models using Three.js with WebGL rendering. Based on Anatomy kit\'s 3D mode (beta). Generates rotatable, zoomable 3D views with proper lighting, materials, and camera controls. Exports as standalone HTML with embedded Three.js or as React Three Fiber components. Operations: create, load, export, scene, materials, lights, camera, animate, sources. Requires three.js (included in Anatomy kit) and WebGL-capable browser.',
  triggers: ['3d model', '3d modeling', 'three d modeling', '3d cad', 'cad model', 'interactive 3d', 'webgl model', 'three js model', 'create 3d', 'build 3d model', '3d visualization', 'threejs'],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: create | load | export | scene | materials | lights | camera | animate | sources. Defaults to create.', enum: ['create', 'load', 'export', 'scene', 'materials', 'lights', 'camera', 'animate', 'sources'] },
      geometry: { type: 'string', description: 'Base geometry: box | sphere | cylinder | cone | torus | plane | custom. Defaults to box.', enum: ['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'custom'] },
      dimensions: { type: 'object', description: 'Dimensions (width, height, depth, radius, segments)', properties: { width: { type: 'number' }, height: { type: 'number' }, depth: { type: 'number' }, radius: { type: 'number' }, segments: { type: 'number' } } },
      position: { type: 'object', description: 'Position (x, y, z)', properties: { x: { type: 'number' }, y: { type: 'number' }, z: { type: 'number' } } },
      rotation: { type: 'object', description: 'Rotation in radians (x, y, z)', properties: { x: { type: 'number' }, y: { type: 'number' }, z: { type: 'number' } } },
      material: { type: 'string', description: 'Material: standard | physical | basic | phong | toon. Defaults to standard.', enum: ['standard', 'physical', 'basic', 'phong', 'toon'] },
      color: { type: 'string', description: 'Material color hex (e.g., #ff0000). Defaults to #888888.' },
      metalness: { type: 'number', description: 'Metalness 0-1. Defaults to 0.' },
      roughness: { type: 'number', description: 'Roughness 0-1. Defaults to 0.5.' },
      scene_file: { type: 'string', description: 'Scene file path for load (.gltf, .glb, .obj, .json)' },
      export_format: { type: 'string', description: 'Export format: gltf | glb | obj | stl | html | react. Defaults to gltf.', enum: ['gltf', 'glb', 'obj', 'stl', 'html', 'react'] },
      include_controls: { type: 'boolean', description: 'Include OrbitControls. Defaults to true.' },
      width: { type: 'number', description: 'Canvas width. Defaults to 800.' },
      height: { type: 'number', description: 'Canvas height. Defaults to 600.' },
    },
    required: [],
  },
  version: '1.0.0',
  category: 'development',
  source: 'stella',
  active: true,
  author: 'Stella (based on wheresryan22/anatomy 3D mode)',
  surface: 'both',
  notes: '3D mode is beta. Requires WebGL browser. Three.js r150+ included via Anatomy kit. React Three Fiber for React output. Performance: ~60fps small models, ~15-20fps 300+ parts.',
  apiSources: {
    three_js: { name: 'Three.js', description: 'JS 3D library (in Anatomy kit)', url: 'https://threejs.org/', docs: 'https://threejs.org/docs/', authTier: 'keyless', rateLimit: 'Local only', uses: ['create', 'load', 'export', 'scene', 'materials', 'lights', 'camera', 'animate'] },
    react_three_fiber: { name: 'React Three Fiber', description: 'React renderer for Three.js', url: 'https://docs.pmnd.rs/react-three-fiber', docs: 'https://github.com/pmndrs/react-three-fiber', authTier: 'keyless', rateLimit: 'Local only', uses: ['export', 'react'] },
    anatomy_kit_3d: { name: 'Anatomy Kit 3D', description: 'Beta 3D mode from wheresryan22/anatomy', url: 'https://github.com/wheresryan22/anatomy', docs: 'https://skills.wheresryan.sh/anatomy', authTier: 'keyless', rateLimit: 'Local only', uses: ['create', 'export', 'scene', 'animate'] },
  },
};

export const GEOMETRY_TYPES = { box: { name: 'Box', params: ['width', 'height', 'depth'] }, sphere: { name: 'Sphere', params: ['radius', 'segments'] }, cylinder: { name: 'Cylinder', params: ['radiusTop', 'radiusBottom', 'height'] }, cone: { name: 'Cone', params: ['radius', 'height'] }, torus: { name: 'Torus', params: ['radius', 'tube'] }, plane: { name: 'Plane', params: ['width', 'height'] } };

export const MATERIAL_TYPES = { standard: { name: 'MeshStandardMaterial', desc: 'PBR, metalness/roughness' }, physical: { name: 'MeshPhysicalMaterial', desc: 'Extended PBR with clearcoat' }, basic: { name: 'MeshBasicMaterial', desc: 'Unlit, no lighting' }, phong: { name: 'MeshPhongMaterial', desc: 'Shiny specular (legacy)' }, toon: { name: 'MeshToonMaterial', desc: 'Cel-shaded cartoon' } };

export const LIGHT_TYPES = { ambient: { name: 'AmbientLight', desc: 'Global ambient' }, directional: { name: 'DirectionalLight', desc: 'Parallel rays (sun)' }, point: { name: 'PointLight', desc: 'Omnidirectional' }, spot: { name: 'SpotLight', desc: 'Cone-shaped' }, hemisphere: { name: 'HemisphereLight', desc: 'Sky/ground gradient' }, rect: { name: 'RectAreaLight', desc: 'Rectangular area (physical)' } };