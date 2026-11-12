/**
 * Stella Mobile — Media Upload
 * Upload media files to external servers.
 */

import RNFS from 'react-native-fs'
import { MediaFile } from '../core/types'

export class MediaUploader {
  static async upload(filePath: string, uploadUrl: string, method: 'POST' | 'PUT' = 'POST'): Promise<{ ok: boolean; url?: string; error?: string }> {
    try {
      const exists = await RNFS.exists(filePath)
      if (!exists) return { ok: false, error: 'File not found' }

      const stat = await RNFS.stat(filePath)
      const formData = new FormData()
      formData.append('file', {
        uri: `file://${filePath}`,
        name: filePath.split('/').pop() || 'file',
        type: 'application/octet-stream',
      } as any)

      const response = await fetch(uploadUrl, {
        method,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.ok) {
        return { ok: true, url: uploadUrl }
      }
      return { ok: false, error: `Upload failed: ${response.status}` }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  static async listUploads(): Promise<MediaFile[]> {
    const dir = `${RNFS.DocumentDirectoryPath}/StellaAI/uploads`
    if (!(await RNFS.exists(dir))) return []
    const items = await RNFS.readDir(dir)
    return items.map((item, idx) => ({
      id: `up_${idx}`,
      name: item.name,
      path: item.path,
      uri: `file://${item.path}`,
      type: 'document',
      size: item.size,
      mime_type: '',
      created_at: item.mtime ? new Date(item.mtime).getTime() : Date.now(),
      downloaded: true,
      upload_status: 'completed',
    }))
  }
}
