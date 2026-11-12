/**
 * Stella Mobile — Anatomy Skill Metadata
 * Based on: https://github.com/wheresryan22/anatomy
 * Creates crafted, interactive isometric SVG figures with WebGL shaders and 3D effects
 */

import { SkillMetadata } from '../core/types';

export const anatomyMetadata: SkillMetadata = {
  name: 'anatomy',
  aliases: [
    'anatomy', 'technical_illustration', 'isometric_figure', 'exploded_view',
    'technical_drawing', 'interactive_explainer', 'svg_figure', 'webgl_shader',
    'anatomy_figure', 'crafted_diagram', 'premium_technical_drawing',
    'explain_how_it_works', 'build_figure', 'isometric_illustration',
    '3d_modeling', 'three_d_modeling', 'mechanical_diagram'
  ],
  description: (
    'Anatomy: Build crafted, highly detailed, interactive isometric SVG figures that ' +
    'explain a technical idea as a real physical object. Based on the Anatomy kit ' +
    '(github.com/wheresryan22/anatomy) - a self-contained Node.js toolkit that generates ' +
    'standalone HTML figures with embedded SVG, optional WebGL shaders, and 3D effects. ' +
    'No external dependencies, no npm install required. Runs in Node.js 20.10+. ' +
    'Operations: sources, examples, kit, workflow, verify, figure_plan, references, build. ' +
    'Read operations are free; building figures requires authorization.'
  ),
  triggers: [
    'anatomy', 'technical illustration', 'isometric figure', 'exploded view',
    'technical drawing', 'interactive explainer', 'svg figure', 'webgl shader',
    'anatomy figure', 'crafted diagram', 'premium technical drawing',
    'explain how it works', 'build a figure', 'isometric illustration',
    '3d modeling', 'mechanical diagram', 'technical visualization',
    'draw a machine', 'show me how it works', 'create a diagram'
  ],
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'One of: sources | examples | kit | workflow | verify | figure_plan | references | build. Defaults to sources.', enum: ['sources', 'examples', 'kit', 'workflow', 'verify', 'figure_plan', 'references', 'build'] },
      example: { type: 'string', description: 'Name of an example to build (for examples/build operations). Available: dial-indicator, raptor-engine, spot-plate, test-rig, and more. Defaults to dial-indicator.' },
      module: { type: 'string', description: 'Name of a kit module to describe (kit operation). Available: geometry, projection, parts, audit, materials, themes, react, shaders, three-d, export.' },
      concept: { type: 'string', description: 'The technical idea to explain as a physical mechanism (figure_plan operation). E.g., "how a jet engine works", "mechanical watch movement", "hydraulic brake system".' },
      size: { type: 'string', description: 'Figure size tier for figure_plan: Figure | Hero | Epic. Defaults to Figure.', enum: ['Figure', 'Hero', 'Epic'] },
      theme: { type: 'string', description: 'Figure theme for build operation: dark | light. Defaults to dark.', enum: ['dark', 'light'] },
      width: { type: 'number', description: 'Figure width in pixels (build operation). Defaults to 600.' },
      height: { type: 'number', description: 'Figure height in pixels (build operation). Defaults to 400.' },
      output_path: { type: 'string', description: 'Custom output path for built figure (build operation). Defaults to temp directory.' },
      include_3d: { type: 'boolean', description: 'Include 3D/WebGL components in build (beta feature). Defaults to false.' },
      include_react: { type: 'boolean', description: 'Generate React component output instead of HTML. Defaults to false.' },
    },
    required: [],
  },
  version: '2.0.0',
  category: 'development',
  source: 'stella',
  active: true,
  author: 'Stella (based on wheresryan22/anatomy)',
  surface: 'both',
  notes: 'Self-contained Node.js kit - no npm install needed. Requires Node.js 20.10+. Chrome/Chromium needed for browser-based checks. 3D mode is beta. React output requires React 18+.',
  apiSources: {
    anatomy_kit: { name: 'Anatomy Kit (wheresryan22/anatomy)', description: 'Self-contained Node.js toolkit for isometric technical illustrations', url: 'https://github.com/wheresryan22/anatomy', docs: 'https://skills.wheresryan.sh/anatomy', authTier: 'keyless', rateLimit: 'Local only - no rate limits', uses: ['sources', 'examples', 'kit', 'workflow', 'verify', 'figure_plan', 'references', 'build'] },
    node_js: { name: 'Node.js Runtime', description: 'JavaScript runtime for building figures', url: 'https://nodejs.org/', docs: 'https://nodejs.org/docs/latest/api/', authTier: 'keyless', rateLimit: 'Local only', uses: ['build', 'verify', 'workflow'] },
    chromium: { name: 'Chrome/Chromium Browser', description: 'Headless browser for WebGL shader checks and 3D rendering', url: 'https://chromium.org/', docs: 'https://chromium.googlesource.com/chromium/src/+/main/docs/', authTier: 'keyless', rateLimit: 'Local only', uses: ['build', 'verify', '3d_checks'] },
  },
};

export const ANATOMY_EXAMPLES = [
  'dial-indicator', 'raptor-engine', 'spot-plate', 'test-rig',
  'micrometer', 'vernier-caliper', 'torque-wrench', 'differential',
];

export const ANATOMY_KIT_MODULES = [
  'geometry', 'projection', 'parts', 'audit', 'materials', 'themes', 'react', 'shaders', 'three-d', 'export',
];

export const FIGURE_SIZES = {
  Figure: { parts: '5-15', time: '~2-5 min', description: 'Small mechanism, single view' },
  Hero: { parts: '20-50', time: '~10-20 min', description: 'Complex system, multiple views' },
  Epic: { parts: '50-300+', time: '~30-60 min', description: 'Full system with 3D orbit audit' },
};