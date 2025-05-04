import React, { useState } from 'react';
import { useSerial, availablePorts, availableBaudRates } from '../contexts/SerialContext';
import { Activity, RefreshCw, Link2, Link2Off, Paperclip, Clock, Settings, MessageSquare, Calculator } from 'lucide-react';
import SerialFileTransfer from './SerialFileTransfer';
import SerialTimedSender from './SerialTimedSender';
import SerialPresetMessages from './SerialPresetMessages';
import SerialChecksumCalculator from './SerialChecksumCalculator';
import { Element, scroller } from 'react-scroll';

const SerialConfigPanel: React.FC = () => {
  const { config, updateConfig, status, connect, disconnect } = useSerial();
  const [scanning, setScanning] = useState(false);
  const [customPort, setCustomPort] = useState(false);
  const [customBaud, setCustomBaud] = useState(false);
  
  const handleConnect = () => {
    if (status.connected) {
      disconnect();
    } else {
      connect();
    }
  };
  
  const simulateScanPorts = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateConfig({ port: e.target.value });
  };

  const handleBaudChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      updateConfig({ baudRate: value });
    }
  };

  const scrollToSection = (section: string) => {
    scroller.scrollTo(section, {
      duration: 500,
      smooth: true,
      containerId: 'configPanelContainer',
      offset: -20
    });
  };
  
  return (
    <div className="bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 border-b border-gray-700 dark:border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => scrollToSection('basic-config')}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors flex items-center"
          >
            <Settings className="mr-1.5 h-4 w-4" />
            基本配置
          </button>
          <button
            onClick={() => scrollToSection('preset-messages')}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors flex items-center"
          >
            <MessageSquare className="mr-1.5 h-4 w-4" />
            预设报文
          </button>
          <button
            onClick={() => scrollToSection('file-transfer')}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors flex items-center"
          >
            <Paperclip className="mr-1.5 h-4 w-4" />
            文件传输
          </button>
          <button
            onClick={() => scrollToSection('timed-sender')}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors flex items-center"
          >
            <Clock className="mr-1.5 h-4 w-4" />
            定时发送
          </button>
          <button
            onClick={() => scrollToSection('checksum-calculator')}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-md hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors flex items-center"
          >
            <Calculator className="mr-1.5 h-4 w-4" />
            校验计算
          </button>
        </div>
      </div>
      
      <div 
        id="configPanelContainer"
        className="flex-1 p-4 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-300 scrollbar-track-gray-700 dark:scrollbar-track-gray-200"
      >
        <Element name="basic-config" className="bg-gray-750 dark:bg-gray-50 rounded-lg p-4 shadow-md">
          <div className="flex items-center mb-3">
            <Settings className="mr-2 h-5 w-5 text-blue-400 dark:text-blue-600" />
            <h3 className="text-lg font-medium">基本配置</h3>
          </div>
          
          <div className="grid gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-300 dark:text-gray-700">串口</label>
                <button
                  onClick={() => setCustomPort(!customPort)}
                  className="text-xs text-blue-400 dark:text-blue-600 hover:text-blue-300 dark:hover:text-blue-700"
                >
                  {customPort ? '选择串口' : '手动输入'}
                </button>
              </div>
              <div className="relative">
                {customPort ? (
                  <input
                    type="text"
                    value={config.port}
                    onChange={handlePortChange}
                    disabled={status.connected}
                    placeholder="输入串口名称"
                    className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                ) : (
                  <select
                    value={config.port}
                    onChange={handlePortChange}
                    disabled={status.connected}
                    className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md pl-3 pr-12 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
                  >
                    <option value="">选择串口</option>
                    {availablePorts.map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                )}
                <button 
                  onClick={simulateScanPorts}
                  disabled={status.connected || scanning}
                  className="absolute right-1 top-1 bottom-1 px-2 bg-gray-600 dark:bg-gray-200 hover:bg-gray-500 dark:hover:bg-gray-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center"
                  title="扫描串口"
                >
                  <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-300 dark:text-gray-700">波特率</label>
                <button
                  onClick={() => setCustomBaud(!customBaud)}
                  className="text-xs text-blue-400 dark:text-blue-600 hover:text-blue-300 dark:hover:text-blue-700"
                >
                  {customBaud ? '选择波特率' : '手动输入'}
                </button>
              </div>
              {customBaud ? (
                <input
                  type="number"
                  value={config.baudRate}
                  onChange={handleBaudChange}
                  disabled={status.connected}
                  placeholder="输入波特率"
                  min="1"
                  className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                <select
                  value={config.baudRate}
                  onChange={handleBaudChange}
                  disabled={status.connected}
                  className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
                >
                  {availableBaudRates.map(rate => (
                    <option key={rate} value={rate}>{rate}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">数据位</label>
              <select
                value={config.dataBits}
                onChange={(e) => updateConfig({ dataBits: Number(e.target.value) as 5 | 6 | 7 | 8 })}
                disabled={status.connected}
                className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
              >
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">停止位</label>
              <select
                value={config.stopBits}
                onChange={(e) => updateConfig({ stopBits: Number(e.target.value) as 1 | 2 })}
                disabled={status.connected}
                className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">校验位</label>
              <select
                value={config.parity}
                onChange={(e) => updateConfig({ parity: e.target.value as 'none' | 'even' | 'odd' | 'mark' | 'space' })}
                disabled={status.connected}
                className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
              >
                <option value="none">无</option>
                <option value="even">偶校验</option>
                <option value="odd">奇校验</option>
                <option value="mark">标记</option>
                <option value="space">空格</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">流控制</label>
              <select
                value={config.flowControl}
                onChange={(e) => updateConfig({ flowControl: e.target.value as 'none' | 'hardware' | 'software' })}
                disabled={status.connected}
                className="bg-gray-700 dark:bg-white text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
              >
                <option value="none">无</option>
                <option value="hardware">硬件</option>
                <option value="software">软件</option>
              </select>
            </div>
            
            <button
              onClick={handleConnect}
              className={`mt-2 py-2 px-4 rounded-md flex items-center justify-center font-medium transition-colors ${
                status.connected 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {status.connected ? (
                <>
                  <Link2Off className="mr-2 h-5 w-5" />
                  断开连接
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-5 w-5" />
                  连接
                </>
              )}
            </button>
          </div>
        </Element>
        
        <Element name="preset-messages" className="bg-gray-750 dark:bg-gray-50 rounded-lg p-4 shadow-md">
          <SerialPresetMessages />
        </Element>
        
        <Element name="file-transfer" className="bg-gray-750 dark:bg-gray-50 rounded-lg p-4 shadow-md">
          <SerialFileTransfer />
        </Element>
        
        <Element name="timed-sender" className="bg-gray-750 dark:bg-gray-50 rounded-lg p-4 shadow-md">
          <SerialTimedSender />
        </Element>

        <Element name="checksum-calculator" className="bg-gray-750 dark:bg-gray-50 rounded-lg p-4 shadow-md">
          <SerialChecksumCalculator />
        </Element>
      </div>
    </div>
  );
}

export default SerialConfigPanel;