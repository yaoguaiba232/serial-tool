import React, { useState, useRef } from 'react';
import { useSerial } from '../contexts/SerialContext';
import { File, UploadCloud, Paperclip, Pause, Play, Square, Clock, Download, Save } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const SerialFileTransfer: React.FC = () => {
  const { sendFile, pauseFileTransfer, resumeFileTransfer, stopFileTransfer, status, fileTransferStatus, startFileReceive, stopFileReceive, pauseFileReceive, resumeFileReceive, fileReceiveStatus } = useSerial();
  const { error } = useToast();
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const receiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const receiveStartTimeRef = useRef<number>(0);
  const [receiveElapsedTime, setReceiveElapsedTime] = useState(0);

  // Check if we're in an active file transfer
  const isTransferring = fileTransferStatus.isTransferring;
  const isPaused = fileTransferStatus.isPaused;
  
  // Check if we're receiving a file
  const isReceiving = fileReceiveStatus.isReceiving;
  const isReceivePaused = fileReceiveStatus.isPaused;
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setFileSize(file.size);
  };

  const startTimer = () => {
    startTimeRef.current = Date.now() - elapsedTime;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      pausedTimeRef.current = elapsedTime;
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedTime(0);
  };

  const startReceiveTimer = () => {
    receiveStartTimeRef.current = Date.now() - receiveElapsedTime;
    
    if (receiveTimerRef.current) {
      clearInterval(receiveTimerRef.current);
    }
    
    receiveTimerRef.current = setInterval(() => {
      setReceiveElapsedTime(Date.now() - receiveStartTimeRef.current);
    }, 1000);
  };

  const pauseReceiveTimer = () => {
    if (receiveTimerRef.current) {
      clearInterval(receiveTimerRef.current);
    }
  };

  const stopReceiveTimer = () => {
    if (receiveTimerRef.current) {
      clearInterval(receiveTimerRef.current);
      receiveTimerRef.current = null;
    }
    setReceiveElapsedTime(0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateSpeed = (progress: number, size: number, time: number) => {
    if (time === 0 || progress === 0) return '0 KB/s';
    
    const secondsElapsed = time / 1000;
    const bytesTransferred = size * (progress / 100);
    const bytesPerSecond = bytesTransferred / secondsElapsed;
    
    if (bytesPerSecond < 1024) {
      return `${bytesPerSecond.toFixed(1)} B/s`;
    } else if (bytesPerSecond < 1024 * 1024) {
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    } else {
      return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
    }
  };

  const handleFileSend = async () => {
    if (!fileInputRef.current?.files?.[0] || !status.connected) return;
    
    const file = fileInputRef.current.files[0];
    setUploadProgress(0);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    startTimer();
    
    try {
      const updateProgress = (progress: number) => {
        setUploadProgress(progress);
      };
      
      await sendFile(file, updateProgress);
      stopTimer();
      setFileName('');
      fileInputRef.current.value = '';
    } catch (err) {
      console.error('File upload failed:', err);
      stopTimer();
      if (err instanceof Error && err.message !== 'Transfer stopped') {
        error('文件传输失败: ' + err.message);
      }
    }
  };

  const handleStartReceive = () => {
    if (!status.connected) return;
    
    startFileReceive();
    setReceiveElapsedTime(0);
    startReceiveTimer();
  };

  const handlePauseResumeReceive = () => {
    if (isReceivePaused) {
      resumeFileReceive();
      startReceiveTimer();
    } else {
      pauseFileReceive();
      pauseReceiveTimer();
    }
  };

  const handleStopReceive = () => {
    stopFileReceive();
    stopReceiveTimer();
  };

  const handleSaveReceivedFile = () => {
    // Simulate a file save dialog
    // In a real app, we would use the File System Access API or other methods
    // Here we'll just simulate downloading the file
    const blob = new Blob([fileReceiveStatus.data || ''], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileReceiveStatus.fileName || `received_file_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeFileTransfer();
      startTimer();
    } else {
      pauseFileTransfer();
      pauseTimer();
    }
  };

  const handleStop = () => {
    stopFileTransfer();
    stopTimer();
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };

  return (
    <div>
      <div className="flex items-center mb-3">
        <Paperclip className="mr-2 h-5 w-5 text-blue-400 dark:text-blue-600" />
        <h3 className="text-lg font-medium">文件传输</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-300 dark:text-gray-700">文件发送</h4>
        </div>
        
        {!isTransferring ? (
          <>
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={!status.connected}
                className="flex items-center w-full bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 disabled:opacity-50 hover:bg-gray-600 dark:hover:bg-gray-100 transition-colors text-sm"
              >
                <File size={16} className="mr-2" />
                {fileName ? `${fileName} (${formatFileSize(fileSize)})` : '选择文件'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleFileSend}
              disabled={!status.connected || !fileName}
              className="flex items-center w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded px-3 py-2 transition-colors text-sm"
            >
              <UploadCloud size={16} className="mr-2" />
              发送文件
            </button>
          </>
        ) : (
          <div className="bg-gray-700 dark:bg-gray-200 p-3 rounded-md">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-gray-300 dark:text-gray-700 truncate flex-1">
                <p className="truncate">{fileName}</p>
                <div className="flex items-center mt-0.5 text-xs">
                  <Clock size={12} className="mr-1 text-gray-400 dark:text-gray-500" />
                  <span>{formatTime(elapsedTime)} | {calculateSpeed(uploadProgress, fileSize, elapsedTime)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={handlePauseResume}
                  className={`p-1.5 rounded-md ${
                    isPaused 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                  title={isPaused ? "继续传输" : "暂停传输"}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  title="停止传输"
                >
                  <Square size={14} />
                </button>
              </div>
            </div>
            
            <div>
              <div className="h-2 bg-gray-600 dark:bg-gray-300 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ease-in-out ${
                    isPaused ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
              <div className="text-xs mt-1 flex justify-between text-gray-400 dark:text-gray-500">
                <span>{uploadProgress}% 已发送</span>
                <span>{formatFileSize(fileSize * uploadProgress / 100)} / {formatFileSize(fileSize)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-700 dark:border-gray-200 pt-3 mt-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-300 dark:text-gray-700">文件接收</h4>
          </div>
          
          {!isReceiving ? (
            <button
              type="button"
              onClick={handleStartReceive}
              disabled={!status.connected}
              className="flex items-center w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-3 py-2 transition-colors text-sm"
            >
              <Download size={16} className="mr-2" />
              开始接收文件
            </button>
          ) : (
            <div className="bg-gray-700 dark:bg-gray-200 p-3 rounded-md">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-300 dark:text-gray-700 truncate flex-1">
                  <p className="truncate">{fileReceiveStatus.fileName || "正在接收文件..."}</p>
                  <div className="flex items-center mt-0.5 text-xs">
                    <Clock size={12} className="mr-1 text-gray-400 dark:text-gray-500" />
                    <span>{formatTime(receiveElapsedTime)} | {calculateSpeed(fileReceiveStatus.progress, fileReceiveStatus.fileSize, receiveElapsedTime)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={handlePauseResumeReceive}
                    className={`p-1.5 rounded-md ${
                      isReceivePaused 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                    title={isReceivePaused ? "继续接收" : "暂停接收"}
                  >
                    {isReceivePaused ? <Play size={14} /> : <Pause size={14} />}
                  </button>
                  <button
                    onClick={handleStopReceive}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    title="停止接收"
                  >
                    <Square size={14} />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="h-2 bg-gray-600 dark:bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ease-in-out ${
                      isReceivePaused ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${fileReceiveStatus.progress}%` }} 
                  />
                </div>
                <div className="text-xs mt-1 flex justify-between text-gray-400 dark:text-gray-500">
                  <span>{fileReceiveStatus.progress}% 已接收</span>
                  <span>
                    {formatFileSize(fileReceiveStatus.fileSize * fileReceiveStatus.progress / 100)} / 
                    {fileReceiveStatus.fileSize ? formatFileSize(fileReceiveStatus.fileSize) : '未知'}
                  </span>
                </div>
              </div>
              
              {fileReceiveStatus.progress === 100 && (
                <button
                  onClick={handleSaveReceivedFile}
                  className="mt-2 flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1.5 transition-colors text-sm"
                >
                  <Save size={14} className="mr-1.5" />
                  保存文件
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 dark:text-gray-500">
          支持所有类型的文件传输，可以暂停和停止传输过程。接收完成后可选择保存位置。
        </div>
      </div>
    </div>
  );
};

export default SerialFileTransfer;