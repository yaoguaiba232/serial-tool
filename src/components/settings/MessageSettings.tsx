import React from 'react';
import { Settings } from '../../hooks/useSettings';
import { Card } from '../common';

interface MessageSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const MessageSettings: React.FC<MessageSettingsProps> = ({ settings, onUpdate }) => {
  }
  return (
    <Card id="messages" title="消息显示">
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showTimestamp}
            onChange={(e) => onUpdate('showTimestamp', e.target.checked)}
            className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-sm text-gray-300 dark:text-gray-700">显示时间戳</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showSent}
            onChange={(e) => onUpdate('showSent', e.target.checked)}
            className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-sm text-gray-300 dark:text-gray-700">显示发送消息</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showReceived}
            onChange={(e) => onUpdate('showReceived', e.target.checked)}
            className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-sm text-gray-300 dark:text-gray-700">显示接收消息</span>
        </label>
      </div>
    </Card>
  );
};

export default MessageSettings;