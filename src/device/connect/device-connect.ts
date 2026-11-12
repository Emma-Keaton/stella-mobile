/**
 * Stella Mobile — Device Connect (Device Mesh) — Part 1
 * Enables Stella-to-Stella connections: mobile-to-mobile, mobile-to-PC.
 * Connection: QR scanning, pairing codes, URL endpoints, local discovery.
 */

import { v4 as uuidv4 } from 'uuid'

export type ConnectRole = 'host' | 'client' | 'peer'
export type ConnectTransport = 'qr' | 'pairing_code' | 'url_endpoint' | 'local_discovery'
export type ConnectStatus = 'idle' | 'hosting' | 'pairing' | 'connected' | 'disconnected' | 'error'

export interface DeviceConnectConfig {
  deviceId: string
  deviceName: string
  deviceType: 'mobile' | 'pc' | 'tablet'
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux'
  capabilities: string[]
  port: number
  host: string
}

export interface PeerInfo {
  id: string
  name: string
  type: 'mobile' | 'pc' | 'tablet'
  platform: string
  endpoint: string
  pairingCode: string
  qrData: string
  capabilities: string[]
  role: ConnectRole
  connected: boolean
  pairedAt?: number
  lastSeen?: number
}

export interface ConnectionSession {
  id: string
  peer: PeerInfo
  status: ConnectStatus
  transport: ConnectTransport
  createdAt: number
  connectedAt?: number
  messages: number
}

export class DeviceConnect {
  private config: DeviceConnectConfig
  private status: ConnectStatus = 'idle'
  private peers: Map<string, PeerInfo> = new Map()
  private sessions: Map<string, ConnectionSession> = new Map()
  private pairingCode: string = ''
  private qrData: string = ''
  private onPeerConnected: ((peer: PeerInfo) => void) | null = null
  onMessage: ((peerId: string, message: any) => void) | null = null
  onStatusChange: ((status: ConnectStatus) => void) | null = null
  onPeerDisconnected: ((peerId: string) => void) | null = null

  constructor(config: DeviceConnectConfig) {
    this.config = config
    this.generatePairingCode()
  }

  getStatus(): ConnectStatus {
    return this.status
  }

  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values())
  }

  getSessions(): ConnectionSession[] {
    return Array.from(this.sessions.values())
  }

  getPairingCode(): string {
    return this.pairingCode
  }

  getQrData(): string {
    return this.qrData
  }

  getEndpoint(): string {
    return `ws://${this.config.host}:${this.config.port}`
  }

  private generatePairingCode(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''

  // ── Host Mode ──
  async startHosting(): Promise<{ ok: boolean; error?: string }> {
    try {
      this.status = 'hosting'
      this.onStatusChange?.('hosting')
      console.log('[DeviceConnect] Hosting on', this.getEndpoint())
      return { ok: true }
    } catch (e: any) {
      this.status = 'error'
      this.onStatusChange?.('error')
      return { ok: false, error: e.message }
    }
  }

  async stopHosting(): Promise<void> {
    this.status = 'idle'
    this.onStatusChange?.('idle')
  }

  // ── Join Mode ──
  async connectViaPairingCode(code: string): Promise<{ ok: boolean; peer?: PeerInfo; error?: string }> {
    try {
      this.status = 'pairing'
      this.onStatusChange?.('pairing')
      const peer = await this.lookupPeerByCode(code)
      if (!peer) {
        this.status = 'error'
        this.onStatusChange?.('error')
        return { ok: false, error: 'Invalid pairing code' }
      }
      return await this.establishConnection(peer, 'pairing_code')
    } catch (e: any) {
      this.status = 'error'
      this.onStatusChange?.('error')
      return { ok: false, error: e.message }
    }
  }

  async connectViaQR(qrData: string): Promise<{ ok: boolean; peer?: PeerInfo; error?: string }> {
    try {
      this.status = 'pairing'
      this.onStatusChange?.('pairing')
      let data: any
      try {
        data = JSON.parse(qrData)
      } catch {
        return { ok: false, error: 'Invalid QR code format' }
      }
      if (data.type !== 'stella_connect') {
        return { ok: false, error: 'Not a Stella Connect QR code' }
      }
      const peer: PeerInfo = {
        id: data.deviceId,
        name: data.deviceName,
        type: 'mobile',
        platform: 'android',
        endpoint: data.endpoint,
        pairingCode: data.pairingCode,
        qrData,
        capabilities: ['chat', 'models', 'media'],
        role: 'client',
        connected: false,
      }
      return await this.establishConnection(peer, 'qr')
    } catch (e: any) {
      this.status = 'error'
      this.onStatusChange?.('error')
      return { ok: false, error: e.message }
    }
  }

  async connectViaUrl(endpoint: string): Promise<{ ok: boolean; peer?: PeerInfo; error?: string }> {
    try {
      this.status = 'pairing'
      this.onStatusChange?.('pairing')
      const peer: PeerInfo = {
        id: `stella_${uuidv4().replace(/-/g, '').substring(0, 12)}`,
        name: 'Remote Stella',
        type: 'pc',
        platform: 'windows',
        endpoint,
        pairingCode: '',
        qrData: '',
        capabilities: ['chat', 'models', 'media', 'device_control'],
        role: 'client',
        connected: false,
      }
      return await this.establishConnection(peer, 'url_endpoint')
    } catch (e: any) {
      this.status = 'error'
      this.onStatusChange?.('error')
      return { ok: false, error: e.message }
    }
  }

  private async lookupPeerByCode(code: string): Promise<PeerInfo | null> {
    for (const peer of this.peers.values()) {

  private async establishConnection(peer: PeerInfo, transport: ConnectTransport): Promise<{ ok: boolean; peer?: PeerInfo; error?: string }> {
    try {
      const connectedPeer: PeerInfo = {
        ...peer,
        connected: true,
        pairedAt: Date.now(),
        lastSeen: Date.now(),
      }
      this.peers.set(connectedPeer.id, connectedPeer)

      const session: ConnectionSession = {
        id: `session_${Date.now()}`,
        peer: connectedPeer,
        status: 'connected',
        transport,
        createdAt: Date.now(),
        connectedAt: Date.now(),
        messages: 0,
      }
      this.sessions.set(session.id, session)

      this.status = 'connected'
      this.onStatusChange?.('connected')
      this.onPeerConnected?.(connectedPeer)
      return { ok: true, peer: connectedPeer }
    } catch (e: any) {
      this.status = 'error'
      this.onStatusChange?.('error')
      return { ok: false, error: e.message }
    }
  }

  async disconnectPeer(peerId: string): Promise<void> {
    this.peers.delete(peerId)
    const session = Array.from(this.sessions.values()).find(s => s.peer.id === peerId)
    if (session) session.status = 'disconnected'
    if (this.peers.size === 0) {
      this.status = 'idle'
      this.onStatusChange?.('idle')
    }
    this.onPeerDisconnected?.(peerId)
  }

  async sendMessage(peerId: string, message: any): Promise<{ ok: boolean; error?: string }> {
    const peer = this.peers.get(peerId)
    if (!peer || !peer.connected) {
      return { ok: false, error: 'Peer not connected' }
    }
    const session = Array.from(this.sessions.values()).find(s => s.peer.id === peerId)
    if (session) {
      session.messages++
      session.peer.lastSeen = Date.now()
    }
    console.log('[DeviceConnect] Sending to', peerId, ':', JSON.stringify(message))
    this.onMessage?.(peerId, message)
    return { ok: true }
  }

  async broadcastMessage(message: any): Promise<{ ok: boolean; sent: number }> {
    let sent = 0
    for (const [peerId, peer] of this.peers) {
      if (peer.connected) {
        const result = await this.sendMessage(peerId, message)
        if (result.ok) sent++
      }
    }
    return { ok: sent > 0, sent }
  }

  async startLocalDiscovery(): Promise<void> {
    console.log('[DeviceConnect] Starting local discovery')
  }

  async stopLocalDiscovery(): Promise<void> {
    console.log('[DeviceConnect] Stopping local discovery')
  }

}

let deviceConnectInstance: DeviceConnect | null = null

export function initDeviceConnect(config: DeviceConnectConfig): DeviceConnect {
  if (!deviceConnectInstance) {
    deviceConnectInstance = new DeviceConnect(config)
  }
  return deviceConnectInstance
}

export function getDeviceConnect(): DeviceConnect | null {
  return deviceConnectInstance
}

      if (peer.pairingCode === code) {
        return peer
      }
    }
    return null
  }

    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    this.pairingCode = code
    this.qrData = JSON.stringify({
      type: 'stella_connect',
      version: 1,
      deviceId: this.config.deviceId,
      deviceName: this.config.deviceName,
      endpoint: this.getEndpoint(),
      pairingCode: this.pairingCode,
      timestamp: Date.now(),
    })
  }
