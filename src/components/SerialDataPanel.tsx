import React, { useRef, useEffect, useState } from 'react';
import { useSerial } from '../contexts/SerialContext';
import { Trash2, Download, ArrowDownCircle, PauseCircle, Copy, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, ArrowRightCircle, ArrowLeftCircle, Terminal } from 'lucide-react';
import { Element, scroller } from 'react-scroll';
import ContextMenu from './ContextMenu';

const SerialDataPanel: React.FC = () => {
  const { messages, clearMessages, stats, status } = useSerial();
  const [autoScroll, setAutoScroll] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scroller.scrollTo('messagesEnd', {
        duration: 300,
        smooth: true,
        containerId: 'messagesContainer',
        offset: -20
      });
    }
  }, [messages, autoScroll]);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const atBottom = Math.abs(
      element.scrollHeight - element.clientHeight - element.scrollTop
    ) < 50;
    
    setAutoScroll(atBottom);
  };
  
  const saveToFile = () => {
    if (messages.length === 0) return;
    
    const content = messages.map(msg => {
      const time = msg.timestamp.toLocaleTimeString();
      const direction = msg.direction === 'sent' ? '>> ' : '<< ';
      return `[${time}] ${direction}${msg.content}`;
    }).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContextMenu = (e: React.MouseEvent, content: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setSelectedMessage(content);
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage);
    }
  };
  
  const contextMenuItems = [
    {
      icon: <Copy size={16} />,
      label: '复制消息',
      onClick: handleCopyMessage
    },
    {
      icon: <Trash2 size={16} />,
      label: '清除所有消息',
      onClick: clearMessages,
      divider: true
    },
    {
      icon: <Download size={16} />,
      label: '保存到文件',
      onClick: saveToFile
    }
  ];

  const getDirectionIndicator = (direction: 'sent' | 'received', arrowStyle: string) => {
    switch (arrowStyle) {
      case 'arrow':
        return direction === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />;
      case 'chevron':
        return direction === 'sent' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;
      case 'circle':
        return direction === 'sent' ? <ArrowRightCircle size={16} /> : <ArrowLeftCircle size={16} />;
      case 'text':
        return direction === 'sent' ? '>>' : '<<';
      case 'none':
        return '';
      default:
        return direction === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />;
    }
  };

  const currentArrowStyle = localStorage.getItem('arrowStyle') || 'arrow';
  
  return (
    <div className="flex flex-col h-full bg-gray-900 dark:bg-white text-gray-100 dark:text-gray-900">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 dark:bg-gray-100 border-b border-gray-700 dark:border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Terminal className="h-5 w-5 text-blue-400 dark:text-blue-600 mr-2" />
            <span className="font-medium">数据监视</span>
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <span className="inline-flex items-center text-blue-400 dark:text-blue-600">
              {getDirectionIndicator('sent', currentArrowStyle)}
            </span>
            <span>已发送：{stats.bytesSent} 字节</span>
            <span className="ml-2 inline-flex items-center text-green-400 dark:text-green-600">
              {getDirectionIndicator('received', currentArrowStyle)}
            </span>
            <span>已接收：{stats.bytesReceived} 字节</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-md transition-colors ${
              autoScroll 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300'
            }`}
            title={autoScroll ? '自动滚动已启用' : '自动滚动已禁用'}
          >
            {autoScroll ? <ArrowDownCircle size={18} /> : <PauseCircle size={18} />}
          </button>
          <button
            onClick={saveToFile}
            disabled={messages.length === 0}
            className="p-1.5 bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="保存到文件"
          >
            <Download size={18} />
          </button>
          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            className="p-1.5 bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="清除消息"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div 
        id="messagesContainer"
        className="flex-1 p-4 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-gray-700 dark:scrollbar-thumb-gray-300 scrollbar-track-gray-800 dark:scrollbar-track-gray-100 messages-content"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            {status.connected ? '暂无数据' : '请先连接串口'}
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`py-1 px-2 rounded transition-colors ${
                  message.direction === 'sent' 
                    ? 'bg-gray-800/50 dark:bg-gray-100/50 hover:bg-gray-800 dark:hover:bg-gray-200/70' 
                    : 'hover:bg-gray-800/30 dark:hover:bg-gray-100/30'
                }`}
                onContextMenu={(e) => handleContextMenu(e, message.content)}
              >
                <span className="text-gray-400 dark:text-gray-500">
                  [{message.timestamp.toLocaleTimeString()}]
                </span>{' '}
                <span 
                  className={`${
                    message.direction === 'sent' 
                      ? 'text-blue-400 dark:text-blue-600' 
                      : 'text-green-400 dark:text-green-600'
                  }`}
                >
                  {getDirectionIndicator(message.direction, currentArrowStyle)}
                </span>{' '}
                <span className="break-all">{message.content}</span>
              </div>
            ))}
            <Element name="messagesEnd" className="h-5" />
          </div>
        )}
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

export default SerialDataPanel;