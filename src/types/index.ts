export interface SerialConfig {
  port: string;
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space';
  flowControl: 'none' | 'hardware' | 'software';
}

export interface SerialMessage {
  id: string;
  timestamp: Date;
  direction: 'sent' | 'received';
  content: string;
  type: 'ascii' | 'hex';
}

export interface ConnectionStatus {
  connected: boolean;
  port: string | null;
  error: string | null;
}

export interface SerialStats {
  bytesSent: number;
  bytesReceived: number;
  errorCount: number;
  lastActivity: Date | null;
}

export interface FileTransferStatus {
  isTransferring: boolean;
  isPaused: boolean;
  fileName: string | null;
  fileSize: number;
  progress: number;
}

export interface FileReceiveStatus {
  isReceiving: boolean;
  isPaused: boolean;
  fileName: string | null;
  fileSize: number;
  progress: number;
  data: Uint8Array | null;
}