import React from 'react';
import { useSerial } from '../contexts/SerialContext';

const StatusBar: React.FC = () => {
  const { status, config } = useSerial();
  
  return (
    <div className="bg-gray-900 text-gray-300 border-t border-gray-700 px-4 py-1 text-xs flex items-center">
      <div className="flex items-center">
        <div 
          className={`h-2 w-2 rounded-full mr-2 ${
            status.connected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span>
          {status.connected 
            ? `已连接到 ${status.port}` 
            : '未连接'
          }
        </span>
      </div>
      
      {status.connected && (
        <div className="ml-6 flex space-x-4">
          <span>{config.baudRate} 波特</span>
          <span>{config.dataBits}-{config.parity.charAt(0).toUpperCase()}-{config.stopBits}</span>
          <span>流控：{config.flowControl === 'none' ? '无' : config.flowControl === 'hardware' ? '硬件' : '软件'}</span>
        </div>
      )}
      
      {status.error && (
        <div className="ml-auto text-red-400">
          错误：{status.error}
        </div>
      )}
    </div>
  );
};

export default StatusBar;