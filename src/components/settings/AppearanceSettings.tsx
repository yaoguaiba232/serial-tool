import React from 'react';
import { Settings } from '../../hooks/useSettings';
import { Card, Select } from '../common';
import { FONT_SIZES } from '../../utils/constants';

interface AppearanceSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card id="appearance" title="外观">
      <div className="space-y-3">
        <Select
          label="主题"
          value={settings.theme}
          onChange={(e) => onUpdate('theme', e.target.value as 'dark' | 'light')}
        >
          <option value="light">浅色主题</option>
          <option value="dark">深色主题</option>
        </Select>

        <Select
          label="字体大小"
          value={settings.fontSize}
          onChange={(e) => onUpdate('fontSize', e.target.value)}
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </Select>
      </div>
    </Card>
  );
};

export default AppearanceSettings;