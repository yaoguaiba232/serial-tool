import React from 'react';
import { Settings } from '../../hooks/useSettings';
import { Card } from '../common';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_BUFFER_SIZE, MAX_BUFFER_SIZE, MIN_BUFFER_SIZE } from '../../utils/constants';

interface BufferSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const BufferSettings: React.FC<BufferSettingsProps> = ({ settings, onUpdate }) => {
  }
  const handleBufferSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = DEFAULT_BUFFER_SIZE;
    if (value < MIN_BUFFER_SIZE) value = MIN_BUFFER_SIZE;
    if (value > MAX_BUFFER_SIZE) value = MAX_BUFFER_SIZE;
    onUpdate('bufferSize', value.toString());
  };

  return (
    <Card id="buffer" title="接收缓冲区">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
              缓冲区大小 ({MIN_BUFFER_SIZE}-{MAX_BUFFER_SIZE} bytes)
            </label>
            <input
              type="number"
              value={settings.bufferSize}
              onChange={handleBufferSizeChange}
              min={MIN_BUFFER_SIZE}
              max={MAX_BUFFER_SIZE}
              className="bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => onUpdate('bufferSize', DEFAULT_BUFFER_SIZE.toString())}
            className="mt-6 p-2 bg-gray-600 dark:bg-gray-200 hover:bg-gray-500 dark:hover:bg-gray-300 rounded-md transition-colors"
            title="重置为默认值 (512 bytes)"
          >
            <RotateCcw size={18} className="text-gray-300 dark:text-gray-700" />
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          当前设置: {settings.bufferSize} bytes
        </p>
      </div>
    </Card>
  );
};

export default BufferSettings;