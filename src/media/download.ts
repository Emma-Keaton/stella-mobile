/**
 * Stella Mobile — Media Download
 * Download media files from external download hub.
 */

import RNFS from 'react-native-fs'
import { MediaFile } from '../core/types'

export class MediaDownloader {
  static async download(url: string, filename?: string, type: MediaFile['type'] = 'document'): Promise<MediaFile> {
    const dir = `${RNFS.DocumentDirectoryPath}/StellaAI/downloads`
    if (!(await RNFS.exists(dir))) await RNFS.mkdir(dir)

    const fileName = filename || url.split('/').pop() || 'download'
    const path = `${dir}/${fileName}`
    const uri = `file://${path}`

    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
      background: true,
    })

    return {
      id: `dl_${Date.now()}`,
      name: fileName,
      path,
      uri,
      type,
      size: 0,
      mime_type: '',
      created_at: Date.now(),
      downloaded: false,
      upload_status: 'pending',
    }
  }

  static async listDownloads(): Promise<MediaFile[]> {
    const dir = `${RNFS.DocumentDirectoryPath}/StellaAI/downloads`
    if (!(await RNFS.exists(dir))) return []
    const items = await RNFS.readDir(dir)
    return items.map((item, idx) => ({
      id: `dl_${idx}`,
      name: item.name,
      path: item.path,
      uri: `file://${item.path}`,
      type: 'document',
      size: item.size,
      mime_type: '',
      created_at: item.mtime ? new Date(item.mtime).getTime() : Date.now(),
      downloaded: true,
      upload_status: 'pending',
    }))
  }

  static async deleteDownload(path: string): Promise<boolean> {
    try {
      await RNFS.unlink(path)
      return true
    } catch {
      return false
    }
  }
}
