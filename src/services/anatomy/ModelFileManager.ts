/**
 * Stella Mobile — Model File Manager
 * Handles model file format loading, export, and management for anatomy models.
 * Supports multiple 3D model formats: OBJ, STL, GLTF, GLB, PLY, FBX
 */

import RNFS from 'react-native-fs'
import { Platform } from 'react-native'

export type ModelFormat = 'obj' | 'stl' | 'gltf' | 'glb' | 'ply' | 'fbx'

export interface ModelFileInfo {
  id: string
  name: string
  path: string
  uri: string
  format: ModelFormat
  size: number
  createdAt: number
  isBundled: boolean
  isDownloaded: boolean
}

const MODEL_EXTENSIONS: Record<string, ModelFormat> = {
  obj: 'obj',
  stl: 'stl',
  gltf: 'gltf',
  glb: 'glb',
  ply: 'ply',
  fbx: 'fbx',
}

export class ModelFileManager {
  private readonly MODELS_DIR: string

  constructor() {
    this.MODELS_DIR = `${RNFS.DocumentDirectoryPath}/StellaAI/models`
  }

  async init(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.MODELS_DIR)
      if (!exists) {
        await RNFS.mkdir(this.MODELS_DIR)
      }
    } catch (e) {
      console.error('[ModelFileManager] Init failed:', e)
    }
  }

  async listModels(): Promise<ModelFileInfo[]> {
    try {
      const exists = await RNFS.exists(this.MODELS_DIR)
      if (!exists) return []

      const items = await RNFS.readDir(this.MODELS_DIR)
      return items
        .filter(item => {
          const ext = item.name.split('.').pop()?.toLowerCase()
          return ext && ext in MODEL_EXTENSIONS
        })
        .map(item => {
          const ext = item.name.split('.').pop()?.toLowerCase() || ''
          return {
            id: item.name,
            name: item.name,
            path: item.path,
            uri: `file://${item.path}`,
            format: MODEL_EXTENSIONS[ext] || 'obj',
            size: item.size,
            createdAt: item.mtime ? new Date(item.mtime).getTime() : Date.now(),
            isBundled: false,
            isDownloaded: true,
          }
        })
    } catch (e) {
      console.error('[ModelFileManager] List failed:', e)
      return []
    }
  }

  async downloadModel(url: string, filename?: string): Promise<ModelFileInfo | null> {
    try {
      const exists = await RNFS.exists(this.MODELS_DIR)
      if (!exists) await RNFS.mkdir(this.MODELS_DIR)

      const filename = filename || url.split('/').pop() || 'model'
      const ext = filename.split('.').pop()?.toLowerCase() || 'obj'
      const path = `${this.MODELS_DIR}/${filename}`

      const download = RNFS.downloadFile({
        fromUrl: url,
        toFile: path,
      })

      return {
        id: filename,
        name: filename,
        path,
        uri: `file://${path}`,
        format: MODEL_EXTENSIONS[ext] || 'obj',
        size: 0,
        createdAt: Date.now(),
        isBundled: false,
        isDownloaded: true,
      }
    } catch (e: any) {
      console.error('[ModelFileManager] Download failed:', e)
      return null
    }
  }

  async deleteModel(path: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(path)
      if (exists) {
        await RNFS.unlink(path)
        return true
      }
      return false
    } catch (e) {
      console.error('[ModelFileManager] Delete failed:', e)
      return false
    }
  }

  async exportModel(modelPath: string, format: ModelFormat, destPath: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(modelPath)
      if (!exists) return false

      const destDir = destPath.split('/').slice(0, -1).join('/')
      if (destDir) {
        const exists = await RNFS.exists(destDir)
        if (!exists) await RNFS.mkdir(destDir)
      }

      await RNFS.copyFile(modelPath, path)
      return true
    } catch (e: any) {
      console.error('[ModelFileManager] Export failed:', e)
      return false
    }
  }

  async importModel(filePath: string): Promise<ModelFileInfo | null> {
    try {
      const exists = await RNFS.exists(filePath)
      if (!exists) return null

      const stat = await RNFS.stat(filePath)
      const filename = filePath.split('/').pop() || 'model'
      const ext = filename.split('.').pop()?.toLowerCase() || 'obj'
      const destPath = `${this.MODELS_DIR}/${filename}`

      await RNFS.copyFile(filePath, destPath)

      return {
        id: filename,
        name: filename,
        path: destPath,
        uri: `file://${destPath}`,
        format: MODEL_EXTENSIONS[ext] || 'obj',
        size: stat.size,
        createdAt: stat.mtime ? new Date(stat.mtime).getTime() : Date.now(),
        isBundled: false,
        isDownloaded: true,
      }
    } catch (e: any) {
      console.error('[ModelFileManager] Import failed:', e)
      return null
    }
  }

  getSupportedFormats(): ModelFormat[] {
    return ['obj', 'stl', 'gltf', 'glb', 'ply', 'fbx']
  }

  getFormatIcon(format: ModelFormat): string {
    const icons: Record<ModelFormat, string> = {
      obj: '📦',
      stl: '🔷',
      gltf: '📐',
      glb: '📦',
      ply: '🔺',
      fbx: '🎬',
    }
    return icons[format] || '📦'
  }
}

export const modelFileManager = new ModelFileManager()