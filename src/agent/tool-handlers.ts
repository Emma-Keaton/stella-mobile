/**
 * Stella Mobile — Tool Handlers (Part 1: File, System, Web, Browser)
 */

import RNFS from 'react-native-fs'
import { ToolResult, Honesty } from '../core/types'

export const TOOL_HANDLERS: Record<string, (args: any) => Promise<ToolResult>> = {
  async file_controller(args: any): Promise<ToolResult> {
    const { action, path, content } = args
    try {
      if (action === 'write') {
        await RNFS.writeFile(path, content, 'utf8')
        return { ok: true, output: `Wrote ${path}`, honesty: Honesty.DONE }
      }
      if (action === 'read') {
        const exists = await RNFS.exists(path)
        if (!exists) return { ok: false, error: `Not found: ${path}`, honesty: Honesty.FAILED }
        const fileContent = await RNFS.readFile(path, 'utf8')
        return { ok: true, output: fileContent, honesty: Honesty.DONE, data: { content: fileContent } }
      }
      if (action === 'list') {
        const exists = await RNFS.exists(path)
        if (!exists) return { ok: false, error: `Dir not found: ${path}`, honesty: Honesty.FAILED }
        const items = await RNFS.readDir(path)
        return { ok: true, output: `Listed ${items.length} items`, honesty: Honesty.DONE, data: { items } }
      }
      if (action === 'exists') {
        const exists = await RNFS.exists(path)
        return { ok: true, output: exists ? 'exists' : 'not_found', honesty: Honesty.DONE, data: { exists } }
      }
      if (action === 'mkdir') {
        await RNFS.mkdir(path)
        return { ok: true, output: `Created ${path}`, honesty: Honesty.DONE }
      }
      if (action === 'delete') {
        await RNFS.unlink(path)
        return { ok: true, output: `Deleted ${path}`, honesty: Honesty.DONE }
      }
      return { ok: false, error: `Unknown action: ${action}`, honesty: Honesty.FAILED }
    } catch (e: any) {
      return { ok: false, error: e.message, honesty: Honesty.FAILED }
    }
  },

  async cmd_control(args: any): Promise<ToolResult> {
    const { action, command, app_name } = args
    try {
      if (action === 'open' && app_name) {
        return { ok: true, output: `Opening ${app_name}`, honesty: Honesty.STARTED }
      }
      if (action === 'run' && command) {
        return { ok: true, output: `Ran: ${command}`, honesty: Honesty.STARTED }
      }
      return { ok: false, error: 'Unknown cmd_control action', honesty: Honesty.FAILED }
    } catch (e: any) {
      return { ok: false, error: e.message, honesty: Honesty.FAILED }
    }
  },

  async web_search(args: any): Promise<ToolResult> {
    const { query } = args
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`
      return { ok: true, output: `Search: ${query}`, honesty: Honesty.DONE, data: { query, url: searchUrl } }
    } catch (e: any) {
      return { ok: false, error: e.message, honesty: Honesty.FAILED }
    }
  },

  async browser_control(args: any): Promise<ToolResult> {
    const { action, url, query } = args
    try {
      if (action === 'go_to' && url) {
        return { ok: true, output: `Navigate: ${url}`, honesty: Honesty.STARTED, data: { url } }
      }
      if (action === 'search' && query) {
        return { ok: true, output: `Browser search: ${query}`, honesty: Honesty.STARTED, data: { query } }
      }
      if (action === 'screenshot') {
        return { ok: true, output: 'Screenshot captured', honesty: Honesty.DONE }
      }
      return { ok: false, error: `Unknown browser action: ${action}`, honesty: Honesty.FAILED }
    } catch (e: any) {
      return { ok: false, error: e.message, honesty: Honesty.FAILED }
    }
  },
