import React from 'react';
import { useSerial } from '../contexts/SerialContext';

const ConnectionStatus: React.FC = () => {
  const { status } = useSerial();
  
  return (
    <div className="flex items-center ml-4 text-sm border-l pl-4 border-gray-700 dark:border-gray-300">
      <div className={`h-2 w-2 rounded-full mr-2 ${
        status.connected ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className={status.connected ? 'text-green-400 dark:text-green-600' : 'text-gray-400 dark:text-gray-500'}>
        {status.connected 
          ? `已连接 ${status.port}` 
          : '未连接'
        }
      </span>
    </div>
  );
};

export default ConnectionStatus;