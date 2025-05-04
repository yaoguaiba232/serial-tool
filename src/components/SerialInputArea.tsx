import React, { useState, useRef, useEffect } from 'react';
import { useSerial } from '../contexts/SerialContext';
import { Send, ChevronUp, ChevronDown, RefreshCcw, GripVertical, Copy, RotateCcw } from 'lucide-react';
import ContextMenu from './ContextMenu';

const SerialInputArea: React.FC = () => {
  const { sendMessage, status, commandHistory } = useSerial();
  const [input, setInput] = useState('');
  const [messageType, setMessageType] = useState<'ascii' | 'hex'>('ascii');
  const [showHistory, setShowHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [startHeight, setStartHeight] = useState(0);
  const [startY, setStartY] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !status.connected) return;
    
    sendMessage(input, messageType);
    setInput('');
    setHistoryIndex(-1);
    inputRef.current?.focus();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey && e.key === 'Enter') || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    
    if (e.key === 'ArrowUp' && historyIndex < commandHistory.length - 1) {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(newIndex >= 0 ? commandHistory[newIndex] : '');
    }
  };
  
  const selectHistoryItem = (command: string) => {
    setInput(command);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      setIsDragging(true);
      setStartHeight(inputRef.current.offsetHeight);
      setStartY(e.clientY);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && inputRef.current) {
      const deltaY = startY - e.clientY;
      const newHeight = Math.min(Math.max(44, startHeight + deltaY), 300);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCopyInput = () => {
    if (input) {
      navigator.clipboard.writeText(input);
    }
  };

  const contextMenuItems = [
    {
      icon: <Copy size={16} />,
      label: '复制',
      onClick: handleCopyInput
    },
    {
      icon: <RotateCcw size={16} />,
      label: '清空输入',
      onClick: () => setInput('')
    }
  ];
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startHeight, startY]);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  return (
    <div className="bg-gray-800 dark:bg-gray-100 border-t border-gray-700 dark:border-gray-200">
      <div className="p-2">
        <form onSubmit={handleSubmit} className="flex items-start">
          <div className="flex-none mr-2">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'ascii' | 'hex')}
              className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 text-sm rounded px-2 py-2 h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ascii">ASCII</option>
              <option value="hex">HEX</option>
            </select>
          </div>
          
          <div className="relative flex-1">
            <div className="relative">
              <button
                type="button"
                onMouseDown={handleMouseDown}
                className="absolute -top-2 -left-2 cursor-ns-resize p-2 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 z-10"
              >
                <GripVertical size={14} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onContextMenu={handleContextMenu}
                placeholder={status.connected ? "输入要发送的消息..." : "请先连接串口"}
                disabled={!status.connected}
                className="w-full bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded px-3 py-2 min-h-[2.75rem] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 font-mono"
                style={{ resize: 'none', height: '44px' }}
              />
            </div>
            
            {commandHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="absolute right-2 top-2 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 transition-colors"
              >
                {showHistory ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
            
            {showHistory && commandHistory.length > 0 && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-gray-700 dark:bg-white border border-gray-600 dark:border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                {commandHistory.map((cmd, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectHistoryItem(cmd)}
                    className="block w-full text-left px-3 py-2 text-sm text-white dark:text-gray-900 hover:bg-gray-600 dark:hover:bg-gray-100 font-mono border-b border-gray-600 dark:border-gray-200 last:border-b-0"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!status.connected || !input.trim()}
            className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center justify-center transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <div className="px-2 py-1.5 border-t border-gray-700/50 dark:border-gray-200/50 flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <div>按回车发送，Shift+回车换行</div>
        <div className="flex space-x-4">
          <button 
            type="button" 
            className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 flex items-center transition-colors"
            onClick={() => setInput('')}
            disabled={!input}
          >
            <RefreshCcw size={14} className="mr-1" />
            清空输入
          </button>
          <div>
            上/下方向键浏览历史
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default SerialInputArea;