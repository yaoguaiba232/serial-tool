import React from 'react';
import { Settings } from '../../hooks/useSettings';
import { Card, Select } from '../common';

interface TimestampSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const TimestampSettings: React.FC<TimestampSettingsProps> = ({ settings, onUpdate }) => {
  }
  return (
    <Card id="timestamp" title="时间格式">
      <Select
        value={settings.timestampFormat}
        onChange={(e) => onUpdate('timestampFormat', e.target.value as '12' | '24')}
      >
        <option value="24">24小时制</option>
        <option value="12">12小时制</option>
      </Select>
    </Card>
  );
};

export default TimestampSettings;