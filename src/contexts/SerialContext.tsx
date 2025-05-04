import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { SerialConfig, SerialMessage, ConnectionStatus, SerialStats, FileTransferStatus, FileReceiveStatus } from '../types';
import { useToast } from './ToastContext';

interface SerialContextType {
  config: SerialConfig;
  updateConfig: (config: Partial<SerialConfig>) => void;
  messages: SerialMessage[];
  sendMessage: (content: string, type: 'ascii' | 'hex') => void;
  sendFile: (file: File, progressCallback: (progress: number) => void) => Promise<void>;
  pauseFileTransfer: () => void;
  resumeFileTransfer: () => void;
  stopFileTransfer: () => void;
  startFileReceive: () => void;
  pauseFileReceive: () => void;
  resumeFileReceive: () => void;
  stopFileReceive: () => void;
  clearMessages: () => void;
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  stats: SerialStats;
  commandHistory: string[];
  addToHistory: (command: string) => void;
  fileTransferStatus: FileTransferStatus;
  fileReceiveStatus: FileReceiveStatus;
}

// Load saved configuration from localStorage or use defaults
const getSavedConfig = (): SerialConfig => {
  try {
    const savedConfig = localStorage.getItem('serialConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (e) {
    console.error('Error loading saved serial configuration:', e);
  }
  
  return {
    port: '',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none'
  };
};

const defaultStatus: ConnectionStatus = {
  connected: false,
  port: null,
  error: null
};

const defaultStats: SerialStats = {
  bytesSent: 0,
  bytesReceived: 0,
  errorCount: 0,
  lastActivity: null
};

const defaultFileTransferStatus: FileTransferStatus = {
  isTransferring: false,
  isPaused: false,
  fileName: null,
  fileSize: 0,
  progress: 0
};

const defaultFileReceiveStatus: FileReceiveStatus = {
  isReceiving: false,
  isPaused: false,
  fileName: null,
  fileSize: 0,
  progress: 0,
  data: null
};

const SerialContext = createContext<SerialContextType | undefined>(undefined);

export const availablePorts = ['COM1', 'COM2', 'COM3', '/dev/ttyUSB0', '/dev/ttyACM0'];
export const availableBaudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export const SerialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [config, setConfig] = useState<SerialConfig>(getSavedConfig);
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>(defaultStatus);
  const [stats, setStats] = useState<SerialStats>(defaultStats);
  const [fileTransferStatus, setFileTransferStatus] = useState<FileTransferStatus>(defaultFileTransferStatus);
  const [fileReceiveStatus, setFileReceiveStatus] = useState<FileReceiveStatus>(defaultFileReceiveStatus);
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('commandHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Refs for managing file transfer state
  const fileTransferCancelRef = useRef<boolean>(false);
  const fileTransferPauseRef = useRef<boolean>(false);
  const transferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for managing file receive state
  const fileReceiveCancelRef = useRef<boolean>(false);
  const fileReceivePauseRef = useRef<boolean>(false);
  const receiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const receivedDataRef = useRef<Uint8Array | null>(null);
  
  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('serialConfig', JSON.stringify(config));
  }, [config]);
  
  // Save command history to localStorage
  useEffect(() => {
    localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
  }, [commandHistory]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (status.connected) {
      interval = setInterval(() => {
        if (Math.random() < 0.3) {
          const now = new Date();
          const mockResponse = `RESPONSE [${now.toISOString()}]: Status OK`;
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: now,
            direction: 'received',
            content: mockResponse,
            type: 'ascii'
          }]);
          
          setStats(prev => ({
            ...prev,
            bytesReceived: prev.bytesReceived + mockResponse.length,
            lastActivity: now
          }));
        }
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.connected]);
  
  const updateConfig = (newConfig: Partial<SerialConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };
  
  const sendMessage = (content: string, type: 'ascii' | 'hex') => {
    if (!content.trim()) return;
    
    if (!status.connected) {
      showToast('error', '未连接到串口，无法发送消息', 3000);
      return;
    }
    
    const message: SerialMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      direction: 'sent',
      content,
      type
    };
    
    setMessages(prev => [...prev, message]);
    addToHistory(content);
    
    setStats(prev => ({
      ...prev,
      bytesSent: prev.bytesSent + content.length,
      lastActivity: new Date()
    }));
  };

  const pauseFileTransfer = () => {
    if (fileTransferStatus.isTransferring) {
      fileTransferPauseRef.current = true;
      setFileTransferStatus(prev => ({
        ...prev,
        isPaused: true
      }));
      showToast('info', '文件传输已暂停', 2000);
    }
  };

  const resumeFileTransfer = () => {
    if (fileTransferStatus.isTransferring && fileTransferStatus.isPaused) {
      fileTransferPauseRef.current = false;
      setFileTransferStatus(prev => ({
        ...prev,
        isPaused: false
      }));
      showToast('info', '文件传输已恢复', 2000);
    }
  };

  const stopFileTransfer = () => {
    if (fileTransferStatus.isTransferring) {
      fileTransferCancelRef.current = true;
      
      // Reset timeouts
      if (transferTimeoutRef.current) {
        clearTimeout(transferTimeoutRef.current);
        transferTimeoutRef.current = null;
      }
      
      setFileTransferStatus(defaultFileTransferStatus);
      showToast('warning', '文件传输已停止', 2000);
      
      const stopMessage: SerialMessage = {
        id: Date.now().toString(),
        timestamp: new Date(),
        direction: 'sent',
        content: `文件传输已手动停止: ${fileTransferStatus.fileName}`,
        type: 'ascii'
      };
      setMessages(prev => [...prev, stopMessage]);
    }
  };

  // File receiving functions
  const startFileReceive = () => {
    if (!status.connected) {
      showToast('error', '未连接到串口，无法接收文件', 3000);
      return;
    }

    // Reset receive state
    fileReceiveCancelRef.current = false;
    fileReceivePauseRef.current = false;
    receivedDataRef.current = new Uint8Array();
    
    // Update status
    setFileReceiveStatus({
      isReceiving: true,
      isPaused: false,
      fileName: "incoming_file.bin", // Default name, can be updated as metadata is received
      fileSize: 0, // Will be updated as metadata is received
      progress: 0,
      data: null
    });

    // Log file receiving start
    const startMessage: SerialMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      direction: 'received',
      content: `开始接收文件...`,
      type: 'ascii'
    };
    setMessages(prev => [...prev, startMessage]);

    // Simulate receiving a file with random size
    const simulatedFileSize = Math.floor(Math.random() * 10000000) + 100000; // 100KB to 10MB
    const simulatedFileName = `received_file_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.bin`;
    
    // Update with "metadata"
    setTimeout(() => {
      setFileReceiveStatus(prev => ({
        ...prev,
        fileName: simulatedFileName,
        fileSize: simulatedFileSize
      }));
      
      // Simulate receiving chunks
      simulateFileReceive(simulatedFileSize);
    }, 500);
  };

  const simulateFileReceive = (totalSize: number) => {
    const totalChunks = Math.ceil(totalSize / 1024); // 1KB chunks
    let currentChunk = 0;
    let buffer = new Uint8Array(totalSize);
    
    const receiveNextChunk = () => {
      // Check if transfer was canceled
      if (fileReceiveCancelRef.current) {
        return;
      }
      
      // If paused, wait and check again
      if (fileReceivePauseRef.current) {
        receiveTimeoutRef.current = setTimeout(receiveNextChunk, 100);
        return;
      }
      
      currentChunk++;
      const progress = Math.min(Math.round((currentChunk / totalChunks) * 100), 100);
      
      // Generate random data for this chunk
      const chunkSize = Math.min(1024, totalSize - (currentChunk - 1) * 1024);
      const randomData = new Uint8Array(chunkSize);
      crypto.getRandomValues(randomData);
      
      // Store the data in the buffer
      buffer.set(randomData, (currentChunk - 1) * 1024);
      
      // Update receive status
      setFileReceiveStatus(prev => ({
        ...prev,
        progress,
        data: buffer
      }));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        bytesReceived: prev.bytesReceived + chunkSize,
        lastActivity: new Date()
      }));
      
      // Continue if not complete
      if (currentChunk < totalChunks) {
        receiveTimeoutRef.current = setTimeout(receiveNextChunk, 50);
      } else {
        // Complete
        const completionMessage: SerialMessage = {
          id: Date.now().toString(),
          timestamp: new Date(),
          direction: 'received',
          content: `文件接收完成: ${fileReceiveStatus.fileName} (${totalSize} 字节)`,
          type: 'ascii'
        };
        setMessages(prev => [...prev, completionMessage]);
        showToast('success', `文件接收完成: ${fileReceiveStatus.fileName}`, 3000);
      }
    };
    
    // Start receiving
    receiveNextChunk();
  };

  const pauseFileReceive = () => {
    if (fileReceiveStatus.isReceiving) {
      fileReceivePauseRef.current = true;
      setFileReceiveStatus(prev => ({
        ...prev,
        isPaused: true
      }));
      showToast('info', '文件接收已暂停', 2000);
    }
  };

  const resumeFileReceive = () => {
    if (fileReceiveStatus.isReceiving && fileReceiveStatus.isPaused) {
      fileReceivePauseRef.current = false;
      setFileReceiveStatus(prev => ({
        ...prev,
        isPaused: false
      }));
      showToast('info', '文件接收已恢复', 2000);
    }
  };

  const stopFileReceive = () => {
    if (fileReceiveStatus.isReceiving) {
      fileReceiveCancelRef.current = true;
      
      // Reset timeouts
      if (receiveTimeoutRef.current) {
        clearTimeout(receiveTimeoutRef.current);
        receiveTimeoutRef.current = null;
      }
      
      const wasComplete = fileReceiveStatus.progress === 100;
      
      if (!wasComplete) {
        setFileReceiveStatus(defaultFileReceiveStatus);
        showToast('warning', '文件接收已停止', 2000);
        
        const stopMessage: SerialMessage = {
          id: Date.now().toString(),
          timestamp: new Date(),
          direction: 'received',
          content: `文件接收已手动停止: ${fileReceiveStatus.fileName}`,
          type: 'ascii'
        };
        setMessages(prev => [...prev, stopMessage]);
      }
    }
  };

  const sendFile = async (file: File, progressCallback: (progress: number) => void): Promise<void> => {
    if (!status.connected) {
      showToast('error', '未连接到串口，无法发送文件', 3000);
      throw new Error('未连接到串口');
    }

    // Reset transfer state
    fileTransferCancelRef.current = false;
    fileTransferPauseRef.current = false;
    
    // Update status
    setFileTransferStatus({
      isTransferring: true,
      isPaused: false,
      fileName: file.name,
      fileSize: file.size,
      progress: 0
    });

    // Log file sending start
    const startMessage: SerialMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      direction: 'sent',
      content: `开始发送文件: ${file.name} (${file.size} 字节)`,
      type: 'ascii'
    };
    setMessages(prev => [...prev, startMessage]);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result;
          if (!fileContent || typeof fileContent !== 'string' && !(fileContent instanceof ArrayBuffer)) {
            throw new Error('无法读取文件内容');
          }
          
          // For simulation, we'll pretend to send chunks with progress updates
          const totalSize = file.size;
          const chunkSize = 1024; // 1KB chunks
          const totalChunks = Math.ceil(totalSize / chunkSize);
          let currentChunk = 0;
          
          // If it's text, we can get it directly
          let content: string | ArrayBuffer;
          if (typeof fileContent === 'string') {
            content = fileContent;
          } else {
            content = fileContent;
          }
          
          // Simulate sending the file in chunks
          for (let i = 0; i < totalChunks; i++) {
            // Check if transfer was canceled
            if (fileTransferCancelRef.current) {
              throw new Error('Transfer stopped');
            }
            
            // Handle pause
            while (fileTransferPauseRef.current) {
              if (fileTransferCancelRef.current) {
                throw new Error('Transfer stopped');
              }
              // Wait for pause to be lifted
              await new Promise(r => setTimeout(r, 100));
            }
            
            // Simulate network delay
            await new Promise(r => {
              transferTimeoutRef.current = setTimeout(r, 50);
            });
            
            currentChunk++;
            const progress = Math.round((currentChunk / totalChunks) * 100);
            progressCallback(progress);
            
            // Update global file transfer status
            setFileTransferStatus(prev => ({
              ...prev,
              progress
            }));
            
            // In a real implementation, you would send the actual chunk here
            // For simulation, we'll just update the stats
            setStats(prev => ({
              ...prev,
              bytesSent: prev.bytesSent + (i === totalChunks - 1 ? totalSize % chunkSize || chunkSize : chunkSize),
              lastActivity: new Date()
            }));
          }
          
          // Reset file transfer status
          setFileTransferStatus(defaultFileTransferStatus);
          
          // Log file sending completion
          const completionMessage: SerialMessage = {
            id: Date.now().toString(),
            timestamp: new Date(),
            direction: 'sent',
            content: `文件发送完成: ${file.name} (${file.size} 字节)`,
            type: 'ascii'
          };
          setMessages(prev => [...prev, completionMessage]);
          
          showToast('success', `文件 ${file.name} 发送成功`, 3000);
          resolve();
        } catch (err) {
          // Reset file transfer status
          setFileTransferStatus(defaultFileTransferStatus);
          
          // Only show error message if it wasn't a manual cancel
          if (!(err instanceof Error) || err.message !== 'Transfer stopped') {
            // Log error
            const errorMessage: SerialMessage = {
              id: Date.now().toString(),
              timestamp: new Date(),
              direction: 'sent',
              content: `文件发送失败: ${file.name} - ${err instanceof Error ? err.message : '未知错误'}`,
              type: 'ascii'
            };
            setMessages(prev => [...prev, errorMessage]);
            
            showToast('error', `文件发送失败: ${err instanceof Error ? err.message : '未知错误'}`, 3000);
            
            setStats(prev => ({
              ...prev,
              errorCount: prev.errorCount + 1
            }));
          }
          
          reject(err);
        }
      };
      
      reader.onerror = () => {
        // Reset file transfer status
        setFileTransferStatus(defaultFileTransferStatus);
        
        reject(new Error('文件读取失败'));
        
        // Log error
        const errorMessage: SerialMessage = {
          id: Date.now().toString(),
          timestamp: new Date(),
          direction: 'sent',
          content: `文件读取失败: ${file.name}`,
          type: 'ascii'
        };
        setMessages(prev => [...prev, errorMessage]);
        
        showToast('error', `文件读取失败: ${file.name}`, 3000);
        
        setStats(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1
        }));
      };
      
      // Read the file as text or binary based on file type
      const isTextFile = /\.(txt|log|csv|json|xml|html|css|js|ts|md)$/i.test(file.name);
      if (isTextFile) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };
  
  const clearMessages = () => {
    setMessages([]);
    setStats(defaultStats);
    showToast('info', '消息已清除', 2000);
  };
  
  const connect = () => {
    if (!config.port.trim()) {
      showToast('error', '请输入串口名称', 3000);
      setStatus(prev => ({
        ...prev,
        error: '请输入串口名称'
      }));
      return;
    }

    if (!config.baudRate || config.baudRate <= 0) {
      showToast('error', '请输入有效的波特率', 3000);
      setStatus(prev => ({
        ...prev,
        error: '请输入有效的波特率'
      }));
      return;
    }
    
    showToast('info', `正在连接到 ${config.port}...`, 2000);
    
    setStatus({
      connected: false,
      port: config.port,
      error: null
    });
    
    setTimeout(() => {
      if (Math.random() < 0.1) {
        const errorMsg = `无法连接到 ${config.port}`;
        showToast('error', errorMsg, 3000);
        
        setStatus({
          connected: false,
          port: null,
          error: errorMsg
        });
        
        setStats(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1
        }));
      } else {
        const successMsg = `已成功连接到 ${config.port}`;
        showToast('success', successMsg, 3000);
        
        setStatus({
          connected: true,
          port: config.port,
          error: null
        });
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          timestamp: new Date(),
          direction: 'received',
          content: `已连接到 ${config.port}，波特率 ${config.baudRate}`,
          type: 'ascii'
        }]);
      }
    }, 800);
  };
  
  const disconnect = () => {
    if (status.connected) {
      // Stop any active file transfer
      if (fileTransferStatus.isTransferring) {
        stopFileTransfer();
      }
      
      // Stop any active file receive
      if (fileReceiveStatus.isReceiving) {
        stopFileReceive();
      }
      
      const disconnectMsg = `已断开与 ${status.port} 的连接`;
      showToast('info', disconnectMsg, 3000);
      
      setStatus({
        connected: false,
        port: null,
        error: null
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date(),
        direction: 'received',
        content: disconnectMsg,
        type: 'ascii'
      }]);
    }
  };
  
  const addToHistory = (command: string) => {
    if (commandHistory.length === 0 || commandHistory[0] !== command) {
      const newHistory = [command, ...commandHistory.slice(0, 19)];
      setCommandHistory(newHistory);
    }
  };
  
  const value: SerialContextType = {
    config,
    updateConfig,
    messages,
    sendMessage,
    sendFile,
    pauseFileTransfer,
    resumeFileTransfer,
    stopFileTransfer,
    startFileReceive,
    pauseFileReceive,
    resumeFileReceive,
    stopFileReceive,
    clearMessages,
    status,
    connect,
    disconnect,
    stats,
    commandHistory,
    addToHistory,
    fileTransferStatus,
    fileReceiveStatus
  };
  
  return (
    <SerialContext.Provider value={value}>
      {children}
    </SerialContext.Provider>
  );
};

export const useSerial = (): SerialContextType => {
  const context = useContext(SerialContext);
  if (context === undefined) {
    throw new Error('useSerial must be used within a SerialProvider');
  }
  return context;
};