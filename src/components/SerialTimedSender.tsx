import React, { useState, useEffect, useRef } from 'react';
import { useSerial } from '../contexts/SerialContext';
import { Clock, Play, Pause, Settings, RotateCcw } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

const SerialTimedSender: React.FC = () => {
  const { sendMessage, status } = useSerial();
  const [timedMessage, setTimedMessage] = useLocalStorage('timedMessage', '');
  const [interval, setInterval] = useLocalStorage('timedInterval', 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [sendCount, setSendCount] = useState(0);
  const [messageType, setMessageType] = useLocalStorage<'ascii' | 'hex'>('timedMessageType', 'ascii');
  const [isDragOver, setIsDragOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!status.connected && isRunning) {
      stopTimedSend();
    }
  }, [status.connected]);
  
  const startTimedSend = () => {
    if (!status.connected || !timedMessage.trim() || isRunning) return;
    
    setIsRunning(true);
    setSendCount(0);
    
    timerRef.current = setInterval(() => {
      sendMessage(timedMessage, messageType);
      setSendCount(prev => prev + 1);
    }, interval);
  };
  
  const stopTimedSend = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };
  
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 100) return;
    setInterval(value);
  };
  
  const resetSettings = () => {
    setTimedMessage('');
    setInterval(1000);
    setMessageType('ascii');
    stopTimedSend();
    setSendCount(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const preset = JSON.parse(data);
        if (preset && preset.content) {
          if (isRunning) {
            stopTimedSend();
          }
          setTimedMessage(preset.content);
          setMessageType(preset.type || 'ascii');
        }
      }
    } catch (error) {
      console.error('Error processing dropped data:', error);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-3">
        <Clock className="mr-2 h-5 w-5 text-blue-400 dark:text-blue-600" />
        <h3 className="text-lg font-medium">定时发送</h3>
      </div>
      
      <div className="space-y-3">
        <div
          className={`relative ${isDragOver ? 'ring-2 ring-blue-500' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center rounded z-10">
              <div className="bg-blue-600 text-white py-1.5 px-3 rounded text-sm">
                释放以使用预设报文
              </div>
            </div>
          )}
          <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
            发送内容
          </label>
          <textarea
            value={timedMessage}
            onChange={(e) => setTimedMessage(e.target.value)}
            disabled={isRunning || !status.connected}
            placeholder="输入要定时发送的内容或从预设报文拖动至此..."
            className="w-full bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          ></textarea>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
              发送间隔 (毫秒)
            </label>
            <input
              type="number"
              value={interval}
              onChange={handleIntervalChange}
              disabled={isRunning || !status.connected}
              min="100"
              step="100"
              className="w-full bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
              类型
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'ascii' | 'hex')}
              disabled={isRunning || !status.connected}
              className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none"
            >
              <option value="ascii">ASCII</option>
              <option value="hex">HEX</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={startTimedSend}
              disabled={!status.connected || !timedMessage.trim()}
              className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded px-3 py-2 transition-colors text-sm"
            >
              <Play size={16} className="mr-2" />
              开始发送
            </button>
          ) : (
            <button
              onClick={stopTimedSend}
              className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded px-3 py-2 transition-colors text-sm"
            >
              <Pause size={16} className="mr-2" />
              停止发送
            </button>
          )}
          
          <button
            onClick={resetSettings}
            disabled={!status.connected}
            className="flex items-center justify-center bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300 disabled:opacity-50 rounded px-3 py-2 transition-colors text-sm"
            title="重置设置"
          >
            <RotateCcw size={16} />
          </button>
        </div>
        
        {isRunning && (
          <div className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-500">
            <span>状态: 正在发送</span>
            <span>已发送次数: {sendCount}</span>
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500">
          提示: 可以从预设报文直接拖拽到此处使用
        </div>
      </div>
    </div>
  );
};

export default SerialTimedSender;