import React, { useState, useEffect } from 'react';
import { SerialProvider } from './contexts/SerialContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import SerialConfigPanel from './components/SerialConfigPanel';
import SerialDataPanel from './components/SerialDataPanel';
import SerialInputArea from './components/SerialInputArea';
import { Terminal, Settings, Pin, Minus, Square, X, GripHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ConnectionStatus from './components/ConnectionStatus';
import ToastContainer from './components/ToastContainer';

// 添加类型声明
declare global {
  interface Window {
    electron: {
      windowControl: {
        minimize: () => void
        maximize: () => void
        close: () => void
        setAlwaysOnTop: (isAlwaysOnTop: boolean) => void
        move: (x: number, y: number) => void
        isMaximized: () => Promise<boolean>
      }
      onMaximized: (callback: (isMaximized: boolean) => void) => () => void
    }
  }
}

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showStartup, setShowStartup] = useState(true);
  const [startupMessages, setStartupMessages] = useState<Array<{ text: string; type: 'sent' | 'received' }>>([]);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  
  // Load sidebar position from localStorage or default to left
  const [isSidebarOnLeft, setIsSidebarOnLeft] = useState(() => {
    const saved = localStorage.getItem('sidebarPosition');
    return saved !== 'right';
  });
  
  const [isDragging, setIsDragging] = useState(false);
  
  // Load panel sizes from localStorage or use defaults
  const [configPanelSize, setConfigPanelSize] = useState(() => {
    const saved = localStorage.getItem('configPanelSize');
    return saved ? parseInt(saved, 10) : 25;
  });

  useEffect(() => {
    // Save sidebar position whenever it changes
    localStorage.setItem('sidebarPosition', isSidebarOnLeft ? 'left' : 'right');
  }, [isSidebarOnLeft]);

  useEffect(() => {
    const messages = [
      { text: 'AT', type: 'sent' as const },
      { text: 'OK', type: 'received' as const },
      { text: 'AT+VERSION?', type: 'sent' as const },
      { text: 'VERSION 2.0', type: 'received' as const },
      { text: 'AT+CONNECT', type: 'sent' as const },
      { text: 'CONNECTED', type: 'received' as const }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < messages.length) {
        setStartupMessages(prev => [...prev, messages[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowStartup(false);
        }, 500);
      }
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // 监听窗口最大化状态变化
    const cleanup = window.electron.onMaximized((isMaximized) => {
      setIsMaximized(isMaximized)
    })

    return cleanup
  }, [])

  const handlePanelResize = (sizes: number[]) => {
    // The panel that's being resized will be at index 0 or 2 depending on sidebar position
    const index = isSidebarOnLeft ? 0 : 2;
    const size = sizes[index];
    if (typeof size === 'number') {
      setConfigPanelSize(size);
      localStorage.setItem('configPanelSize', size.toString());
    }
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
    // 在实际应用中，这里会调用窗口API来设置置顶状态
  };

  const handleMinimize = () => {
    window.electron.windowControl.minimize()
  };

  const handleMaximize = () => {
    window.electron.windowControl.maximize()
  };

  const handleClose = () => {
    window.electron.windowControl.close()
  };

  const handleAlwaysOnTop = async () => {
    const newState = !isAlwaysOnTop
    setIsAlwaysOnTop(newState)
    window.electron.windowControl.setAlwaysOnTop(newState)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleDragMove = (moveEvent: MouseEvent) => {
      if (moveEvent.clientX > window.innerWidth / 2) {
        // Moved to the right half of the screen
        setIsSidebarOnLeft(false);
      } else {
        // Moved to the left half of the screen
        setIsSidebarOnLeft(true);
      }
    };
    
    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      const isMaximized = await window.electron.windowControl.isMaximized()
      if (isMaximized) {
        window.electron.windowControl.maximize()
        // 等待一帧以确保窗口已经还原
        await new Promise(resolve => requestAnimationFrame(resolve))
        // 重新计算鼠标位置
        const rect = e.target.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const handleMouseMove = async (e: MouseEvent) => {
          const isMaximized = await window.electron.windowControl.isMaximized()
          if (!isMaximized) {
            window.electron.windowControl.move(e.screenX - x, e.screenY - y)
          }
        }

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return
      }

      const rect = e.target.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const handleMouseMove = async (e: MouseEvent) => {
        const isMaximized = await window.electron.windowControl.isMaximized()
        if (!isMaximized) {
          window.electron.windowControl.move(e.screenX - x, e.screenY - y)
        }
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  const handleDoubleClick = () => {
    handleMaximize();
  };

  // Create a triangle pattern with dots
  const createDotTriangle = (isLeftSide: boolean) => {
    const dotSize = 1.5; // Size of each dot
    const dotSpacing = 3; // Spacing between dots
    const dotColor = '#4B5563'; // Gray-700
    
    return (
      <div 
        className={`absolute top-1 ${isLeftSide ? 'left-1' : 'right-1'} w-6 h-6 cursor-move z-10 flex flex-col items-${isLeftSide ? 'start' : 'end'}`}
        onMouseDown={handleDragStart}
        title="拖动调整位置"
      >
        {/* First row - 1 dot */}
        <div className="flex" style={{ height: `${dotSpacing}px` }}>
          <div 
            style={{ 
              width: `${dotSize}px`, 
              height: `${dotSize}px`, 
              backgroundColor: dotColor,
              borderRadius: '50%'
            }} 
          />
        </div>
        
        {/* Second row - 2 dots */}
        <div className={`flex ${isLeftSide ? '' : 'justify-end'}`} style={{ height: `${dotSpacing}px` }}>
          <div 
            style={{ 
              width: `${dotSize}px`, 
              height: `${dotSize}px`, 
              backgroundColor: dotColor,
              borderRadius: '50%',
              marginRight: isLeftSide ? `${dotSpacing}px` : 0,
              marginLeft: isLeftSide ? 0 : `${dotSpacing}px`
            }} 
          />
          <div 
            style={{ 
              width: `${dotSize}px`, 
              height: `${dotSize}px`, 
              backgroundColor: dotColor,
              borderRadius: '50%'
            }} 
          />
        </div>
        
        {/* Third row - 3 dots */}
        <div className={`flex ${isLeftSide ? '' : 'justify-end'}`} style={{ height: `${dotSpacing}px` }}>
          <div 
            style={{ 
              width: `${dotSize}px`, 
              height: `${dotSize}px`, 
              backgroundColor: dotColor,
              borderRadius: '50%',
              marginRight: isLeftSide ? `${dotSpacing}px` : 0,
              marginLeft: isLeftSide ? 0 : `${dotSpacing}px`
            }} 
          />
          <div 
            style={{ 
              width: `${dotSize}px`, 
              height: `${dotSize}px`, 
              backgroundColor: dotColor,
              borderRadius: '50%',
              marginRight: isLeftSide ? `${dotSpacing}px` : 0,
              marginLeft: isLeftSide ? 0 : `${dotSpacing}px`
            }} 
          />
          <div 
            style={{ 
              width: `${dotSize}px`, 
              height: `${dotSize}px`, 
              backgroundColor: dotColor,
              borderRadius: '50%'
            }} 
          />
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <SerialProvider>
          {showStartup && (
            <div className={`startup-screen ${!showStartup ? 'fade-out' : ''}`}>
              <Terminal className="h-16 w-16 text-white dark:text-gray-900 logo" />
              <h1 className="text-white dark:text-gray-900 text-2xl font-bold mb-2">串口调试工具</h1>
              <div className="startup-messages">
                {startupMessages.map((msg, index) => (
                  msg && msg.type && (
                    <div key={index} className={`message ${msg.type} fade-in`}>
                      {msg.type === 'sent' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                      <span>{msg.text}</span>
                    </div>
                  )
                ))}
              </div>
              <div className="loading-bar"></div>
            </div>
          )}
          
          <div className="flex flex-col h-screen bg-gray-900 dark:bg-white text-white dark:text-gray-900">
            <header 
              className="bg-gray-800 dark:bg-gray-100 border-b border-gray-700 dark:border-gray-200 h-12 flex items-center px-3"
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
            >
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-blue-400 dark:text-blue-600" />
                <h1 className="text-base font-medium">串口调试工具</h1>
                <ConnectionStatus />
              </div>
              <div className="ml-auto flex items-center space-x-1">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 rounded transition-colors"
                  title="设置"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePin}
                  className={`p-1.5 rounded transition-colors ${
                    isPinned
                      ? 'text-blue-400 dark:text-blue-600 hover:text-blue-300 dark:hover:text-blue-700'
                      : 'text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200'
                  }`}
                  title="置顶窗口"
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  onClick={handleMinimize}
                  className="p-1.5 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 rounded transition-colors"
                  title="最小化"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={handleMaximize}
                  className="p-1.5 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 rounded transition-colors"
                  title={isMaximized ? "还原" : "最大化"}
                >
                  <Square className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-600 hover:bg-gray-700 dark:hover:bg-gray-200 rounded transition-colors"
                  title="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            
            <main className="flex-1 flex overflow-hidden">
              <PanelGroup direction="horizontal" onLayout={handlePanelResize}>
                {isSidebarOnLeft ? (
                  <>
                    <Panel defaultSize={configPanelSize} minSize={20} maxSize={40} className="relative">
                      {createDotTriangle(false)}
                      <SerialConfigPanel />
                    </Panel>
                    
                    <PanelResizeHandle className="w-1 bg-gray-700 dark:bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors cursor-col-resize" />
                    
                    <Panel minSize={60}>
                      <div className="flex-1 flex flex-col h-full">
                        <div className="flex-1 overflow-hidden">
                          <SerialDataPanel />
                        </div>
                        <SerialInputArea />
                      </div>
                    </Panel>
                  </>
                ) : (
                  <>
                    <Panel minSize={60}>
                      <div className="flex-1 flex flex-col h-full">
                        <div className="flex-1 overflow-hidden">
                          <SerialDataPanel />
                        </div>
                        <SerialInputArea />
                      </div>
                    </Panel>
                    
                    <PanelResizeHandle className="w-1 bg-gray-700 dark:bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors cursor-col-resize" />
                    
                    <Panel defaultSize={configPanelSize} minSize={20} maxSize={40} className="relative">
                      {createDotTriangle(true)}
                      <SerialConfigPanel />
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </main>

            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            
            {isDragging && (
              <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-gray-800 dark:bg-gray-100 rounded-lg p-4 text-white dark:text-gray-900 shadow-lg">
                  正在拖动面板 - 释放鼠标完成
                </div>
              </div>
            )}
            
            <ToastContainer />
          </div>
        </SerialProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;