/**
 * Stella Mobile — 3D Modeling Skill Entry Point
 */

import { Skill, SkillResult, SkillContext } from '../core/types';
import { modeling3dMetadata } from './Modeling3DMetadata';
import { getSources, createModel, loadModel, exportModel, configureScene, configureMaterials, configureLights, configureCamera, animateScene } from './Modeling3DOperations';

export const modeling3dSkill: Skill = {
  metadata: modeling3dMetadata,

  async execute(params: any, context: SkillContext): Promise<SkillResult> {
    const operation = (params.operation || 'create').toLowerCase();

    try {
      switch (operation) {
        case 'sources': return await getSources();
        case 'create': return await createModel(params);
        case 'load': return await loadModel(params);
        case 'export': return await exportModel(params);
        case 'scene': return await configureScene(params);
        case 'materials': return await configureMaterials(params);
        case 'lights': return await configureLights(params);
        case 'camera': return await configureCamera(params);
        case 'animate': return await animateScene(params);
        default:
          return { title: '3D Modeling', summary: `Unknown operation '${operation}'. Available: sources, create, load, export, scene, materials, lights, camera, animate`, spokenNarrative: `Unknown 3D modeling operation ${operation}`, operation, ok: false };
      }
    } catch (error) {
      return { title: '3D Modeling', summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, spokenNarrative: '3D modeling service error', operation, ok: false };
    }
  },
};

export { modeling3dMetadata } from './Modeling3DMetadata';
export { getSources, createModel, loadModel, exportModel, configureScene, configureMaterials, configureLights, configureCamera, animateScene } from './Modeling3DOperations';