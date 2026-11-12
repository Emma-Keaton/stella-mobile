/**
 * Stella Mobile — Skills Module
 * Main entry point for the skill system
 */

export { SkillRegistry, skillRegistry } from './registry/SkillRegistry';
export { ApiClient, apiClients } from './api/ApiClient';
export * from './core/types';

// Re-export skills as they're created
export * from './weather';
export * from './system';
export * from './development';
export * from './research';
export * from './finance';
export * from './productivity';
export * from './media';
export * from './location';