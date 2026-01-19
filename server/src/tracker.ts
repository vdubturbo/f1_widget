import { WebSocket } from 'ws';

interface ConnectionInfo {
  connectedAt: Date;
  lastPing: Date;
}

class ConnectionTracker {
  private connections: Map<WebSocket, ConnectionInfo> = new Map();
  private peakConnections: number = 0;
  private peakTime: Date = new Date();
  private startTime: Date = new Date();

  add(ws: WebSocket): void {
    this.connections.set(ws, {
      connectedAt: new Date(),
      lastPing: new Date(),
    });

    // Update peak if needed
    if (this.connections.size > this.peakConnections) {
      this.peakConnections = this.connections.size;
      this.peakTime = new Date();
    }

    console.log(`[Tracker] Connection added. Active: ${this.connections.size}`);
  }

  remove(ws: WebSocket): void {
    this.connections.delete(ws);
    console.log(`[Tracker] Connection removed. Active: ${this.connections.size}`);
  }

  updatePing(ws: WebSocket): void {
    const info = this.connections.get(ws);
    if (info) {
      info.lastPing = new Date();
    }
  }

  getStats() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      app: 'f1-dashboard',
      status: 'operational',
      connections: {
        current: this.connections.size,
        peak: this.peakConnections,
        peakTime: this.peakTime.toISOString(),
      },
      uptime: {
        seconds: uptimeSeconds,
        formatted: this.formatUptime(uptimeSeconds),
      },
      startedAt: this.startTime.toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : '< 1m';
  }
}

export const tracker = new ConnectionTracker();
